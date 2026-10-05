export interface Client {
  id: string;
  name: string;
  gstinCount: number;
  status: 'reconciled' | 'needs_review';
  lastSynced: string;
}

export interface GSTIN {
  id: string;
  clientId: string;
  number: string;
  stateCode: string;
}

export interface FieldConfidence {
  vendorName: number;
  vendorGstin: number;
  invoiceNumber: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  vendorName: string;
  vendorGstin: string;
  invoiceNumber: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  extractedConfidence: FieldConfidence;
  status: 'processed' | 'extracting' | 'duplicate' | 'failed';
  uploadedAt: string;
}

export interface GSTR2BRecord {
  id: string;
  clientId: string;
  gstinId: string;
  period: string;
  vendorGstin: string;
  invoiceNumber: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  status: 'valid' | 'error';
}

export type MatchStatus = 'matched' | 'mismatch' | 'needs_review';
export type MismatchType = 'vendor_not_filed' | 'amount_mismatch' | 'rate_mismatch';

export interface MismatchItem {
  id: string;
  invoiceId: string;
  gstr2bRecordId: string;
  clientId: string;
  matchStatus: MatchStatus;
  mismatchType: MismatchType;
  variance: number;
  confidence: number;
  resolved: boolean;
  vendorContacted: boolean;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface UserSettings {
  firmName: string;
  email: string;
  defaultGstin: string;
  notifyMismatches: boolean;
  notifyUploads: boolean;
  notifyApprovals: boolean;
  weeklyDigest: boolean;
}

export interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  stage: 'uploading' | 'extracting' | 'processed' | 'duplicate' | 'failed';
  confidence?: number;
  isDuplicate?: boolean;
}

// ─── Role-Based Auth ───
export type UserRole = 'partner' | 'associate' | 'trial';

export interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  firmName: string;
  assignedClientIds: string[]; // empty = all clients
  approvalLimit: number; // 0 = unlimited
}

// ─── Vendor Risk ───
export type VendorRiskLevel = 'reliable' | 'occasional_delays' | 'chronic_late';

export interface VendorRiskProfile {
  vendorGstin: string;
  riskLevel: VendorRiskLevel;
  lateFilings: number;
  totalFilings: number;
  tooltip: string;
}

// ─── Onboarding ───
export interface OnboardingStep {
  id: string;
  label: string;
  completed: boolean;
}
