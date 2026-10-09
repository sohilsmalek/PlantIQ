/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Download,
  Database,
  ArrowRight,
  RefreshCw,
  FileText,
  Sliders,
  Check,
  HelpCircle,
  FileArchive
} from 'lucide-react';
import { usePlantDatabase } from '../../context/DatabaseContext';
import {
  CSV_TEMPLATES,
  DatabaseTableKey,
  detectTableTypeFromHeaders,
  parseCSVForTable,
  parseCSVToRows,
  rowsToObjectList
} from '../../services/csvDatabaseService';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTable?: DatabaseTableKey;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  defaultTable = 'components'
}) => {
  const {
    importTableData,
    importBatchTables,
    downloadTemplate,
    downloadAllTemplates,
    isCustomDatabase,
    resetToDefaultDatabase
  } = usePlantDatabase();

  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'templates'>('upload');
  const [selectedTable, setSelectedTable] = useState<DatabaseTableKey>(defaultTable);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  // Staged file state
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [pasteText, setPasteText] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [autoDetectedTable, setAutoDetectedTable] = useState<DatabaseTableKey | null>(null);

  // Parsing & validation state
  const [parsedPreview, setParsedPreview] = useState<{
    headers: string[];
    rows: Record<string, string>[];
    totalCount: number;
    errors: string[];
    warnings: string[];
    parsedData: any[];
  } | null>(null);

  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handler for file reading
  const processRawCSV = (content: string, name: string) => {
    setFileContent(content);
    setFileName(name);
    setStatusMessage(null);

    const rawRows = parseCSVToRows(content);
    const { headers } = rowsToObjectList(rawRows);

    if (headers.length === 0) {
      setParsedPreview({
        headers: [],
        rows: [],
        totalCount: 0,
        errors: ['The selected CSV file appears to be empty or improperly formatted.'],
        warnings: [],
        parsedData: []
      });
      return;
    }

    // Auto-detect table
    const detected = detectTableTypeFromHeaders(headers);
    setAutoDetectedTable(detected);

    // If user hasn't explicitly locked in a different table, auto-select detected
    const targetTable = detected;
    setSelectedTable(targetTable);

    // Run actual validator
    const res = parseCSVForTable(targetTable, content);

    setParsedPreview({
      headers: res.headers.slice(0, 8),
      rows: res.samplePreview.slice(0, 5),
      totalCount: res.validRows,
      errors: res.errors,
      warnings: res.warnings,
      parsedData: res.data
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processRawCSV(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    if (files.length === 1) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processRawCSV(text, file.name);
      };
      reader.readAsText(file);
    } else {
      // Multiple CSV files dropped at once!
      handleMultipleFiles(files);
    }
  };

  const handleMultipleFiles = async (files: File[]) => {
    const batches: { tableKey: DatabaseTableKey; records: any[]; fileName: string }[] = [];
    let successCount = 0;

    for (const file of files) {
      if (!file.name.endsWith('.csv')) continue;
      const text = await file.text();
      const rawRows = parseCSVToRows(text);
      const { headers } = rowsToObjectList(rawRows);
      const detected = detectTableTypeFromHeaders(headers);
      const parsed = parseCSVForTable(detected, text);
      if (parsed.validRows > 0) {
        batches.push({
          tableKey: detected,
          records: parsed.data,
          fileName: file.name
        });
        successCount++;
      }
    }

    if (batches.length > 0) {
      importBatchTables(batches);
      setStatusMessage({
        type: 'success',
        text: `Successfully ingested and activated ${batches.length} database tables from multi-file CSV drop!`
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setStatusMessage({
        type: 'error',
        text: 'Could not parse records from the dropped files. Please verify they are CSV format.'
      });
    }
  };

  const handlePasteChange = (text: string) => {
    setPasteText(text);
    if (text.trim().length > 10) {
      processRawCSV(text, 'pasted_data.csv');
    } else {
      setParsedPreview(null);
    }
  };

  const handleTableSwitch = (tbl: DatabaseTableKey) => {
    setSelectedTable(tbl);
    const textToUse = activeTab === 'paste' ? pasteText : fileContent;
    if (textToUse) {
      const res = parseCSVForTable(tbl, textToUse);
      setParsedPreview({
        headers: res.headers.slice(0, 8),
        rows: res.samplePreview.slice(0, 5),
        totalCount: res.validRows,
        errors: res.errors,
        warnings: res.warnings,
        parsedData: res.data
      });
    }
  };

  const handleApplyImport = () => {
    if (!parsedPreview || parsedPreview.parsedData.length === 0) {
      setStatusMessage({
        type: 'error',
        text: 'No valid rows found to import. Please check your CSV format.'
      });
      return;
    }

    importTableData(
      selectedTable,
      parsedPreview.parsedData,
      importMode,
      fileName || 'user_database.csv'
    );

    setStatusMessage({
      type: 'success',
      text: `Successfully updated "${CSV_TEMPLATES[selectedTable].label}" with ${parsedPreview.totalCount} records!`
    });

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-4xl max-h-[92vh] rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#10233F] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1677F2] text-white shadow-inner">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Upload Database CSV</h2>
                <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-blue-200 border border-blue-400/30">
                  Custom Data Engine
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Replace or augment plant databases with your own CSV spreadsheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'upload'
                ? 'border-[#1677F2] text-[#1677F2] font-bold'
                : 'border-transparent text-slate-600 hover:text-[#172B4D]'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload File (.csv)</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'paste'
                ? 'border-[#1677F2] text-[#1677F2] font-bold'
                : 'border-transparent text-slate-600 hover:text-[#172B4D]'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Paste Raw CSV Text</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'templates'
                ? 'border-[#1677F2] text-[#1677F2] font-bold'
                : 'border-transparent text-slate-600 hover:text-[#172B4D]'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV Templates</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`rounded-lg p-3 text-xs flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'border border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border border-red-300 bg-red-50 text-red-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              )}
              <span className="font-medium">{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#1677F2] bg-blue-50/70 scale-[0.99]'
                    : fileName
                    ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70'
                    : 'border-slate-300 bg-slate-50/50 hover:border-[#1677F2] hover:bg-blue-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#1677F2] mb-3 shadow-inner">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>

                {fileName ? (
                  <div>
                    <p className="text-sm font-bold text-[#172B4D] flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>{fileName}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click or drop another file to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-[#172B4D]">
                      Drag & drop your CSV file here, or{' '}
                      <span className="text-[#1677F2] underline underline-offset-2">browse</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Accepts single CSV files or multiple tables simultaneously. Maximum 10MB per file.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RAW TEXT PASTE */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#172B4D] flex items-center justify-between">
                <span>Paste CSV spreadsheet data directly:</span>
                <span className="text-[11px] font-normal text-slate-500">
                  Header row + comma, tab, or semicolon separated
                </span>
              </label>
              <textarea
                value={pasteText}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder={`partNumber,name,category,onHandStock,unitCost,leadTimeDays\nSEN-2048,"Inductive Proximity Sensor M12",Automation,5,48.50,45\nMCU-110,"32-bit Automotive TriCore Microcontroller",Electronics,1200,32.50,180`}
                rows={8}
                className="w-full rounded-lg border border-slate-300 p-3 font-mono text-xs text-[#172B4D] placeholder:text-slate-400 focus:border-[#1677F2] focus:outline-hidden focus:ring-1 focus:ring-[#1677F2]"
              />
            </div>
          )}

          {/* TAB 3: DOWNLOAD TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/80 rounded-lg p-3">
                <div className="flex items-center gap-2.5">
                  <FileArchive className="h-5 w-5 text-[#1677F2]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#172B4D]">
                      Download All 6 Database Templates Bundle (.ZIP)
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Includes pre-filled schema templates for all plant modules + Quickstart Readme
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadAllTemplates}
                  className="flex items-center gap-1.5 rounded-md bg-[#1677F2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition-colors shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Bundle</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(CSV_TEMPLATES) as DatabaseTableKey[]).map((key) => {
                  const tpl = CSV_TEMPLATES[key];
                  return (
                    <div
                      key={key}
                      className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#172B4D]">{tpl.label}</span>
                          <span className="text-[10px] font-mono text-slate-400">.csv</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{tpl.description}</p>
                      </div>
                      <div className="pt-3">
                        <button
                          onClick={() => downloadTemplate(key)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 py-1.5 text-xs font-semibold text-[#172B4D] hover:bg-slate-100 transition-colors"
                        >
                          <Download className="h-3 w-3 text-[#1677F2]" />
                          <span>Download Template</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TABLE TARGET & IMPORT OPTIONS (Visible when content exists) */}
          {(fileContent || pasteText) && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Target Table Dropdown */}
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                    <span>Target Database Table:</span>
                    {autoDetectedTable === selectedTable && (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-[#1677F2]">
                        <Check className="h-3 w-3" /> Auto-detected
                      </span>
                    )}
                  </label>
                  <select
                    value={selectedTable}
                    onChange={(e) => handleTableSwitch(e.target.value as DatabaseTableKey)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-[#172B4D] focus:border-[#1677F2] focus:outline-hidden"
                  >
                    <option value="components">Parts & BOM Components (Inventory, Safety Stock, Costs)</option>
                    <option value="machines">Machines & Telemetry (Stations, Temperature, Vibration)</option>
                    <option value="oemOrders">OEM Customer Orders (Delivery Dates, Quantities, Revenue)</option>
                    <option value="suppliers">Suppliers Directory (Tiers, On-Time Delivery, Lead Times)</option>
                    <option value="purchaseOrders">Purchase Orders (Open Inbound POs, Tracking)</option>
                    <option value="spares">Maintenance Spares (Toolroom Inventory & Reorder Points)</option>
                  </select>
                </div>

                {/* Import Mode (Replace vs Append) */}
                <div className="sm:w-64 space-y-1">
                  <label className="text-xs font-bold text-[#172B4D]">Import Strategy:</label>
                  <div className="flex rounded-md border border-slate-300 bg-white p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setImportMode('replace')}
                      className={`flex-1 rounded py-1 font-semibold text-center transition-colors ${
                        importMode === 'replace'
                          ? 'bg-[#1677F2] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#172B4D]'
                      }`}
                    >
                      Overwrite Table
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportMode('append')}
                      className={`flex-1 rounded py-1 font-semibold text-center transition-colors ${
                        importMode === 'append'
                          ? 'bg-[#1677F2] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#172B4D]'
                      }`}
                    >
                      Upsert / Append
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PARSED PREVIEW & VALIDATION REPORT */}
          {parsedPreview && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#172B4D]">Parsed Preview & Validation:</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    {parsedPreview.totalCount} Valid Rows Ready
                  </span>
                </div>
                <button
                  onClick={() => downloadTemplate(selectedTable)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#1677F2] hover:underline"
                >
                  <Download className="h-3 w-3" />
                  <span>Download matching schema template</span>
                </button>
              </div>

              {/* Warnings / Errors */}
              {parsedPreview.errors.length > 0 && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                    <span>Formatting Errors:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {parsedPreview.errors.slice(0, 3).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {parsedPreview.warnings.length > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                  <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    <span>{parsedPreview.warnings.length} notice(s): non-critical fields received auto-defaults.</span>
                  </div>
                </div>
              )}

              {/* Sample Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-48">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-200">
                    <tr>
                      {parsedPreview.headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-mono text-[11px]">
                    {parsedPreview.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {parsedPreview.headers.map((h, cIdx) => (
                          <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap text-slate-600 truncate max-w-[200px]">
                            {row[h] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <div className="flex items-center gap-2">
            {isCustomDatabase && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset database back to the factory demo baseline?')) {
                    resetToDefaultDatabase();
                    setStatusMessage({
                      type: 'success',
                      text: 'Database successfully reset to default demo baseline.'
                    });
                  }
                }}
                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-red-600 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset to Factory Baseline</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!parsedPreview || parsedPreview.totalCount === 0}
              onClick={handleApplyImport}
              className="flex items-center gap-2 rounded-md bg-[#1677F2] px-5 py-2 text-xs font-bold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>Confirm & Apply to Database</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
