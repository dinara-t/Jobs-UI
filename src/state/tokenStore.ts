const key = "jobs.jwt";

export function getToken() {
  return localStorage.getItem(key);
}

export function setToken(token: string) {
  localStorage.setItem(key, token);
}

export function clearToken() {
  localStorage.removeItem(key);
}
