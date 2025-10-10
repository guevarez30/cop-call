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
      return
    }

    // Combine the date with the current time
    const [hours, minutes] = timeValue.split(":").map(Number)
    const combinedDateTime = new Date(newDate)
    combinedDateTime.setHours(hours)
    combinedDateTime.setMinutes(minutes)

    setSelectedDate(combinedDateTime)
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
          <div className="border-t p-4">
            <div className="text-xs font-medium text-muted-foreground mb-3">
              Select Time
            </div>
            <div className="flex items-start justify-center gap-2">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Hour
                </div>
                <div className="h-[160px] w-16 overflow-y-auto border rounded-md flex flex-col">
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                    const [currentHour] = timeValue.split(":").map(Number)
                    return (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => {
                          const [, minutes] = timeValue.split(":")
                          setTimeValue(`${hour.toString().padStart(2, "0")}:${minutes}`)
                        }}
                        className={cn(
                          "w-full py-2 text-sm hover:bg-accent transition-colors flex-shrink-0",
                          hour === currentHour && "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                      >
                        {hour.toString().padStart(2, "0")}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Separator */}
              <div className="text-2xl font-semibold text-muted-foreground mt-8">
                :
              </div>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Minute
                </div>
                <div className="h-[160px] w-16 overflow-y-auto border rounded-md flex flex-col">
                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => {
                    const [, currentMinute] = timeValue.split(":").map(Number)
                    return (
                      <button
                        key={minute}
                        type="button"
                        onClick={() => {
                          const [hours] = timeValue.split(":")
                          setTimeValue(`${hours}:${minute.toString().padStart(2, "0")}`)
                        }}
                        className={cn(
                          "w-full py-2 text-sm hover:bg-accent transition-colors flex-shrink-0",
                          minute === currentMinute && "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                      >
                        {minute.toString().padStart(2, "0")}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Selected time display */}
            <div className="mt-3 text-center text-sm text-muted-foreground">
              {timeValue && format(new Date(`2000-01-01T${timeValue}`), "p")}
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
