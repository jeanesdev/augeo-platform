/**
 * TimezoneSelect Component
 * Searchable dropdown for selecting IANA timezones
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Common US timezones
const US_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (No DST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
]

// Additional international timezones
const INTERNATIONAL_TIMEZONES = [
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
]

interface TimezoneSelectProps {
  value?: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function TimezoneSelect({ value, onValueChange, disabled }: TimezoneSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          United States
        </div>
        {US_TIMEZONES.map((tz) => (
          <SelectItem key={tz.value} value={tz.value}>
            {tz.label}
          </SelectItem>
        ))}
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-2">
          International
        </div>
        {INTERNATIONAL_TIMEZONES.map((tz) => (
          <SelectItem key={tz.value} value={tz.value}>
            {tz.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
