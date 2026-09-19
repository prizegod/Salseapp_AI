import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Package,
  Store as StoreIcon,
  Calendar,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  RefreshCw,
  Layers,
  Trash2,
  Loader2
} from "lucide-react";
import { toast } from "react-toastify";
import { getProducts, getStores, getSales, recordSale, deleteSale } from "../services/api";
import { Product, Store, DailySale } from "../types";

export const Sale: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [recentSales, setRecentSales] = useState<DailySale[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [selectedStoreId, setSelectedStoreId] = useState<number>(1);
  const [quantity, setQuantity] = useState<number | "">(1);
  const [saleDate, setSaleDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<DailySale | null>(null);
  const [deletingSale, setDeletingSale] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      const [prods, strs, sls] = await Promise.all([
        getProducts(),
                                                   getStores(),
                                                   getSales(),
      ]);
      setProducts(prods);
      setStores(strs);
      setRecentSales(sls);

      // Set default selected product if none selected or if previously selected item is invalid
      if (prods.length > 0) {
        if (
          selectedProductId === "" ||
          !prods.some((p) => p.id === Number(selectedProductId))
        ) {
          const availableProd = prods.find((p) => p.stock > 0) || prods[0];
          setSelectedProductId(availableProd.id);
        }
      }
      if (strs.length > 0 && !strs.some((s) => s.storeID === selectedStoreId)) {
        setSelectedStoreId(strs[0].storeID);
      }
    } catch (error: any) {
      console.error("Error loading sales entry data:", error);
      toast.error("Failed to load products or store data.");
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleDbUpdate = () => {
      fetchData();
    };
    window.addEventListener("shopsale-db-updated", handleDbUpdate);
    return () => window.removeEventListener("shopsale-db-updated", handleDbUpdate);
  }, []);

  const selectedProduct = products.find((p) => p.id === Number(selectedProductId));
  const numericQty = typeof quantity === "number" ? quantity : 0;
  const totalPrice = selectedProduct ? (selectedProduct.price * numericQty).toFixed(2) : "0.00";

  const handleResetForm = () => {
    const availableProd = products.find((p) => p.stock > 0) || products[0];
    setSelectedProductId(availableProd ? availableProd.id : "");
    setSelectedStoreId(stores.length > 0 ? stores[0].storeID : 1);
    setQuantity(1);
    setSaleDate(new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId || selectedProductId === "") {
      toast.warning("Please select a product.");
      return;
    }

    if (!quantity || quantity <= 0) {
      toast.warning("Please enter a valid quantity of at least 1.");
      return;
    }

    if (!selectedProduct) {
      toast.error("Selected product does not exist.");
      return;
    }

    if (quantity > selectedProduct.stock) {
      toast.error(`Insufficient inventory! Only ${selectedProduct.stock} units available.`);
      return;
    }

    setSubmitting(true);
    try {
      // Build ISO Date string using current local time appended to selected date
      const selectedDateObj = new Date(saleDate);
      const now = new Date();
      selectedDateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

      const newSale = await recordSale({
        storeID: Number(selectedStoreId),
                                       productID: Number(selectedProductId),
                                       quantitySold: Number(quantity),
                                       saleDate: selectedDateObj.toISOString(),
      });

      toast.success(
        `Sale recorded successfully! Total: ₹${newSale.totalAmount?.toFixed(2)} (${newSale.quantitySold}x ${newSale.productName})`
      );

      handleResetForm();
      await fetchData();

      // Dispatch global DB update event to refresh other tabs/components
      window.dispatchEvent(new CustomEvent("shopsale-db-updated"));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to record sale.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteSale = async () => {
    if (!saleToDelete) return;
    try {
      setDeletingSale(true);
      await deleteSale(saleToDelete.saleID);
      toast.success(`Sale #${saleToDelete.saleID} deleted. Inventory stock restored.`);
      setSaleToDelete(null);
      await fetchData();
      window.dispatchEvent(new CustomEvent("shopsale-db-updated"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete sale record.");
    } finally {
      setDeletingSale(false);
    }
  };

  return (
    <div className="space-y-6">
    {/* Header Banner */}
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
    <div className="flex items-center gap-2">
    <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
    <ShoppingCart className="w-5 h-5" />
    </span>
    <h2 className="text-xl font-bold text-slate-900">Sales Entry Terminal</h2>
    </div>
    <p className="text-xs text-slate-500 mt-1">
    Record retail sales transactions, update inventory counts, and synchronize with SQLite EF Core
    </p>
    </div>
    <div className="flex items-center gap-2">
    <button
    onClick={fetchData}
    disabled={loadingInitial}
    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
    >
    <RefreshCw className={`w-3.5 h-3.5 ${loadingInitial ? "animate-spin" : ""}`} />
    <span>Refresh Catalog</span>
    </button>
    </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    {/* Sales Entry Form Card */}
    <div className="lg:col-span-7">
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
    <div className="flex items-center gap-2">
    <Layers className="w-4 h-4 text-indigo-600" />
    <h3 className="text-sm font-semibold text-slate-900">New Transaction Entry</h3>
    </div>
    <span className="text-xs font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded">
    POST /api/sales
    </span>
    </div>

    <form onSubmit={handleSubmit} className="p-6 space-y-5">
    {/* Product Selection */}
    <div>
    <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
    <span className="flex items-center gap-1.5">
    <Package className="w-3.5 h-3.5 text-indigo-500" />
    Select Product *
    </span>
    {selectedProduct && (
      <span
      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
        selectedProduct.stock < 15
        ? "bg-amber-50 text-amber-700 border border-amber-200"
        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
      }`}
      >
      In Stock: {selectedProduct.stock} units
      </span>
    )}
    </label>

    <select
    value={selectedProductId}
    onChange={(e) => setSelectedProductId(Number(e.target.value))}
    required
    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-2xs"
    >
    <option value="" disabled>-- Select a Product --</option>
    {products.map((p) => (
      <option key={p.id} value={p.id} disabled={p.stock <= 0}>
      {p.name} — ₹{p.price.toFixed(2)} ({p.category}) [{p.stock <= 0 ? "Out of Stock" : `Stock: ${p.stock}`}]
      </option>
    ))}
    </select>
    </div>

    {/* Store Location & Sale Date Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* Store Selection */}
    <div>
    <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
    <StoreIcon className="w-3.5 h-3.5 text-indigo-500" />
    Store Location *
    </label>
    <select
    value={selectedStoreId}
    onChange={(e) => setSelectedStoreId(Number(e.target.value))}
    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-2xs"
    >
    {stores.map((s) => (
      <option key={s.storeID} value={s.storeID}>
      {s.name} ({s.location})
      </option>
    ))}
    </select>
    </div>

    {/* Sale Date */}
    <div>
    <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
    Sale Date *
    </label>
    <input
    type="date"
    value={saleDate}
    onChange={(e) => setSaleDate(e.target.value)}
    required
    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-2xs"
    />
    </div>
    </div>

    {/* Quantity Input */}
    <div>
    <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
    <span className="flex items-center gap-1.5">
    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
    Quantity to Sell *
    </span>
    {selectedProduct && selectedProduct.stock > 0 && (
      <span className="text-xs text-slate-500">
      Max: {selectedProduct.stock}
      </span>
    )}
    </label>
    <div className="relative">
    <input
    type="number"
    min="1"
    max={selectedProduct ? selectedProduct.stock : 9999}
    value={quantity}
    onChange={(e) => {
      const val = e.target.value === "" ? "" : parseInt(e.target.value, 10);
      setQuantity(val);
    }}
    required
    placeholder="Enter quantity"
    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-2xs"
    />
    </div>
    {selectedProduct && numericQty > selectedProduct.stock && (
      <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      Quantity exceeds available stock ({selectedProduct.stock})
      </p>
    )}
    </div>

    {/* Live Transaction Preview */}
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
    <div className="flex justify-between text-xs text-slate-500">
    <span>Unit Price:</span>
    <span className="font-medium text-slate-700">
    ₹{selectedProduct ? selectedProduct.price.toFixed(2) : "0.00"}
    </span>
    </div>
    <div className="flex justify-between text-xs text-slate-500">
    <span>Quantity:</span>
    <span className="font-medium text-slate-700">{numericQty} units</span>
    </div>
    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
    <span className="text-sm font-semibold text-slate-800">Total Sale Amount:</span>
    <span className="text-xl font-bold text-indigo-600">₹{totalPrice}</span>
    </div>
    </div>

    {/* Action Buttons */}
    <div className="flex items-center gap-3 pt-2">
    <button
    type="submit"
    disabled={submitting || (selectedProduct ? numericQty > selectedProduct.stock || selectedProduct.stock <= 0 : false)}
    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60 cursor-pointer"
    >
    {submitting ? (
      <>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Recording Sale...</span>
      </>
    ) : (
      <>
      <CheckCircle2 className="w-4 h-4" />
      <span>Submit Sale Transaction</span>
      </>
    )}
    </button>
    <button
    type="button"
    onClick={handleResetForm}
    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
    >
    Reset
    </button>
    </div>
    </form>
    </div>
    </div>

    {/* Product Quick-View Card */}
    <div className="lg:col-span-5 space-y-6">
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
    <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
    <IndianRupee className="w-4 h-4 text-emerald-600" />
    Item Summary & Specification
    </h3>

    {selectedProduct ? (
      <div className="space-y-4">
      <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded">
      {selectedProduct.category}
      </span>
      <h4 className="text-base font-bold text-slate-900 mt-1.5">{selectedProduct.name}</h4>
      <div className="mt-3 flex items-baseline justify-between">
      <span className="text-2xl font-black text-slate-900">
      ₹{selectedProduct.price.toFixed(2)}
      </span>
      <span className="text-xs text-slate-500">Retail MSRP</span>
      </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
      <span className="text-slate-500 block">Available Units</span>
      <span className="text-base font-bold text-slate-800 mt-0.5 block">
      {selectedProduct.stock}
      </span>
      </div>
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
      <span className="text-slate-500 block">Post-Sale Stock</span>
      <span className={`text-base font-bold mt-0.5 block ${selectedProduct.stock - numericQty < 0 ? "text-rose-600" : "text-slate-800"}`}>
      {selectedProduct.stock - numericQty}
      </span>
      </div>
      </div>

      <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200/80 flex items-start gap-2">
      <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
      <span>
      Database automatically updates the <code>DailySales</code> table with foreign keys to Store and Product upon confirmation.
      </span>
      </div>
      </div>
    ) : (
      <div className="p-8 text-center text-slate-400 text-xs">
      Select a product to view real-time inventory and pricing details.
      </div>
    )}
    </div>
    </div>
    </div>

    {/* Recent Daily Sales Transactions Table */}
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
    <div>
    <h3 className="text-sm font-semibold text-slate-900">Recent Sales Transactions</h3>
    <p className="text-xs text-slate-500">Synchronized records from SQLite database</p>
    </div>
    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
    {recentSales.length} Total Sales
    </span>
    </div>

    <div className="overflow-x-auto">
    <table className="w-full text-left text-xs text-slate-600">
    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
    <tr>
    <th className="px-6 py-3.5">Sale ID</th>
    <th className="px-6 py-3.5">Date</th>
    <th className="px-6 py-3.5">Store</th>
    <th className="px-6 py-3.5">Product</th>
    <th className="px-6 py-3.5">Unit Price</th>
    <th className="px-6 py-3.5">Qty Sold</th>
    <th className="px-6 py-3.5 text-right">Total Amount</th>
    <th className="px-4 py-3.5 text-center w-16">Action</th>
    </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
    {recentSales.length === 0 ? (
      <tr>
      <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
      No sales recorded yet. Submit your first transaction above!
      </td>
      </tr>
    ) : (
      recentSales.map((sale) => (
        <tr key={sale.saleID} className="hover:bg-slate-50/80 transition-colors">
        <td className="px-6 py-3 font-mono font-medium text-indigo-600">
        #{sale.saleID.toString().padStart(4, "0")}
        </td>
        <td className="px-6 py-3 text-slate-500">
        {new Date(sale.saleDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
        </td>
        <td className="px-6 py-3 font-medium text-slate-800">
        {sale.storeName || `Store #${sale.storeID}`}
        </td>
        <td className="px-6 py-3 font-medium text-slate-900">
        {sale.productName}
        <span className="block text-[10px] text-slate-400 font-normal">
        {sale.productCategory}
        </span>
        </td>
        <td className="px-6 py-3 text-slate-600">
        ₹{sale.productUnitPrice?.toFixed(2)}
        </td>
        <td className="px-6 py-3 font-semibold text-slate-800">
        {sale.quantitySold}x
        </td>
        <td className="px-6 py-3 text-right font-bold text-emerald-600 text-sm">
        ₹{sale.totalAmount?.toFixed(2)}
        </td>
        <td className="px-4 py-3 text-center">
        <button
        onClick={() => setSaleToDelete(sale)}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
        title="Delete Sale Transaction"
        >
        <Trash2 className="w-3.5 h-3.5" />
        </button>
        </td>
        </tr>
      ))
    )}
    </tbody>
    </table>
    </div>
    </div>

    {/* Delete Sale Confirmation Modal */}
    {saleToDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
      <div className="p-6">
      <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
      <Trash2 className="w-5 h-5" />
      </div>
      <div>
      <h3 className="text-sm font-bold text-slate-900">Delete Sale Transaction</h3>
      <p className="text-xs text-slate-500 mt-0.5">
      This will remove the transaction and restore product inventory.
      </p>
      </div>
      </div>

      <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
      <div className="font-bold text-slate-900">Sale #{saleToDelete.saleID}</div>
      <div className="text-slate-600 mt-1 space-y-0.5">
      <div>Product: <strong className="text-slate-800">{saleToDelete.productName}</strong></div>
      <div>Quantity: <strong className="text-slate-800">{saleToDelete.quantitySold} units</strong></div>
      <div>Total Amount: <strong className="text-emerald-600">₹{saleToDelete.totalAmount?.toFixed(2)}</strong></div>
      </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2.5">
      <button
      type="button"
      onClick={() => setSaleToDelete(null)}
      disabled={deletingSale}
      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
      >
      Cancel
      </button>
      <button
      type="button"
      onClick={handleConfirmDeleteSale}
      disabled={deletingSale}
      className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
      >
      {deletingSale ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
      <span>{deletingSale ? "Deleting..." : "Confirm Delete"}</span>
      </button>
      </div>
      </div>
      </div>
      </div>
    )}
    </div>
  );
};

export default Sale;
