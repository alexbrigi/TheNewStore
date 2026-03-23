import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ReservationProvider } from './context/ReservationContext.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext.jsx';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminProducts from './pages/admin/ProductsAdmin.jsx';
import AdminOrders from './pages/admin/Orders.jsx';
import Checkout from './pages/Checkout.jsx';
import AdminClients from './pages/admin/Clients.jsx';
import AdminRevenue from './pages/admin/Revenue.jsx';
import Profile from './pages/Profile.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RecentlyViewedProvider>
          <CurrencyProvider>
            <ReservationProvider>
              <CartProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              containerStyle={{ right: '4%', top: '1rem' }}
              toastOptions={{
                className: 'dark:bg-slate-800 dark:text-white',
                duration: 3000,
              }}
            />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="productos" element={<Products />} />
                <Route path="productos/:slug" element={<ProductDetail />} />
                <Route path="categoria/:category" element={<Products />} />
                <Route path="login" element={<Login />} />
                <Route path="registro" element={<Register />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="checkout" element={<Checkout />} />

                {/* Rutas Admin */}
                <Route
                  path="admin"
                  element={<ProtectedRoute adminOnly />}
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="productos" element={<AdminProducts />} />
                  <Route path="pedidos" element={<AdminOrders />} />
                  <Route path="clientes" element={<AdminClients />} />
                  <Route path="ingresos" element={<AdminRevenue />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
              </CartProvider>
            </ReservationProvider>
          </CurrencyProvider>
        </RecentlyViewedProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
