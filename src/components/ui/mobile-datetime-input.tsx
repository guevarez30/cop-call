"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface MobileDateTimeInputProps {
  date?: Date
  onDateTimeChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
}

/**
 * Mobile-optimized datetime input using native HTML5 date and time pickers
 * Provides the best user experience on mobile devices
 */
export function MobileDateTimeInput({
  date,
  onDateTimeChange,
  placeholder = "Pick date and time",
  disabled = false,
  className,
  required = false,
}: MobileDateTimeInputProps) {
  // Format date and time for input values
  const dateValue = date ? format(date, "yyyy-MM-dd") : ""
  const timeValue = date ? format(date, "HH:mm") : "12:00"

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value) {
      onDateTimeChange?.(undefined)
      return
    }

    // Parse the date and combine with current time
    const newDate = new Date(value)
    const adjustedDate = new Date(newDate.getTime() + newDate.getTimezoneOffset() * 60000)

    // Set the time from the existing date or default
    const [hours, minutes] = timeValue.split(":").map(Number)
    adjustedDate.setHours(hours)
    adjustedDate.setMinutes(minutes)

    onDateTimeChange?.(adjustedDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!dateValue) {
      // If no date is selected, set to today with the selected time
      const today = new Date()
      const [hours, minutes] = value.split(":").map(Number)
      today.setHours(hours)
      today.setMinutes(minutes)
      onDateTimeChange?.(today)
      return
    }

    // Update time on existing date
    const currentDate = new Date(dateValue)
    const adjustedDate = new Date(currentDate.getTime() + currentDate.getTimezoneOffset() * 60000)
    const [hours, minutes] = value.split(":").map(Number)
    adjustedDate.setHours(hours)
    adjustedDate.setMinutes(minutes)

    onDateTimeChange?.(adjustedDate)
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
    "touch-manipulation select-none-ui"
  )

  return (
    <div className={cn("space-y-3", className)}>
      {/* Date Input */}
      <div className="space-y-1.5">
        <Label htmlFor="datetime-date" className="text-xs font-medium text-muted-foreground">
          Date
        </Label>
        <div className="relative">
          <input
            id="datetime-date"
            type="date"
            value={dateValue}
            onChange={handleDateChange}
            disabled={disabled}
            required={required}
            className={cn(
              inputClassName,
              !dateValue && "text-muted-foreground"
            )}
          />
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Time Input */}
      <div className="space-y-1.5">
        <Label htmlFor="datetime-time" className="text-xs font-medium text-muted-foreground">
          Time
        </Label>
        <div className="relative">
          <input
            id="datetime-time"
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            disabled={disabled}
            required={required}
            className={inputClassName}
          />
        </div>
      </div>

      {/* Display selected datetime */}
      {date && (
        <div className="text-sm text-muted-foreground text-center pt-1">
          {format(date, "PPP 'at' p")}
        </div>
      )}

      {/* Shared styles for inputs */}
      <style jsx>{`
        input[type="date"] {
          padding-left: 2.5rem;
        }
        /* Position native calendar icon on WebKit browsers */
        input[type="date"]::-webkit-calendar-picker-indicator {
          position: absolute;
          right: 0.75rem;
          cursor: pointer;
        }
        input[type="time"]::-webkit-calendar-picker-indicator {
          position: absolute;
          right: 0.75rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
