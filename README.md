# 🃏 The New Store

Tienda online de cartas (Pokémon, One Piece, Dragon Ball, Lorcana y más).

**Stack:** React + Vite · Node.js + Express · PostgreSQL + Prisma · Tailwind CSS

---

## 📁 Estructura del proyecto

```
PAGINASTORE/
├── client/          ← Frontend (React + Vite + Tailwind)
└── server/          ← Backend  (Node.js + Express + Prisma)
```

---

## 🚀 Configuración inicial

### Requisitos previos
- Node.js 18+
- PostgreSQL instalado y corriendo

---

### 1️⃣ Configurar el servidor

```bash
cd server
npm install
```

Crea el archivo `.env` copiando el ejemplo:

```bash
copy .env.example .env
```

Edita `.env` con tus datos de PostgreSQL:

```env
DATABASE_URL="postgresql://TU_USUARIO:TU_CONTRASEÑA@localhost:5432/thenewstore"
JWT_SECRET="cambia_esto_por_algo_muy_seguro"
```

Crea la base de datos y aplica el schema:

```bash
npx prisma migrate dev --name init
```

Carga datos de ejemplo (categorías + admin + productos):

```bash
npm run db:seed
```

Inicia el servidor:

```bash
npm run dev
# → http://localhost:5000
```

---

### 2️⃣ Configurar el cliente

```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

---
n.

---

## 🌐 Rutas disponibles

### Frontend
| Ruta | Descripción |
|------|-------------|
| `/` | Página de inicio con hero, categorías y productos |
| `/productos` | Catálogo completo con filtros |
| `/productos/:slug` | Detalle de producto |
| `/categoria/:slug` | Filtrar por categoría |
| `/login` | Iniciar sesión |
| `/registro` | Crear cuenta |
| `/admin` | Dashboard de administración |
| `/admin/productos` | Gestión de productos |

### API Backend
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servidor |
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Perfil del usuario |
| GET | `/api/products` | Listar productos (filtros: category, search, sort, page, limit) |
| GET | `/api/products/:slug` | Producto por slug |
| POST | `/api/products` | Crear producto (Admin) |
| PUT | `/api/products/:id` | Actualizar producto (Admin) |
| DELETE | `/api/products/:id` | Eliminar producto (Admin) |
| GET | `/api/categories` | Listar categorías |
| GET | `/api/cart` | Ver carrito (Auth) |
| POST | `/api/cart` | Añadir al carrito |
| PATCH | `/api/cart/:id` | Actualizar cantidad |
| DELETE | `/api/cart/:id` | Eliminar ítem |
| DELETE | `/api/cart` | Vaciar carrito |
| POST | `/api/orders` | Crear pedido |
| GET | `/api/orders/mine` | Mis pedidos |
| GET | `/api/orders` | Todos los pedidos (Admin) |
| PATCH | `/api/orders/:id/status` | Actualizar estado (Admin) |

---

## ✨ Funcionalidades incluidas

- ✅ Catálogo de productos con filtros (categoría, búsqueda, precio, página)
- ✅ Detalle de producto con galería de imágenes
- ✅ Carrito de compra con drawer lateral
- ✅ Registro e inicio de sesión con JWT
- ✅ Tema claro / oscuro con persistencia
- ✅ Panel de administración (Dashboard + Productos)
- ✅ Hero dinámico con slider automático
- ✅ Categorías: Pokémon, One Piece, Dragon Ball, Lorcana, Deportes, Accesorios
- ✅ Diseño responsive (mobile-first)
- ✅ Protección de rutas (usuarios y admin)
- ✅ Gestión de stock en pedidos
- ✅ Base de datos con Prisma + PostgreSQL

---

## 🛠️ Scripts útiles

```bash
# Ver la base de datos en el navegador
cd server && npx prisma studio

# Regenerar cliente Prisma tras cambios en schema
cd server && npx prisma generate

# Crear nueva migración
cd server && npx prisma migrate dev --name nombre_cambio
```

---

## 📦 Próximos pasos sugeridos

- [ ] Integrar Stripe para pagos reales
- [ ] Página de mis pedidos para el usuario
- [ ] Sistema de sorteos
- [ ] Subida de imágenes (Cloudinary o similar)
- [ ] Panel admin de pedidos y categorías
- [ ] Notificaciones por email
- [ ] SEO y meta tags por página
