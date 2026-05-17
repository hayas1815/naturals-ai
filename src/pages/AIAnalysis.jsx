import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ScanFace, Upload, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AIAnalysis() {
  const { profile } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);
    
    // Fallback to mock profile if not logged in (for testing)
    formData.append('profileId', profile?.id || '11111111-1111-1111-1111-111111111111');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/ai/analyze`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze image');
      }

      setSuccess(true);
      // Wait a moment then redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 flex items-center justify-center">
      <div className="max-w-3xl w-full mx-auto px-4">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 md:p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-8 relative">
            {success ? (
               <CheckCircle className="w-10 h-10 text-green-400" />
            ) : isAnalyzing ? (
               <Loader2 className="w-10 h-10 text-primary animate-spin" />
            ) : (
               <ScanFace className="w-10 h-10 text-primary" />
            )}
            {!success && !isAnalyzing && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 border border-primary rounded-full"
              />
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {success ? 'Scan Complete' : isAnalyzing ? 'Neural Engine Active...' : 'Initialize DNA Scan'}
          </h1>
          <p className="text-gray-400 font-light mb-10 max-w-lg mx-auto">
            {success 
              ? 'Your passport has been updated. Redirecting to dashboard...' 
              : isAnalyzing 
                ? 'Processing high-resolution facial data and identifying key dermatological markers. Please wait.' 
                : 'Our neural network requires a high-resolution facial scan to decode your unique dermatological profile and generate your passport.'}
          </p>

          {!isAnalyzing && !success && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg, image/png"
                onChange={handleFileUpload}
              />
              <div 
                className="border-2 border-dashed border-white/20 rounded-3xl p-12 hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-4 group-hover:text-primary transition-colors" />
                <p className="text-gray-300 font-medium">Click to upload scan</p>
                <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG (Max 10MB)</p>
              </div>
              
              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}
            </>
          )}
        </motion.div>

      </div>
    </div>
  );
}
