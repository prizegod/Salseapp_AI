import React, { useState, useEffect } from "react";
import { X, Copy, Check, FileCode, Server, Database, Layers } from "lucide-react";
import { getCSharpCode } from "../services/api";

interface CSharpCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FILES = [
  { name: "Program.cs", label: "Program.cs (CORS & SQLite Init)", icon: Server },
  { name: "Data/ShopSaleDbContext.cs", label: "ShopSaleDbContext.cs (EF Core & Seed)", icon: Database },
  { name: "Controllers/DocScannerController.cs", label: "DocScannerController.cs (OCR / Scan)", icon: FileCode },
  { name: "Controllers/SalesController.cs", label: "SalesController.cs (POST /api/sales)", icon: Layers },
  { name: "Controllers/ProductsController.cs", label: "ProductsController.cs", icon: FileCode },
  { name: "Models/DailySale.cs", label: "Models/DailySale.cs", icon: Database },
  { name: "Models/Product.cs", label: "Models/Product.cs", icon: Database },
  { name: "Models/Store.cs", label: "Models/Store.cs", icon: Database },
  { name: "ShopSaleAPI.csproj", label: "ShopSaleAPI.csproj (.NET 6.0)", icon: Server },
];

export const CSharpCodeModal: React.FC<CSharpCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(FILES[0].name);
  const [code, setCode] = useState<string>("// Loading C# source...");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    getCSharpCode(selectedFile)
      .then((res) => {
        if (isMounted) {
          setCode(res.content);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setCode(`// Error loading source: ${err.message}`);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedFile]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">ASP.NET Core 6.0 Web API & EF Core Architecture</h2>
              <p className="text-xs text-slate-400">Inspect the exact C# models, DbContext, and controllers powering this system</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Code"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* File selector sidebar */}
          <div className="w-72 border-r border-slate-800 bg-slate-950/60 p-3 overflow-y-auto space-y-1">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Project Structure
            </div>
            {FILES.map((f) => {
              const Icon = f.icon;
              const isActive = selectedFile === f.name;
              return (
                <button
                  key={f.name}
                  onClick={() => setSelectedFile(f.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-medium"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                  <span className="truncate">{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-slate-300">{selectedFile}</span>
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">C# / .NET 6.0</span>
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300 select-text">
              {loading ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <span>Loading source file...</span>
                </div>
              ) : (
                <pre className="whitespace-pre">
                  <code>{code}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
