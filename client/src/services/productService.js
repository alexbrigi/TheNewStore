import api from './api.js';

export const getProducts = (params = {}) => api.get('/products', { params });

export const getProductBySlug = (slug) => api.get(`/products/${slug}`);

export const createProduct = (data) => api.post('/products', data);

export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getCategories = () => api.get('/categories');

export const createCategory = (data) => api.post('/categories', data);

export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);

export const deleteCategory = (id) => api.delete(`/categories/${id}`);
