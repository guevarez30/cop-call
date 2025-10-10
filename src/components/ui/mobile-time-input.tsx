"use client"

import * as React from "react"
import { format } from "date-fns"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"

interface MobileTimeInputProps {
  time?: Date
  onTimeChange?: (time: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
}

/**
 * Mobile-optimized time input using native HTML5 time picker
 * Provides the best user experience on mobile devices
 */
export function MobileTimeInput({
  time,
  onTimeChange,
  placeholder = "Pick a time",
  disabled = false,
  className,
  required = false,
}: MobileTimeInputProps) {
  // Format time for input value
  const timeValue = time ? format(time, "HH:mm") : ""

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value) {
      onTimeChange?.(undefined)
      return
    }

    // Parse the time and create a new Date object
    const [hours, minutes] = value.split(":").map(Number)
    const newTime = new Date()
    newTime.setHours(hours)
    newTime.setMinutes(minutes)
    newTime.setSeconds(0)
    newTime.setMilliseconds(0)

    onTimeChange?.(newTime)
  }

  const inputClassName = cn(
    // Base styles matching shadcn Button outline variant
    "flex h-11 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background",
    // Focus styles
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Disabled styles
    "disabled:cursor-not-allowed disabled:opacity-50",
    // Text styles
    "font-normal text-left",
    // Mobile-specific optimizations
    "touch-manipulation select-none-ui",
    // Placeholder color
    !timeValue && "text-muted-foreground"
  )

  return (
    <div className={cn("relative", className)}>
      <input
        id="mobile-time-input"
        type="time"
        value={timeValue}
        onChange={handleTimeChange}
        disabled={disabled}
        required={required}
        className={inputClassName}
        style={{ paddingLeft: '2.5rem' }}
      />
      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

      {/* Shared styles for input */}
      <style jsx>{`
        /* Position native time picker icon on WebKit browsers */
        input[type="time"]::-webkit-calendar-picker-indicator {
          position: absolute;
          right: 0.75rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
