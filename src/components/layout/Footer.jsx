import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold tracking-wide">Naturals AI</span>
            </Link>
            <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
              Elevating personal care through predictive artificial intelligence and luxury aesthetics. 
              Your beauty journey, decoded.
            </p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/analysis" className="text-gray-400 hover:text-primary text-sm transition-colors">AI Analysis</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-primary text-sm transition-colors">Beauty Passport</Link></li>
              <li><Link to="/recommendations" className="text-gray-400 hover:text-primary text-sm transition-colors">Shop</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-400 hover:text-primary text-sm transition-colors">About</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Privacy</Link></li>
              <li><Link to="/admin" className="text-gray-400 hover:text-primary text-sm transition-colors">Admin</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 Naturals AI Beauty Passport. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
