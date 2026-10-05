import type { Client, GSTIN, Invoice, GSTR2BRecord, MismatchItem, Notification, UserSettings, DemoUser, VendorRiskProfile, OnboardingStep } from './types';

export const clients: Client[] = [
  { id: 'c1', name: 'Sharma Enterprises', gstinCount: 3, status: 'needs_review', lastSynced: '2026-09-18T14:30:00Z' },
  { id: 'c2', name: 'Patel Trading Co.', gstinCount: 2, status: 'reconciled', lastSynced: '2026-09-19T09:15:00Z' },
  { id: 'c3', name: 'Gupta Textiles Pvt Ltd', gstinCount: 4, status: 'needs_review', lastSynced: '2026-09-17T11:00:00Z' },
  { id: 'c4', name: 'Reddy Pharma Industries', gstinCount: 1, status: 'reconciled', lastSynced: '2026-09-20T08:45:00Z' },
  { id: 'c5', name: 'Mehta Steel Industries', gstinCount: 2, status: 'needs_review', lastSynced: '2026-09-16T16:20:00Z' },
  { id: 'c6', name: 'Iyer & Associates', gstinCount: 1, status: 'reconciled', lastSynced: '2026-09-19T13:00:00Z' },
  { id: 'c7', name: 'Singh Logistics Ltd', gstinCount: 3, status: 'needs_review', lastSynced: '2026-09-15T10:30:00Z' },
  { id: 'c8', name: 'Kapoor Electronics', gstinCount: 2, status: 'reconciled', lastSynced: '2026-09-20T07:00:00Z' },
];

export const gstins: GSTIN[] = [
  { id: 'g1', clientId: 'c1', number: '27AADCS1234F1ZP', stateCode: '27' },
  { id: 'g2', clientId: 'c1', number: '29AADCS1234F1ZQ', stateCode: '29' },
  { id: 'g3', clientId: 'c1', number: '07AADCS1234F1ZR', stateCode: '07' },
  { id: 'g4', clientId: 'c2', number: '24BBBPT5678G1ZA', stateCode: '24' },
  { id: 'g5', clientId: 'c2', number: '27BBBPT5678G1ZB', stateCode: '27' },
  { id: 'g6', clientId: 'c3', number: '09CCCGT9012H1ZC', stateCode: '09' },
  { id: 'g7', clientId: 'c3', number: '27CCCGT9012H1ZD', stateCode: '27' },
  { id: 'g8', clientId: 'c4', number: '36DDDRI3456J1ZE', stateCode: '36' },
  { id: 'g9', clientId: 'c5', number: '27EEEMS7890K1ZF', stateCode: '27' },
  { id: 'g10', clientId: 'c5', number: '24EEEMS7890K1ZG', stateCode: '24' },
  { id: 'g11', clientId: 'c6', number: '33FFFIA2345L1ZH', stateCode: '33' },
  { id: 'g12', clientId: 'c7', number: '07GGGSL6789M1ZI', stateCode: '07' },
  { id: 'g13', clientId: 'c7', number: '27GGGSL6789M1ZJ', stateCode: '27' },
  { id: 'g14', clientId: 'c8', number: '27HHHKE0123N1ZK', stateCode: '27' },
  { id: 'g15', clientId: 'c8', number: '29HHHKE0123N1ZL', stateCode: '29' },
];

export const invoices: Invoice[] = [
  {
    id: 'inv1', clientId: 'c1', vendorName: 'ABC Raw Materials Ltd', vendorGstin: '27AABCA1234B1ZX',
    invoiceNumber: 'INV-2026-001', taxableValue: 245000, cgst: 22050, sgst: 22050, igst: 0, total: 289100,
    extractedConfidence: { vendorName: 0.97, vendorGstin: 0.99, invoiceNumber: 0.95, taxableValue: 0.92, cgst: 0.91, sgst: 0.91, igst: 1.0, total: 0.94 },
    status: 'processed', uploadedAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'inv2', clientId: 'c1', vendorName: 'Delhi Packaging Solutions', vendorGstin: '07DDDPS5678C1ZY',
    invoiceNumber: 'DPS/26-27/0442', taxableValue: 87500, cgst: 0, sgst: 0, igst: 15750, total: 103250,
    extractedConfidence: { vendorName: 0.96, vendorGstin: 0.98, invoiceNumber: 0.93, taxableValue: 0.89, cgst: 1.0, sgst: 1.0, igst: 0.88, total: 0.90 },
    status: 'processed', uploadedAt: '2026-09-18T10:02:00Z',
  },
  {
    id: 'inv3', clientId: 'c1', vendorName: 'Raj Transport Services', vendorGstin: '27RRRTS9012D1ZZ',
    invoiceNumber: 'RTS-0891', taxableValue: 32000, cgst: 2880, sgst: 2880, igst: 0, total: 37760,
    extractedConfidence: { vendorName: 0.72, vendorGstin: 0.68, invoiceNumber: 0.85, taxableValue: 0.78, cgst: 0.76, sgst: 0.76, igst: 1.0, total: 0.79 },
    status: 'processed', uploadedAt: '2026-09-18T10:05:00Z',
  },
  {
    id: 'inv4', clientId: 'c2', vendorName: 'Gujarat Chemical Works', vendorGstin: '24GGGCW3456E1ZA',
    invoiceNumber: 'GCW/2026/1122', taxableValue: 156000, cgst: 14040, sgst: 14040, igst: 0, total: 184080,
    extractedConfidence: { vendorName: 0.98, vendorGstin: 0.99, invoiceNumber: 0.97, taxableValue: 0.96, cgst: 0.95, sgst: 0.95, igst: 1.0, total: 0.97 },
    status: 'processed', uploadedAt: '2026-09-19T08:30:00Z',
  },
  {
    id: 'inv5', clientId: 'c3', vendorName: 'Surat Silk House', vendorGstin: '24SSSSH7890F1ZB',
    invoiceNumber: 'SSH-4455', taxableValue: 520000, cgst: 0, sgst: 0, igst: 93600, total: 613600,
    extractedConfidence: { vendorName: 0.94, vendorGstin: 0.96, invoiceNumber: 0.91, taxableValue: 0.93, cgst: 1.0, sgst: 1.0, igst: 0.92, total: 0.93 },
    status: 'processed', uploadedAt: '2026-09-17T09:00:00Z',
  },
  {
    id: 'inv6', clientId: 'c3', vendorName: 'Kanpur Dyes & Chemicals', vendorGstin: '09KKKDC1234G1ZC',
    invoiceNumber: 'KDC/09/2026/078', taxableValue: 78000, cgst: 7020, sgst: 7020, igst: 0, total: 92040,
    extractedConfidence: { vendorName: 0.88, vendorGstin: 0.91, invoiceNumber: 0.70, taxableValue: 0.85, cgst: 0.84, sgst: 0.84, igst: 1.0, total: 0.86 },
    status: 'processed', uploadedAt: '2026-09-17T09:15:00Z',
  },
  {
    id: 'inv7', clientId: 'c4', vendorName: 'Hyderabad Medical Supplies', vendorGstin: '36HHHMS5678H1ZD',
    invoiceNumber: 'HMS-2026-3301', taxableValue: 412000, cgst: 24720, sgst: 24720, igst: 0, total: 461440,
    extractedConfidence: { vendorName: 0.99, vendorGstin: 0.99, invoiceNumber: 0.98, taxableValue: 0.97, cgst: 0.97, sgst: 0.97, igst: 1.0, total: 0.98 },
    status: 'processed', uploadedAt: '2026-09-20T07:00:00Z',
  },
  {
    id: 'inv8', clientId: 'c5', vendorName: 'Tata Steel Distribution', vendorGstin: '27TTTSD9012I1ZE',
    invoiceNumber: 'TSD/MH/26-0055', taxableValue: 1850000, cgst: 166500, sgst: 166500, igst: 0, total: 2183000,
    extractedConfidence: { vendorName: 0.95, vendorGstin: 0.97, invoiceNumber: 0.94, taxableValue: 0.91, cgst: 0.90, sgst: 0.90, igst: 1.0, total: 0.92 },
    status: 'processed', uploadedAt: '2026-09-16T14:00:00Z',
  },
  {
    id: 'inv9', clientId: 'c5', vendorName: 'JSW Coated Products', vendorGstin: '27JJJCP3456J1ZF',
    invoiceNumber: 'JSWCP-88721', taxableValue: 975000, cgst: 87750, sgst: 87750, igst: 0, total: 1150500,
    extractedConfidence: { vendorName: 0.93, vendorGstin: 0.95, invoiceNumber: 0.89, taxableValue: 0.74, cgst: 0.73, sgst: 0.73, igst: 1.0, total: 0.75 },
    status: 'processed', uploadedAt: '2026-09-16T14:10:00Z',
  },
  {
    id: 'inv10', clientId: 'c6', vendorName: 'Chennai Office Supplies', vendorGstin: '33CCCOF7890K1ZG',
    invoiceNumber: 'COS-2026-0089', taxableValue: 12500, cgst: 1125, sgst: 1125, igst: 0, total: 14750,
    extractedConfidence: { vendorName: 0.96, vendorGstin: 0.98, invoiceNumber: 0.95, taxableValue: 0.94, cgst: 0.93, sgst: 0.93, igst: 1.0, total: 0.95 },
    status: 'processed', uploadedAt: '2026-09-19T11:00:00Z',
  },
  {
    id: 'inv11', clientId: 'c7', vendorName: 'Bharat Petroleum Corp', vendorGstin: '07BBBPC1234L1ZH',
    invoiceNumber: 'BPCL/DEL/26-4421', taxableValue: 340000, cgst: 0, sgst: 0, igst: 61200, total: 401200,
    extractedConfidence: { vendorName: 0.97, vendorGstin: 0.99, invoiceNumber: 0.96, taxableValue: 0.93, cgst: 1.0, sgst: 1.0, igst: 0.92, total: 0.94 },
    status: 'processed', uploadedAt: '2026-09-15T08:30:00Z',
  },
  {
    id: 'inv12', clientId: 'c7', vendorName: 'MRF Tyres Dealer', vendorGstin: '27MMMTD5678M1ZI',
    invoiceNumber: 'MRF-DLR-0224', taxableValue: 128000, cgst: 14400, sgst: 14400, igst: 0, total: 156800,
    extractedConfidence: { vendorName: 0.69, vendorGstin: 0.71, invoiceNumber: 0.82, taxableValue: 0.68, cgst: 0.67, sgst: 0.67, igst: 1.0, total: 0.69 },
    status: 'processed', uploadedAt: '2026-09-15T08:45:00Z',
  },
  {
    id: 'inv13', clientId: 'c8', vendorName: 'Samsung India Electronics', vendorGstin: '27SSSIE9012N1ZJ',
    invoiceNumber: 'SIE/MH/2026/0553', taxableValue: 890000, cgst: 80100, sgst: 80100, igst: 0, total: 1050200,
    extractedConfidence: { vendorName: 0.98, vendorGstin: 0.99, invoiceNumber: 0.97, taxableValue: 0.95, cgst: 0.94, sgst: 0.94, igst: 1.0, total: 0.96 },
    status: 'processed', uploadedAt: '2026-09-20T06:00:00Z',
  },
  {
    id: 'inv14', clientId: 'c8', vendorName: 'LG Electronics India', vendorGstin: '27LLLEI3456O1ZK',
    invoiceNumber: 'LGEI-26-07821', taxableValue: 445000, cgst: 40050, sgst: 40050, igst: 0, total: 525100,
    extractedConfidence: { vendorName: 0.95, vendorGstin: 0.97, invoiceNumber: 0.93, taxableValue: 0.91, cgst: 0.90, sgst: 0.90, igst: 1.0, total: 0.92 },
    status: 'processed', uploadedAt: '2026-09-20T06:15:00Z',
  },
  {
    id: 'inv15', clientId: 'c3', vendorName: 'Varanasi Handloom Co-op', vendorGstin: '09VVVHC7890P1ZL',
    invoiceNumber: 'VHC-2026-112', taxableValue: 67000, cgst: 0, sgst: 0, igst: 3350, total: 70350,
    extractedConfidence: { vendorName: 0.71, vendorGstin: 0.74, invoiceNumber: 0.69, taxableValue: 0.72, cgst: 1.0, sgst: 1.0, igst: 0.70, total: 0.73 },
    status: 'processed', uploadedAt: '2026-09-17T09:30:00Z',
  },
];

export const gstr2bRecords: GSTR2BRecord[] = [
  { id: 'g2b1', clientId: 'c1', gstinId: 'g1', period: '092026', vendorGstin: '27AABCA1234B1ZX', invoiceNumber: 'INV-2026-001', taxableValue: 245000, cgst: 22050, sgst: 22050, igst: 0, status: 'valid' },
  { id: 'g2b2', clientId: 'c1', gstinId: 'g3', period: '092026', vendorGstin: '07DDDPS5678C1ZY', invoiceNumber: 'DPS/26-27/0442', taxableValue: 87500, cgst: 0, sgst: 0, igst: 15750, status: 'valid' },
  { id: 'g2b3', clientId: 'c2', gstinId: 'g4', period: '092026', vendorGstin: '24GGGCW3456E1ZA', invoiceNumber: 'GCW/2026/1122', taxableValue: 156000, cgst: 14040, sgst: 14040, igst: 0, status: 'valid' },
  { id: 'g2b4', clientId: 'c3', gstinId: 'g6', period: '092026', vendorGstin: '24SSSSH7890F1ZB', invoiceNumber: 'SSH-4455', taxableValue: 520000, cgst: 0, sgst: 0, igst: 93600, status: 'valid' },
  { id: 'g2b5', clientId: 'c3', gstinId: 'g6', period: '092026', vendorGstin: '09KKKDC1234G1ZC', invoiceNumber: 'KDC/09/2026/078', taxableValue: 82000, cgst: 7380, sgst: 7380, igst: 0, status: 'valid' },
  { id: 'g2b6', clientId: 'c4', gstinId: 'g8', period: '092026', vendorGstin: '36HHHMS5678H1ZD', invoiceNumber: 'HMS-2026-3301', taxableValue: 412000, cgst: 24720, sgst: 24720, igst: 0, status: 'valid' },
  { id: 'g2b7', clientId: 'c5', gstinId: 'g9', period: '092026', vendorGstin: '27TTTSD9012I1ZE', invoiceNumber: 'TSD/MH/26-0055', taxableValue: 1850000, cgst: 166500, sgst: 166500, igst: 0, status: 'valid' },
  { id: 'g2b8', clientId: 'c5', gstinId: 'g9', period: '092026', vendorGstin: '27JJJCP3456J1ZF', invoiceNumber: 'JSWCP-88721', taxableValue: 980000, cgst: 88200, sgst: 88200, igst: 0, status: 'valid' },
  // Validation error example
  { id: 'g2b9', clientId: 'c7', gstinId: 'g12', period: '092026', vendorGstin: '07BBBPC1234L1ZH', invoiceNumber: 'BPCL/DEL/26-4421', taxableValue: 340000, cgst: 0, sgst: 0, igst: 61200, status: 'valid' },
  { id: 'g2b10', clientId: 'c7', gstinId: 'g13', period: '092026', vendorGstin: '27MMMTD5678M1ZI', invoiceNumber: 'MRF-DLR-0224', taxableValue: 128000, cgst: 14400, sgst: 14400, igst: 0, status: 'valid' },
  { id: 'g2b11', clientId: 'c8', gstinId: 'g14', period: '092026', vendorGstin: '27SSSIE9012N1ZJ', invoiceNumber: 'SIE/MH/2026/0553', taxableValue: 890000, cgst: 80100, sgst: 80100, igst: 0, status: 'valid' },
  // Error records
  { id: 'g2b12', clientId: 'c3', gstinId: 'g7', period: '092026', vendorGstin: 'INVALID_GSTIN', invoiceNumber: '', taxableValue: -5000, cgst: 0, sgst: 0, igst: 0, status: 'error' },
  { id: 'g2b13', clientId: 'c5', gstinId: 'g10', period: '092026', vendorGstin: '24XXXXX0000X1ZZ', invoiceNumber: 'TEST-000', taxableValue: 0, cgst: 0, sgst: 0, igst: 0, status: 'error' },
];

export const mismatches: MismatchItem[] = [
  // Matched items
  { id: 'm1', invoiceId: 'inv1', gstr2bRecordId: 'g2b1', clientId: 'c1', matchStatus: 'matched', mismatchType: 'amount_mismatch', variance: 0, confidence: 0.98, resolved: false, vendorContacted: false },
  { id: 'm2', invoiceId: 'inv2', gstr2bRecordId: 'g2b2', clientId: 'c1', matchStatus: 'matched', mismatchType: 'amount_mismatch', variance: 0, confidence: 0.96, resolved: false, vendorContacted: false },
  { id: 'm3', invoiceId: 'inv4', gstr2bRecordId: 'g2b3', clientId: 'c2', matchStatus: 'matched', mismatchType: 'amount_mismatch', variance: 0, confidence: 0.99, resolved: false, vendorContacted: false },
  { id: 'm4', invoiceId: 'inv7', gstr2bRecordId: 'g2b6', clientId: 'c4', matchStatus: 'matched', mismatchType: 'amount_mismatch', variance: 0, confidence: 0.98, resolved: false, vendorContacted: false },
  // Mismatches - amount
  { id: 'm5', invoiceId: 'inv6', gstr2bRecordId: 'g2b5', clientId: 'c3', matchStatus: 'mismatch', mismatchType: 'amount_mismatch', variance: 4720, confidence: 0.72, resolved: false, vendorContacted: false },
  { id: 'm6', invoiceId: 'inv9', gstr2bRecordId: 'g2b8', clientId: 'c5', matchStatus: 'mismatch', mismatchType: 'amount_mismatch', variance: 5450, confidence: 0.68, resolved: false, vendorContacted: false },
  // Mismatches - rate
  { id: 'm7', invoiceId: 'inv12', gstr2bRecordId: 'g2b10', clientId: 'c7', matchStatus: 'mismatch', mismatchType: 'rate_mismatch', variance: 3200, confidence: 0.71, resolved: false, vendorContacted: false },
  // Needs review
  { id: 'm8', invoiceId: 'inv3', gstr2bRecordId: 'g2b1', clientId: 'c1', matchStatus: 'needs_review', mismatchType: 'vendor_not_filed', variance: 37760, confidence: 0.45, resolved: false, vendorContacted: false },
  { id: 'm9', invoiceId: 'inv5', gstr2bRecordId: 'g2b4', clientId: 'c3', matchStatus: 'needs_review', mismatchType: 'amount_mismatch', variance: 0, confidence: 0.88, resolved: false, vendorContacted: false },
  { id: 'm10', invoiceId: 'inv8', gstr2bRecordId: 'g2b7', clientId: 'c5', matchStatus: 'needs_review', mismatchType: 'amount_mismatch', variance: 0, confidence: 0.91, resolved: false, vendorContacted: false },
  { id: 'm11', invoiceId: 'inv11', gstr2bRecordId: 'g2b9', clientId: 'c7', matchStatus: 'needs_review', mismatchType: 'vendor_not_filed', variance: 401200, confidence: 0.52, resolved: false, vendorContacted: false },
  { id: 'm12', invoiceId: 'inv15', gstr2bRecordId: 'g2b4', clientId: 'c3', matchStatus: 'needs_review', mismatchType: 'amount_mismatch', variance: 1250, confidence: 0.76, resolved: false, vendorContacted: false },
  { id: 'm13', invoiceId: 'inv13', gstr2bRecordId: 'g2b11', clientId: 'c8', matchStatus: 'matched', mismatchType: 'amount_mismatch', variance: 0, confidence: 0.97, resolved: false, vendorContacted: false },
  { id: 'm14', invoiceId: 'inv14', gstr2bRecordId: 'g2b11', clientId: 'c8', matchStatus: 'needs_review', mismatchType: 'rate_mismatch', variance: 2100, confidence: 0.79, resolved: false, vendorContacted: false },
];

export const notifications: Notification[] = [
  { id: 'n1', message: 'GSTR-2B data available for September 2026', timestamp: '2026-09-20T08:00:00Z', read: false },
  { id: 'n2', message: '3 new mismatches detected for Sharma Enterprises', timestamp: '2026-09-19T15:30:00Z', read: false },
  { id: 'n3', message: 'Mehta Steel Industries reconciliation complete', timestamp: '2026-09-18T12:00:00Z', read: true },
  { id: 'n4', message: 'Invoice extraction failed for 1 file — Gupta Textiles', timestamp: '2026-09-17T14:22:00Z', read: true },
  { id: 'n5', message: 'Monthly ITC summary ready for download', timestamp: '2026-09-16T09:00:00Z', read: true },
];

export const defaultSettings: UserSettings = {
  firmName: 'Sharma & Associates',
  email: 'priya@sharmaassociates.in',
  defaultGstin: '27AADCV1234F1ZP',
  notifyMismatches: true,
  notifyUploads: true,
  notifyApprovals: false,
  weeklyDigest: true,
};

// ─── Demo Accounts ───
export const demoUsers: DemoUser[] = [
  {
    email: 'priya@sharmaassociates.in',
    password: 'demo1234',
    name: 'Priya Sharma',
    role: 'partner',
    firmName: 'Sharma & Associates',
    assignedClientIds: [], // empty = all clients
    approvalLimit: 0, // 0 = unlimited
  },
  {
    email: 'rahul@sharmaassociates.in',
    password: 'demo1234',
    name: 'Rahul Mehta',
    role: 'associate',
    firmName: 'Sharma & Associates',
    assignedClientIds: ['c1', 'c3', 'c5'], // only Sharma, Gupta, Mehta
    approvalLimit: 10000, // cannot approve above ₹10,000
  },
  {
    email: 'demo@newfirm.in',
    password: 'demo1234',
    name: 'Ankit Verma',
    role: 'trial',
    firmName: 'Verma Tax Consultants',
    assignedClientIds: [], // has no data at all
    approvalLimit: 0,
  },
];

// ─── Vendor Risk Profiles ───
export const vendorRiskProfiles: VendorRiskProfile[] = [
  { vendorGstin: '27AABCA1234B1ZX', riskLevel: 'reliable', lateFilings: 0, totalFilings: 12, tooltip: 'Filed on time 12 of last 12 months' },
  { vendorGstin: '07DDDPS5678C1ZY', riskLevel: 'occasional_delays', lateFilings: 3, totalFilings: 12, tooltip: 'Filed late 3 of last 12 months' },
  { vendorGstin: '27RRRTS9012D1ZZ', riskLevel: 'chronic_late', lateFilings: 8, totalFilings: 12, tooltip: 'Filed late 8 of last 12 months' },
  { vendorGstin: '24GGGCW3456E1ZA', riskLevel: 'reliable', lateFilings: 1, totalFilings: 12, tooltip: 'Filed late 1 of last 12 months' },
  { vendorGstin: '24SSSSH7890F1ZB', riskLevel: 'reliable', lateFilings: 0, totalFilings: 12, tooltip: 'Filed on time 12 of last 12 months' },
  { vendorGstin: '09KKKDC1234G1ZC', riskLevel: 'occasional_delays', lateFilings: 4, totalFilings: 6, tooltip: 'Filed late 4 of last 6 months' },
  { vendorGstin: '36HHHMS5678H1ZD', riskLevel: 'reliable', lateFilings: 0, totalFilings: 12, tooltip: 'Filed on time 12 of last 12 months' },
  { vendorGstin: '27TTTSD9012I1ZE', riskLevel: 'reliable', lateFilings: 1, totalFilings: 12, tooltip: 'Filed late 1 of last 12 months' },
  { vendorGstin: '27JJJCP3456J1ZF', riskLevel: 'occasional_delays', lateFilings: 3, totalFilings: 12, tooltip: 'Filed late 3 of last 12 months' },
  { vendorGstin: '33CCCOF7890K1ZG', riskLevel: 'reliable', lateFilings: 0, totalFilings: 12, tooltip: 'Filed on time 12 of last 12 months' },
  { vendorGstin: '07BBBPC1234L1ZH', riskLevel: 'reliable', lateFilings: 0, totalFilings: 12, tooltip: 'Filed on time 12 of last 12 months' },
  { vendorGstin: '27MMMTD5678M1ZI', riskLevel: 'chronic_late', lateFilings: 7, totalFilings: 12, tooltip: 'Filed late 7 of last 12 months' },
  { vendorGstin: '27SSSIE9012N1ZJ', riskLevel: 'reliable', lateFilings: 0, totalFilings: 12, tooltip: 'Filed on time 12 of last 12 months' },
  { vendorGstin: '27LLLEI3456O1ZK', riskLevel: 'reliable', lateFilings: 0, totalFilings: 12, tooltip: 'Filed on time 12 of last 12 months' },
  { vendorGstin: '09VVVHC7890P1ZL', riskLevel: 'chronic_late', lateFilings: 5, totalFilings: 6, tooltip: 'Filed late 5 of last 6 months' },
];

// ─── Onboarding Steps (trial account) ───
export const onboardingSteps: OnboardingStep[] = [
  { id: 'ob1', label: 'Add your first client', completed: false },
  { id: 'ob2', label: 'Upload invoices', completed: false },
  { id: 'ob3', label: 'Upload GSTR-2B data', completed: false },
];

