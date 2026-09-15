import axios, { isAxiosError } from "axios"
import { notificarSessaoExpirada } from "@/lib/auth-events"
import { getToken, setToken } from "@/lib/token-store"

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// So trata como "sessao expirada" quando a propria requisicao ja tinha um
// token anexado -- assim um 401 de credenciais invalidas no /auth/login
// (que nunca leva Authorization) continua caindo no catch normal do form.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error) && error.response?.status === 401 && error.config?.headers?.Authorization) {
      setToken(null)
      notificarSessaoExpirada()
    }
    return Promise.reject(error)
  }
)
