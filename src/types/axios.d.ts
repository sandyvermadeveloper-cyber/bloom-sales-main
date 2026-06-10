import "axios"

declare module "axios" {
  export interface AxiosRequestConfig {
    _retryAuth?: boolean
    skipAuthRefresh?: boolean
  }
}
