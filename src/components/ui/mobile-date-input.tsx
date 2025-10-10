"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface MobileDateInputProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * Mobile-optimized date input using native HTML5 date picker
 * Provides the best user experience on mobile devices by leveraging
 * the device's native date picker interface
 */
export function MobileDateInput({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
}: MobileDateInputProps) {
  // Format date to YYYY-MM-DD for input value
  const dateValue = date ? format(date, "yyyy-MM-dd") : ""

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value) {
      onDateChange?.(undefined)
      return
    }

    // Parse the date from YYYY-MM-DD format
    const newDate = new Date(value)
    // Adjust for timezone to get the correct date
    const adjustedDate = new Date(newDate.getTime() + newDate.getTimezoneOffset() * 60000)
    onDateChange?.(adjustedDate)
  }

  return (
    <div className="relative">
      <input
        type="date"
        value={dateValue}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          // Base styles matching shadcn Button outline variant
          "flex h-11 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background",
          // Focus styles
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Disabled styles
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Text styles
          "font-normal text-left",
          // Placeholder color when no date selected
          !dateValue && "text-muted-foreground",
          // Mobile-specific optimizations
          "touch-manipulation select-none-ui",
          className
        )}
      />
      {/* Calendar icon overlay for visual consistency */}
      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      {/* Add left padding to text to account for icon */}
      <style jsx>{`
        input[type="date"] {
          padding-left: 2.5rem;
        }
        /* Hide native calendar icon on WebKit browsers */
        input[type="date"]::-webkit-calendar-picker-indicator {
          position: absolute;
          right: 0.75rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
