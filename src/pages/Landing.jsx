import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>The Future of Personal Care</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight text-white">
              Your Beauty Journey,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">Decoded by AI</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 font-light">
              Experience the world's most advanced aesthetic intelligence. 
              Naturals AI analyzes your unique features to create a bespoke, predictive beauty passport.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link to="/analysis" className="group relative inline-flex items-center gap-2 px-8 py-4 bg-primary text-background font-medium rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(212,175,55,0.4)]">
                <span>Start Free Analysis</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/dashboard" className="px-8 py-4 glass-panel text-white font-medium hover:bg-white/10 transition-colors">
                View Passport
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Activity,
                title: "Predictive Analytics",
                description: "Our neural engine forecasts your skin's evolution and pre-emptively suggests regimens."
              },
              {
                icon: Sparkles,
                title: "Hyper-Personalization",
                description: "Over 2 million data points analyzed to craft a routine exclusively designed for your DNA."
              },
              {
                icon: ShieldCheck,
                title: "Enterprise Security",
                description: "Your beauty passport is encrypted with military-grade standards, ensuring total privacy."
              }
            ].map((feature, i) => (
              <div key={i} className="glass-panel p-8 glow-hover group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed font-light">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
