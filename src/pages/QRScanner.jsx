import { motion } from 'framer-motion';
import { QrCode, ScanLine } from 'lucide-react';

export default function QRScanner() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 text-center">
        
        <h1 className="text-3xl font-bold text-white mb-4">Passport Scanner</h1>
        <p className="text-gray-400 font-light mb-12">
          Align your unique QR code within the frame to verify biometric data.
        </p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mx-auto w-64 h-64 border-2 border-primary/40 rounded-3xl overflow-hidden bg-black/50 shadow-[0_0_50px_rgba(212,175,55,0.1)]"
        >
          {/* Scanner Line Animation */}
          <motion.div
            animate={{ y: [0, 256, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(212,175,55,0.8)] z-10"
          />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <QrCode className="w-32 h-32 text-white" />
          </div>

          {/* Corner Markers */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
        </motion.div>

        <div className="mt-12 flex justify-center gap-4">
          <button className="px-6 py-3 glass-panel hover:bg-white/10 transition-colors text-white font-medium flex items-center gap-2">
            <ScanLine className="w-5 h-5" /> Enable Camera
          </button>
        </div>

      </div>
    </div>
  );
}
