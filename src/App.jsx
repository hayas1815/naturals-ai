import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import AIAnalysis from './pages/AIAnalysis';
import Dashboard from './pages/Dashboard';
import Recommendations from './pages/Recommendations';
import AdminAnalytics from './pages/AdminAnalytics';
import Auth from './pages/Auth';
import QRScanner from './pages/QRScanner';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected Routes (All Logged-in Users) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/analysis" element={<AIAnalysis />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/scan" element={<QRScanner />} />
            </Route>

            {/* Admin/Staff Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'stylist']} />}>
              <Route path="/admin" element={<AdminAnalytics />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
