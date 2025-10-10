"use client"

import * as React from "react"
import { format } from "date-fns"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { MobileTimeInput } from "@/components/ui/mobile-time-input"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"

interface TimePickerProps {
  time?: Date
  onTimeChange?: (time: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
}

export function TimePicker({
  time,
  onTimeChange,
  placeholder = "Pick a time",
  disabled = false,
  className,
  required = false,
}: TimePickerProps) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedTime, setSelectedTime] = React.useState<Date | undefined>(time)

  // Update internal state when prop changes
  React.useEffect(() => {
    setSelectedTime(time)
  }, [time])

  // On mobile, use native time input for better UX
  if (isMobile) {
    return (
      <MobileTimeInput
        time={time}
        onTimeChange={onTimeChange}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        required={required}
      />
    )
  }

  const handleApply = () => {
    onTimeChange?.(selectedTime)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setSelectedTime(time)
    setIsOpen(false)
  }

  const formatTime = (time?: Date) => {
    if (!time) return placeholder
    return format(time, "p") // 12-hour format with AM/PM
  }

  const handleTimeSelect = (hours: number, minutes: number) => {
    const newTime = new Date()
    newTime.setHours(hours)
    newTime.setMinutes(minutes)
    newTime.setSeconds(0)
    newTime.setMilliseconds(0)
    setSelectedTime(newTime)
  }

  const currentHour = selectedTime?.getHours() ?? 12
  const currentMinute = selectedTime?.getMinutes() ?? 0

  // Generate hours (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Generate minutes (0-59)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-11",
            !selectedTime && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatTime(selectedTime)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          {/* Time Selector */}
          <div className="p-4">
            <div className="flex items-center gap-2">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Hour
                </div>
                <div className="h-[200px] overflow-y-auto border rounded-md">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => handleTimeSelect(hour, currentMinute)}
                      className={cn(
                        "w-16 py-2 text-sm hover:bg-accent transition-colors",
                        hour === currentHour && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      {hour.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Separator */}
              <div className="text-2xl font-semibold text-muted-foreground self-center mt-6">
                :
              </div>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Minute
                </div>
                <div className="h-[200px] overflow-y-auto border rounded-md">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => handleTimeSelect(currentHour, minute)}
                      className={cn(
                        "w-16 py-2 text-sm hover:bg-accent transition-colors",
                        minute === currentMinute && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      {minute.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected time display */}
            <div className="mt-3 text-center text-sm text-muted-foreground">
              {selectedTime && format(selectedTime, "p")}
            </div>
          </div>

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
