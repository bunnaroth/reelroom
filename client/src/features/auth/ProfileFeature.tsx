import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import type { Profile } from '../../types/movie'

export function ProfileFeature() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('movie-app-token')) {
      navigate('/')
      return
    }

    void api.getProfile()
      .then((result) => setProfile(result.user))
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Could not load your profile')
      })
  }, [navigate])

  function signOut() {
    localStorage.removeItem('movie-app-token')
    localStorage.removeItem('movie-app-user')
    navigate('/')
  }

  return (
    <main
      className="profile-page"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          navigate('/')
        }
      }}
    >
      <header className="topbar">
        <a className="brand" href="/">REEL<span>ROOM</span></a>
        <button className="text-button" onClick={() => navigate('/')}>Back</button>
      </header>
      <section className="profile-card" role="dialog" aria-modal="true" aria-labelledby="profile-heading">
        <h1 id="profile-heading">Your profile</h1>
        {error ? <p className="empty-state">{error}</p> : !profile ? <p className="empty-state">Loading your profile...</p> : (
          <div className="profile-details">
            <div className="profile-avatar">{profile.username.charAt(0).toUpperCase()}</div>
            <div>
              <p className="profile-label">Username</p>
              <p>{profile.username}</p>
            </div>
            <div>
              <p className="profile-label">Email</p>
              <p>{profile.email}</p>
            </div>
            <div>
              <p className="profile-label">Member since</p>
              <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
            <button className="primary-button" onClick={signOut}>Sign out</button>
          </div>
        )}
      </section>
    </main>
  )
}