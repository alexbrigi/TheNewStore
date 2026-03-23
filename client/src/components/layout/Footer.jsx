import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-950 dark:bg-black text-gray-400 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-1">
          <span className="text-2xl font-black text-white">
            The New <span className="text-primary-500">Store</span>
          </span>
          <p className="mt-3 text-sm">
            Tu tienda especializada en cartas de colección. Pokémon, One Piece, Dragon Ball y más.
          </p>
        </div>

        {/* Categorías */}
        <div>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Categorías</h3>
          <ul className="space-y-2 text-sm">
            {['Pokémon', 'One Piece', 'Dragon Ball', 'Lorcana', 'Deportes'].map((cat) => (
              <li key={cat}>
                <Link to={`/categoria/${cat.toLowerCase().replace(/ /g, '-')}`} className="hover:text-white transition-colors">
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Tienda */}
        <div>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Tienda</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/productos" className="hover:text-white transition-colors">Todos los productos</Link></li>
            <li><Link to="/productos?featured=true" className="hover:text-white transition-colors">Destacados</Link></li>
            <li><Link to="/productos?sort=newest" className="hover:text-white transition-colors">Novedades</Link></li>
          </ul>
        </div>

        {/* Info */}
        <div>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Info</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span>📦</span> Envíos en 24-72h
            </li>
            <li className="flex items-center gap-2">
              <span>💳</span> Pago seguro
            </li>
            <li className="flex items-center gap-2">
              <span>🔄</span> Devoluciones fáciles
            </li>
            <li className="flex items-center gap-2">
              <span>💬</span> Soporte online
            </li>
          </ul>
        </div>
      </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-xs">
        <p>© {new Date().getFullYear()} The New Store. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
