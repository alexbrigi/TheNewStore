import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/cart
export const getCart = async (req, res, next) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { category: true } } },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// POST /api/cart
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Stock insuficiente' });

    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { userId: req.user.id, productId, quantity },
      include: { product: true },
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/cart/:id
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: req.params.id } });
      return res.json({ message: 'Producto eliminado del carrito' });
    }
    const item = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { quantity },
      include: { product: true },
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/:id
export const removeFromCart = async (req, res, next) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Producto eliminado del carrito' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart
export const clearCart = async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    res.json({ message: 'Carrito vaciado' });
  } catch (err) {
    next(err);
  }
};
