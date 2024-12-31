import Modal from './Modal'

export default function LogoutModal({ onClose, onLogout }) {
  return (
    <Modal onClose={onClose} width={400}>
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>📢</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
          Confirm Logout
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 28 }}>
          You are about to log out. Please ensure all your work is saved. Are you sure you want to proceed?
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onLogout}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 12,
              border: '1px solid var(--danger)',
              background: 'transparent',
              color: 'var(--danger)',
              fontWeight: 700, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Logout
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 12,
              border: 'none', background: 'var(--primary)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
