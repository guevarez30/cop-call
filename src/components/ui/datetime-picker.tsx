"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MobileDateTimeInput } from "@/components/ui/mobile-datetime-input"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"

interface DateTimePickerProps {
  date?: Date
  onDateTimeChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
}

export function DateTimePicker({
  date,
  onDateTimeChange,
  placeholder = "Pick date and time",
  disabled = false,
  className,
  required = false,
}: DateTimePickerProps) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [timeValue, setTimeValue] = React.useState<string>(
    date ? format(date, "HH:mm") : "12:00"
  )

  // Update internal state when prop changes (only used for desktop)
  React.useEffect(() => {
    if (date) {
      setSelectedDate(date)
      setTimeValue(format(date, "HH:mm"))
    }
  }, [date])

  // On mobile, use native datetime inputs for better UX
  if (isMobile) {
    return (
      <MobileDateTimeInput
        date={date}
        onDateTimeChange={onDateTimeChange}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        required={required}
      />
    )
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setSelectedDate(undefined)
      onDateTimeChange?.(undefined)
      return
    }

    // Combine the date with the current time
    const [hours, minutes] = timeValue.split(":").map(Number)
    const combinedDateTime = new Date(newDate)
    combinedDateTime.setHours(hours)
    combinedDateTime.setMinutes(minutes)

    setSelectedDate(combinedDateTime)
    onDateTimeChange?.(combinedDateTime)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTimeValue(newTime)

    if (selectedDate) {
      const [hours, minutes] = newTime.split(":").map(Number)
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(hours)
      newDateTime.setMinutes(minutes)

      setSelectedDate(newDateTime)
      onDateTimeChange?.(newDateTime)
    }
  }

  const handleApply = () => {
    if (selectedDate) {
      const [hours, minutes] = timeValue.split(":").map(Number)
      const finalDateTime = new Date(selectedDate)
      finalDateTime.setHours(hours)
      finalDateTime.setMinutes(minutes)

      onDateTimeChange?.(finalDateTime)
    }
    setIsOpen(false)
  }

  const formatDateTime = (dateTime?: Date) => {
    if (!dateTime) return placeholder
    return format(dateTime, "PPP 'at' p")
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-11",
            !selectedDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">{formatDateTime(selectedDate)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          {/* Calendar */}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
          {/* Time picker */}
          <div className="border-t p-3 space-y-2">
            <Label htmlFor="time-picker" className="text-sm font-medium">
              Time
            </Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                id="time-picker"
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="h-9"
                required={required}
              />
            </div>
          </div>
          {/* Apply button */}
          <div className="border-t p-3 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!selectedDate}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
