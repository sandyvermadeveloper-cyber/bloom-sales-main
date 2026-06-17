"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Smartphone } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const fallbackDelayMs = 1200

type DeepLinkRedirectProps = {
  deepLinkPath: "accept-invite" | "reset-password"
  invalidMessage: string
  invalidTitle: string
  loadingMessage: string
  loadingTitle: string
}

export function DeepLinkRedirect({
  deepLinkPath,
  invalidMessage,
  invalidTitle,
  loadingMessage,
  loadingTitle,
}: DeepLinkRedirectProps) {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")?.trim() ?? ""
  const [showFallback, setShowFallback] = useState(false)

  const deepLink = useMemo(
    () => (token ? `bloomsales://auth/${deepLinkPath}?token=${encodeURIComponent(token)}` : ""),
    [deepLinkPath, token]
  )

  useEffect(() => {
    if (!deepLink) return

    window.location.href = deepLink

    const timer = window.setTimeout(() => {
      setShowFallback(true)
    }, fallbackDelayMs)

    return () => window.clearTimeout(timer)
  }, [deepLink])

  const openApp = () => {
    if (!deepLink) return
    window.location.href = deepLink
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md text-center shadow-sm">
        <CardHeader className="space-y-3">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {deepLink ? <Loader2 className="size-5 animate-spin" /> : <Smartphone className="size-5" />}
          </span>
          <CardTitle>{deepLink ? loadingTitle : invalidTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {deepLink ? (
            <>
              <p className="text-sm text-muted-foreground">{loadingMessage}</p>
              {showFallback ? (
                <Button type="button" size="xl" className="w-full" onClick={openApp}>
                  Open Bloom Sales App
                </Button>
              ) : null}
            </>
          ) : (
            <Alert variant="destructive">{invalidMessage}</Alert>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
