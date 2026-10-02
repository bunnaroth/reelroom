import type { FormEvent } from 'react'
import { AuthDialog } from '../../components/AuthDialog'

interface AuthFeatureProps {
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

export function AuthFeature(props: AuthFeatureProps) {
  return <AuthDialog {...props} />
}
