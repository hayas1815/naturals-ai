import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Recommendations() {
  const { profile } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const profileId = profile?.id || '11111111-1111-1111-1111-111111111111';
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const response = await fetch(`${apiUrl}/recommendations/${profileId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch recommendations');
        }

        if (result.data && result.data.length > 0) {
           setProducts(result.data.map(rec => ({
             id: rec.id,
             name: rec.products?.name,
             type: rec.products?.category,
             match: rec.match_score,
             price: `$${rec.products?.price}`
           })));
        } else {
           // Fallback to static if no db data exists
           setProducts([
            { id: 1, name: "Cellular Renewal Serum", type: "Night Repair", match: 98, price: "$120" },
            { id: 2, name: "DNA Defense Cream", type: "Daily Protection", match: 94, price: "$85" },
            { id: 3, name: "Hydro-Active Essence", type: "Hydration", match: 91, price: "$65" }
          ]);
        }
      } catch (err) {
        setError(err.message);
        // Fallback for demo
        setProducts([
          { id: 1, name: "Cellular Renewal Serum", type: "Night Repair", match: 98, price: "$120" },
          { id: 2, name: "DNA Defense Cream", type: "Daily Protection", match: 94, price: "$85" },
          { id: 3, name: "Hydro-Active Essence", type: "Hydration", match: 91, price: "$65" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Precision Formulation</h1>
          <p className="text-gray-400 font-light">
            Products algorithmically matched to your DNA profile and current environmental stressors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 flex flex-col group glow-hover"
            >
              <div className="w-full aspect-square bg-gradient-to-br from-white/5 to-white/0 rounded-xl mb-6 flex items-center justify-center border border-white/5 relative overflow-hidden">
                <ShoppingBag className="w-12 h-12 text-primary/40 group-hover:scale-110 group-hover:text-primary transition-all duration-500" />
                <div className="absolute top-4 right-4 bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                  {product.match}% Match
                </div>
              </div>
              
              <div className="flex-grow">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.type}</p>
                <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
                <p className="text-gray-400 text-sm font-light mb-6">Custom compounded active ingredients based on your latest scan.</p>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-medium text-white">{product.price}</span>
                <button className="flex items-center gap-2 text-sm font-medium text-primary hover:text-white transition-colors">
                  Add to Routine <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
