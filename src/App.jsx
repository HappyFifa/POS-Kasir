import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductManagementPage from './pages/ProductManagementPage';
import ProductFormPage from './pages/ProductFormPage';
import CashierPage from './pages/CashierPage';
import ReportsPage from './pages/ReportsPage';
import Sidebar from './components/Sidebar';
import SuccessModal from './components/SuccessModal';
import ConfirmModal from './components/ConfirmModal';
import PaymentModal from './components/PaymentModal';
import PaymentSuccessModal from './components/PaymentSuccessModal';
import { getProducts, saveProduct, deleteProduct } from './data/productData';
import { addTransaction } from './data/transactionData';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).isLoggedIn : false;
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastPaymentDetails, setLastPaymentDetails] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Load products on mount
  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsFormVisible(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleEditClick = (product) => {
    setProductToEdit(product);
    setIsFormVisible(true);
  };

  const handleSaveProduct = (productData) => {
    const updatedProducts = saveProduct(productData);
    setProducts(updatedProducts);
    setIsFormVisible(false);
    setShowSuccessModal(true);
  };

  const handleDeleteProduct = (productId) => {
    const updatedProducts = deleteProduct(productId);
    setProducts(updatedProducts);
    setProductToDelete(null);
    setShowSuccessModal(true);
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

  const clearCart = () => {
    setCart([]);
    setShowPaymentModal(false);
  };

  const processPayment = (paymentDetails) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const transaction = {
      items: cart,
      total: total,
      amountPaid: paymentDetails.amountPaid,
      change: paymentDetails.change,
      date: new Date().toISOString()
    };
    
    addTransaction(transaction);
    setShowPaymentModal(false);
    setLastPaymentDetails(paymentDetails);
    setShowSuccessModal(true);

    // Clear cart after successful payment
    setTimeout(() => {
      setShowSuccessModal(false);
      clearCart();
    }, 3000);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
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
        return <DashboardPage navigateTo={navigateTo} />;
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
            clearCart={clearCart}
            onProcessPayment={() => setShowPaymentModal(true)}
          />
        );
      case 'laporan':
        return <ReportsPage />;
      default:
        return <DashboardPage navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
      <Sidebar currentPage={currentPage} navigateTo={navigateTo} />
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
  );
}
