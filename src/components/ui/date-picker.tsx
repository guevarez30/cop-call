"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { MobileDateInput } from "@/components/ui/mobile-date-input"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
}: DatePickerProps) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)

  // Update internal state when prop changes
  React.useEffect(() => {
    setSelectedDate(date)
  }, [date])

  // On mobile, use native date input for better UX
  if (isMobile) {
    return (
      <MobileDateInput
        date={date}
        onDateChange={onDateChange}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
    )
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate)
  }

  const handleApply = () => {
    onDateChange?.(selectedDate)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setSelectedDate(date)
    setIsOpen(false)
  }

  // On desktop, use calendar popover
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-11",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
          {/* Apply/Cancel buttons */}
          <div className="border-t p-3 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
