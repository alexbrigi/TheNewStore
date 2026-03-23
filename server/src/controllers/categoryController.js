import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/categories
export const getCategories = async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// POST /api/categories  (Admin)
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, color } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await prisma.category.create({ data: { name, slug, description, image, color } });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// PUT /api/categories/:id  (Admin)
export const updateCategory = async (req, res, next) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id  (Admin)
export const deleteCategory = async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    next(err);
  }
};
