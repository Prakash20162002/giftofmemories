import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

// --- MANTINE & TIPTAP SETUP ---
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css'; 
import '@mantine/tiptap/styles.css';

import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { FloatingDock } from "./components/FloatingDock";

import {
  IconHome,
  IconTools,
  IconShoppingBag,
  IconPhoto,
  IconArticle,
  IconInfoCircle,
  IconPhoneCall,
} from "@tabler/icons-react";

// --- PAGES ---
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailsPage from "./pages/ServiceDetailsPage";
import GalleryPage from "./pages/GalleryPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import AboutPage from "./pages/AboutPage";
import AdminLogin from "./pages/AdminLogin";
import ProductsPage from "./pages/ProductsPage";
import DashboardPage from "./pages/DashboardPage";
import AdminEnquiry from "./pages/AdminEnquiry";
import AdminEnquiryDetails from "./pages/AdminEnquiryDetails";
import FloatingChatButtons from "./components/FloatingChatButtons";
import AnnouncementPopup from "./components/AnnouncementPopup";
import FloatingOffers from "./components/FloatingOffers";
import AdminPopups from "./pages/AdminPopups";
import AdminBlogPage from "./pages/AdminBlogPage";
import AdminTestimonial from "./pages/AdminTestimonial";
import AdminServicePage from "./pages/AdminServicePage";
import AdminHero from "./pages/AdminHero";
import AdminGalleryPage from "./pages/AdminGalleryPage";
import AdminShopPage from "./pages/AdminShopPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminAboutPage from "./pages/AdminAboutPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminHomepageSettings from "./pages/AdminHomepageSettings";
import AdminPageHeroes from "./pages/AdminPageHeroes";
import AdminHomepageGallery from "./pages/AdminHomepageGallery";
import AdminPageVideos from "./pages/AdminPageVideos";
import AdminProductCollections from "./pages/AdminProductCollections";
import AdminFAQPage from "./pages/AdminFAQPage";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/ProtectedRoute";
import { ClientAuthProvider } from "./context/ClientAuthContext";
import ClientLoginPage from "./pages/ClientLoginPage";
import ClientSignupPage from "./pages/ClientSignupPage";

// --- WHATSAPP, LEADS & OFFERS ---
import BookingForm from "./pages/BookingForm"; 
import AdminDashboard from "./pages/AdminDashboard"; 
import LeadCapture from "./pages/LeadCapture";
import AdminLeads from "./pages/AdminLeads";
import AdminOffersPage from "./pages/AdminOffersPage";

// --- NEW WHATSAPP CRM ENGINE ---
import AdminWhatsAppReminders from "./pages/AdminWhatsAppReminders";
import ProductDetailsPage from "./pages/ProductDetailedPage";

// --- THEME DEFINITION ---
const theme = createTheme({
  colors: {
    gold: [
      '#fdf9ed', '#f9f1d5', '#f2e2aa', '#ebcf7a', '#e5bf53', 
      '#e1b438', '#dfae29', '#c6981e', '#b08717', '#98720b'
    ],
  },
  primaryColor: 'gold',
});

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const isAdminRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin-');
    if (!isAdminRoute) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
};

const navLinks = [
  { title: "Home", icon: <IconHome />, href: "/" },
  { title: "Services", icon: <IconTools />, href: "/services" },
  { title: "Shop", icon: <IconShoppingBag />, href: "/shop" },
  { title: "Gallery", icon: <IconPhoto />, href: "/gallery" },
  { title: "Blog", icon: <IconArticle />, href: "/blog" },
  { title: "About", icon: <IconInfoCircle />, href: "/about" },
  { title: "Contact", icon: <IconPhoneCall />, href: "/contact" },
];

const AppContent = () => {
  const location = useLocation();
  
  const hideNavbarRoutes = [
    "/admin-portal-secret", "/dashboard", "/admin-popups", "/admin-blogs",
    "/admin-enquiries", "/admin-testimonials", "/admin-services", "/admin-hero",
    "/admin-gallery", "/admin-shop", "/admin-users", "/admin-about",
    "/admin-reports", "/admin-homepage-settings", "/admin-page-heroes",
    "/admin-homepage-gallery", "/admin-page-videos", "/admin-product-collections",
    "/admin-faqs", "/admin-bookings", "/admin-offers", "/admin-leads",
    "/admin-whatsapp-reminders", 
  ];

  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  const isHomePage = location.pathname === "/";
  const [isLoading, setIsLoading] = useState(isHomePage);

  useEffect(() => {
    if (isHomePage) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 2500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [isHomePage]);

  return (
    <div className="min-h-screen bg-warm-ivory selection:bg-gold-accent selection:text-white">
      <ScrollToTop />
      
      <AnimatePresence mode="wait">
        {isLoading && isHomePage && <LoadingScreen key="loading" />}
      </AnimatePresence>

      {!shouldHideNavbar && <Navbar />}
      {!shouldHideNavbar && <FloatingChatButtons />}
      {!shouldHideNavbar && <AnnouncementPopup />}
      {!shouldHideNavbar && <FloatingOffers />} 
      
      <ToastContainer position="top-center" />
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServiceDetailsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin-portal-secret" element={<AdminLogin />} />
          <Route path="/shop" element={<ProductsPage />} />
          <Route path="/login" element={<ClientLoginPage />} />
          <Route path="/signup" element={<ClientSignupPage />} />
          <Route path="/book" element={<BookingForm />} />
          <Route path="/contact-leads" element={<LeadCapture />} />
          
          {/* FIXED ROUTE: Matches the ProductCategoryGrid and Navbar navigation */}
          <Route path="/shop/product/:id" element={<ProductDetailsPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin-popups" element={<AdminPopups />} />
            <Route path="/admin-blogs" element={<AdminBlogPage />} />
            <Route path="/admin-enquiries" element={<AdminEnquiry />} />
            <Route path="/admin-enquiries/:id" element={<AdminEnquiryDetails />} />
            <Route path="/admin-leads" element={<AdminLeads />} />
            <Route path="/admin-testimonials" element={<AdminTestimonial />} />
            <Route path="/admin-services" element={<AdminServicePage />} />
            <Route path="/admin-hero" element={<AdminHero />} />
            <Route path="/admin-gallery" element={<AdminGalleryPage />} />
            <Route path="/admin-shop" element={<AdminShopPage />} />
            <Route path="/admin-about" element={<AdminAboutPage />} />
            <Route path="/admin-users" element={<AdminUsersPage />} />
            <Route path="/admin-reports" element={<AdminReportsPage />} />
            <Route path="/admin-homepage-settings" element={<AdminHomepageSettings />} />
            <Route path="/admin-page-heroes" element={<AdminPageHeroes />} />
            <Route path="/admin-homepage-gallery" element={<AdminHomepageGallery />} />
            <Route path="/admin-page-videos" element={<AdminPageVideos />} />
            <Route path="/admin-product-collections" element={<AdminProductCollections />} />
            <Route path="/admin-faqs" element={<AdminFAQPage />} />
            <Route path="/admin-bookings" element={<AdminDashboard />} />
            <Route path="/admin-offers" element={<AdminOffersPage />} />
            <Route path="/admin-whatsapp-reminders" element={<AdminWhatsAppReminders />} />
          </Route>
        </Routes>
      </main>

      {!shouldHideNavbar && <Footer />}

      {!shouldHideNavbar && (
        <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center md:hidden">
          <FloatingDock mobileClassName="" desktopClassName="hidden" items={navLinks} />
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <MantineProvider theme={theme}>
      <ClientAuthProvider>
        <Router>
          <AppContent />
        </Router>
      </ClientAuthProvider>
    </MantineProvider>
  );
}

export default App;