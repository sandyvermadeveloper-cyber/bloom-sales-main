"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import Link from "next/link"
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
import { authRoutes } from "@/constants/auth-routes"
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/schemas/auth.schemas"
import { getAuthErrorMessage } from "@/utils/api-error"
import { applyApiFieldErrors } from "@/utils/form-errors"

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: "",
    },
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: adminAuthApi.forgotPassword,
    onSuccess: (response) => {
      form.reset({ identifier: "" })
      form.clearErrors()
      return response
    },
    onError: (error) => {
      applyApiFieldErrors(error, form, ["identifier"])
    },
  })

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPasswordMutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form method="POST" className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reset password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your registered admin email address and we will send reset instructions.
          </p>
        </div>

        {forgotPasswordMutation.isSuccess ? (
          <Alert variant="success">{forgotPasswordMutation.data.message}</Alert>
        ) : null}

        {forgotPasswordMutation.isError ? (
          <Alert variant="destructive">
            {getAuthErrorMessage(forgotPasswordMutation.error)}
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  disabled={forgotPasswordMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button size="xl" type="submit" disabled={forgotPasswordMutation.isPending}>
          {forgotPasswordMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Send reset link
        </Button>

        <Button asChild variant="link" className="h-auto w-full p-0">
          <Link href={authRoutes.login}>Back to sign in</Link>
        </Button>
      </form>
    </Form>
  )
}
