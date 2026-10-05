import { useStore } from '../store/useStore';

export default function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const dismissToast = useStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-toast-in pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] font-medium text-white shadow-lg cursor-pointer border"
          style={{
            background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : toast.type === 'warning' ? '#d97706' : '#6D4FF0',
            borderColor: toast.type === 'success' ? '#047857' : toast.type === 'error' ? '#b91c1c' : toast.type === 'warning' ? '#b45309' : '#5B3BDC',
          }}
          onClick={() => dismissToast(toast.id)}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'info'}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
