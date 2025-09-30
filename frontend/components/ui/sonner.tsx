"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      position="top-center"
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
            "--success-bg": "var(--green-light)",
            "--success-text": "var(--green-dark)",
            "--success-border": "var(--green-dark)",
            "--error-bg": "var(--red-light)",
            "--error-text": "var(--red-dark)",
            "--error-border": "var(--red-dark)",
          } as React.CSSProperties,
      }}
      {...props}
    />
  )
}

export { Toaster }
