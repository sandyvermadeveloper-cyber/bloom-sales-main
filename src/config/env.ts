const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "")

export const env = {
  apiUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL ?? ""),
}
