import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  CreditCard, 
  ArrowLeft,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts, recordSale } from '../services/api'; // 🎯 API ஃபங்க்ஷன்கள் இறக்குமதி செய்யப்பட்டுள்ளன

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.96 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 }
  }
};

export const Sale: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🎯 1. டேட்டாபேஸிலிருந்து தயாரிப்புகளை (Products) Fetch செய்தல்
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to load products from database:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Search & Filter
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products.filter(p => 
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cart Operations
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prevCart => 
      prevCart.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 🎯 2. விற்பனை விவரங்களை டேட்டாபேஸில் பதிவு செய்தல் (Checkout)
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const salePayload = {
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: totalAmount
      };

      // C# Backend API மூலம் டேட்டாபேஸில் சேமித்தல்
      await recordSale(salePayload);

      setIsSuccessModalOpen(true);
      setTimeout(() => {
        setIsSuccessModalOpen(false);
        setCart([]);
      }, 2000);
    } catch (err) {
      console.error('Failed to record sale to database:', err);
      alert('Failed to complete sale. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#18181B] p-4 md:p-8 text-[#FFFBEB] pb-32">
      
      {/* 🚀 Header */}
      <div className="flex items-center justify-between mb-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/dashboard')}
            className="p-2.5 rounded-2xl bg-[#27272A] border border-[#F59E0B]/20 text-[#FDE68A]"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-[#FFFBEB]">New Sale (POS)</h1>
            <p className="text-xs text-[#FDE68A]/70">Live Database Checkout</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#27272A] border border-[#F59E0B]/20 px-3.5 py-2 rounded-2xl">
          <ShoppingCart className="w-5 h-5 text-[#F59E0B]" />
          <span className="text-sm font-bold text-[#FFFBEB]">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
        </div>
      </div>

      {/* 🖥️ Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* 🛍️ Left Column: Product Selection Grid */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Search Bar & Categories */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#FDE68A]/50" />
              <input 
                type="text" 
                placeholder="Search products from database..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#27272A] border border-[#F59E0B]/20 rounded-2xl text-[#FFFBEB] placeholder-[#FDE68A]/40 focus:outline-none focus:border-[#F59E0B] transition-all"
              />
            </div>

            {/* Categories */}
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? 'bg-[#F59E0B] text-[#18181B] font-bold shadow-md shadow-[#F59E0B]/20' 
                      : 'bg-[#27272A] text-[#FDE68A]/70 border border-[#F59E0B]/10 hover:text-[#FFFBEB]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="text-center py-16 text-[#FDE68A]/60 text-sm">Loading database products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-[#FDE68A]/60 text-sm">No products found in database. Add items via Inventory or AI Scanner.</div>
          ) : (
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProducts.map(product => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToCart(product)}
                  className="p-4 rounded-2xl bg-[#27272A] border border-[#F59E0B]/20 hover:border-[#F59E0B] cursor-pointer flex flex-col justify-between transition-all"
                >
                  <div>
                    <span className="text-[10px] text-[#FDE68A] bg-[#18181B] px-2 py-0.5 rounded-md font-medium border border-[#F59E0B]/10">
                      {product.category}
                    </span>
                    <h3 className="text-sm font-semibold text-[#FFFBEB] mt-2 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-[#FDE68A]/60">Stock: {product.stock}</p>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#F59E0B]/10">
                    <span className="text-base font-bold text-[#FFFBEB]">₹{product.price}</span>
                    <div className="p-1.5 rounded-xl bg-[#F59E0B] text-[#18181B] font-bold">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

        </div>

        {/* 🛒 Right Column: Cart & Summary */}
        <div className="bg-[#27272A] border border-[#F59E0B]/20 rounded-3xl p-5 flex flex-col justify-between h-fit space-y-4 shadow-xl">
          <div className="flex justify-between items-center pb-3 border-b border-[#F59E0B]/20">
            <h2 className="text-lg font-bold text-[#FFFBEB]">Cart Summary</h2>
            {cart.length > 0 && (
              <button 
                onClick={() => setCart([])} 
                className="text-xs text-rose-400 hover:underline font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Cart Item List */}
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            <AnimatePresence>
              {cart.length === 0 ? (
                <div className="text-center py-10 text-[#FDE68A]/50 space-y-2">
                  <Package className="w-10 h-10 mx-auto opacity-40 text-[#F59E0B]" />
                  <p className="text-xs">Cart is empty. Tap products to add.</p>
                </div>
              ) : (
                cart.map(item => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-3 bg-[#18181B] border border-[#F59E0B]/20 rounded-2xl flex justify-between items-center"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#FFFBEB] line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-[#FDE68A]/70">₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</p>
                    </div>

                    <div className="flex items-center space-x-1.5 bg-[#27272A] p-1 rounded-xl border border-[#F59E0B]/10">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 rounded-lg bg-[#18181B] text-[#FFFBEB] hover:text-[#F59E0B]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-1 text-[#F59E0B]">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 rounded-lg bg-[#18181B] text-[#FFFBEB] hover:text-[#F59E0B]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-rose-400 hover:text-rose-300 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Total & Checkout */}
          <div className="pt-4 border-t border-[#F59E0B]/20 space-y-3">
            <div className="flex justify-between text-sm text-[#FDE68A]/80">
              <span>Subtotal:</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-[#FFFBEB]">
              <span>Total Payable:</span>
              <span className="text-[#F59E0B]">₹{totalAmount}</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg transition-all ${
                cart.length > 0 
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#18181B] hover:opacity-90 shadow-[#F59E0B]/20 cursor-pointer' 
                  : 'bg-[#18181B] text-[#FDE68A]/30 cursor-not-allowed border border-[#F59E0B]/10'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Complete Sale</span>
            </motion.button>
          </div>

        </div>

      </div>

      {/* 🎉 Animated Success Modal */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-[#18181B] border border-[#F59E0B]/40 rounded-3xl p-6 text-center space-y-4 max-w-sm w-full shadow-2xl"
            >
              <CheckCircle className="w-16 h-16 text-[#F59E0B] mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-[#FFFBEB]">Sale Completed!</h3>
              <p className="text-xs text-[#FDE68A]/70">Transaction recorded successfully in database.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Sale;