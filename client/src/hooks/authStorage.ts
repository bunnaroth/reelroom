export function readStoredAuth() {
  return {
    token: localStorage.getItem('movie-app-token'),
    username: localStorage.getItem('movie-app-user'),
  }
}

export function persistAuth(token: string, username: string) {
  localStorage.setItem('movie-app-token', token)
  localStorage.setItem('movie-app-user', username)
}
