import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import RecentlyViewedCarousel from '../ui/RecentlyViewedCarousel.jsx';
import ScrollToTopButton from '../ui/ScrollToTopButton.jsx';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext.jsx';

const Layout = () => {
  const { items } = useRecentlyViewed();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Sección tipo banner con carrusel de "Visto recientemente" */}
      {items && items.length > 0 && (
        <section className="bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <RecentlyViewedCarousel items={items} />
          </div>
        </section>
      )}

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Layout;
