import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  Loader2
} from "lucide-react";
import { toast } from "react-toastify";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/api";
import { Product } from "../types";

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Hardware");
  const [customCategory, setCustomCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const fetchProductsList = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      toast.error("Failed to load products from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();

    const handleDbUpdate = () => {
      fetchProductsList();
    };
    window.addEventListener("shopsale-db-updated", handleDbUpdate);
    return () => window.removeEventListener("shopsale-db-updated", handleDbUpdate);
  }, []);

  // Memoize distinct category list
  const existingCategories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
  }, [products]);

  const categories = ["All", ...existingCategories];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName("");
    setCategory(existingCategories[0] || "Hardware");
    setCustomCategory("");
    setPrice("");
    setStock("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setCustomCategory("");
    setPrice(p.price);
    setStock(p.stock);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === "NEW" ? customCategory.trim() : category;

    if (!name.trim() || !finalCategory || price === "" || stock === "") {
      toast.warning("Please fill in all product fields correctly.");
      return;
    }

    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: name.trim(),
                            category: finalCategory,
                            price: Number(price),
                            stock: Number(stock),
        });
        toast.success(`Updated "${name}" successfully.`);
      } else {
        await createProduct({
          name: name.trim(),
                            category: finalCategory,
                            price: Number(price),
                            stock: Number(stock),
        });
        toast.success(`Created product "${name}" successfully.`);
      }

      handleCloseModal();
      fetchProductsList();
      window.dispatchEvent(new CustomEvent("shopsale-db-updated"));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handlePromptDelete = (product: Product) => {
    setProductToDelete(product);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      await deleteProduct(productToDelete.id);
      toast.success(`Deleted product "${productToDelete.name}" successfully.`);
      setProductToDelete(null);
      await fetchProductsList();
      window.dispatchEvent(new CustomEvent("shopsale-db-updated"));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete product from SQLite.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
    {/* Header Banner */}
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
    <div className="flex items-center gap-2">
    <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
    <Package className="w-5 h-5" />
    </span>
    <h2 className="text-xl font-bold text-slate-900">Inventory Catalog</h2>
    </div>
    <p className="text-xs text-slate-500 mt-1">
    Manage product lines, categories, MSRP pricing, and live inventory levels
    </p>
    </div>

    <div className="flex items-center gap-3">
    <button
    onClick={fetchProductsList}
    disabled={loading}
    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
    title="Refresh Inventory"
    >
    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
    </button>
    <button
    onClick={handleOpenAddModal}
    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
    >
    <Plus className="w-4 h-4" />
    <span>Add New Product</span>
    </button>
    </div>
    </div>

    {/* Filters & Search */}
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
    <div className="relative w-full sm:w-80">
    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
    <input
    type="text"
    placeholder="Search products by name or category..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300/80 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
    />
    </div>

    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
    {categories.map((cat) => (
      <button
      key={cat}
      onClick={() => setSelectedCategory(cat)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
        selectedCategory === cat
        ? "bg-slate-900 text-white"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
      >
      {cat}
      </button>
    ))}
    </div>
    </div>

    {/* Products Table */}
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden relative">
    <div className="overflow-x-auto">
    <table className="w-full text-left text-xs text-slate-600">
    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
    <tr>
    <th className="px-6 py-3.5">ID</th>
    <th className="px-6 py-3.5">Product Name</th>
    <th className="px-6 py-3.5">Category</th>
    <th className="px-6 py-3.5">Unit Price</th>
    <th className="px-6 py-3.5">Stock Status</th>
    <th className="px-6 py-3.5 text-right">Actions</th>
    </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
    {loading && products.length === 0 ? (
      <tr>
      <td colSpan={6} className="p-8 text-center text-slate-400">
      <div className="flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
      <span>Fetching items from database...</span>
      </div>
      </td>
      </tr>
    ) : filteredProducts.length === 0 ? (
      <tr>
      <td colSpan={6} className="p-8 text-center text-slate-400">
      No products matched your search or category filter.
      </td>
      </tr>
    ) : (
      filteredProducts.map((p) => {
        const isLow = p.stock < 20;
        const isOut = p.stock <= 0;
        return (
          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
          <td className="px-6 py-3.5 font-mono font-medium text-indigo-600">
          #{p.id}
          </td>
          <td className="px-6 py-3.5 font-semibold text-slate-900">
          {p.name}
          </td>
          <td className="px-6 py-3.5">
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {p.category}
          </span>
          </td>
          <td className="px-6 py-3.5 font-bold text-slate-800">
          ₹{p.price.toFixed(2)}
          </td>
          <td className="px-6 py-3.5">
          <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
            isOut
            ? "bg-rose-50 text-rose-700 border border-rose-200"
            : isLow
            ? "bg-amber-50 text-amber-700 border border-amber-200"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
          >
          {isOut ? (
            "Out of Stock (0)"
          ) : isLow ? (
            <>
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Low: {p.stock} units
            </>
          ) : (
            <>
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            In Stock: {p.stock} units
            </>
          )}
          </span>
          </td>
          <td className="px-6 py-3.5 text-right">
          <div className="flex items-center justify-end gap-2">
          <button
          onClick={() => handleOpenEditModal(p)}
          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
          title="Edit"
          >
          <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
          onClick={() => handlePromptDelete(p)}
          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
          title="Delete Product"
          >
          <Trash2 className="w-3.5 h-3.5" />
          </button>
          </div>
          </td>
          </tr>
        );
      })
    )}
    </tbody>
    </table>
    </div>
    </div>

    {/* Add / Edit Product Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
      <h3 className="text-sm font-bold text-slate-900">
      {editingProduct ? "Edit Product Details" : "Add New Inventory Product"}
      </h3>
      <button
      onClick={handleCloseModal}
      className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
      >
      <X className="w-4 h-4" />
      </button>
      </div>

      <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
      <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
      Product Name *
      </label>
      <input
      type="text"
      required
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="e.g. Wireless Barcode Scanner 2D"
      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
      </div>

      <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
      Category *
      </label>
      <select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
      >
      {existingCategories.map((cat) => (
        <option key={cat} value={cat}>
        {cat}
        </option>
      ))}
      <option value="NEW">+ Create New Category...</option>
      </select>

      {category === "NEW" && (
        <input
        type="text"
        required
        value={customCategory}
        onChange={(e) => setCustomCategory(e.target.value)}
        placeholder="Enter new category name"
        className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      )}
      </div>

      <div className="grid grid-cols-2 gap-3">
      <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
      Price (₹ INR) *
      </label>
      <input
      type="number"
      step="0.01"
      min="0"
      required
      value={price}
      onChange={(e) => setPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
      placeholder="79.99"
      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
      </div>

      <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
      Stock Quantity *
      </label>
      <input
      type="number"
      min="0"
      required
      value={stock}
      onChange={(e) => setStock(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
      placeholder="45"
      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
      </div>
      </div>

      <div className="pt-3 flex items-center justify-end gap-2">
      <button
      type="button"
      onClick={handleCloseModal}
      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
      >
      Cancel
      </button>
      <button
      type="submit"
      disabled={saving}
      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs disabled:opacity-60 cursor-pointer"
      >
      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      <span>{saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}</span>
      </button>
      </div>
      </form>
      </div>
      </div>
    )}

    {/* Delete Confirmation Modal */}
    {productToDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
      <div className="p-6">
      <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
      <Trash2 className="w-5 h-5" />
      </div>
      <div>
      <h3 className="text-sm font-bold text-slate-900">Delete Product</h3>
      <p className="text-xs text-slate-500 mt-0.5">
      This will permanently remove the item from SQLite inventory.
      </p>
      </div>
      </div>

      <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
      <div className="font-bold text-slate-900 text-sm">{productToDelete.name}</div>
      <div className="text-slate-500 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
      <span>Product ID: <strong className="text-slate-700">#{productToDelete.id}</strong></span>
      <span>Category: <strong className="text-slate-700">{productToDelete.category}</strong></span>
      <span>Price: <strong className="text-slate-700">₹{productToDelete.price.toFixed(2)}</strong></span>
      <span>Current Stock: <strong className="text-slate-700">{productToDelete.stock}</strong></span>
      </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2.5">
      <button
      type="button"
      onClick={() => setProductToDelete(null)}
      disabled={deleting}
      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
      >
      Cancel
      </button>
      <button
      type="button"
      onClick={handleConfirmDelete}
      disabled={deleting}
      className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
      >
      {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      <span>{deleting ? "Deleting..." : "Confirm Delete"}</span>
      </button>
      </div>
      </div>
      </div>
      </div>
    )}
    </div>
  );
};

export default Products;
