"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun, Languages, Link, Info } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  return (
    <header className="border-b border-blue-500/10 bg-transparent py-2 px-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-100">
          <Languages className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-100">
          <Link className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-100"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-100">
          <Info className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
