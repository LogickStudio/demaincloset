import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './hooks/useAuth';
import { useProducts } from './hooks/useProducts';
import { useCoupons } from './hooks/useCoupons';
import { useUsers } from './hooks/useUsers';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductManagementPage from './pages/AdminProductManagementPage';
import AdminCouponManagementPage from './pages/AdminCouponManagementPage';
import AdminReferralsPage from './pages/AdminReferralsPage';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import ContactPage from './pages/ContactPage';
import AdminMessagesPage from './pages/AdminMessagesPage';

// Layout for the main public-facing application
const MainLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen font-sans">
    <Navbar />
    {/* Added flex flex-col to allow child pages to use flex-grow for vertical centering */}
    <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
      <Outlet /> {/* Child routes will render here */}
    </main>
    <Footer />
  </div>
);

// Layout for the admin section, minimal and separate from the main app
const AdminLayout: React.FC = () => (
  <div className="bg-gray-100 min-h-screen font-sans">
    <Outlet /> {/* Child routes will render here */}
  </div>
);


const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { loading: productsLoading } = useProducts();
  const { loading: couponsLoading } = useCoupons();
  const { loading: usersLoading } = useUsers();
  
  const isAppLoading = authLoading || productsLoading || couponsLoading || usersLoading;

  const navigate = useNavigate();
  const location = useLocation();
  const hasInitialized = useRef(false);
  const splashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Set a maximum timeout for the splash screen (8 seconds)
    splashTimeoutRef.current = setTimeout(() => {
      if (isAppLoading) {
        setShowSplash(false);
      }
    }, 8000);
    return () => {
      if (splashTimeoutRef.current) clearTimeout(splashTimeoutRef.current);
    };
  }, []);

  // Lightweight splash: always hide after 2s, regardless of loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // Always hide splash after 2 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // This effect runs once after the splash screen is hidden to ensure
    // the app always starts on the homepage for a consistent user experience.
    if (!showSplash && !hasInitialized.current) {
      hasInitialized.current = true;
      // List of paths to redirect to homepage from on initial load.
      // These are pages a user shouldn't land on directly when opening the app.
      const pathsToRedirect = ['/login', '/signup', '/dashboard', '/cart'];
      if (pathsToRedirect.includes(location.pathname)) {
        navigate('/', { replace: true });
      }
    }
  }, [showSplash, location.pathname, navigate]);

  // Health check for Supabase connectivity
  useEffect(() => {
    async function checkSupabase() {
      try {
        // Try a simple query to ensure Supabase is reachable
        const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
        const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
        const res = await fetch(`${supabaseUrl}/rest/v1/products?select=id&limit=1`, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        });
        if (!res.ok) throw new Error('Supabase unreachable');
      } catch (err) {
        setSupabaseError('Cannot connect to the database. Please try again later or contact support.');
      }
    }
    checkSupabase();
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }
  if (supabaseError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 text-center p-8">
        <h1 className="text-3xl font-bold text-amber-600 mb-4">Something went wrong</h1>
        <p className="text-lg text-gray-700 mb-2">{supabaseError}</p>
        <p className="text-gray-500">Check your internet connection or reload the page.</p>
      </div>
    );
  }


  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Routes>
      {/* Admin Routes use the AdminLayout for a separate experience */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminProtectedRoute>
              <AdminDashboardPage />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/products" 
          element={
            <AdminProtectedRoute>
              <AdminProductManagementPage />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/coupons" 
          element={
            <AdminProtectedRoute>
              <AdminCouponManagementPage />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/referrals" 
          element={
            <AdminProtectedRoute>
              <AdminReferralsPage />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/messages" 
          element={
            <AdminProtectedRoute>
              <AdminMessagesPage />
            </AdminProtectedRoute>
          } 
        />
         <Route 
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />
      </Route>
      
      {/* Main App Routes use the MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
