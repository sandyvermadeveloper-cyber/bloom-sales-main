import { Suspense } from "react"

import { DeepLinkRedirect } from "@/components/public/deep-link-redirect"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function InvitePage() {
  return (
    <Suspense fallback={<DeepLinkFallback title="Opening Bloom Sales App" />}>
      <DeepLinkRedirect
        deepLinkPath="accept-invite"
        loadingTitle="Opening Bloom Sales App"
        loadingMessage="Please wait while we open your employee invite in the Bloom Sales mobile app."
        invalidTitle="Invalid invite link"
        invalidMessage="This invite link is missing a valid token. Please open the latest invite link sent to you."
      />
    </Suspense>
  )
}

function DeepLinkFallback({ title }: { title: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md text-center shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="mx-auto size-12 rounded-2xl" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mx-auto h-4 w-3/4" />
        </CardContent>
      </Card>
    </main>
  )
}
