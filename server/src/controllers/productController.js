import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      sort,
      page = 1,
      limit = 12,
      featured,
      lang,
      inStock,
      outStock,
      isNew,
      minPrice,
      maxPrice,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // language filter may be provided as repeated params (array) or single value
    const langFilter = Array.isArray(lang) ? lang : (lang ? [lang] : undefined);

    const where = {
      ...(category && { category: { slug: category } }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(featured === 'true' && { featured: true }),
      ...(langFilter && langFilter.length && { language: { in: langFilter } }),
    };

    // Stock filters: if only inStock selected -> stock > 0
    // if only outStock selected -> stock == 0
    if (inStock === 'true' && outStock !== 'true') {
      where.stock = { gt: 0 };
    } else if (outStock === 'true' && inStock !== 'true') {
      where.stock = 0;
    }

    if (isNew === 'true') {
      where.isNew = true;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};
      if (minPrice !== undefined && minPrice !== '') priceFilter.gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') priceFilter.lte = Number(maxPrice);
      if (Object.keys(priceFilter).length) where.price = priceFilter;
    }

    // Always try to put in-stock items first by ordering by stock desc
    const primaryOrder = { stock: 'desc' };
    let secondaryOrder;
    if (sort === 'price-asc') secondaryOrder = { price: 'asc' };
    else if (sort === 'price-desc') secondaryOrder = { price: 'desc' };
    else secondaryOrder = { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: [primaryOrder, secondaryOrder],
        skip,
        take: Number(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:slug
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// POST /api/products  (Admin)
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId, featured, isNew, discount, images, language, preorder, releaseDate } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const data = { name, slug, description, price: Number(price), stock: Number(stock), categoryId, featured: !!featured, isNew: !!isNew, discount: discount ? Number(discount) : null, images: images || [], language: language || 'ENGLISH' };
    if (preorder !== undefined) data.preorder = !!preorder;
    if (releaseDate) data.releaseDate = new Date(releaseDate);

    const product = await prisma.product.create({
      data,
      include: { category: true },
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id  (Admin)
export const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId, featured, isNew, discount, images, language, preorder, releaseDate } = req.body;
    const data = {
      ...(name && { name, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(categoryId && { categoryId }),
      ...(featured !== undefined && { featured: !!featured }),
      ...(isNew !== undefined && { isNew: !!isNew }),
      ...(discount !== undefined && { discount: discount ? Number(discount) : null }),
      ...(images && { images }),
      ...(language !== undefined && { language }),
    };
    if (preorder !== undefined) data.preorder = !!preorder;
    if (releaseDate !== undefined) data.releaseDate = releaseDate ? new Date(releaseDate) : null;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { category: true },
    });

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id  (Admin)
export const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    next(err);
  }
};
