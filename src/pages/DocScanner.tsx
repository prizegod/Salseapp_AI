// The project does not currently provide React/Vite type declarations.
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import {
  Upload, FileText, AlertCircle, ZoomIn, ZoomOut,
  RotateCw, RefreshCw, Image as ImageIcon, Smartphone, Monitor, Trash2, Database, CheckCircle
} from 'lucide-react';
import { recordSale } from '../services/api'; // 👈 1. Centralized API helper-ஐ இறக்குமதி செய்கிறோம்

interface LineItem {
  name: string;
  price: number;
}

interface ReceiptData {
  items: LineItem[];
}

export const DocScanner: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReceiptData | null>(null);

  // 🎯 Database Processing States
  const [saving, setSaving] = useState<boolean>(false);
  const [dbSuccess, setDbSuccess] = useState<boolean>(false);

  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("கோப்பின் அளவு 10MB-க்கு மேல் இருக்கக்கூடாது.");
      return;
    }

    processSelectedFile(selectedFile);
  };

  const processSelectedFile = (selectedFile: File) => {
    setError(null);
    setResult(null);
    setDbSuccess(false);
    setFile(selectedFile);
    setZoom(1);
    setRotation(0);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleResetAll = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setDbSuccess(false);
    setZoom(1);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const res = reader.result as string;
        resolve(res.split(',')[1]);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // 🎯 Gemini API Scan Function
  const scanSalesInvoice = async () => {
    if (!file) return;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError("API Key கிடைக்கவில்லை. .env ஃபைலில் VITE_GEMINI_API_KEY உள்ளதா எனச் சரிபார்க்கவும்.");
      return;
    }

    setLoading(true);
    setError(null);
    setDbSuccess(false);

    try {
      const base64Data = await fileToBase64(file);
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: file.type || 'image/png', data: base64Data } },
              { text: "Extract only sold items and prices." }
            ]
          }
        ],
        config: {
          systemInstruction: `You are an expert handwritten receipt OCR scanner for mobile repair and hardware shops.
          Extract ONLY two pieces of information for each line item on the receipt:
          1. Item Name (name) - Correct common handwriting shorthand for mobile spare parts (e.g., T/M -> Temper Glass, B/C -> Back Cover, Simtray -> Sim Tray).
          2. Total Price (price) as a numeric value.
          Do not extract total summary lines, dates, shop names, or mobile numbers as line items.`,
          temperature: 0,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the item" },
                    price: { type: Type.NUMBER, description: "Total price of the item" }
                  },
                  required: ["name", "price"]
                }
              }
            },
            required: ["items"]
          }
        }
      });

      if (response.text) {
        const parsedData = JSON.parse(response.text);
        setResult(parsedData);
      } else {
        throw new Error("தரவை எடுக்க முடியவில்லை.");
      }

    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        setError("இணைய இணைப்பு தொடர்பில் இல்லை அல்லது API தடுக்கப்பட்டுள்ளது.");
      } else {
        setError(err.message || "பிழை ஏற்பட்டது.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🎯 2. Execute / Save to Database Function (recordSale API பயன்படுத்தித் திருத்தப்பட்டது)
  const handleExecuteSaveToDB = async () => {
    if (!result || !result.items || result.items.length === 0) return;

    setSaving(true);
    setError(null);

    try {
      // 💡 api.ts-ல் உள்ள recordSale வழியாக C# API-க்குத் தேவையான DTO வடிவமைப்பில் அனுப்புகிறோம்
      const payload = {
        storeId: 1,
        items: result.items.map(item => ({
          productId: 1,
          name: item.name,
          price: Number(item.price || 0),
                                         quantity: 1
        })),
        totalAmount: calculatedTotal
      };

      await recordSale(payload); // 👈 Axios helper API மூலம் C# Backend-க்கு அனுப்பப்படுகிறது

      setDbSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Database Connection Failed!");
    } finally {
      setSaving(false);
    }
  };

  const generateTechInvoiceSample = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('NEXUS TECH & MOBILE HUB', 60, 80);

      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Sales & Service Invoice', 60, 110);
      ctx.fillText('Inv No: INV-2026-8841', 600, 80);
      ctx.fillText('Date: 2026-03-19', 600, 110);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 140);
      ctx.lineTo(840, 140);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('ITEM DESCRIPTION                             PRICE', 60, 180);

      ctx.font = '16px monospace';
      ctx.fillStyle = '#334155';
      ctx.fillText('1. Kingston 16GB DDR4 RAM 3200MHz        ₹3,200', 60, 230);
      ctx.fillText('2. Samsung Galaxy S23 Back Cover           ₹900', 60, 270);
      ctx.fillText('3. 11D Tempered Glass Guard                ₹250', 60, 310);
      ctx.fillText('4. MS Office 2024 Digital Key            ₹2,499', 60, 350);
      ctx.fillText('5. Type-C Fast Charging Cable 65W          ₹450', 60, 390);

      ctx.beginPath();
      ctx.moveTo(60, 430);
      ctx.lineTo(840, 430);
      ctx.stroke();

      canvas.toBlob((blob) => {
        if (blob) {
          processSelectedFile(new File([blob], 'tech-sales-invoice.png', { type: 'image/png' }));
        }
      });
    }
  };

  const calculatedTotal = result?.items?.reduce((acc, item) => acc + (item.price || 0), 0) || 0;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen">
    <header className="mb-8 border-b pb-4">
    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
    <Monitor className="text-blue-600" /> Tech & Mobile Sales Invoice Scanner
    </h1>
    <p className="text-slate-600 text-sm mt-1">
    விற்பனை ரசீதுகளிலிருந்து பொருள் மற்றும் விலையை பிரித்தெடுக்கும் AI ஸ்கேனர்
    </p>
    </header>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Upload Column */}
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <div className="flex justify-between items-center mb-4">
    <h2 className="text-md font-semibold text-slate-700">1. பில் / ரசீதை பதிவேற்றவும்</h2>
    <button
    onClick={generateTechInvoiceSample}
    className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition"
    >
    + 1-Click Tech Invoice Test
    </button>
    </div>

    {!previewUrl ? (
      <div
      onClick={() => fileInputRef.current?.click()}
      className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition"
      >
      <Upload className="mx-auto h-12 w-12 text-slate-400 mb-3" />
      <p className="text-slate-600 font-medium">படம் அல்லது PDF-ஐ பதிவேற்றவும்</p>
      <p className="text-xs text-slate-400 mt-1">Hardware / Mobile Invoice (Max 10MB)</p>
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
      </div>
    ) : (
      <div>
      <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg mb-3">
      <span className="text-xs font-medium truncate max-w-[150px]">{file?.name}</span>
      <div className="flex items-center gap-2">
      <button onClick={() => setZoom(p => Math.min(p + 0.2, 3))} className="p-1 hover:bg-white rounded" title="Zoom In"><ZoomIn size={16} /></button>
      <button onClick={() => setZoom(p => Math.max(p - 0.2, 0.6))} className="p-1 hover:bg-white rounded" title="Zoom Out"><ZoomOut size={16} /></button>
      <button onClick={() => setRotation(p => (p + 90) % 360)} className="p-1 hover:bg-white rounded" title="Rotate"><RotateCw size={16} /></button>
      <button onClick={handleResetAll} className="p-1 hover:bg-red-50 text-red-500 rounded" title="Remove File"><Trash2 size={16} /></button>
      </div>
      </div>

      <div className="relative h-80 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
      {file?.type === 'application/pdf' ? (
        <div className="text-center text-white">
        <FileText size={48} className="mx-auto mb-2 text-blue-400" />
        <p className="text-sm">PDF Invoice Loaded</p>
        </div>
      ) : (
        <img
        src={previewUrl}
        alt="Invoice Preview"
        className="max-h-full transition-transform duration-200 object-contain"
        style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
        />
      )}
      </div>

      <div className="flex gap-2 mt-4">
      <button
      onClick={scanSalesInvoice}
      disabled={loading}
      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:bg-slate-400 cursor-pointer"
      >
      {loading ? <RefreshCw className="animate-spin" size={18} /> : <ImageIcon size={18} />}
      <span>{loading ? "ஸ்கேன் செய்யப்படுகிறது..." : result ? "Re-Scan Invoice" : "Scan Sales Items"}</span>
      </button>

      <button
      onClick={handleResetAll}
      className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition border border-slate-300"
      >
      Clear / New
      </button>
      </div>
      </div>
    )}

    {error && (
      <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
      <AlertCircle size={16} />
      <span>{error}</span>
      </div>
    )}
    </div>

    {/* Results Column */}
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
    <div>
    <div className="flex justify-between items-center mb-4">
    <h2 className="text-md font-semibold text-slate-700">2. Extracted Items</h2>
    {result && (
      <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded text-slate-600 font-medium">
      {copied ? "Copied!" : "Copy JSON"}
      </button>
    )}
    </div>

    {!result && !loading && (
      <div className="h-80 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
      <Smartphone size={40} className="mb-2 stroke-1 text-slate-300" />
      <p className="text-sm">விற்பனைப் பட்டியல் விவரங்கள் இங்கே தோன்றும்</p>
      </div>
    )}

    {result && (
      <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex justify-between items-center">
      <p className="text-xs text-blue-600 font-medium">கணக்கிடப்பட்ட மொத்தத் தொகை</p>
      <p className="text-xl font-bold text-blue-700">₹{calculatedTotal.toLocaleString()}</p>
      </div>

      <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">விற்பனை செய்யப்பட்ட பொருட்கள் ({result.items?.length || 0})</h3>
      <div className="border border-slate-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
      <table className="w-full text-left text-xs">
      <thead className="bg-slate-100 text-slate-600 font-medium sticky top-0">
      <tr>
      <th className="p-2.5">பொருள் பெயர்</th>
      <th className="p-2.5 text-right">விலை</th>
      </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
      {result.items?.map((item, idx) => (
        <tr key={idx} className="hover:bg-slate-50">
        <td className="p-2.5 font-medium text-slate-800">{item.name}</td>
        <td className="p-2.5 text-right font-semibold text-slate-800">₹{item.price?.toLocaleString()}</td>
        </tr>
      ))}
      </tbody>
      </table>
      </div>
      </div>
      </div>
    )}
    </div>

    {/* 🎯 EXECUTE & SAVE TO DATABASE BUTTON */}
    {result && (
      <div className="mt-6 border-t pt-4">
      {dbSuccess && (
        <div className="mb-3 p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs flex items-center justify-center gap-1.5 font-medium">
        <CheckCircle size={16} />
        <span>டேட்டாபேஸில் வெற்றிகரமாகச் சேமிக்கப்பட்டது!</span>
        </div>
      )}
      <button
      onClick={handleExecuteSaveToDB}
      disabled={saving || dbSuccess}
      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-sm cursor-pointer text-sm"
      >
      {saving ? (
        <RefreshCw className="animate-spin" size={18} />
      ) : (
        <Database size={18} />
      )}
      <span>{saving ? "சேமிக்கப்படுகிறது..." : dbSuccess ? "Saved to Database" : "Execute & Save to Database"}</span>
      </button>
      </div>
    )}
    </div>
    </div>
    </div>
  );
};

export default DocScanner;
