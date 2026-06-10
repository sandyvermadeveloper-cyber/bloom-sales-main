"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

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
import { adminAuthApi } from "@/api/auth.api"
import {
  authRoutes,
  resetPasswordRedirectDelayMs,
} from "@/constants/auth-routes"
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/schemas/auth.schemas"
import { getAuthErrorMessage } from "@/utils/api-error"
import { applyApiFieldErrors } from "@/utils/form-errors"

type ResetPasswordFormProps = {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSucceeded, setResetSucceeded] = useState(false)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const resetTokenQuery = useQuery({
    queryKey: ["admin-auth", "reset-token", token],
    queryFn: () => adminAuthApi.verifyResetToken({ token }),
    enabled: Boolean(token),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      adminAuthApi.resetPassword({
        token,
        password: values.password,
      }),
    onSuccess: () => {
      form.reset()
      setResetSucceeded(true)
    },
    onError: (error) => {
      applyApiFieldErrors(error, form, ["password"])
    },
  })

  useEffect(() => {
    if (!resetSucceeded) return

    const timer = window.setTimeout(() => {
      router.replace(authRoutes.login)
    }, resetPasswordRedirectDelayMs)

    return () => window.clearTimeout(timer)
  }, [resetSucceeded, router])

  const onSubmit = (values: ResetPasswordFormValues) => {
    resetPasswordMutation.mutate(values)
  }

  if (!token) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Invalid reset link</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Request a new password reset link to continue.
          </p>
        </div>
        <Alert variant="destructive">Your reset link is missing or invalid.</Alert>
        <Button asChild size="xl">
          <Link href={authRoutes.forgotPassword}>Request new link</Link>
        </Button>
      </div>
    )
  }

  if (resetTokenQuery.isLoading) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Checking reset link</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please wait while we verify your password reset request.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Validating reset link...
        </div>
      </div>
    )
  }

  if (resetTokenQuery.isError) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reset link expired</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Request a new password reset link to protect your account.
          </p>
        </div>
        <Alert variant="destructive">{getAuthErrorMessage(resetTokenQuery.error)}</Alert>
        <Button asChild size="xl">
          <Link href={authRoutes.forgotPassword}>Request new link</Link>
        </Button>
        <Button asChild variant="link" className="h-auto w-full p-0">
          <Link href={authRoutes.login}>Back to sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form method="POST" className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a new password for your admin account.
          </p>
        </div>

        {resetSucceeded ? (
          <Alert variant="success">
            Password reset successfully. Redirecting you to sign in.
          </Alert>
        ) : null}

        {resetPasswordMutation.isError ? (
          <Alert variant="destructive">
            {getAuthErrorMessage(resetPasswordMutation.error)}
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="pr-10"
                    disabled={resetPasswordMutation.isPending || resetSucceeded}
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={resetPasswordMutation.isPending || resetSucceeded}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="pr-10"
                    disabled={resetPasswordMutation.isPending || resetSucceeded}
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    disabled={resetPasswordMutation.isPending || resetSucceeded}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          size="xl"
          type="submit"
          disabled={resetPasswordMutation.isPending || resetSucceeded}
        >
          {resetPasswordMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Reset password
        </Button>
      </form>
    </Form>
  )
}
