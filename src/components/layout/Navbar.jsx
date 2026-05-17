import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Menu } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="fixed w-full z-50 glass-panel border-b-0 rounded-none bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold tracking-wide">Naturals AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/analysis" className="text-sm text-gray-300 hover:text-primary transition-colors">Analysis</Link>
            <Link to="/dashboard" className="text-sm text-gray-300 hover:text-primary transition-colors">Passport</Link>
            <Link to="/recommendations" className="text-sm text-gray-300 hover:text-primary transition-colors">Products</Link>
            {user ? (
              <button onClick={handleSignOut} className="px-5 py-2.5 rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all text-sm font-medium">
                Sign Out
              </button>
            ) : (
              <Link to="/auth" className="px-5 py-2.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-sm font-medium">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-lg border-t border-white/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link to="/analysis" className="block text-gray-300 hover:text-primary transition-colors">Analysis</Link>
              <Link to="/dashboard" className="block text-gray-300 hover:text-primary transition-colors">Passport</Link>
              <Link to="/recommendations" className="block text-gray-300 hover:text-primary transition-colors">Products</Link>
              {user ? (
                <button onClick={handleSignOut} className="block w-full text-center px-5 py-3 rounded-xl bg-white/5 text-white border border-white/10 mt-4">
                  Sign Out
                </button>
              ) : (
                <Link to="/auth" className="block w-full text-center px-5 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 mt-4">
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
