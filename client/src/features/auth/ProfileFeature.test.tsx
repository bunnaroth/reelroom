import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../../services/api'
import { ProfileFeature } from './ProfileFeature'

vi.mock('../../services/api', () => ({
  api: {
    getProfile: vi.fn(),
  },
}))

function CurrentLocation() {
  const location = useLocation()
  return <output aria-label="Current URL">{location.pathname}</output>
}

describe('ProfileFeature', () => {
  beforeEach(() => {
    localStorage.setItem('movie-app-token', 'profile-token')
    vi.mocked(api.getProfile).mockResolvedValue({
      user: {
        id: 1,
        username: 'Ava',
        email: 'ava@example.com',
        role: 'user',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    })
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('keeps the profile open when clicking inside and closes it on an outside click', async () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<ProfileFeature />} />
          <Route path="/" element={<p>Home page</p>} />
        </Routes>
        <CurrentLocation />
      </MemoryRouter>,
    )

    expect(await screen.findByText('ava@example.com')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('dialog'))
    expect(screen.getByLabelText('Current URL')).toHaveTextContent('/profile')

    fireEvent.click(screen.getByRole('main'))
    expect(await screen.findByText('Home page')).toBeInTheDocument()
    expect(screen.getByLabelText('Current URL')).toHaveTextContent('/')
  })
})
