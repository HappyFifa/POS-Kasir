import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductManagementPage from './pages/ProductManagementPage';
import ProductFormPage from './pages/ProductFormPage';
import CashierPage from './pages/CashierPage';
import ReportsPage from './pages/ReportsPage';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import SuccessModal from './components/SuccessModal';
import ConfirmModal from './components/ConfirmModal';
import PaymentModal from './components/PaymentModal';
import PaymentSuccessModal from './components/PaymentSuccessModal';
import { getCurrentUser, logoutUser, isAuthenticated } from './utils/auth';
import { productStorage, transactionStorage, databaseInfo } from './utils/databaseAdapter';
import { useSessionTimeout } from './hooks/useCustomHooks';
import { CONFIG } from './utils/constants';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastPaymentDetails, setLastPaymentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState('initializing');

  // Session timeout handler
  const handleSessionTimeout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('dashboard');
    alert('Sesi Anda telah berakhir. Silakan login kembali.');
  };

  // Use session timeout hook
  useSessionTimeout(handleSessionTimeout, CONFIG.SESSION_TIMEOUT);

  // Initialize authentication and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check authentication
        if (isAuthenticated()) {
          const user = getCurrentUser();
          setCurrentUser(user);
          setIsLoggedIn(true);
        }

        // Load products from database
        setIsLoading(true);
        setDatabaseStatus('loading');
        
        const savedProducts = await productStorage.getAll();
        setProducts(savedProducts || []);
        
        setDatabaseStatus('ready');
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
        setDatabaseStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsFormVisible(false);
  };

  const handleLogin = () => {
    const user = getCurrentUser();
    setIsLoggedIn(true);
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('dashboard');
    setCart([]);
  };

  const handleEditClick = (product) => {
    setProductToEdit(product);
    setIsFormVisible(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      setIsLoading(true);
      let updatedProduct;
      
      if (productToEdit) {
        // Update existing product
        updatedProduct = await productStorage.update(productToEdit.id, productData);
        setProducts(products.map(p => p.id === productToEdit.id ? updatedProduct : p));
      } else {
        // Add new product
        updatedProduct = await productStorage.add(productData);
        setProducts(prev => [...prev, updatedProduct]);
      }
      
      if (updatedProduct) {
        setIsFormVisible(false);
        setProductToEdit(null);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Terjadi kesalahan saat menyimpan produk: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await productStorage.delete(productId);
      setProducts(products.filter(p => p.id !== productId));
      setProductToDelete(null); // Close the confirmation modal
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setProductToEdit(null);
  };

  // Cart functions
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart =>
      prevCart
        .map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeItemFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    setShowPaymentModal(false);
  };

  const processPayment = async (paymentDetails) => {
    try {
      setIsLoading(true);
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const transaction = {
        items: cart,
        total: total,
        amountPaid: paymentDetails.amountPaid,
        change: paymentDetails.change,
        cashier: currentUser?.username || 'Unknown',
        timestamp: new Date().toISOString(),
      };
      
      const savedTransaction = await transactionStorage.add(transaction);
      
      setShowPaymentModal(false);
      setLastPaymentDetails(paymentDetails);
      setShowSuccessModal(true);

      // Clear cart immediately after successful payment
      clearCart();

      // Auto close success modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(`Terjadi kesalahan saat memproses pembayaran: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <ErrorBoundary>
        <LoginPage onLogin={handleLogin} />
      </ErrorBoundary>
    );
  }

  const renderPage = () => {
    if (isFormVisible) {
      return (
        <ProductFormPage
          product={productToEdit}
          onSave={handleSaveProduct}
          onCancel={handleCancelForm}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage navigateTo={navigateTo} products={products} />;
      case 'produk':
        return (
          <ProductManagementPage
            products={products}
            onEditClick={handleEditClick}
            onDeleteProduct={(id) => setProductToDelete(id)}
          />
        );
      case 'kasir':
        return (
          <CashierPage
            products={products}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            removeItemFromCart={removeItemFromCart}
            updateQuantity={updateQuantity}
            clearCart={clearCart}
            onProcessPayment={() => setShowPaymentModal(true)}
          />
        );
      case 'laporan':
        return <ReportsPage />;
      default:
        return <DashboardPage navigateTo={navigateTo} products={products} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
        <Sidebar 
          currentPage={currentPage} 
          navigateTo={navigateTo} 
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
        
        <PaymentModal
          show={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={processPayment}
          total={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
        />

        <PaymentSuccessModal
          show={showSuccessModal && lastPaymentDetails}
          onClose={() => {
            setShowSuccessModal(false);
            setLastPaymentDetails(null);
          }}
          change={lastPaymentDetails?.change || 0}
        />

        <ConfirmModal
          show={!!productToDelete}
          message="Apakah Anda yakin ingin menghapus produk ini?"
          onConfirm={() => handleDeleteProduct(productToDelete)}
          onCancel={() => setProductToDelete(null)}
        />
      </div>
    </ErrorBoundary>
  );
}
