import { create } from 'zustand';
import type { Client, Invoice, GSTR2BRecord, MismatchItem, Notification, Toast, UserSettings, MatchStatus, DemoUser, OnboardingStep, VendorRiskProfile } from '../data/types';
import * as seed from '../data/seed';

interface AppState {
  // ─── Auth ───
  isLoggedIn: boolean;
  currentUser: DemoUser | null;
  loginWithCredentials: (email: string, password: string) => DemoUser | null;
  logout: () => void;

  // ─── Data ───
  clients: Client[];
  invoices: Invoice[];
  gstr2bRecords: GSTR2BRecord[];
  mismatches: MismatchItem[];
  notifications: Notification[];
  settings: UserSettings;

  // ─── Onboarding (trial) ───
  onboardingSteps: OnboardingStep[];
  onboardingDismissed: boolean;
  toggleOnboardingStep: (id: string) => void;
  dismissOnboarding: () => void;

  // ─── Toast system ───
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;

  // ─── Approval actions ───
  approveItems: (ids: string[]) => void;
  resolveItem: (id: string, action: 'confirm_match' | 'confirm_mismatch') => void;
  contactVendor: (id: string) => void;

  // ─── Data actions ───
  addInvoices: (invoices: Invoice[]) => void;
  addGstr2bRecords: (records: GSTR2BRecord[]) => void;

  // ─── Notifications ───
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // ─── Settings ───
  updateSettings: (settings: Partial<UserSettings>) => void;

  // ─── Scoped helpers (role-aware) ───
  getScopedClients: () => Client[];
  getScopedInvoices: () => Invoice[];
  getScopedMismatches: () => MismatchItem[];
  getScopedGstr2bRecords: () => GSTR2BRecord[];
  getPendingApprovals: () => number;
  getClientMismatches: (clientId: string) => MismatchItem[];
  getFilteredMismatches: (filter: MatchStatus | 'all', clientId?: string) => MismatchItem[];
  getVendorRisk: (vendorGstin: string) => VendorRiskProfile | undefined;
  canApproveItem: (item: MismatchItem) => boolean;
}

let toastCounter = 0;

function cloneData() {
  return {
    clients: JSON.parse(JSON.stringify(seed.clients)) as Client[],
    invoices: JSON.parse(JSON.stringify(seed.invoices)) as Invoice[],
    gstr2bRecords: JSON.parse(JSON.stringify(seed.gstr2bRecords)) as GSTR2BRecord[],
    mismatches: JSON.parse(JSON.stringify(seed.mismatches)) as MismatchItem[],
    notifications: JSON.parse(JSON.stringify(seed.notifications)) as Notification[],
    settings: JSON.parse(JSON.stringify(seed.defaultSettings)) as UserSettings,
    onboardingSteps: JSON.parse(JSON.stringify(seed.onboardingSteps)) as OnboardingStep[],
  };
}

export const useStore = create<AppState>((set, get) => ({
  // ─── Auth ───
  isLoggedIn: false,
  currentUser: null,

  loginWithCredentials: (email, password) => {
    const user = seed.demoUsers.find((u) => u.email === email && u.password === password);
    if (!user) return null;

    // Reset all data on login so switching accounts is clean
    const fresh = cloneData();

    set({
      isLoggedIn: true,
      currentUser: user,
      ...fresh,
      settings: {
        ...fresh.settings,
        firmName: user.firmName,
        email: user.email,
      },
      toasts: [],
      onboardingDismissed: false,
    });
    return user;
  },

  logout: () => {
    set({
      isLoggedIn: false,
      currentUser: null,
      toasts: [],
    });
  },

  // ─── Data ───
  ...cloneData(),

  // ─── Onboarding ───
  onboardingDismissed: false,
  toggleOnboardingStep: (id) => {
    set((state) => ({
      onboardingSteps: state.onboardingSteps.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s
      ),
    }));
  },
  dismissOnboarding: () => set({ onboardingDismissed: true }),

  // ─── Toast system (auto-dismiss after 3.5s, max 5 visible) ───
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = `toast-${++toastCounter}`;
    set((state) => {
      const next = [...state.toasts, { id, message, type }];
      // Cap at 5 toasts max to prevent stacking
      return { toasts: next.slice(-5) };
    });
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  // ─── Approval actions ───
  approveItems: (ids) => {
    set((state) => ({
      mismatches: state.mismatches.map((m) =>
        ids.includes(m.id) ? { ...m, resolved: true, matchStatus: 'matched' as MatchStatus } : m
      ),
    }));
    get().addToast(`${ids.length} item${ids.length > 1 ? 's' : ''} approved`);
  },

  resolveItem: (id, action) => {
    set((state) => ({
      mismatches: state.mismatches.map((m) =>
        m.id === id
          ? {
              ...m,
              resolved: true,
              matchStatus: action === 'confirm_match' ? ('matched' as MatchStatus) : ('mismatch' as MatchStatus),
            }
          : m
      ),
    }));
    get().addToast(action === 'confirm_match' ? 'Match confirmed' : 'Mismatch confirmed');
  },

  contactVendor: (id) => {
    set((state) => ({
      mismatches: state.mismatches.map((m) =>
        m.id === id ? { ...m, vendorContacted: true } : m
      ),
    }));
  },

  // ─── Data actions ───
  addInvoices: (newInvoices) => {
    set((state) => ({ invoices: [...state.invoices, ...newInvoices] }));
  },
  addGstr2bRecords: (newRecords) => {
    set((state) => ({ gstr2bRecords: [...state.gstr2bRecords, ...newRecords] }));
  },

  // ─── Notifications ───
  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },
  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  // ─── Settings ───
  updateSettings: (newSettings) => {
    set((state) => ({ settings: { ...state.settings, ...newSettings } }));
    get().addToast('Changes saved');
  },

  // ─── Scoped helpers ───
  getScopedClients: () => {
    const user = get().currentUser;
    if (!user) return [];
    if (user.role === 'trial') return [];
    if (user.assignedClientIds.length > 0) {
      return get().clients.filter((c) => user.assignedClientIds.includes(c.id));
    }
    return get().clients;
  },

  getScopedInvoices: () => {
    const user = get().currentUser;
    if (!user || user.role === 'trial') return [];
    const scopedClientIds = user.assignedClientIds.length > 0
      ? user.assignedClientIds
      : get().clients.map((c) => c.id);
    return get().invoices.filter((i) => scopedClientIds.includes(i.clientId));
  },

  getScopedMismatches: () => {
    const user = get().currentUser;
    if (!user || user.role === 'trial') return [];
    const scopedClientIds = user.assignedClientIds.length > 0
      ? user.assignedClientIds
      : get().clients.map((c) => c.id);
    return get().mismatches.filter((m) => scopedClientIds.includes(m.clientId));
  },

  getScopedGstr2bRecords: () => {
    const user = get().currentUser;
    if (!user || user.role === 'trial') return [];
    const scopedClientIds = user.assignedClientIds.length > 0
      ? user.assignedClientIds
      : get().clients.map((c) => c.id);
    return get().gstr2bRecords.filter((r) => scopedClientIds.includes(r.clientId));
  },

  getPendingApprovals: () => {
    return get().getScopedMismatches().filter((m) => !m.resolved && !m.vendorContacted).length;
  },

  getClientMismatches: (clientId) => {
    return get().getScopedMismatches().filter((m) => m.clientId === clientId && !m.resolved);
  },

  getFilteredMismatches: (filter, clientId) => {
    let items = get().getScopedMismatches().filter((m) => !m.resolved && !m.vendorContacted);
    if (clientId) {
      items = items.filter((m) => m.clientId === clientId);
    }
    if (filter !== 'all') {
      items = items.filter((m) => m.matchStatus === filter);
    }
    return items;
  },

  getVendorRisk: (vendorGstin) => {
    return seed.vendorRiskProfiles.find((v) => v.vendorGstin === vendorGstin);
  },

  canApproveItem: (item) => {
    const user = get().currentUser;
    if (!user) return false;
    if (user.role === 'partner') return true;
    if (user.role === 'trial') return false;
    // Associate: can only approve if variance <= approvalLimit
    if (user.approvalLimit > 0 && item.variance > user.approvalLimit) return false;
    return true;
  },
}));
