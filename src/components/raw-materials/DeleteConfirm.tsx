'use client';

interface Props {
  id: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirm({ id, onCancel, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">Delete Raw Material</h3>
        <p className="mt-2 text-sm text-slate-500">Are you sure you want to delete this raw material?</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onCancel} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-rose-700">Delete</button>
        </div>
      </div>
    </div>
  );
}
