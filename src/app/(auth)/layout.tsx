// "use client"

// import { Loader2, LockKeyhole, ShieldCheck, Zap } from "lucide-react"
// import { useRouter } from "next/navigation"
// import { useEffect, type ReactNode } from "react"

// import { authRoutes } from "@/constants/auth-routes"
// import { useAuthStore } from "@/stores/auth.store"

// const features = [
//   {
//     icon: ShieldCheck,
//     title: "Secure by default",
//     description: "Every session is verified with multi-factor authentication.",
//   },
//   {
//     icon: LockKeyhole,
//     title: "Short-lived tokens",
//     description: "Access tokens expire automatically to protect your account.",
//   },
//   {
//     icon: Zap,
//     title: "Fast & reliable",
//     description: "Instant OTP delivery with automatic resend support.",
//   },
// ]

// export default function AuthLayout({ children }: { children: ReactNode }) {
//   const router = useRouter()
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
//   const isLoading = useAuthStore((state) => state.isLoading)

//   useEffect(() => {
//     if (!isLoading && isAuthenticated) {
//       router.replace(authRoutes.home)
//     }
//   }, [isAuthenticated, isLoading, router])

//   if (isLoading) {
//     return (
//       <main className="flex min-h-screen items-center justify-center bg-background">
//         <div className="flex flex-col items-center gap-3 text-center">
//           <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
//             B
//           </div>
//           <div className="flex items-center gap-2 text-sm text-muted-foreground">
//             <Loader2 className="size-4 animate-spin" />
//             Loading...
//           </div>
//         </div>
//       </main>
//     )
//   }

//   return (
//     <main className="flex min-h-screen bg-background">
//       {/* Left panel — decorative, desktop only */}
//       <section className="relative hidden flex-1 overflow-hidden border-r border-border bg-muted/40 lg:flex lg:flex-col">
//         {/* Subtle grid background */}
//         <div
//           className="pointer-events-none absolute inset-0 opacity-[0.03]"
//           style={{
//             backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
//             backgroundSize: "32px 32px",
//           }}
//         />

//         <div className="relative flex flex-1 flex-col px-10 py-8">
//           {/* Logo */}
//           <div className="flex items-center gap-3">
//             <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
//               B
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-foreground">Bloom Sales</p>
//               <p className="text-xs text-muted-foreground">Admin Panel</p>
//             </div>
//           </div>

//           {/* Headline */}
//           <div className="mt-auto max-w-sm">
//             <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
//               Manage sales operations with a secure admin workspace.
//             </h1>
//             <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
//               Access is protected with password verification, one-time code confirmation, and short-lived token sessions.
//             </p>

//             {/* Feature list */}
//             <ul className="mt-8 space-y-4">
//               {features.map(({ icon: Icon, title, description }) => (
//                 <li key={title} className="flex items-start gap-3">
//                   <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
//                     <Icon className="size-3.5" />
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-foreground">{title}</p>
//                     <p className="text-xs text-muted-foreground">{description}</p>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Footer */}
//           <p className="mt-8 text-xs text-muted-foreground/60">
//             &copy; {new Date().getFullYear()} Bloom Sales. All rights reserved.
//           </p>
//         </div>
//       </section>

//       {/* Right panel — form */}
//       <section className="flex flex-1 flex-col items-center justify-center px-5 py-12">
//         {/* Mobile logo */}
//         <div className="mb-8 flex items-center gap-3 lg:hidden">
//           <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
//             B
//           </div>
//           <div>
//             <p className="text-sm font-semibold text-foreground">Bloom Sales</p>
//             <p className="text-xs text-muted-foreground">Admin Panel</p>
//           </div>
//         </div>

//         <div className="w-full max-w-[400px]">{children}</div>
//       </section>
//     </main>
//   )
// }











"use client"

import { Loader2, LockKeyhole, ShieldCheck, Zap, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

import { authRoutes } from "@/constants/auth-routes"
import { useAuthStore } from "@/stores/auth.store"
import Image from "next/image"

const features = [
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description: "Every session is verified with multi-factor authentication.",
    iconGradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: LockKeyhole,
    title: "Short-lived tokens",
    description: "Access tokens expire automatically to protect your account.",
    iconGradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Zap,
    title: "Fast & reliable",
    description: "Instant OTP delivery with automatic resend support.",
    iconGradient: "from-amber-500 to-orange-500",
  },
]

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(authRoutes.home)
    }
  }, [isAuthenticated, isLoading, router])

  // if (isLoading) {
  //   return (
  //     <main className="fixed inset-0 flex items-center justify-center bg-background">
  //       <div className="flex flex-col items-center gap-4 text-center">
  //         <div className="relative">
  //           <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
  //           <div className="relative flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground shadow-lg">
  //             B
  //           </div>
  //         </div>
  //         <div className="flex items-center gap-2 text-sm text-muted-foreground">
  //           <Loader2 className="size-4 animate-spin" />
  //           <span>Loading secure workspace...</span>
  //         </div>
  //       </div>
  //     </main>
  //   )
  // }
  if (isLoading) {
  return (
    <main className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/10">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Animated logo container */}
        <div className="relative">
          {/* Outer ring animation */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-xl animate-pulse" />
          
          {/* Multiple ping rings */}
          <div className="absolute -inset-2 rounded-2xl bg-primary/10 animate-ping" style={{ animationDuration: "1.5s" }} />
          <div className="absolute -inset-4 rounded-2xl bg-primary/5 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
          <div className="absolute -inset-6 rounded-2xl bg-primary/0 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "1s" }} />
          
          {/* Main logo */}
          <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl">
            <span className="text-2xl font-bold text-primary-foreground">B</span>
          </div>
        </div>

        {/* Loading text with spinner */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-base text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span className="font-medium">Loading secure workspace...</span>
          </div>
          
          {/* Subtle loading dots animation */}
          <div className="flex items-center justify-center gap-1">
            <div className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>

        {/* Optional: Brand text */}
        <p className="absolute bottom-8 left-0 right-0 text-center text-xs text-muted-foreground/50">
          Bloom Sales Platform
        </p>
      </div>
    </main>
  )
}

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-background via-background to-muted/10">
      <div className="flex h-full w-full">
        {/* Left panel — decorative, desktop only */}
        <section className="relative hidden h-full flex-1 overflow-hidden border-r border-border/50 bg-gradient-to-br from-muted/30 via-muted/20 to-background lg:block">
                {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
          {/* Animated gradient orbs */}
          <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-gradient-to-br from-primary/5 via-primary/10 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-info/5 via-primary/5 to-transparent blur-3xl" />
          
          {/* Subtle grid background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative flex h-full flex-col overflow-y-auto px-8 py-8 lg:px-10 ">
            {/* Logo */}
            {/* <div className="flex flex-shrink-0 items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-primary/50 blur-md opacity-50 transition-opacity group-hover:opacity-70" />
                <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground shadow-md lg:size-11 lg:text-base">
                  B
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-foreground lg:text-base">Bloom Sales</p>
                <p className="text-xs text-muted-foreground/70">Secure Admin Portal</p>
              </div>
            </div> */}
            <div className="relative h-22 w-42 bg-[#070114] rounded-2xl">
    <Image
      src="/logo.png"
      alt="Bloom Sales"
      fill
      className="object-contain"
      priority
    />
  </div>

            {/* Content - centered vertically */}
            <div className="flex flex-1 flex-col justify-center py-8">
              <div className="max-w-md">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-3 py-1 backdrop-blur-sm">
                  <Sparkles className="size-3 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Enterprise Security</span>
                </div>
                
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground lg:text-3xl">
                  Manage sales with
                  <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent"> enterprise-grade</span>
                  security
                </h1>
                
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground lg:mt-4 lg:text-base">
                  Access your admin workspace with multi-factor authentication, 
                  short-lived tokens, and complete audit logging.
                </p>

                {/* Feature list */}
                <ul className="mt-6 space-y-4 lg:mt-8 lg:space-y-5">
                  {features.map(({ icon: Icon, title, description, iconGradient }) => (
                    <li key={title} className="group">
                      <div className="flex items-start gap-3 lg:gap-4">
                        <div className={`flex-shrink-0 rounded-lg bg-gradient-to-br ${iconGradient} p-1.5 shadow-sm lg:p-2`}>
                          <Icon className="size-3.5 text-white lg:size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{title}</p>
                          <p className="text-xs text-muted-foreground/80 lg:text-sm">{description}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="relative flex-shrink-0 pt-6">
              <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
              <p className="text-xs text-muted-foreground/50">
                &copy; {new Date().getFullYear()} Bloom Sales. All rights reserved.
              </p>
            </div>
          </div>
        </section>

        {/* Right panel — form */}
        <section className="relative flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-background/50 lg:w-1/2">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 right-0 size-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 size-96 rounded-full bg-info/5 blur-3xl" />
          </div>

          {/* Mobile logo */}
          {/* <div className="mb-10 flex flex-shrink-0 items-center gap-4 lg:hidden">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-xl font-bold text-primary-foreground shadow-lg">
              B
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">Bloom Sales</p>
              <p className="text-sm text-muted-foreground">Secure Admin Portal</p>
            </div>
          </div> */}
          <div className="mb-5 flex flex-shrink-0  items-center gap-4 lg:hidden">
          <div className="relative h-22 w-52 bg-[#070114] rounded-2xl">
    <Image
      src="/logo.png"
      alt="Bloom Sales"
      fill
      className="object-contain"
      priority
    />
  </div>
  </div>

          {/* Form container */}
          <div className="w-full max-w-md px-4">
            <div className="relative rounded-xl border border-border/50 bg-card/50 p-6 shadow-lg backdrop-blur-sm lg:rounded-2xl lg:p-8">
              {/* Gradient border top */}
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <div className="relative">
                {children}
              </div>
            </div>
          </div>
          
          {/* Extra space at bottom for scroll on mobile if needed */}
          <div className="h-4 flex-shrink-0 lg:hidden" />
        </section>
      </div>
    </div>
  )
}