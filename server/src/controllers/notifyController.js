import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

export const requestNotification = async (req, res, next) => {
  try {
    const { productId, email } = req.body;
    if (!productId || !email) return res.status(400).json({ message: 'productId and email are required' });

    // Save the request in DB
    await prisma.backInStockRequest.create({ data: { productId, email } });

    // Send email to admin (if ADMIN_EMAIL set)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      const mail = {
        from: process.env.SMTP_FROM || 'no-reply@thenewstore.local',
        to: adminEmail,
        subject: `Solicitud de notificación: ${product?.name || 'Producto'}`,
        text: `El usuario ${email} ha solicitado ser notificado cuando el producto "${product?.name || productId}" vuelva a estar disponible. Producto ID: ${productId}`,
      };
      try {
        await transporter.sendMail(mail);
      } catch (err) {
        console.error('Error sending notification email', err);
      }
    }

    return res.json({ message: 'Solicitud registrada' });
  } catch (err) {
    next(err);
  }
};

export default { requestNotification };
