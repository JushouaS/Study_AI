import Icon from './Icon'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 w-full max-w-sm mx-4 fade-up shadow-lg">
        <div className="flex items-center gap-sm mb-3">
          <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center">
            <Icon name="warning" className="text-error" />
          </div>
          <h3 className="text-on-background font-headline-md text-headline-md font-bold">{title}</h3>
        </div>
        <p className="text-on-surface-variant text-body-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm bg-error text-on-error hover:opacity-90 transition-all font-semibold active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
