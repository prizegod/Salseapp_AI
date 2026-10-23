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
import { scanDocument, recordSale } from '../services/api'; // 👈 createProduct நீக்கப்பட்டது

interface ScannedItem {
  id?: number;
  name: string;
  price: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
};

export const DocScanner: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.target.files?.[0];
    if (!file) return;

    setRawFile(file);
    setSelectedImage(URL.createObjectURL(file));
    setScannedItems([]);
    setErrorMessage(null);
    setIsSaved(false);

    e.target.value = '';
  };

  const handleTriggerScan = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!rawFile) {
      setErrorMessage('Please select an image first.');
      return;
    }

    setIsScanning(true);
    setErrorMessage(null);

    try {
      const response: any = await scanDocument(rawFile);
      const result = response.data || response;
      
      if (result) {
        const rawItems = result.items || result.Items || [];
        const formattedItems: ScannedItem[] = rawItems.map((item: any, index: number) => ({
          id: index + 1,
          name: item.name || item.Name || 'Scanned Item',
          price: Number(item.price || item.Price || 0),
        }));

        setScannedItems(formattedItems);
        const calculatedTotal = Number(result.totalAmount || result.TotalAmount || formattedItems.reduce((acc, curr) => acc + curr.price, 0));
        setTotalAmount(calculatedTotal);
      } else {
        setErrorMessage('No data returned from backend scanner.');
      }
    } catch (err: any) {
      console.error('Scan Error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to scan document.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleRetry = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setScannedItems([]);
    setSelectedImage(null);
    setRawFile(null);
    setErrorMessage(null);

    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  // 🎯 இன்வென்டரியில் சேர்க்காமல் நேராக ரிப்போர்ட்ஸ்/சேல்ஸ் டேட்டாவுக்கு மட்டும் அனுப்புதல்
  const handleSaveToInventory = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsSaved(true);

      const itemsPayload = scannedItems.map(item => ({
        productId: 0,
        name: item.name,
        price: item.price,
        quantity: 1
      }));

      // நேராக விற்பனைப் பதிவாக (Sales) ரிப்போர்ட்ஸுக்கு அனுப்புதல்
      await recordSale({
        storeId: 1,
        totalAmount: totalAmount,
        items: itemsPayload
      });

      setTimeout(() => {
        setIsSaved(false);
        setSelectedImage(null);
        setRawFile(null);
        setScannedItems([]);
        setTotalAmount(0);
      }, 1500);

    } catch (err) {
      console.error('Save Error:', err);
      setIsSaved(false);
      setErrorMessage('Failed to save sales records to database.');
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#18181B] p-4 md:p-8 text-[#FFFBEB] pb-32 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.button 
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard');
            }}
            className="p-2.5 rounded-2xl bg-[#27272A] border border-[#F59E0B]/20 text-[#FDE68A] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-[#FFFBEB] flex items-center gap-2">
              AI Bill Scanner <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            </h1>
            <p className="text-xs text-[#FDE68A]/70">Direct Report Sync Mode without Inventory Stock</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="relative border-2 border-dashed border-[#F59E0B]/30 rounded-3xl p-4 bg-[#27272A] text-center min-h-[320px] flex flex-col justify-center items-center overflow-hidden shadow-lg">
            {selectedImage ? (
              <div className="relative w-full h-full max-h-[380px] rounded-2xl overflow-hidden flex justify-center items-center bg-[#18181B]">
                <img src={selectedImage} alt="Receipt" className="max-h-full object-contain rounded-xl" />
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
                  <p className="text-xs text-[#FDE68A]/60 mt-1">Select an invoice to start scanning</p>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }}
                  className="px-5 py-2.5 bg-[#F59E0B] text-[#18181B] text-xs font-bold rounded-2xl shadow-lg inline-flex items-center gap-2 hover:bg-[#D97706] transition-all mt-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> Select Bill Image
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
            )}
          </div>

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
                    <span className="text-[#FDE68A]/85">Total Bill Amount: <strong className="text-[#F59E0B]">₹{totalAmount}</strong></span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {scannedItems.map((item, index) => (
                      <div key={item.id || index} className="p-3 bg-[#18181B] border border-[#F59E0B]/10 rounded-xl flex justify-between items-center text-xs">
                        <p className="font-semibold text-[#FFFBEB]">{item.name}</p>
                        <span className="font-bold text-[#F59E0B]">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {scannedItems.length > 0 && (
              <div className="pt-4 border-t border-[#F59E0B]/20 mt-4">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSaveToInventory}
                  className="w-full py-3.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#18181B] rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-[#F59E0B]/20 cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Record Scanned Bill to Reports</span>
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isSaved && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }} className="bg-[#18181B] border border-[#F59E0B]/40 rounded-3xl p-6 text-center space-y-3 max-w-sm w-full shadow-2xl">
              <CheckCircle2 className="w-14 h-14 text-[#F59E0B] mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-[#FFFBEB]">Reports Updated!</h3>
              <p className="text-xs text-[#FDE68A]/70">Scanned bill records added successfully to reports.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DocScanner;