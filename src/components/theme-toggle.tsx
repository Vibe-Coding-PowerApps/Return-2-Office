"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"

  return (
    <button 
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex items-center justify-center rounded-full bg-muted p-0.5 transition-colors hover:bg-muted/80 border border-input"
      aria-label="Toggle theme"
      style={{ width: "56px", height: "28px" }}
    >
      {/* Animated sliding background */}
      <div 
        className="absolute w-6 h-6 rounded-full bg-background transition-transform duration-300"
        style={{ 
          transform: isDark ? "translateX(12px)" : "translateX(-12px)",
          top: "50%",
          left: "50%",
          marginTop: "-12px",
          marginLeft: "-12px"
        }}
      />
      
      {/* Light mode icon */}
      <div className="relative flex-1 flex items-center justify-center z-10">
        <Sun className="h-4 w-4 text-foreground" />
      </div>
      
      {/* Dark mode icon */}
      <div className="relative flex-1 flex items-center justify-center z-10">
        <Moon className="h-4 w-4 text-foreground" />
      </div>
    </button>
  )
}
