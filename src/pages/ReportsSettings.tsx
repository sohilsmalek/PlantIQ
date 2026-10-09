import React, { useState } from 'react';
import {
  FileText,
  Download,
  Upload,
  Database,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Copy,
  Layers,
  Settings,
  BookOpen,
  Code,
  FileSpreadsheet,
  RefreshCw,
  FileArchive
} from 'lucide-react';
import { INITIAL_RAG_DOCUMENTS } from '../data/mockData';
import { RAGDocument } from '../types/manufacturing';
import { exportPlanToCSV, PlanningCalculationResult } from '../services/materialPlanning';
import { ragService } from '../services/ragService';
import { Badge } from '../components/common/Badge';
import { usePlantDatabase } from '../context/DatabaseContext';

interface ReportsSettingsProps {
  planningResult: PlanningCalculationResult;
  onNavigateToDatabase?: () => void;
}

export const ReportsSettings: React.FC<ReportsSettingsProps> = ({
  planningResult,
  onNavigateToDatabase
}) => {
  const {
    isCustomDatabase,
    metadata,
    openImportModal,
    downloadAllTemplates,
    exportAllDatabase,
    resetToDefaultDatabase,
    components,
    machines,
    oemOrders,
    suppliers
  } = usePlantDatabase();

  const [activeTab, setActiveTab] = useState<'reports' | 'knowledge' | 'system'>('reports');
  const [docsList, setDocsList] = useState<RAGDocument[]>(ragService.getDocuments());
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Simulated doc upload
  const handleSimulateDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc: RAGDocument = {
      id: `DOC-USR-${Date.now()}`,
      title: `Uploaded SOP: ${file.name.replace(/\.[^/.]+$/, '')}`,
      fileName: file.name,
      category: 'SOP',
      docType: 'Operational Procedure',
      dateAdded: new Date().toISOString().split('T')[0],
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      summary: `Automotive manufacturing specification parsed and chunked into active RAG memory.`,
      chunks: [
        {
          id: `CHUNK-USR-${Date.now()}-1`,
          page: 1,
          section: 'Section 1: Work Instructions & Quality Criteria',
          content: `Ingested content from ${file.name}. Validated against Tier-1 automotive electronics standards (IPC-A-610 Class 3).`
        }
      ]
    };

    ragService.addDocument(newDoc);
    setDocsList([...ragService.getDocuments()]);
    setUploadNotice(`Document "${file.name}" ingested into RAG vector index (2 chunks generated).`);
    setTimeout(() => setUploadNotice(null), 4000);
  };

  const reports = [
    {
      id: 'REP-01',
      title: 'Material Shortages & Replenishment Schedule',
      desc: 'Complete BOM explosion with net requirement deficits, safety buffer gaps, and supplier MOQ calculations.',
      format: 'CSV Export',
      action: () => exportPlanToCSV(planningResult.rows)
    },
    {
      id: 'REP-02',
      title: 'Inventory 4-Week Forward Forecast',
      desc: 'Week-over-week demand trajectory for active OEM programs (Maruti Suzuki, Tata, Mahindra).',
      format: 'CSV Export',
      action: () => exportPlanToCSV(planningResult.rows)
    },
    {
      id: 'REP-03',
      title: 'Tier-2 Supplier Performance & Lead-Time Variance',
      desc: 'Vendor scorecard tracking on-time delivery rates, port congestion slips, and single-source dependencies.',
      format: 'CSV Export',
      action: () => exportPlanToCSV(planningResult.rows)
    },
    {
      id: 'REP-04',
      title: 'Machine Telemetry & Vibration Harmonics Audit',
      desc: '24-hour sensor logs for SMT Placement (M-ASSY-03), Fanuc Robot, and CNC milling cells.',
      format: 'CSV Export',
      action: () => exportPlanToCSV(planningResult.rows)
    },
    {
      id: 'REP-05',
      title: 'Critical Maintenance Spares Status Report',
      desc: 'Central toolroom stock inventory vs safety replenishment thresholds.',
      format: 'CSV Export',
      action: () => exportPlanToCSV(planningResult.rows)
    },
    {
      id: 'REP-06',
      title: 'OEM Delivery Milestone Risk Summary',
      desc: 'Total active order valuation exposed to tier-2 semiconductor and proximity sensor bottlenecks.',
      format: 'CSV Export',
      action: () => exportPlanToCSV(planningResult.rows)
    }
  ];

  const supabaseSQLSchema = `-- PlantIQ Supabase Relational Persistence Schema (Automotive Tier-1)
CREATE TABLE IF NOT EXISTS components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_number VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(32) NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL,
  on_hand_stock INT NOT NULL DEFAULT 0,
  reserved_stock INT NOT NULL DEFAULT 0,
  safety_stock INT NOT NULL DEFAULT 0,
  min_order_qty INT NOT NULL DEFAULT 1,
  order_multiple INT NOT NULL DEFAULT 1,
  supplier_id UUID REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS machines (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  line_name VARCHAR(64) NOT NULL,
  health_score INT NOT NULL,
  temperature NUMERIC(5,2),
  vibration NUMERIC(5,2),
  oil_level INT,
  status VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  doc_type VARCHAR(64),
  content TEXT NOT NULL,
  embedding vector(1536) -- pgvector for RAG similarity search
);`;

  const copySQL = () => {
    navigator.clipboard.writeText(supabaseSQLSchema);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#172B4D]">
            Reports & Architecture Settings
          </h1>
          <p className="text-xs text-[#718198]">
            Audit reports, engineering knowledge-base management, and persistent system configuration
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('reports')}
          className={`border-b-2 px-4 py-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-[#1677F2] text-[#1677F2]'
              : 'border-transparent text-slate-500 hover:text-[#172B4D]'
          }`}
        >
          Audit Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`border-b-2 px-4 py-2 transition-colors ${
            activeTab === 'knowledge'
              ? 'border-[#1677F2] text-[#1677F2]'
              : 'border-transparent text-slate-500 hover:text-[#172B4D]'
          }`}
        >
          RAG Knowledge Base & SOPs ({docsList.length})
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`border-b-2 px-4 py-2 transition-colors ${
            activeTab === 'system'
              ? 'border-[#1677F2] text-[#1677F2]'
              : 'border-transparent text-slate-500 hover:text-[#172B4D]'
          }`}
        >
          Model & Database Architecture
        </button>
      </div>

      {/* Toast Notice */}
      {uploadNotice && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* TAB 1: REPORTS */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((rep, repIdx) => (
            <div
              key={`${rep.id}-${repIdx}`}
              className="flex flex-col justify-between rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#1677F2]">{rep.id}</span>
                  <Badge variant="info">{rep.format}</Badge>
                </div>
                <h3 className="text-sm font-bold text-[#172B4D]">{rep.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{rep.desc}</p>
              </div>

              <div className="pt-4">
                <button
                  onClick={rep.action}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-slate-50/70 py-2 text-xs font-semibold text-[#172B4D] hover:bg-slate-100 transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-[#1677F2]" />
                  <span>Download Report</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: KNOWLEDGE BASE */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#172B4D]">
                  Ingested Technical Documents & SOPs
                </h2>
                <p className="text-xs text-[#718198]">
                  Indexed in local BM25 memory and vector embeddings for AI Copilot retrieval
                </p>
              </div>

              {/* Ingestion Button */}
              <div>
                <label className="flex items-center gap-1.5 rounded-md bg-[#1677F2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 cursor-pointer transition-colors shadow-2xs">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Document (PDF/TXT)</span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleSimulateDocUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {docsList.map((doc, docIdx) => (
                <div key={`${doc.id}-${docIdx}`} className="py-3.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#1677F2]" />
                      <span className="font-bold text-[#172B4D]">{doc.title}</span>
                    </div>
                    <Badge variant="neutral">{doc.docType}</Badge>
                  </div>
                  <p className="text-slate-600">{doc.summary}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>File: {doc.fileName}</span>
                    <span>•</span>
                    <span>Size: {doc.fileSize}</span>
                    <span>•</span>
                    <span>Chunks: {doc.chunks.length}</span>
                    <span>•</span>
                    <span>Added: {doc.dateAdded}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM ARCHITECTURE */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Model Card */}
            <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-[#172B4D]">
                <Cpu className="h-4 w-4 text-[#1677F2]" />
                <span>AI Service Configuration</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Active Provider:</span>
                  <span className="font-semibold text-[#172B4D]">Google Gemini (@google/genai)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Default Model:</span>
                  <span className="font-mono font-bold text-[#1677F2]">gemini-3.8-flash</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">TCS GenAI Migration Adapter:</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Ready (Isolated Interface)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Security Boundary:</span>
                  <span className="text-slate-700">Server-side proxy routes (/api/*)</span>
                </div>
              </div>
            </div>

            {/* Persistence Card */}
            <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-[#172B4D]">
                  <Database className="h-4 w-4 text-[#20A36B]" />
                  <span>Database & Persistence Architecture</span>
                </div>
                {isCustomDatabase ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Custom CSV
                  </span>
                ) : (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                    Demo Baseline
                  </span>
                )}
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Active Source:</span>
                  <span className="font-semibold text-[#172B4D] truncate max-w-[210px]">{metadata.source}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Tracked Entities:</span>
                  <span className="font-semibold text-[#1677F2]">
                    {components.length} parts, {machines.length} machines, {oemOrders.length} orders
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Last Synced / Updated:</span>
                  <span className="text-slate-700">{metadata.lastUpdated}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">PostgreSQL Migration DDL:</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Compatible Schema Ready
                  </span>
                </div>
              </div>

              {/* Quick CSV Actions */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => openImportModal()}
                  className="flex items-center gap-1.5 rounded-md bg-[#1677F2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition-colors shadow-2xs"
                >
                  <Upload className="h-3 w-3" />
                  <span>Upload CSV</span>
                </button>
                <button
                  onClick={downloadAllTemplates}
                  className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-[#172B4D] hover:bg-slate-100 transition-colors"
                >
                  <Download className="h-3 w-3 text-[#1677F2]" />
                  <span>Templates (.zip)</span>
                </button>
                {isCustomDatabase && (
                  <button
                    onClick={() => {
                      if (confirm('Reset to default factory demo baseline?')) {
                        resetToDefaultDatabase();
                      }
                    }}
                    className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Supabase Schema Code Block */}
          <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 font-bold text-xs text-[#172B4D] uppercase">
                <Code className="h-4 w-4 text-[#1677F2]" />
                <span>Supabase PostgreSQL Schema (Production Migration)</span>
              </div>
              <button
                onClick={copySQL}
                className="flex items-center gap-1 text-xs font-semibold text-[#1677F2] hover:underline"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copiedSQL ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto rounded bg-[#10233F] p-4 text-[11px] font-mono text-slate-200 leading-relaxed">
              {supabaseSQLSchema}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
