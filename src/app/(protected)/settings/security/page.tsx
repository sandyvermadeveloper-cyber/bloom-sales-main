// "use client"

// import { zodResolver } from "@hookform/resolvers/zod"
// import { useMutation, useQueryClient } from "@tanstack/react-query"
// import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react"
// import { useRouter } from "next/navigation"
// import { useState } from "react"
// import { useForm } from "react-hook-form"

// import { ApiClientError } from "@/api/client"
// import { adminAuthApi } from "@/api/auth.api"
// import { Alert } from "@/components/ui/alert"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import {
//   changePasswordSchema,
//   type ChangePasswordFormValues,
// } from "@/schemas/auth.schemas"
// import { useAuthStore } from "@/stores/auth.store"
// import { applyApiFieldErrors } from "@/utils/form-errors"

// type PasswordFieldName = "currentPassword" | "newPassword" | "confirmPassword"

// const passwordFields: PasswordFieldName[] = ["currentPassword", "newPassword", "confirmPassword"]

// export default function SecuritySettingsPage() {
//   const router = useRouter()
//   const queryClient = useQueryClient()
//   const clearSession = useAuthStore((state) => state.clearSession)
//   const [formMessage, setFormMessage] = useState<string | null>(null)
//   const [visibleFields, setVisibleFields] = useState<Record<PasswordFieldName, boolean>>({
//     currentPassword: false,
//     newPassword: false,
//     confirmPassword: false,
//   })

//   const form = useForm<ChangePasswordFormValues>({
//     resolver: zodResolver(changePasswordSchema),
//     defaultValues: {
//       currentPassword: "",
//       newPassword: "",
//       confirmPassword: "",
//     },
//   })

//   const changePasswordMutation = useMutation({
//     mutationFn: (values: ChangePasswordFormValues) =>
//       adminAuthApi.changePassword({
//         currentPassword: values.currentPassword,
//         newPassword: values.newPassword,
//       }),
//     onSuccess: () => {
//       form.reset()
//       queryClient.clear()
//       clearSession()
//       router.replace("/login")
//     },
//     onError: (error) => {
//       applyApiFieldErrors(error, form, passwordFields)

//       if (error instanceof ApiClientError) {
//         setFormMessage(error.message)
//         return
//       }

//       setFormMessage("Unable to change password. Please try again.")
//     },
//   })

//   const onSubmit = (values: ChangePasswordFormValues) => {
//     setFormMessage(null)
//     changePasswordMutation.mutate(values)
//   }

//   const renderPasswordInput = (name: PasswordFieldName, autoComplete: string) => {
//     const isVisible = visibleFields[name]

//     return (
//       <FormField
//         control={form.control}
//         name={name}
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>
//               {name === "currentPassword"
//                 ? "Current password"
//                 : name === "newPassword"
//                   ? "New password"
//                   : "Confirm new password"}
//             </FormLabel>
//             <FormControl>
//               <div className="relative">
//                 <Input
//                   type={isVisible ? "text" : "password"}
//                   autoComplete={autoComplete}
//                   placeholder={
//                     name === "currentPassword"
//                       ? "Enter current password"
//                       : name === "newPassword"
//                         ? "Enter new password"
//                         : "Confirm new password"
//                   }
//                   className="h-10 pr-10"
//                   disabled={changePasswordMutation.isPending}
//                   {...field}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon-sm"
//                   className="absolute right-1 top-1/2 -translate-y-1/2"
//                   aria-label={isVisible ? "Hide password" : "Show password"}
//                   tabIndex={-1}
//                   onClick={() =>
//                     setVisibleFields((state) => ({
//                       ...state,
//                       [name]: !state[name],
//                     }))
//                   }
//                 >
//                   {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
//                 </Button>
//               </div>
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//     )
//   }

//   return (
//     <section className="page-section">
//       <div className="page-header">
//         <h1 className="text-2xl font-semibold tracking-tight text-foreground">Security settings</h1>
//         <p className="text-sm text-muted-foreground">
//           Manage password, sessions, and account security controls.
//         </p>
//       </div>

//       <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
//         <Card>
//           <CardHeader>
//             <CardTitle>Change password</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Form {...form}>
//               <form className="max-w-xl space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
//                 {formMessage ? <Alert variant="destructive">{formMessage}</Alert> : null}

//                 {renderPasswordInput("currentPassword", "current-password")}
//                 {renderPasswordInput("newPassword", "new-password")}
//                 {renderPasswordInput("confirmPassword", "new-password")}

//                 <Button type="submit" disabled={changePasswordMutation.isPending}>
//                   {changePasswordMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
//                   Change password
//                 </Button>
//               </form>
//             </Form>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <ShieldCheck className="size-4 text-primary" />
//               Session security
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-sm leading-6 text-muted-foreground">
//               Changing your password revokes active sessions and clears the current admin cookies.
//               You will be asked to sign in again after the password is changed.
//             </p>
//           </CardContent>
//         </Card>
//       </div>
//     </section>
//   )
// }



"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck, 
  Key, 
  LogOut, 
  AlertCircle,
  CheckCircle2,
  Fingerprint
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { ApiClientError } from "@/api/client"
import { adminAuthApi } from "@/api/auth.api"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/schemas/auth.schemas"
import { useAuthStore } from "@/stores/auth.store"
import { applyApiFieldErrors } from "@/utils/form-errors"

type PasswordFieldName = "currentPassword" | "newPassword" | "confirmPassword"

const passwordFields: PasswordFieldName[] = ["currentPassword", "newPassword", "confirmPassword"]

export default function SecuritySettingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((state) => state.clearSession)
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [visibleFields, setVisibleFields] = useState<Record<PasswordFieldName, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      adminAuthApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      setFormSuccess("Password changed successfully! Redirecting to login...")
      setTimeout(() => {
        form.reset()
        queryClient.clear()
        clearSession()
        router.replace("/login")
      }, 2000)
    },
    onError: (error) => {
      applyApiFieldErrors(error, form, passwordFields)

      if (error instanceof ApiClientError) {
        setFormMessage(error.message)
        return
      }

      setFormMessage("Unable to change password. Please try again.")
    },
  })

  const onSubmit = (values: ChangePasswordFormValues) => {
    setFormMessage(null)
    setFormSuccess(null)
    changePasswordMutation.mutate(values)
  }

  const renderPasswordInput = (name: PasswordFieldName, autoComplete: string) => {
    const isVisible = visibleFields[name]
    const labels = {
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm new password"
    }
    const placeholders = {
      currentPassword: "Enter your current password",
      newPassword: "Enter new password (min. 8 characters)",
      confirmPassword: "Re-enter your new password"
    }

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">{labels[name]}</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type={isVisible ? "text" : "password"}
                  autoComplete={autoComplete}
                  placeholder={placeholders[name]}
                  className="h-11 pr-10 bg-background border-border/60 focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled={changePasswordMutation.isPending}
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                  aria-label={isVisible ? "Hide password" : "Show password"}
                  tabIndex={-1}
                  onClick={() =>
                    setVisibleFields((state) => ({
                      ...state,
                      [name]: !state[name],
                    }))
                  }
                >
                  {isVisible ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  const passwordStrength = form.watch("newPassword")
  const getPasswordStrength = () => {
    if (!passwordStrength) return null
    if (passwordStrength.length < 6) return { label: "Weak", color: "text-red-500", bg: "bg-red-500/10" }
    if (passwordStrength.length < 8) return { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-500/10" }
    return { label: "Strong", color: "text-green-500", bg: "bg-green-500/10" }
  }
  const strength = getPasswordStrength()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Security Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your password and account security preferences
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1">
          <ShieldCheck className="size-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Protected</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Change Password Card - Main */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Key className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Change Password</CardTitle>
                  <CardDescription className="text-sm">
                    Update your password to keep your account secure
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                  {/* Success Message */}
                  {formSuccess && (
                    <Alert className="border-success/20 bg-success/5 text-success">
                      <CheckCircle2 className="size-4" />
                      <span className="text-sm">{formSuccess}</span>
                    </Alert>
                  )}

                  {/* Error Message */}
                  {formMessage && (
                    <Alert variant="destructive" className="border-destructive/20">
                      <AlertCircle className="size-4" />
                      <span className="text-sm">{formMessage}</span>
                    </Alert>
                  )}

                  {/* Password Fields */}
                  <div className="space-y-4">
                    {renderPasswordInput("currentPassword", "current-password")}
                    
                    <div className="relative">
                      {renderPasswordInput("newPassword", "new-password")}
                      
                      {/* Password Strength Indicator */}
                      {strength && passwordStrength && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                strength.label === "Weak" ? "w-1/3 bg-red-500" :
                                strength.label === "Medium" ? "w-2/3 bg-yellow-500" : "w-full bg-green-500"
                              }`}
                            />
                          </div>
                          <span className={`text-xs font-medium ${strength.color}`}>
                            {strength.label} password
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {renderPasswordInput("confirmPassword", "new-password")}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={changePasswordMutation.isPending}
                      className="gap-2 h-11 px-6 bg-primary hover:bg-primary/90 transition-all"
                    >
                      {changePasswordMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="size-4" />
                      )}
                      {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Security Info Cards - Sidebar */}
        <div className="space-y-4">
          {/* Session Security Card */}
          <Card className="border-border/60 shadow-sm overflow-hidden p-0">
            <div className="h-1 bg-info/20" />
            <CardHeader className="">
              <div className="flex items-center gap-2">
                <LogOut className="size-4 text-info" />
                <CardTitle className="text-sm font-semibold">Session Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Changing your password will immediately revoke all active sessions across all devices. 
                You will be redirected to login page to sign in with your new password.
              </p>
            </CardContent>
          </Card>

          {/* Password Requirements Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Fingerprint className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">Password Requirements</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-1 rounded-full bg-green-500" />
                <span>Minimum 8 characters</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-1 rounded-full bg-green-500" />
                <span>Mix of letters and numbers</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-1 rounded-full bg-green-500" />
                <span>Special characters allowed</span>
              </div>
            </CardContent>
          </Card>

          {/* Security Tip Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Security Tip</p>
                  <p className="text-xs text-muted-foreground">
                    Never share your password with anyone. Use a strong, unique password that you don&apos;t use elsewhere.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
