import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { SkeletonTable } from '../components/Skeleton';
import { ConfidencePill, StatusBadge, EmptyState } from '../components/UIComponents';
import Modal from '../components/Modal';
import type { Invoice, UploadingFile } from '../data/types';

type Tab = 'invoices' | 'gstr2b';

const MOCK_GSTR2B_LEDGER = [
  { vendorGstin: '27FUTUR3456F1ZA', invoiceNumber: 'FTS-26-098', taxableValue: 125000, cgst: 11250, sgst: 11250, igst: 0 },
  { vendorGstin: '29METRO9012G1ZB', invoiceNumber: 'MLL/00912', taxableValue: 45000, cgst: 0, sgst: 0, igst: 8100 },
  { vendorGstin: '07APEXO1234H1ZC', invoiceNumber: 'AOF-2026-334', taxableValue: 280000, cgst: 25200, sgst: 25200, igst: 0 },
  { vendorGstin: '27AABCA1234B1ZX', invoiceNumber: 'INV-2026-001', taxableValue: 245000, cgst: 22050, sgst: 22050, igst: 0 },
];

export default function Data() {
  const navigate = useNavigate();
  const invoices = useStore((s) => s.invoices);
  const gstr2bRecords = useStore((s) => s.gstr2bRecords);
  const addInvoices = useStore((s) => s.addInvoices);
  const addGstr2bRecords = useStore((s) => s.addGstr2bRecords);
  const addToast = useStore((s) => s.addToast);
  const mismatches = useStore((s) => s.mismatches);
  const getVendorRisk = useStore((s) => s.getVendorRisk);

  const [tab, setTab] = useState<Tab>('invoices');
  const [loading, setLoading] = useState(true);
  
  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<'picker' | 'single_scan' | 'single_result' | 'batch_progress'>('picker');
  
  // Batch Upload State
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Single Upload State
  const [scanText, setScanText] = useState('Reading document...');
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Invoice Detail Drawer
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // GSTR-2B State
  const [showGstr2bModal, setShowGstr2bModal] = useState(false);
  const [gstr2bStage, setGstr2bStage] = useState<'idle' | 'parsing' | 'done'>('idle');
  const [gstr2bValidCount] = useState(1198);
  const [gstr2bErrorCount] = useState(3);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const startBatchUpload = useCallback(() => {
    setUploadMode('batch_progress');
    const files: UploadingFile[] = [
      { id: 'uf1', name: 'INV-2026-016_Sharma.pdf', size: 245000, progress: 0, stage: 'uploading' },
      { id: 'uf2', name: 'INV-2026-017_Patel.pdf', size: 189000, progress: 0, stage: 'uploading' },
      { id: 'uf3', name: 'INV-2026-001_ABC_Raw.pdf', size: 312000, progress: 0, stage: 'uploading', isDuplicate: true },
      { id: 'uf4', name: 'INV-2026-018_Gupta.pdf', size: 156000, progress: 0, stage: 'uploading' },
    ];
    setUploadingFiles(files);
    setUploadComplete(false);

    files.forEach((file, idx) => {
      if (file.isDuplicate) {
        setTimeout(() => {
          setUploadingFiles((prev) =>
            prev.map((f) => f.id === file.id ? { ...f, progress: 100, stage: 'duplicate' as const } : f)
          );
        }, 600);
        return;
      }

      const baseDelay = idx * 400;
      for (let p = 10; p <= 100; p += 10) {
        setTimeout(() => {
          setUploadingFiles((prev) =>
            prev.map((f) => f.id === file.id && f.stage === 'uploading' ? { ...f, progress: p } : f)
          );
        }, baseDelay + p * 15);
      }

      setTimeout(() => {
        setUploadingFiles((prev) =>
          prev.map((f) => f.id === file.id ? { ...f, stage: 'extracting' as const } : f)
        );
      }, baseDelay + 1600);

      setTimeout(() => {
        const conf = 0.85 + Math.random() * 0.13;
        setUploadingFiles((prev) =>
          prev.map((f) => f.id === file.id ? { ...f, stage: 'processed' as const, confidence: conf } : f)
        );
      }, baseDelay + 3200);
    });

    setTimeout(() => setUploadComplete(true), 4800);
  }, []);

  const handleBatchDone = () => {
    const processedFiles = uploadingFiles.filter((f) => f.stage === 'processed');
    const newInvoices: Invoice[] = processedFiles.map((f, i) => ({
      id: `inv-new-${Date.now()}-${i}`,
      clientId: 'c1',
      vendorName: f.name.replace('.pdf', '').replace(/_/g, ' '),
      vendorGstin: `27NEWGS${String(i + 1).padStart(4, '0')}A1Z${String.fromCharCode(65 + i)}`,
      invoiceNumber: f.name.split('_')[0],
      taxableValue: 50000 + Math.floor(Math.random() * 200000),
      cgst: 4500 + Math.floor(Math.random() * 18000),
      sgst: 4500 + Math.floor(Math.random() * 18000),
      igst: 0,
      total: 59000 + Math.floor(Math.random() * 236000),
      extractedConfidence: {
        vendorName: f.confidence || 0.9, vendorGstin: (f.confidence || 0.9) + 0.02,
        invoiceNumber: (f.confidence || 0.9) - 0.03, taxableValue: (f.confidence || 0.9) - 0.05,
        cgst: (f.confidence || 0.9) - 0.06, sgst: (f.confidence || 0.9) - 0.06, igst: 1.0,
        total: (f.confidence || 0.9) - 0.02,
      },
      status: 'processed',
      uploadedAt: new Date().toISOString(),
    }));

    addInvoices(newInvoices);
    addToast(`${processedFiles.length} invoices processed`);
    setShowUploadModal(false);
    setUploadingFiles([]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadMode('single_scan');
    setScanText('Reading document...');
    setExtractionError(null);
    setExtractionResult(null);

    let progressInterval: ReturnType<typeof setInterval>;
    const startProgress = () => {
      let stage = 0;
      progressInterval = setInterval(() => {
        stage++;
        if (stage === 1) setScanText('Extracting fields...');
        if (stage === 2) setScanText('Matching against GSTR-2B...');
        if (stage > 4) setScanText('Taking longer than expected...');
      }, 1500);
    };

    startProgress();
    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append('invoice', file);

      const res = await fetch('/api/extract-invoice', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Extraction failed');
      }

      const data = await res.json();
      
      // Matching Logic
      let matchStatus = 'No portal record found';
      let variance = 0;
      let isMismatch = false;

      // Find in mock ledger by GSTIN
      const ledgerEntry = MOCK_GSTR2B_LEDGER.find(l => l.vendorGstin === data.vendor_gstin);

      if (ledgerEntry) {
        // Evaluate variance
        const extractedTaxable = data.taxable_value || 0;
        const extractedCgst = data.cgst || 0;
        const extractedSgst = data.sgst || 0;
        const extractedIgst = data.igst || 0;

        const ledgerTaxable = ledgerEntry.taxableValue;
        const ledgerCgst = ledgerEntry.cgst;
        const ledgerSgst = ledgerEntry.sgst;
        const ledgerIgst = ledgerEntry.igst;

        const diffTaxable = Math.abs(extractedTaxable - ledgerTaxable);
        const diffTax = Math.abs((extractedCgst + extractedSgst + extractedIgst) - (ledgerCgst + ledgerSgst + ledgerIgst));
        
        variance = diffTaxable + diffTax;

        if (variance > 10) { // small tolerance
          matchStatus = 'Mismatch Detected';
          isMismatch = true;
        } else {
          matchStatus = 'Matched';
        }
      }

      const result: any = {
        vendorName: data.vendor_name || 'Unknown Vendor',
        vendorGstin: data.vendor_gstin || 'Unknown GSTIN',
        invoiceNumber: data.invoice_number || 'Unknown',
        taxableValue: data.taxable_value || 0,
        cgst: data.cgst || 0,
        sgst: data.sgst || 0,
        igst: data.igst || 0,
        total: data.total_amount || 0,
        extractedConfidence: {
          vendorName: data.field_confidence?.vendor_name || 0,
          vendorGstin: data.field_confidence?.vendor_gstin || 0,
          invoiceNumber: data.field_confidence?.invoice_number || 0,
          taxableValue: data.field_confidence?.taxable_value || 0,
          cgst: data.field_confidence?.cgst || 0,
          sgst: data.field_confidence?.sgst || 0,
          igst: data.field_confidence?.igst || 0,
          total: data.field_confidence?.total_amount || 0
        },
        matchStatus,
        variance,
        isMismatch
      };
      
      const confValues = Object.values(result.extractedConfidence) as number[];
      const avgConf = confValues.reduce((a, b) => a + b, 0) / 8;
      result.confidence = avgConf;

      if (avgConf < 0.5 || Object.values(data).filter(v => v === null).length > 3) {
        setExtractionError('Some fields couldn\'t be read clearly — review before accepting');
      }

      // Ensure at least 1.5s passes
      const elapsed = Date.now() - startTime;
      const minWait = 1500;
      if (elapsed < minWait) {
        await new Promise(r => setTimeout(r, minWait - elapsed));
      }

      setExtractionResult(result);
      setUploadMode('single_result');

    } catch (err: any) {
      clearInterval(progressInterval!);
      setExtractionError(err.message || 'Error uploading file');
      setUploadMode('single_result');
    } finally {
      clearInterval(progressInterval!);
    }
  };

  const handleSingleAction = (action: 'accept' | 'reject') => {
    if (!extractionResult) return;
    const mock = extractionResult;
    const newInvoice: Invoice = {
      id: `inv-single-${Date.now()}`,
      clientId: 'c1',
      vendorName: mock.vendorName,
      vendorGstin: mock.vendorGstin,
      invoiceNumber: mock.invoiceNumber,
      taxableValue: mock.taxableValue,
      cgst: mock.cgst,
      sgst: mock.sgst,
      igst: mock.igst,
      total: mock.total,
      extractedConfidence: mock.extractedConfidence,
      status: 'processed',
      uploadedAt: new Date().toISOString(),
    };

    addInvoices([newInvoice]);

    if (action === 'accept' && mock.variance === 0) {
      addToast('Invoice matched and filed');
    } else {
      // Add to mismatches
      useStore.setState((state) => ({
        mismatches: [
          ...state.mismatches,
          {
            id: `m-new-${Date.now()}`,
            invoiceId: newInvoice.id,
            gstr2bRecordId: 'mock-g2b',
            clientId: 'c1',
            matchStatus: 'needs_review',
            mismatchType: mock.variance > 0 ? 'amount_mismatch' : 'vendor_not_filed',
            variance: mock.variance || 4500, // mock some variance if they rejected a matched one
            confidence: mock.confidence,
            resolved: false,
            vendorContacted: false,
          }
        ]
      }));
      addToast('Mismatch detected — added to Approval Queue', 'warning');
    }

    setShowUploadModal(false);
    setUploadMode('picker');
  };

  const handleGstr2bUpload = () => {
    setGstr2bStage('parsing');
    setTimeout(() => setGstr2bStage('done'), 1500);
  };

  const handleImportRecords = () => {
    const newRecords = Array.from({ length: 5 }).map((_, i) => ({
      id: `g2b-new-${Date.now()}-${i}`, clientId: ['c1', 'c2', 'c3', 'c5', 'c7'][i],
      gstinId: ['g1', 'g4', 'g6', 'g9', 'g12'][i], period: '092026',
      vendorGstin: `27IMPRT${String(i + 1).padStart(4, '0')}X1Z${String.fromCharCode(65 + i)}`,
      invoiceNumber: `IMP-2026-${1000 + i}`,
      taxableValue: 100000 + Math.floor(Math.random() * 500000),
      cgst: 9000 + Math.floor(Math.random() * 45000), sgst: 9000 + Math.floor(Math.random() * 45000),
      igst: 0, status: 'valid' as const,
    }));

    addGstr2bRecords(newRecords);
    addToast(`${gstr2bValidCount.toLocaleString()} records imported`);
    setShowGstr2bModal(false);
    setGstr2bStage('idle');
    setShowErrors(false);
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const avgConfidence = (inv: Invoice) => {
    const vals = Object.values(inv.extractedConfidence);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const getInvoiceMismatch = (invoiceId: string) => {
    return mismatches.find((m) => m.invoiceId === invoiceId && !m.resolved && m.matchStatus !== 'matched');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-[-0.025em]">Data</h1>
        <SkeletonTable rows={8} cols={6} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-[-0.025em]">Data Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowUploadModal(true); setUploadMode('picker'); }}
            className="px-4 py-2 rounded-lg bg-[#6D4FF0] hover:bg-[#5B3BDC] text-white text-[13px] font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            Upload Invoices
          </button>
          <button
            onClick={() => { setShowGstr2bModal(true); setGstr2bStage('idle'); setShowErrors(false); }}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Upload GSTR-2B
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-neutral-100 p-1 rounded-xl flex items-center w-fit border border-neutral-200/80">
        {(['invoices', 'gstr2b'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-[9px] text-[13px] font-medium transition-all ${
              tab === t ? 'bg-white text-neutral-900 shadow-sm font-semibold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {t === 'invoices' ? `Invoices (${invoices.length})` : `GSTR-2B Records (${gstr2bRecords.length})`}
          </button>
        ))}
      </div>

      {/* Tables */}
      {tab === 'invoices' ? (
        invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
            <EmptyState 
              title="No invoices yet" 
              subtitle="Upload your purchase invoices to start the reconciliation process." 
              icon="receipt_long" 
            />
            <button
              onClick={() => { setShowUploadModal(true); setUploadMode('picker'); }}
              className="mt-6 px-6 py-3 rounded-lg bg-[#6D4FF0] hover:bg-[#5B3BDC] text-white text-[14px] font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              Upload your first invoice
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-50/80 z-10 backdrop-blur-sm">
                  <tr className="text-left border-b border-slate-200">
                    <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Confidence</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Uploaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} onClick={() => setSelectedInvoice(inv)} className="hover:bg-slate-50 cursor-pointer transition-colors h-[44px]">
                      <td className="px-5 py-3">
                        <div className="text-[13px] font-medium text-slate-900">{inv.vendorName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{inv.vendorGstin}</div>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-slate-600 font-mono">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3 text-[13px] font-medium text-slate-900 text-right tabular-nums">₹{inv.total.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3"><ConfidencePill value={avgConfidence(inv)} /></td>
                      <td className="px-5 py-3"><StatusBadge status={inv.status} /></td>
                      <td className="px-5 py-3 text-[13px] text-slate-500">{formatDate(inv.uploadedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        gstr2bRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
            <EmptyState 
              title="No GSTR-2B data" 
              subtitle="Import GST portal data to match against your uploaded invoices." 
              icon="table_chart" 
            />
            <button
              onClick={() => { setShowGstr2bModal(true); setGstr2bStage('idle'); setShowErrors(false); }}
              className="mt-6 px-6 py-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-[14px] font-semibold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
              Upload your first GSTR-2B file
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-50/80 z-10 backdrop-blur-sm">
                  <tr className="text-left border-b border-slate-200">
                    <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vendor GSTIN</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Period</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Taxable Value</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Tax</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gstr2bRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors h-[44px]">
                      <td className="px-5 py-3 text-[13px] font-mono text-slate-600">{rec.vendorGstin}</td>
                      <td className="px-5 py-3 text-[13px] text-slate-600">{rec.invoiceNumber || '—'}</td>
                      <td className="px-5 py-3 text-[13px] text-slate-500">Sep 2026</td>
                      <td className="px-5 py-3 text-[13px] font-medium text-slate-900 text-right tabular-nums">₹{rec.taxableValue.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 text-[13px] text-slate-600 text-right tabular-nums">₹{(rec.cgst + rec.sgst + rec.igst).toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3"><StatusBadge status={rec.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Upload Invoices Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Invoices" maxWidth={uploadMode === 'single_result' ? 'max-w-md' : 'max-w-xl'}>
        <div className="relative min-h-[300px]">
          {/* Picker Mode */}
          {uploadMode === 'picker' && (
            <div className="flex flex-col items-center justify-center py-12 text-center h-full">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 border border-dashed border-slate-300">
                <span className="material-symbols-outlined text-[32px] text-slate-400">upload_file</span>
              </div>
              <h3 className="text-[14px] font-semibold text-slate-900 mb-1">Drag and drop files here</h3>
              <p className="text-[13px] text-slate-500 mb-8">PDF, JPG, PNG (max 10MB per file)</p>
              
              <div className="flex gap-4">
                <label className="px-5 py-2.5 rounded-lg bg-[#6D4FF0] hover:bg-[#5B3BDC] text-white text-[14px] font-semibold shadow-sm transition-all cursor-pointer">
                  Select File
                  <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
                </label>
                <button
                  onClick={startBatchUpload}
                  className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-[14px] font-medium transition-all"
                >
                  Simulate Batch Upload
                </button>
              </div>
            </div>
          )}

          {/* Single File Scanning State */}
          {uploadMode === 'single_scan' && (
            <div className="flex flex-col items-center justify-center py-12 text-center h-full animate-fade-in">
              <div className="relative w-24 h-32 bg-white rounded-lg border-2 border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="absolute inset-x-2 top-3 h-1 bg-slate-100 rounded" />
                <div className="absolute inset-x-2 top-6 h-1 bg-slate-100 rounded" />
                <div className="absolute inset-x-2 top-9 h-1 bg-slate-100 rounded w-2/3" />
                
                <div className="absolute inset-x-2 bottom-6 h-12 bg-slate-50 rounded border border-slate-100" />
                
                {/* Animated Scanline */}
                <div className="absolute left-0 right-0 h-1 bg-[#6D4FF0] shadow-[0_0_10px_#6D4FF0] animate-scanline z-10" />
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-[#6D4FF0]/30 border-t-[#6D4FF0] rounded-full animate-spin-slow" />
                <span className="text-[14px] font-medium text-[#6D4FF0]">{scanText}</span>
              </div>
            </div>
          )}

          {/* Single File Result Reveal (Mismatch Inspector Style) */}
          {uploadMode === 'single_result' && (() => {
            if (!extractionResult) {
              return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
                  <span className="material-symbols-outlined text-red-500 text-[48px] mb-4">error</span>
                  <p className="text-[14px] font-semibold text-slate-900 mb-2">Extraction Failed</p>
                  <p className="text-[13px] text-slate-500 mb-6">{extractionError || 'We couldn\'t read this document. Please try a clearer image.'}</p>
                  <button onClick={() => setUploadMode('picker')} className="px-5 py-2 rounded-lg bg-slate-100 text-slate-700 text-[13px] font-semibold hover:bg-slate-200 transition-colors">
                    Try Again
                  </button>
                </div>
              );
            }

            const mock = extractionResult;
            const riskProfile = getVendorRisk(mock.vendorGstin);
            
            return (
              <div className="animate-slide-up-fade -m-6 bg-slate-50/50 rounded-b-2xl h-full flex flex-col">
                {extractionError && (
                  <div className="bg-amber-50 border-b border-amber-200 p-3 flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">warning</span>
                    <p className="text-[13px] font-medium text-amber-800">{extractionError}</p>
                  </div>
                )}
                
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Client</p>
                    <p className="text-[13px] font-medium text-slate-900">Sharma Enterprises</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Vendor</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-slate-900">{mock.vendorName}</p>
                        {riskProfile && (
                          <div className="group relative">
                            <span className={`w-2 h-2 rounded-full inline-block ${
                              riskProfile.riskLevel === 'reliable' ? 'bg-emerald-500' :
                              riskProfile.riskLevel === 'occasional_delays' ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{mock.vendorGstin}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Invoice #</p>
                      <p className="text-[13px] font-medium text-slate-900 font-mono">{mock.invoiceNumber}</p>
                    </div>
                  </div>

                  {/* Amount comparison */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 shadow-inner">
                    <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Amount Breakdown</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Taxable Value', val: mock.taxableValue },
                        { label: 'CGST', val: mock.cgst },
                        { label: 'SGST', val: mock.sgst },
                        { label: 'IGST', val: mock.igst },
                        { label: 'Total', val: mock.total },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between text-[13px]">
                          <span className="text-slate-500">{row.label}</span>
                          <span className="font-medium text-slate-900 tabular-nums">₹{(row.val || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div>
                    <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Match Confidence</h4>
                    <div className="flex items-center gap-3">
                      <ConfidencePill value={mock.confidence} />
                      <span className="text-[13px] text-slate-500">
                        {mock.confidence >= 0.9 ? 'High' : mock.confidence >= 0.7 ? 'Medium' : 'Low'} confidence
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Portal Status</h4>
                    <div className={`text-[13px] font-semibold ${
                      mock.matchStatus === 'Matched' ? 'text-emerald-700' : 
                      mock.matchStatus === 'Mismatch Detected' ? 'text-red-700' : 'text-amber-700'
                    }`}>
                      {mock.matchStatus}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Field Extraction</h4>
                    <div className="space-y-2">
                      {Object.entries(mock.extractedConfidence).map(([field, conf]) => (
                        <div key={field} className="flex items-center justify-between">
                          <span className="text-[12px] text-slate-500 capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                          <ConfidencePill value={conf as number} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {mock.variance > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500 text-[18px]">warning</span>
                      <span className="text-[13px] font-semibold text-red-700">Variance vs Portal: ₹{mock.variance.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 p-4 space-y-2 bg-white rounded-b-2xl">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSingleAction('accept')}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      Accept Books
                    </button>
                    <button
                      onClick={() => handleSingleAction('reject')}
                      className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      Reject
                    </button>
                  </div>
                  <button
                    onClick={() => {}}
                    className="w-full py-2 rounded-lg border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                    Draft Vendor Message
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Batch Upload Progress */}
          {uploadMode === 'batch_progress' && (
            <div className="space-y-3">
              {uploadingFiles.map((file) => (
                <div
                  key={file.id}
                  className={`border rounded-xl p-4 transition-all ${
                    file.stage === 'duplicate' ? 'border-slate-200 bg-slate-50 opacity-60' :
                    file.stage === 'processed' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[18px]">
                        {file.stage === 'processed' ? 'check_circle' : file.stage === 'duplicate' ? 'content_copy' : 'description'}
                      </span>
                      <span className={`text-[13px] font-medium ${file.stage === 'duplicate' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {file.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 tabular-nums">{(file.size / 1000).toFixed(0)} KB</span>
                  </div>

                  {file.stage === 'uploading' && (
                    <div className="w-full bg-slate-200 rounded h-1.5 overflow-hidden">
                      <div
                        className="bg-[#6D4FF0] h-full rounded progress-bar-striped transition-all duration-200"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}

                  {file.stage === 'extracting' && (
                    <div className="flex items-center gap-2 text-[13px] text-[#6D4FF0]">
                      <span className="w-4 h-4 border-2 border-[#6D4FF0]/20 border-t-[#6D4FF0] rounded-full animate-spin-slow" />
                      Extracting data with AI...
                    </div>
                  )}

                  {file.stage === 'processed' && (
                    <div className="flex items-center gap-2 text-[13px] text-emerald-600">
                      <span>Processed</span>
                      <ConfidencePill value={file.confidence || 0.9} />
                    </div>
                  )}

                  {file.stage === 'duplicate' && (
                    <div className="text-[13px] text-slate-500 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      Duplicate detected — this invoice already exists
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleBatchDone}
                  disabled={!uploadComplete}
                  className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                    uploadComplete
                      ? 'bg-[#6D4FF0] hover:bg-[#5B3BDC] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Upload GSTR-2B Modal */}
      <Modal isOpen={showGstr2bModal} onClose={() => setShowGstr2bModal(false)} title="Upload GSTR-2B Data" maxWidth="max-w-lg">
        {gstr2bStage === 'idle' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-slate-400">table_chart</span>
            </div>
            <h3 className="text-[14px] font-semibold text-slate-900 mb-2">Upload CSV File</h3>
            <p className="text-[13px] text-slate-500 mb-6">Select your GSTR-2B export file (.csv)</p>
            <button onClick={handleGstr2bUpload} className="px-5 py-2.5 rounded-lg bg-[#6D4FF0] hover:bg-[#5B3BDC] text-white text-[14px] font-semibold shadow-sm transition-all">
              Select File & Upload
            </button>
          </div>
        )}

        {gstr2bStage === 'parsing' && (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 border-3 border-slate-200 border-t-[#6D4FF0] rounded-full animate-spin-slow" />
            <p className="text-[13px] font-medium text-slate-700">Parsing CSV file...</p>
            <p className="text-[12px] text-slate-400 mt-1">Validating records against GSTIN format</p>
          </div>
        )}

        {gstr2bStage === 'done' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                <span className="text-[13px] font-semibold text-emerald-700">Parsing Complete</span>
              </div>
              <p className="text-[13px] text-emerald-600 ml-7">{gstr2bValidCount.toLocaleString()} valid records found</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <button onClick={() => setShowErrors(!showErrors)} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                  <span className="text-[13px] font-semibold text-red-700">{gstr2bErrorCount} validation errors</span>
                </div>
                <span className="material-symbols-outlined text-red-400 text-[18px]">{showErrors ? 'expand_less' : 'expand_more'}</span>
              </button>

              {showErrors && (
                <div className="mt-3 space-y-2 ml-7">
                  <div className="text-[12px] text-red-600 bg-red-100 rounded-lg px-3 py-2">Row 247: Invalid GSTIN format — "INVALID_GSTIN"</div>
                  <div className="text-[12px] text-red-600 bg-red-100 rounded-lg px-3 py-2">Row 891: Missing invoice number, negative taxable value (-₹5,000)</div>
                  <div className="text-[12px] text-red-600 bg-red-100 rounded-lg px-3 py-2">Row 1,102: Taxable value is zero with non-zero tax amounts</div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowGstr2bModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-[13px] hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleImportRecords} className="px-5 py-2 rounded-lg bg-[#6D4FF0] hover:bg-[#5B3BDC] text-white text-[13px] font-semibold shadow-sm transition-all">Import Valid Records</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Invoice Detail Drawer */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm" onClick={() => setSelectedInvoice(null)}>
          <div className="w-[480px] bg-white shadow-2xl animate-slide-in-right h-full overflow-y-auto border-l border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-[16px] font-semibold text-slate-900">Invoice Detail</h3>
              <button onClick={() => setSelectedInvoice(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Vendor</p>
                  <p className="text-[13px] font-medium text-slate-900">{selectedInvoice.vendorName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">GSTIN</p>
                  <p className="text-[13px] font-mono text-slate-600">{selectedInvoice.vendorGstin}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Invoice Number</p>
                  <p className="text-[13px] font-medium text-slate-900 font-mono">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Status</p>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Amounts</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Taxable Value', value: selectedInvoice.taxableValue },
                    { label: 'CGST', value: selectedInvoice.cgst },
                    { label: 'SGST', value: selectedInvoice.sgst },
                    { label: 'IGST', value: selectedInvoice.igst },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-[13px]">
                      <span className="text-slate-500">{row.label}</span>
                      <span className="text-slate-900 font-medium tabular-nums">₹{row.value.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-[13px] font-semibold">
                    <span className="text-slate-700">Total</span>
                    <span className="text-slate-900 tabular-nums">₹{selectedInvoice.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Extraction Confidence</h4>
                <div className="space-y-2">
                  {Object.entries(selectedInvoice.extractedConfidence).map(([field, conf]) => (
                    <div key={field} className="flex items-center justify-between">
                      <span className="text-[13px] text-slate-500 capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                      <ConfidencePill value={conf} />
                    </div>
                  ))}
                </div>
              </div>

              {getInvoiceMismatch(selectedInvoice.id) && (
                <button
                  onClick={() => { setSelectedInvoice(null); navigate(`/approvals`); }}
                  className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  Mismatch Found — View in Approval Queue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
