import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  Camera, 
  Scan, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  PlusCircle,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { scanDocument, createProduct } from '../services/api';

interface ScannedItem {
  id?: number;
  name: string;
  qty: number;
  price: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 }
  }
};

export const DocScanner: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null); // 🎯 ஒரிஜினல் ஃபைலைச் சேமிக்க
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [vendorName, setVendorName] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. File Selection (படம் தேர்வு செய்தல் - உடனே ஸ்கேன் ஆகாது)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setRawFile(file);
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setScannedItems([]);
    setErrorMessage(null);
    setIsSaved(false);

    if (event.target) {
      event.target.value = '';
    }
  };

  // 🎯 2. Scan Button Action (பக்கம் ரீப்ரெஷ் ஆகாமல் பாதுகாப்பாக ஏபிஇ கோரிக்கை அனுப்புதல்)
    const handleTriggerScan = async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
  
      if (!rawFile) {
        setErrorMessage('Please select an image first.');
        return;
      }
  
      setIsScanning(true);
      setErrorMessage(null);
  
      try {
        // 🔒 C# Backend Proxy API Call via Axios
        const result: any = await scanDocument(rawFile);
  
        if (result) {
          setVendorName(result.merchantName || result.vendorName || 'General Store');
          setTotalAmount(result.totalAmount || 0);
          
          const formattedItems: ScannedItem[] = (result.items || []).map((item: any, idx: number) => ({
            id: idx + 1,
            name: item.description || item.name || 'Scanned Item',
            qty: item.quantity || item.qty || 1,
            price: item.unitPrice || item.price || 0,
          }));
  
          setScannedItems(formattedItems);
        } else {
          setErrorMessage('No data returned from backend scanner.');
        }
      } catch (err: any) {
        console.error('DocScanner Error:', err);
        setErrorMessage(
          err.response?.data?.message || 'Failed to scan document via server. Please check backend connection.'
        );
      } finally {
        setIsScanning(false);
      }
    };

  // 🎯 3. Retry / Change Image Button Action
  const handleRetry = () => {
    setScannedItems([]);
    setErrorMessage(null);
    fileInputRef.current?.click();
  };

  // 4. Save to Inventory
  const handleSaveToInventory = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsSaved(true);
      
      for (const item of scannedItems) {
        await createProduct({
          name: item.name,
          category: 'Scanned Invoice',
          price: item.price,
          stock: item.qty,
        });
      }

      setTimeout(() => {
        setIsSaved(false);
        setSelectedImage(null);
        setRawFile(null);
        setScannedItems([]);
      }, 2000);
    } catch (err) {
      console.error('Failed to save scanned items:', err);
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#18181B] p-4 md:p-8 text-[#FFFBEB] pb-32 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 🚀 Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/dashboard')}
            className="p-2.5 rounded-2xl bg-[#27272A] border border-[#F59E0B]/20 text-[#FDE68A] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-[#FFFBEB] flex items-center gap-2">
              AI Bill Scanner <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            </h1>
            <p className="text-xs text-[#FDE68A]/70">Scan receipts with Scan & Retry controls</p>
          </div>
        </div>
      </div>

      {/* 🖥️ Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 📸 Left Column: Image Preview & Scan/Retry Controls */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="relative border-2 border-dashed border-[#F59E0B]/30 rounded-3xl p-4 bg-[#27272A] text-center min-h-[320px] flex flex-col justify-center items-center overflow-hidden shadow-lg">
            
            {selectedImage ? (
              <div className="relative w-full h-full max-h-[380px] rounded-2xl overflow-hidden flex justify-center items-center bg-[#18181B]">
                <img src={selectedImage} alt="Receipt" className="max-h-full object-contain rounded-xl" />

                {/* ⚡ Scanning Animation */}
                {isScanning && (
                  <motion.div 
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent shadow-[0_0_15px_#F59E0B]"
                  />
                )}
              </div>
            ) : (
              <div className="space-y-3 p-6">
                <div className="p-4 rounded-full bg-[#18181B] text-[#F59E0B] w-16 h-16 mx-auto flex items-center justify-center border border-[#F59E0B]/20">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#FFFBEB]">Upload or Capture Bill</h3>
                  <p className="text-xs text-[#FDE68A]/60 mt-1">Select an invoice to enable Scan & Retry</p>
                </div>

                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-[#F59E0B] text-[#18181B] text-xs font-bold rounded-2xl shadow-lg inline-flex items-center gap-2 hover:bg-[#D97706] transition-all mt-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> Select Bill Image
                </button>

                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </div>
            )}
          </div>

          {/* 🎯 Scan & Retry Action Buttons */}
          {selectedImage && (
            <div className="flex gap-3">
              {!isScanning && (
                <button 
                  type="button"
                  onClick={handleTriggerScan}
                  className="w-full py-3 bg-[#F59E0B] text-[#18181B] text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-[#D97706] transition-all cursor-pointer"
                >
                  <Scan className="w-4 h-4" /> Scan Document
                </button>
              )}

              {/* Retry / Change Image Button */}
              <button 
                type="button"
                onClick={handleRetry}
                disabled={isScanning}
                className="w-full py-3 bg-[#27272A] border border-[#F59E0B]/20 text-[#FDE68A] text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 hover:border-[#F59E0B] transition-all cursor-pointer"
              >
                <RefreshCcw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} /> 
                {isScanning ? 'Scanning...' : 'Retry / Change Image'}
              </button>
            </div>
          )}
        </motion.div>

        {/* 📑 Right Column: Extracted Results */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="bg-[#27272A] border border-[#F59E0B]/20 rounded-3xl p-5 min-h-[320px] flex flex-col justify-between shadow-xl">
            
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-[#F59E0B]/20 mb-4">
                <h2 className="text-lg font-bold text-[#FFFBEB] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#F59E0B]" /> Extracted Data
                </h2>
                {isScanning && (
                  <span className="text-xs text-[#F59E0B] font-semibold animate-pulse flex items-center gap-1">
                    <Scan className="w-4 h-4 animate-spin" /> Processing...
                  </span>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {!selectedImage && !isScanning && (
                <div className="text-center py-12 text-[#FDE68A]/50 space-y-2">
                  <AlertCircle className="w-10 h-10 mx-auto opacity-40 text-[#F59E0B]" />
                  <p className="text-xs">Upload an image and click 'Scan Document' to view details.</p>
                </div>
              )}

              {scannedItems.length > 0 && (
                <div className="space-y-3">
                  <div className="bg-[#18181B] p-3 rounded-2xl border border-[#F59E0B]/20 flex justify-between text-xs">
                    <span className="text-[#FDE68A]/80">Vendor: <strong className="text-[#FFFBEB]">{vendorName}</strong></span>
                    <span className="text-[#FDE68A]/80">Total: <strong className="text-[#F59E0B]">₹{totalAmount}</strong></span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {scannedItems.map((item, index) => (
                      <div 
                        key={item.id || index} 
                        className="p-3 bg-[#18181B] border border-[#F59E0B]/10 rounded-xl flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-semibold text-[#FFFBEB]">{item.name}</p>
                          <p className="text-[10px] text-[#FDE68A]/60">Qty: {item.qty} × ₹{item.price}</p>
                        </div>
                        <span className="font-bold text-[#F59E0B]">₹{item.qty * item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {scannedItems.length > 0 && (
              <div className="pt-4 border-t border-[#F59E0B]/20 mt-4">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSaveToInventory}
                  className="w-full py-3.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#18181B] rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-[#F59E0B]/20 cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Add Scanned Items to Products</span>
                </motion.button>
              </div>
            )}

          </div>
        </motion.div>

      </div>

      {/* 🎉 Success Modal */}
      <AnimatePresence>
        {isSaved && (
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
              className="bg-[#18181B] border border-[#F59E0B]/40 rounded-3xl p-6 text-center space-y-3 max-w-sm w-full shadow-2xl"
            >
              <CheckCircle2 className="w-14 h-14 text-[#F59E0B] mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-[#FFFBEB]">Inventory Updated!</h3>
              <p className="text-xs text-[#FDE68A]/70">Scanned bill items added successfully into your store database.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default DocScanner;