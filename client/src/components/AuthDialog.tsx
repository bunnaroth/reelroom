import type { FormEvent } from 'react'

interface AuthDialogProps {
  authOpen: boolean
  registerMode: boolean
  auth: {
    username: string
    email: string
    password: string
  }
  message?: string
  onClose: () => void
  onSubmit: (event: FormEvent) => void
  onToggleMode: () => void
  onChange: (field: 'username' | 'email' | 'password', value: string) => void
}

export function AuthDialog({
  authOpen,
  registerMode,
  auth,
  message,
  onClose,
  onSubmit,
  onToggleMode,
  onChange,
}: AuthDialogProps) {
  if (!authOpen) {
    return null
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section className="auth-dialog" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Close authentication">×</button>
        <h2>{registerMode ? 'Create your account' : 'Welcome back'}</h2>
        {message && <p>{message}</p>}
        <form onSubmit={onSubmit}>
          {registerMode && (
            <input
              required
              value={auth.username}
              onChange={(event) => onChange('username', event.target.value)}
              placeholder="Username"
            />
          )}
          <input
            required
            type="email"
            value={auth.email}
            onChange={(event) => onChange('email', event.target.value)}
            placeholder="Email"
          />
          <input
            required
            type="password"
            value={auth.password}
            onChange={(event) => onChange('password', event.target.value)}
            placeholder="Password"
          />
          <button type="submit" className="primary-button">
            {registerMode ? 'Register' : 'Sign in'}
          </button>
        </form>
        <button className="text-button" onClick={onToggleMode}>
          {registerMode ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </section>
    </div>
  )
}
