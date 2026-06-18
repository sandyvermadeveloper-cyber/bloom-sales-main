"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"

import { ApiClientError } from "@/api/client"
import { adminAuthApi } from "@/api/auth.api"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authRoutes } from "@/constants/auth-routes"
import { verifyOtpSchema, type VerifyOtpFormValues } from "@/schemas/auth.schemas"
import { useAuthStore } from "@/stores/auth.store"
import { getSafeRedirectPath, withRedirectParam } from "@/utils/auth-redirect"

export function VerifyOtpForm() {
  const router = useRouter()
  const challenge = useAuthStore((state) => state.loginChallenge)
  const setLoginChallenge = useAuthStore((state) => state.setLoginChallenge)
  const setEmployee = useAuthStore((state) => state.setEmployee)
  const [formMessage, setFormMessage] = useState<{ text: string; type: "info" | "destructive" } | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const isCompletingLoginRef = useRef(false)
  const getRedirectPath = useCallback(
    () => getSafeRedirectPath(new URLSearchParams(window.location.search).get("redirect")),
    []
  )

  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  })

  useEffect(() => {
    if (!challenge && !isCompletingLoginRef.current) {
      router.replace(withRedirectParam(authRoutes.login, getRedirectPath()))
    }
  }, [challenge, getRedirectPath, router])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const cooldown = useMemo(() => {
    if (!challenge) return 0
    return Math.max(0, Math.ceil((new Date(challenge.resendAvailableAt).getTime() - now) / 1000))
  }, [challenge, now])

  const expiresIn = useMemo(() => {
    if (!challenge) return 0
    return Math.max(0, Math.ceil((new Date(challenge.expiresAt).getTime() - now) / 1000))
  }, [challenge, now])

  const verifyMutation = useMutation({
    mutationFn: async (values: VerifyOtpFormValues) => {
      if (!challenge) throw new Error("Missing login challenge")
      return adminAuthApi.verifyOtp({ challengeId: challenge.challengeId, otp: values.otp })
    },
    onSuccess: (response) => {
      isCompletingLoginRef.current = true
      setEmployee(response.data.employee)
      setLoginChallenge(null)
      window.location.replace(getRedirectPath())
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        for (const fieldError of error.fieldErrors ?? []) {
          if (fieldError.field === "otp") {
            form.setError("otp", { message: fieldError.message })
          }
        }
        setFormMessage({ text: error.message, type: "destructive" })
        return
      }
      setFormMessage({ text: "Something went wrong. Please try again.", type: "destructive" })
    },
  })

  const resendMutation = useMutation({
    mutationFn: async () => {
      if (!challenge) throw new Error("Missing login challenge")
      return adminAuthApi.resendOtp(challenge.challengeId)
    },
    onSuccess: (response) => {
      setLoginChallenge(response.data)
      form.reset({ otp: "" })
      setFormMessage({ text: response.message, type: "info" })
    },
    onError: (error) => {
      setFormMessage({
        text: error instanceof ApiClientError ? error.message : "Something went wrong. Please try again.",
        type: "destructive",
      })
    },
  })

  const onSubmit = (values: VerifyOtpFormValues) => {
    setFormMessage(null)
    verifyMutation.mutate(values)
  }

  if (!challenge) return null

  const minutesLeft = Math.ceil(expiresIn / 60)

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="page-header">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Enter verification code
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a code to <span className="font-medium text-foreground">{challenge.maskedDestination}</span>.
          </p>
        </div>

        {formMessage ? (
          <Alert variant={formMessage.type}>{formMessage.text}</Alert>
        ) : null}

        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification code</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="h-11 text-center text-lg font-semibold tracking-[0.3em]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {!form.formState.errors.otp && (
                <p className="text-xs text-muted-foreground">
                  Code expires in {minutesLeft} minute{minutesLeft === 1 ? "" : "s"}.
                </p>
              )}
            </FormItem>
          )}
        />

        <Button size="xl" type="submit" disabled={verifyMutation.isPending}>
          {verifyMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Verify and sign in
        </Button>

        <div className="flex items-center justify-between gap-4 text-sm">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 font-medium"
            disabled={cooldown > 0 || resendMutation.isPending}
            onClick={() => resendMutation.mutate()}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              setLoginChallenge(null)
              router.replace(withRedirectParam(authRoutes.login, getRedirectPath()))
            }}
          >
            Back to sign in
          </Button>
        </div>
      </form>
    </Form>
  )
}
