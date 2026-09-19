import React, { useState, useEffect } from "react";
import {
  X,
  Database,
  Download,
  RefreshCw,
  Play,
  Table,
  Terminal,
  Code2,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getDatabaseInfo,
  getTableRecords,
  executeSqlQuery,
  resetSqliteDatabase,
  getDatabaseDownloadUrl,
} from "../services/api";
import { DatabaseInfo, TableRecordsResult, SqlQueryResult } from "../types";

interface SQLiteDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export const SQLiteDatabaseModal: React.FC<SQLiteDatabaseModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<"tables" | "sql" | "schema" | "info">("tables");
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<string>("Products");

  // Table browser state
  const [tableData, setTableData] = useState<TableRecordsResult | null>(null);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);

  // SQL Console state
  const [sqlQuery, setSqlQuery] = useState<string>(
    "SELECT StoreName, COUNT(*) as TotalOrders, ROUND(SUM(TotalAmount), 2) as GrossRevenue\nFROM DailySales\nGROUP BY StoreName;"
  );
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);
  const [executingQuery, setExecutingQuery] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const fetchDbInfo = async () => {
    try {
      setLoading(true);
      const info = await getDatabaseInfo();
      setDbInfo(info);
      if (info.tables.length > 0 && !info.tables.some((t) => t.name === selectedTable)) {
        setSelectedTable(info.tables[0].name);
      }
    } catch (err: any) {
      toast.error(`Failed to load SQLite database metadata: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableRows = async (tableName: string) => {
    try {
      setLoadingTable(true);
      const data = await getTableRecords(tableName, 50, 0);
      setTableData(data);
    } catch (err: any) {
      toast.error(`Error loading table ${tableName}: ${err.message}`);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDbInfo();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedTable) {
      fetchTableRows(selectedTable);
    }
  }, [isOpen, selectedTable]);

  if (!isOpen) return null;

  const handleRunQuery = async () => {
    if (!sqlQuery.trim()) return;
    try {
      setExecutingQuery(true);
      const result = await executeSqlQuery(sqlQuery);
      setQueryResult(result);
      if (result.success) {
        toast.success(`Query executed in ${result.durationMs}ms`);
        // If it was an insert/update/delete, refresh tables & notify parent
        if (!/^(SELECT|PRAGMA|EXPLAIN)/i.test(sqlQuery.trim())) {
          fetchDbInfo();
          if (selectedTable) fetchTableRows(selectedTable);
          onDataChanged?.();
        }
      } else {
        toast.error(result.error || "SQL error encountered");
      }
    } catch (err: any) {
      toast.error(`Execution failed: ${err.message}`);
    } finally {
      setExecutingQuery(false);
    }
  };

  const handleResetDatabase = async () => {
    try {
      setResetting(true);
      const res = await resetSqliteDatabase();
      toast.success("SQLite database ShopSale.db reseeded successfully!");
      setDbInfo(res.info);
      setShowResetConfirm(false);
      fetchTableRows(selectedTable);
      onDataChanged?.();
    } catch (err: any) {
      toast.error(`Failed to reset SQLite database: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  const activeTableMeta = dbInfo?.tables.find((t) => t.name === selectedTable);

  const PRESET_QUERIES = [
    {
      label: "Revenue by Store",
      query:
        "SELECT StoreName, COUNT(*) as Orders, ROUND(SUM(TotalAmount), 2) as TotalRevenue\nFROM DailySales\nGROUP BY StoreName;",
    },
    {
      label: "Low Stock Products (<20 units)",
      query: "SELECT Id, Name, Category, Stock, Price\nFROM Products\nWHERE Stock < 20\nORDER BY Stock ASC;",
    },
    {
      label: "Recent Sales with Details",
      query:
        "SELECT s.SaleID, s.SaleDate, s.StoreName, p.Name as Product, s.QuantitySold, s.TotalAmount\nFROM DailySales s\nJOIN Products p ON s.ProductID = p.Id\nORDER BY s.SaleID DESC\nLIMIT 10;",
    },
    {
      label: "SQLite Table Pragma (DailySales)",
      query: "PRAGMA table_info(DailySales);",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">SQLite Database Engine</h2>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ShopSale.db
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {dbInfo?.fileSizeFormatted ?? "Loading..."}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Physical SQLite 3 storage matching ASP.NET Core EF Core architecture
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2">
            <a
              href={getDatabaseDownloadUrl()}
              download="ShopSale.db"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              title="Download physical SQLite .db file to open in DB Browser or SQLite Studio"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .db</span>
            </a>

            {showResetConfirm ? (
              <div className="flex items-center gap-1 bg-rose-950/60 border border-rose-600/40 px-2 py-1 rounded-lg animate-in fade-in">
                <span className="text-[11px] text-rose-300 font-semibold px-1">Recreate & Seed?</span>
                <button
                  onClick={handleResetDatabase}
                  disabled={resetting}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                >
                  {resetting ? "Resetting..." : "Yes, Reset"}
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                disabled={resetting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                title="Reseed SQLite database with default sample data"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
                <span>Reset & Seed</span>
              </button>
            )}

            <button
              onClick={fetchDbInfo}
              disabled={loading}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              title="Refresh SQLite metadata"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("tables")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "tables"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table Data Explorer</span>
              {dbInfo && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
                  {dbInfo.tables.length} tables
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("sql")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "sql"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>SQL Query Console</span>
            </button>

            <button
              onClick={() => setActiveTab("schema")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "schema"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Schema DDL</span>
            </button>

            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "info"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Database Status</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-slate-500 text-[11px]">DRIVER:</span>
            <span className="text-slate-300 font-mono text-[11px]">SQLite 3 / WASM</span>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-950">
          {/* TAB 1: Table Explorer */}
          {activeTab === "tables" && (
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar table selector */}
              <div className="w-64 border-r border-slate-800 bg-slate-900/40 p-3 space-y-1 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  SQLite Tables
                </div>
                {dbInfo?.tables.map((t) => {
                  const isSelected = selectedTable === t.name;
                  return (
                    <button
                      key={t.name}
                      onClick={() => setSelectedTable(t.name)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Table className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                        <span className="truncate font-mono">{t.name}</span>
                      </div>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                        {t.rowCount} rows
                      </span>
                    </button>
                  );
                })}

                {/* Schema column inspector in table sidebar */}
                {activeTableMeta && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Columns ({activeTableMeta.columns.length})
                    </div>
                    <div className="space-y-1 mt-1 max-h-48 overflow-y-auto pr-1">
                      {activeTableMeta.columns.map((c) => (
                        <div
                          key={c.name}
                          className="flex items-center justify-between px-2 py-1 rounded bg-slate-900/60 text-[11px] font-mono"
                        >
                          <span className="text-slate-300 flex items-center gap-1">
                            {c.pk && <KeyRound className="w-2.5 h-2.5 text-amber-400" />}
                            {c.name}
                          </span>
                          <span className="text-slate-500 text-[10px] uppercase">{c.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Table Data View */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Table:</span>
                    <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                      {selectedTable}
                    </span>
                    <span className="text-xs text-slate-400">
                      • {tableData?.total ?? 0} total records
                    </span>
                  </div>
                  <button
                    onClick={() => fetchTableRows(selectedTable)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingTable ? "animate-spin" : ""}`} />
                    <span>Refresh rows</span>
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-4">
                  {loadingTable ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-xs gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Reading SQLite records...</span>
                    </div>
                  ) : !tableData || tableData.rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
                      <Table className="w-8 h-8 text-slate-700 mb-2" />
                      <p>Table {selectedTable} currently has 0 rows in SQLite.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-800 rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-900 text-slate-300 border-b border-slate-800">
                          <tr>
                            {tableData.columns.map((col) => (
                              <th key={col} className="px-4 py-2.5 font-bold tracking-wider text-slate-200">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-950/80">
                          {tableData.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                              {tableData.columns.map((col) => {
                                const val = row[col];
                                const isNumber = typeof val === "number";
                                return (
                                  <td
                                    key={col}
                                    className={`px-4 py-2 text-slate-300 whitespace-nowrap ${
                                      isNumber ? "text-indigo-300" : ""
                                    }`}
                                  >
                                    {val === null || val === undefined ? (
                                      <span className="text-slate-600 italic">NULL</span>
                                    ) : (
                                      String(val)
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SQL Console */}
          {activeTab === "sql" && (
            <div className="flex-1 flex flex-col overflow-hidden p-5 gap-4">
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Sample Queries:</span>
                {PRESET_QUERIES.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setSqlQuery(p.query)}
                    className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Query Editor Box */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 flex flex-col">
                <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-slate-300">SQL Statement</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Press Run Query to execute directly in SQLite</span>
                    <button
                      onClick={handleRunQuery}
                      disabled={executingQuery}
                      className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{executingQuery ? "Executing..." : "Run Query"}</span>
                    </button>
                  </div>
                </div>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={4}
                  className="w-full p-4 bg-slate-950 font-mono text-xs text-emerald-400 outline-hidden resize-none leading-relaxed"
                  placeholder="SELECT * FROM DailySales;"
                />
              </div>

              {/* Query Results Box */}
              <div className="flex-1 flex flex-col border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
                <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Execution Output</span>
                  {queryResult && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        {queryResult.durationMs} ms
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {queryResult.rowCount ?? 0} rows
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-auto p-4">
                  {!queryResult ? (
                    <div className="flex items-center justify-center h-full text-slate-600 text-xs">
                      Enter or select a query above and click &ldquo;Run Query&rdquo;
                    </div>
                  ) : !queryResult.success ? (
                    <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 font-mono text-xs flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                      <div>
                        <div className="font-bold text-rose-200">SQLite Execution Error</div>
                        <div className="mt-1 text-rose-400">{queryResult.error}</div>
                      </div>
                    </div>
                  ) : queryResult.rows && queryResult.rows.length > 0 && queryResult.columns ? (
                    <div className="border border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-900 text-slate-300 border-b border-slate-800">
                          <tr>
                            {queryResult.columns.map((c) => (
                              <th key={c} className="px-4 py-2 font-bold text-slate-200">
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                          {queryResult.rows.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                              {queryResult.columns!.map((c) => (
                                <td key={c} className="px-4 py-2 text-slate-300 whitespace-nowrap">
                                  {r[c] === null ? "NULL" : String(r[c])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-emerald-300 font-mono text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{queryResult.message || "Query executed with 0 rows returned."}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Schema DDL */}
          {activeTab === "schema" && (
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">SQLite Schema DDL (Data Definition Language)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Full table definitions and relational constraints active in ShopSale.db
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {dbInfo?.tables.map((tbl) => (
                  <div key={tbl.name} className="border border-slate-800 rounded-xl bg-slate-900/60 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Table className="w-4 h-4 text-indigo-400" />
                        <span className="font-mono text-xs font-bold text-white">{tbl.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {tbl.columns.length} columns • {tbl.rowCount} rows
                      </span>
                    </div>
                    <pre className="p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto bg-slate-950">
                      <code>{tbl.sql}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Info & Metrics */}
          {activeTab === "info" && (
            <div className="flex-1 overflow-auto p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Database Environment & File Info</h3>
                <p className="text-xs text-slate-400 mt-0.5">Physical storage location, disk footprint, and driver specs</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">Database File</span>
                  <div className="text-base font-bold text-white font-mono mt-1">ShopSale.db</div>
                  <span className="text-[11px] text-emerald-400 mt-1 block">Active on disk</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">Disk Footprint</span>
                  <div className="text-base font-bold text-indigo-300 font-mono mt-1">
                    {dbInfo?.fileSizeFormatted}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">{dbInfo?.fileSizeBytes} bytes</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">Total Tables</span>
                  <div className="text-base font-bold text-white font-mono mt-1">{dbInfo?.tables.length}</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Stores, Products, DailySales</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">Total Records</span>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-1">{dbInfo?.totalRecords}</div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Across all tables</span>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">File & Connection Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block">File Path on Container</span>
                    <span className="text-slate-200 bg-slate-950 px-2.5 py-1.5 rounded block mt-1 truncate">
                      {dbInfo?.filePath}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">C# Connection String (appsettings.json)</span>
                    <span className="text-slate-200 bg-slate-950 px-2.5 py-1.5 rounded block mt-1">
                      Data Source=ShopSale.db
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Driver & Engine</span>
                    <span className="text-slate-200 bg-slate-950 px-2.5 py-1.5 rounded block mt-1">
                      {dbInfo?.driver}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Last Write / Modified</span>
                    <span className="text-slate-200 bg-slate-950 px-2.5 py-1.5 rounded block mt-1">
                      {dbInfo?.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
