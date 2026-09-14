import { isAxiosError } from "axios"

// Espelha com.kiograco.enderecocerto.exception.ApiErrorResponse
type ApiErrorBody = {
  message?: string
}

export function getApiErrorMessage(error: unknown, fallback = "Algo deu errado. Tente novamente."): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message || fallback
  }
  return fallback
}
