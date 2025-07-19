import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppWrapper } from "@/components/app-wrapper";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Beams - Cross Platform File Sharing App",
  description: "Share your files securely and easily",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppWrapper>{children}</AppWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}