"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface MobileDateRangeInputProps {
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * Mobile-optimized date range input using native HTML5 date pickers
 * Provides two separate date inputs for from/to dates with validation
 */
export function MobileDateRangeInput({
  dateRange,
  onDateRangeChange,
  placeholder = "Select date range",
  disabled = false,
  className,
}: MobileDateRangeInputProps) {
  // Format dates to YYYY-MM-DD for input values
  const fromValue = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""
  const toValue = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value) {
      onDateRangeChange?.(undefined)
      return
    }

    const newDate = new Date(value)
    const adjustedDate = new Date(newDate.getTime() + newDate.getTimezoneOffset() * 60000)

    onDateRangeChange?.({
      from: adjustedDate,
      to: dateRange?.to,
    })
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value) {
      // Keep the 'from' date but clear 'to'
      onDateRangeChange?.({
        from: dateRange?.from,
        to: undefined,
      })
      return
    }

    const newDate = new Date(value)
    const adjustedDate = new Date(newDate.getTime() + newDate.getTimezoneOffset() * 60000)

    onDateRangeChange?.({
      from: dateRange?.from,
      to: adjustedDate,
    })
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
      {/* From Date */}
      <div className="space-y-1.5">
        <Label htmlFor="from-date" className="text-xs font-medium text-muted-foreground">
          From
        </Label>
        <div className="relative">
          <input
            id="from-date"
            type="date"
            value={fromValue}
            onChange={handleFromChange}
            disabled={disabled}
            max={toValue || undefined}
            className={cn(
              inputClassName,
              !fromValue && "text-muted-foreground"
            )}
          />
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* To Date */}
      <div className="space-y-1.5">
        <Label htmlFor="to-date" className="text-xs font-medium text-muted-foreground">
          To
        </Label>
        <div className="relative">
          <input
            id="to-date"
            type="date"
            value={toValue}
            onChange={handleToChange}
            disabled={disabled}
            min={fromValue || undefined}
            className={cn(
              inputClassName,
              !toValue && "text-muted-foreground"
            )}
          />
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Display selected range */}
      {dateRange?.from && (
        <div className="text-sm text-muted-foreground text-center pt-1">
          {dateRange.to
            ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
            : format(dateRange.from, "MMM dd, yyyy")}
        </div>
      )}

      {/* Shared styles for date inputs */}
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
      `}</style>
    </div>
  )
}
