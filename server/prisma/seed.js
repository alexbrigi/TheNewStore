import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

dotenv.config();

const prisma = new PrismaClient();
const BASE_URL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear categorías
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'pokemon' },
      update: {},
      create: { name: 'Pokémon', slug: 'pokemon', description: 'Cartas y productos Pokémon TCG', color: '#EAB308' },
    }),
    prisma.category.upsert({
      where: { slug: 'one-piece' },
      update: {},
      create: { name: 'One Piece', slug: 'one-piece', description: 'Cartas del juego One Piece TCG', color: '#EF4444' },
    }),
    prisma.category.upsert({
      where: { slug: 'dragon-ball' },
      update: {},
      create: { name: 'Dragon Ball', slug: 'dragon-ball', description: 'Cartas Dragon Ball Fusion World y Zenkai', color: '#F97316' },
    }),
    prisma.category.upsert({
      where: { slug: 'lorcana' },
      update: {},
      create: { name: 'Lorcana', slug: 'lorcana', description: 'Disney Lorcana TCG', color: '#A855F7' },
    }),
    prisma.category.upsert({
      where: { slug: 'deportes' },
      update: {},
      create: { name: 'Deportes', slug: 'deportes', description: 'Juegos de cartas deportivos', color: '#3B82F6' },
    }),
    prisma.category.upsert({
      where: { slug: 'accesorios' },
      update: {},
      create: { name: 'Accesorios', slug: 'accesorios', description: 'Fundas, álbumes y accesorios para cartas', color: '#22C55E' },
    }),
  ]);

  console.log('✅ Categorías creadas');

  // Crear admin (credenciales actualizadas)
  const adminPass = await bcrypt.hash('adminadmin', 12);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      email: 'admin@admin',
      password: adminPass,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@admin',
      username: 'admin',
      password: adminPass,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin creado: admin@admin / adminadmin');

  // Crear productos de ejemplo
  const pokemonCat = categories.find((c) => c.slug === 'pokemon');
  const opCat = categories.find((c) => c.slug === 'one-piece');
  const dbCat = categories.find((c) => c.slug === 'dragon-ball');

  const products = [
    { name: 'Pokémon Scarlet & Violet Booster Box', slug: 'pokemon-sv-booster-box', price: 119.99, stock: 15, categoryId: pokemonCat.id, isNew: true, featured: true, language: 'ENGLISH', description: 'Caja de 36 sobres de la expansión Scarlet & Violet.' },
    { name: 'Pikachu ex Premium Collection', slug: 'pikachu-ex-premium', price: 49.99, stock: 8, categoryId: pokemonCat.id, isNew: true, discount: 10, language: 'ENGLISH', description: 'Colección premium con 11 sobres y carta promo.' },
    { name: 'One Piece OP-09 Booster Box', slug: 'op09-booster-box', price: 89.99, stock: 20, categoryId: opCat.id, isNew: true, featured: true, language: 'ENGLISH', description: 'Booster box de la novena expansión de One Piece TCG.' },
    { name: 'One Piece OP-08 Box Japonesa', slug: 'op08-box-jp', price: 79.99, stock: 5, categoryId: opCat.id, language: 'JAPANESE', description: 'Edición japonesa de la expansión OP-08.' },
    { name: 'Dragon Ball FW EB-01 Box', slug: 'dbfw-eb01-box', price: 79.99, stock: 12, categoryId: dbCat.id, isNew: true, featured: true, language: 'ENGLISH', description: 'Extra Booster de Dragon Ball Fusion World.' },
    { name: 'Dragon Ball Zenkai Series 07', slug: 'db-zenkai-07', price: 64.99, stock: 18, categoryId: dbCat.id, language: 'ENGLISH', description: 'Booster box de la serie Zenkai 07.' },
  ];

  for (const p of products) {
    // Buscar imagen local en uploads intentando varios tipos de coincidencia.
    const files = fs.existsSync(UPLOADS_DIR) ? fs.readdirSync(UPLOADS_DIR) : [];
    const slugNorm = p.slug.toLowerCase();

    // 1) Coincidencia directa del slug
    let matched = files.find((f) => f.toLowerCase().includes(slugNorm));

    // 2) Si no hay coincidencia directa, probar tokens del slug (ej: 'op09' en 'op09-booster-box')
    if (!matched) {
      const tokens = slugNorm.split(/[^a-z0-9]+/).filter(Boolean).filter(t => t.length >= 2);
      // buscar el archivo que contenga el mayor número de tokens (simple heurística)
      let best = null;
      let bestScore = 0;
      for (const f of files) {
        const fname = f.toLowerCase();
        let score = 0;
        for (const t of tokens) if (fname.includes(t)) score++;
        if (score > bestScore) {
          bestScore = score;
          best = f;
        }
      }
      // solo tomar coincidencia si al menos un token matchea
      if (bestScore > 0) matched = best;
    }
    const colorHex = p.categoryId === pokemonCat.id ? 'eab308' : p.categoryId === opCat.id ? 'ef4444' : 'f97316';
    const placeholder = `https://placehold.co/400x400/1e293b/${colorHex}?text=${encodeURIComponent(p.name.slice(0, 10))}`;
    const imageUrl = matched ? `${BASE_URL}/uploads/${matched}` : placeholder;

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { images: [imageUrl] },
      create: {
        ...p,
        images: [imageUrl],
      },
    });
  }

  console.log('✅ Productos de ejemplo creados');
  // --- Pedido de prueba: comprar 5 unidades de EB-04 ---
  try {
    const ebSlug = 'one-piece-eb-04---egghead-crisis';
    const ebProduct = await prisma.product.findUnique({ where: { slug: ebSlug } });
    if (ebProduct) {
      // Asegurar stock inicial >= 5
      const desiredStock = 5;
      if ((ebProduct.stock || 0) < desiredStock) {
        await prisma.product.update({ where: { id: ebProduct.id }, data: { stock: desiredStock } });
        console.log(`🔧 Stock de ${ebSlug} ajustado a ${desiredStock}`);
      }

      // Crear/usar usuario comprador de prueba
      const buyer = await prisma.user.upsert({
        where: { email: 'buyer-test@local' },
        update: {},
        create: {
          email: 'buyer-test@local',
          username: 'buyer-test',
          password: await bcrypt.hash('testbuyer', 12),
        },
      });

      // Crear pedido con 5 unidades
      const quantity = 5;
      const total = (ebProduct.price || 0) * quantity;

      const createdOrder = await prisma.order.create({
        data: {
          userId: buyer.id,
          total,
          status: 'PENDING',
          address: 'Calle Prueba 1',
          city: 'Madrid',
          postalCode: '28001',
          phone: '600000000',
          notes: 'Pedido de prueba automático (5 x EB-04)',
          items: {
            create: [
              {
                productId: ebProduct.id,
                quantity,
                price: ebProduct.price,
              },
            ],
          },
        },
      });

      // Reducir stock en 5
      await prisma.product.update({ where: { id: ebProduct.id }, data: { stock: (desiredStock - quantity) } });
      console.log(`✅ Pedido de prueba creado (ID: ${createdOrder.id.slice(0,8)}...) y stock reducido en ${quantity}`);
    } else {
      console.log('⚠️ Producto EB-04 no encontrado, no se creó pedido de prueba');
    }
  } catch (err) {
    console.error('Error creando pedido de prueba:', err.message);
  }

  console.log('🎉 Seed completado!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
