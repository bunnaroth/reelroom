import { Link, useLocation, useNavigate } from 'react-router-dom'

interface AppNavigationProps {
  username: string
  onOpenAuth: () => void
}

export function AppNavigation({ username, onOpenAuth }: AppNavigationProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const onDiscoverPage = location.pathname === '/discover'
  const onWatchlistPage = location.pathname === '/watchlist'

  return (
    <header className="topbar">
      <Link className="brand" to="/">REEL<span>ROOM</span></Link>
      <nav className="nav-tabs" aria-label="Main navigation">
        <button className={onDiscoverPage ? 'active' : ''} onClick={() => navigate('/discover')}>Discover</button>
        <button className={onWatchlistPage ? 'active' : ''} onClick={() => navigate('/watchlist')}>My Watchlist</button>
      </nav>
      <button className="account-button" onClick={() => username === 'Sign in' ? onOpenAuth() : navigate('/profile')}>
        {username === 'Sign in' ? username : <><span className="avatar">{username.charAt(0).toUpperCase()}</span>{username}</>}
      </button>
    </header>
  )
}