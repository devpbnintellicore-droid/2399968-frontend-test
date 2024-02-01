import Card from '../components/ui/Card'

export default function Unauthorized() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <Card style={{ maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
          Access Denied
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
          You do not have permission to access this page.
        </div>
      </Card>
    </div>
  )
}
