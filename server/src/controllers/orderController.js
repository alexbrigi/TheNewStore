import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const { address, city, postalCode, phone, notes } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }

    // Validar stock
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ message: `Stock insuficiente para ${item.product.name}` });
      }
    }

    const subtotal = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
    const shipping = subtotal >= 150 ? 0 : 6;
    const total = subtotal + shipping;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          subtotal,
          shipping,
          total,
          address,
          city,
          postalCode,
          phone,
          notes,
          items: {
            create: cartItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.product.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      // Actualizar stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Vaciar carrito
      await tx.cartItem.deleteMany({ where: { userId: req.user.id } });

      return newOrder;
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/mine
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders  (Admin)
export const getAllOrders = async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: { select: { id: true, email: true, username: true } }, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status  (Admin)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!existingOrder) return res.status(404).json({ message: 'Pedido no encontrado' });

    // If changing to CANCELLED and it wasn't cancelled before, restore stock
    if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        for (const it of existingOrder.items) {
          await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } });
        }

        await tx.order.update({ where: { id: req.params.id }, data: { status } });
      });

      const updated = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: { include: { product: true } } } });
      return res.json(updated);
    }

    // Default: just update status
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/orders/:id  (Admin)
export const deleteOrder = async (req, res, next) => {
  try {
    const existingOrder = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!existingOrder) return res.status(404).json({ message: 'Pedido no encontrado' });

    await prisma.$transaction(async (tx) => {
      // If order wasn't cancelled, restore stock
      if (existingOrder.status !== 'CANCELLED') {
        for (const it of existingOrder.items) {
          await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } });
        }
      }

      // Delete order items and order
      await tx.orderItem.deleteMany({ where: { orderId: req.params.id } });
      await tx.order.delete({ where: { id: req.params.id } });
    });

    res.json({ message: 'Pedido eliminado y stock restaurado cuando fue necesario' });
  } catch (err) {
    next(err);
  }
};
