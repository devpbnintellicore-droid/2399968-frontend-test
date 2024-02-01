import { X } from 'lucide-react'

export default function Modal({ title, children, onClose, width = 440 }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          width: '100%',
          maxWidth: width,
          padding: 32,
          position: 'relative',
          animation: 'slideUp 0.25s ease-out',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 8, padding: 6, cursor: 'pointer',
            color: 'var(--muted)', display: 'flex', alignItems: 'center',
          }}
        >
          <X size={14} />
        </button>
        {title && <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>{title}</h2>}
        {children}
      </div>
    </div>
  )
}
