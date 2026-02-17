
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Nutrition from "./pages/Nutrition";
import Contact from "./pages/Contact";
import Custom from "./pages/Custom";
import CustomCreamBuilder from "./pages/CustomCreamBuilder";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Dashboard from "./pages/Dashboard";
import InvoiceDetail from "./pages/InvoiceDetail";
import OrderDetail from "./pages/OrderDetail";
import Admin from "./pages/Admin";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminRevenue from "./pages/AdminRevenue";
import AdminCosts from "./pages/AdminCosts";
import AdminCustomers from "./pages/AdminCustomers";
import AdminDistributors from "./pages/AdminDistributors";
import AdminEmployees from "./pages/AdminEmployees";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminOperationalAnalytics from "./pages/AdminOperationalAnalytics";
import AdminTasks from "./pages/AdminTasks";
import AdminCustomIngredients from "./pages/AdminCustomIngredients";
import AdminBlog from "./pages/AdminBlog";
import AdminProduction from "./pages/AdminProduction";
import AdminInventory from "./pages/AdminInventory";
import AdminFinishedProductsInventory from "./pages/AdminFinishedProductsInventory";
import AdminDistributorInventory from "./pages/AdminDistributorInventory";
import AdminSettings from "./pages/AdminSettings";
import AdminRecipes from "./pages/AdminRecipes";
import AdminProductCreate from "./pages/AdminProductCreate";
import AdminProductCategories from "./pages/AdminProductCategories";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminProductEdit from "./pages/AdminProductEdit";
import AdminProductView from "./pages/AdminProductView";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Rewards from "./pages/Rewards";

const queryClient = new QueryClient();

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7d8768]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para proteger rutas que requieren rol de admin
// Solo permite acceso a la cuenta específica: admin@botaniccare.com
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  
  // Email permitido para acceso admin
  const ADMIN_EMAIL = 'admin@botaniccare.com';
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7d8768]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorizedAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <CartProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/product/:id" element={<ProductDetail />} />
                <Route path="/nutrition" element={<Nutrition />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/custom" element={<Custom />} />
                <Route path="/custom-cream" element={<CustomCreamBuilder />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/orders/:orderId"
                  element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/invoices/:orderId"
                  element={
                    <ProtectedRoute>
                      <InvoiceDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <AdminRoute>
                      <AdminProducts />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/product-categories"
                  element={
                    <AdminRoute>
                      <AdminProductCategories />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <AdminOrders />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/revenue"
                  element={
                    <AdminRoute>
                      <AdminRevenue />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/costs"
                  element={
                    <AdminRoute>
                      <AdminCosts />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/customers"
                  element={
                    <AdminRoute>
                      <AdminCustomers />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/distributors"
                  element={
                    <AdminRoute>
                      <AdminDistributors />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/employees"
                  element={
                    <AdminRoute>
                      <AdminEmployees />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <AdminRoute>
                      <AdminAnalytics />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/operational-analytics"
                  element={
                    <AdminRoute>
                      <AdminOperationalAnalytics />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <AdminRoute>
                      <AdminSettings />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/tasks"
                  element={
                    <AdminRoute>
                      <AdminTasks />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/custom-ingredients"
                  element={
                    <AdminRoute>
                      <AdminCustomIngredients />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/blog"
                  element={
                    <AdminRoute>
                      <AdminBlog />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/production"
                  element={
                    <AdminRoute>
                      <AdminProduction />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/inventory"
                  element={
                    <AdminRoute>
                      <AdminInventory />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/finished-products-inventory"
                  element={
                    <AdminRoute>
                      <AdminFinishedProductsInventory />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/distributor-inventory"
                  element={
                    <AdminRoute>
                      <AdminDistributorInventory />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/recipes"
                  element={
                    <AdminRoute>
                      <AdminRecipes />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products/new"
                  element={
                    <AdminRoute>
                      <AdminProductCreate />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products/:id/edit"
                  element={
                    <AdminRoute>
                      <AdminProductEdit />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products/:id"
                  element={
                    <AdminRoute>
                      <AdminProductView />
                    </AdminRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
