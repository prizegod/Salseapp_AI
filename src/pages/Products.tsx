import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  X,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api'; // 🎯 API இணைப்புகள்

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
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
    transition: { type: 'spring' as const, stiffness: 280, damping: 22 }
  }
};

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', category: 'Grocery', price: '', stock: '' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🎯 1. டேட்டாபேஸிலிருந்து தயாரிப்புகளை (Products) Fetch செய்தல்
  const fetchProductsFromDB = async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      if (data) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products from database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsFromDB();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products.filter(p => 
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString()
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: 'Grocery', price: '', stock: '' });
    }
    setIsModalOpen(true);
  };

  // 🎯 2. புதிய தயாரிப்பைச் சேர்த்தல் அல்லது திருத்துதல் (Database Save/Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) return;

    try {
      if (editingProduct) {
        // Update via API
        await updateProduct(editingProduct.id, {
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          stock: Number(formData.stock)
        });
        showToast('Product updated successfully!');
      } else {
        // Create via API
        await createProduct({
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          stock: Number(formData.stock)
        });
        showToast('New product added to database!');
      }

      setIsModalOpen(false);
      fetchProductsFromDB(); // டேட்டாவை உடனே ரெஃப்ரெஷ் செய்தல்
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product. Please check backend connection.');
    }
  };

  // 🎯 3. தயாரிப்பை நீக்குதல் (Database Delete)
  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(id);
      showToast('Product deleted from database!');
      fetchProductsFromDB();
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product.');
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#18181B] p-4 md:p-8 text-[#FFFBEB] pb-32 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/dashboard')}
            className="p-2.5 rounded-2xl bg-[#27272A] border border-[#F59E0B]/20 text-[#FDE68A]"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-[#FFFBEB]">Product Inventory</h1>
            <p className="text-xs text-[#FDE68A]/70">Live Database Stock & Prices</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-[#F59E0B] text-[#18181B] rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-lg hover:bg-[#D97706] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Product</span>
        </motion.button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 mb-6">
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
        <div className="text-center py-20 text-[#FDE68A]/70 text-sm">Loading inventory from database...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-[#FDE68A]/70 text-sm">No products found in database. Add a new product or use AI Scanner.</div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
        >
          {filteredProducts.map(product => {
            const isLowStock = product.stock <= 5;
            return (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="p-5 rounded-3xl bg-[#27272A] border border-[#F59E0B]/20 shadow-lg flex flex-col justify-between hover:border-[#F59E0B] transition-all"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-[#FDE68A] bg-[#18181B] px-2.5 py-1 rounded-lg font-medium border border-[#F59E0B]/10">
                      {product.category}
                    </span>
                    {isLowStock && (
                      <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#FFFBEB] mt-3">{product.name}</h3>
                  <p className="text-xs text-[#FDE68A]/70 mt-1">
                    Available Stock: <strong className={isLowStock ? 'text-amber-400 font-extrabold' : 'text-[#FFFBEB]'}>{product.stock} units</strong>
                  </p>
                </div>

                <div className="flex justify-between items-center mt-5 pt-3 border-t border-[#F59E0B]/10">
                  <span className="text-lg font-extrabold text-[#FFFBEB]">₹{product.price}</span>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleOpenModal(product)}
                      className="p-2 rounded-xl bg-[#18181B] text-[#FDE68A] hover:text-[#F59E0B] border border-[#F59E0B]/10 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#18181B] border border-[#F59E0B]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#F59E0B]/20">
                <h3 className="text-lg font-bold text-[#FFFBEB]">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-xl text-[#FDE68A]/70 hover:bg-[#27272A] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="text-xs text-[#FDE68A]/80 mb-1 block">Product Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#27272A] border border-[#F59E0B]/20 rounded-xl text-[#FFFBEB] focus:outline-none focus:border-[#F59E0B]"
                    placeholder="e.g. Basmati Rice"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#FDE68A]/80 mb-1 block">Category</label>
                  <input 
                    type="text" 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#27272A] border border-[#F59E0B]/20 rounded-xl text-[#FFFBEB] focus:outline-none focus:border-[#F59E0B]"
                    placeholder="e.g. Grocery"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#FDE68A]/80 mb-1 block">Price (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#27272A] border border-[#F59E0B]/20 rounded-xl text-[#FFFBEB] focus:outline-none focus:border-[#F59E0B]"
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#FDE68A]/80 mb-1 block">Stock Quantity</label>
                    <input 
                      type="number" 
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#27272A] border border-[#F59E0B]/20 rounded-xl text-[#FFFBEB] focus:outline-none focus:border-[#F59E0B]"
                      placeholder="20"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#F59E0B] text-[#18181B] rounded-xl font-bold hover:bg-[#D97706] transition-all shadow-lg shadow-[#F59E0B]/20 cursor-pointer"
                  >
                    {editingProduct ? 'Update Product' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-[#27272A] text-[#FFFBEB] px-4 py-3 rounded-2xl shadow-xl border border-[#F59E0B]/40 flex items-center space-x-2 z-50 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default Products;