import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Fingerprint, Droplets, Sun, Wind, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const pId = profile?.id || '11111111-1111-1111-1111-111111111111';
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const response = await fetch(`${apiUrl}/profiles/${pId}/dashboard`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch data');
        }

        // Format history for chart
        const formattedHistory = result.data.history.map(item => ({
          name: new Date(item.recorded_at).toLocaleDateString('en-US', { month: 'short' }),
          hydration: item.hydration_level,
          elasticity: item.elasticity_score
        }));

        setData({
          profile: result.data.profile,
          history: formattedHistory.length > 0 ? formattedHistory : [
            { name: 'Jan', hydration: 65, elasticity: 70 },
            { name: 'Feb', hydration: 68, elasticity: 72 } // fallback if empty
          ]
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const chartData = data?.history || [];
  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Beauty Passport</h1>
            <p className="text-gray-400 font-light">Your genetic skin profile & progress.</p>
          </div>
          <div className="flex items-center gap-3 glass-panel px-4 py-2 text-sm text-gray-300">
            <Fingerprint className="w-4 h-4 text-primary" />
            <span>ID: NAT-8932-X</span>
          </div>
        </motion.div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Hydration Level', value: '88%', icon: Droplets, trend: '+12%' },
            { label: 'UV Resilience', value: 'High', icon: Sun, trend: 'Optimal' },
            { label: 'Skin Elasticity', value: '89%', icon: Wind, trend: '+5%' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 glow-hover"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-green-500/10 text-green-400 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 md:p-8 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Skin Health Evolution</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHydration" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorElasticity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="hydration" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorHydration)" />
                <Area type="monotone" dataKey="elasticity" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorElasticity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
