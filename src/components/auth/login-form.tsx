"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schemas"
import { useAuthStore } from "@/stores/auth.store"
import { getSafeRedirectPath, withRedirectParam } from "@/utils/auth-redirect"

export function LoginForm() {
  const router = useRouter()
  const setLoginChallenge = useAuthStore((state) => state.setLoginChallenge)
  const [showPassword, setShowPassword] = useState(false)
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  })

  const loginMutation = useMutation({
    mutationFn: adminAuthApi.login,
    onSuccess: (response) => {
      setLoginChallenge(response.data)
      const redirectPath = getSafeRedirectPath(new URLSearchParams(window.location.search).get("redirect"))
      router.replace(withRedirectParam(authRoutes.loginVerify, redirectPath))
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        for (const fieldError of error.fieldErrors ?? []) {
          if (fieldError.field === "identifier" || fieldError.field === "password") {
            form.setError(fieldError.field, { message: fieldError.message })
          }
        }
        setFormMessage(error.message)
        return
      }
      setFormMessage("Something went wrong. Please try again.")
    },
  })

  const onSubmit = (values: LoginFormValues) => {
    setFormMessage(null)
    loginMutation.mutate(values)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your admin account to continue.
        </p>
      </div>

      <Form {...form}>
        <form
          method="POST"
          className="space-y-5"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          {formMessage ? (
            <Alert variant="destructive" className="text-sm">
              {formMessage}
            </Alert>
          ) : null}

          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Email or phone
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="you@company.com"
                    autoComplete="username"
                    disabled={loginMutation.isPending}
                    className="h-11 bg-background px-4 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-2">
                  <FormLabel className="text-sm font-medium text-foreground">
                    Password
                  </FormLabel>
                  <Button
                    asChild
                    variant="link"
                    className="h-auto p-0 text-xs font-normal text-primary hover:text-primary/80"
                  >
                    <Link href={authRoutes.forgotPassword}>Forgot password?</Link>
                  </Button>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-11 bg-background px-4 pr-11 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0"
                      disabled={loginMutation.isPending}
                      {...field}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground/60 transition-colors hover:text-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
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
            disabled={loginMutation.isPending}
            className="w-full h-11 gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60"
          >
            {loginMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {loginMutation.isPending ? "Signing in…" : "Continue"}
          </Button>
        </form>
      </Form>

      {/* Divider hint */}
      <p className="text-center text-xs text-muted-foreground/60">
        Protected by multi-factor authentication
      </p>
    </div>
  )
}
