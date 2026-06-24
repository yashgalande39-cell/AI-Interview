/**
 * EmailVerificationBanner
 * =====================================================================
 * Shown at the top of AppLayout when the user has a local auth account
 * but hasn't verified their email yet. Includes a resend button.
 *
 * Phase 3: Soft enforcement — users can still use the app, but see this
 * persistent banner until they verify.
 */
import { useState } from 'react';
import { MailWarning, X, RefreshCw, CheckCircle } from 'lucide-react';
import { apiPost } from '../services/api';

export default function EmailVerificationBanner() {
  const [dismissed, setDismissed]   = useState(false);
  const [sending, setSending]        = useState(false);
  const [sent, setSent]              = useState(false);
  const [error, setError]            = useState('');

  if (dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    setError('');
    try {
      await apiPost('/auth/resend-verification', {});
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to resend. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background: 'linear-gradient(90deg, rgba(234,179,8,0.08), rgba(234,179,8,0.04))',
        borderBottom: '1px solid rgba(234,179,8,0.2)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
        fontSize: '13px',
      }}
    >
      <MailWarning size={15} style={{ color: '#eab308', flexShrink: 0 }} />

      {sent ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#86efac' }}>
          <CheckCircle size={14} />
          Verification email sent! Check your inbox.
        </span>
      ) : (
        <>
          <span style={{ color: '#fde68a', flex: 1 }}>
            <strong>Verify your email</strong> to unlock all features and keep your account secure.
            {error && <span style={{ color: '#fca5a5', marginLeft: 8 }}>{error}</span>}
          </span>

          <button
            onClick={handleResend}
            disabled={sending}
            style={{
              background: 'rgba(234,179,8,0.15)',
              border: '1px solid rgba(234,179,8,0.3)',
              color: '#fde68a',
              borderRadius: '6px',
              padding: '3px 10px',
              fontSize: '12px',
              cursor: sending ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap',
            }}
          >
            {sending ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {sending ? 'Sending…' : 'Resend email'}
          </button>
        </>
      )}

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          color: '#78716c',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
