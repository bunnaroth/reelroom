import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import { ProfileFeature } from '../features/auth/ProfileFeature'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/profile',
    element: <ProfileFeature />,
  },
])
