/**
 * SponsorList
 * Displays a grid of sponsors grouped by logo size
 */

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Sponsor } from '@/types/sponsor'
import { AlertCircle, Building2, Plus } from 'lucide-react'
import { SponsorCard } from './SponsorCard'

interface SponsorListProps {
  sponsors: Sponsor[]
  isLoading?: boolean
  error?: string | null
  onAdd?: () => void
  onEdit?: (sponsor: Sponsor) => void
  onDelete?: (sponsor: Sponsor) => void
  readOnly?: boolean
}

export function SponsorList({
  sponsors,
  isLoading = false,
  error = null,
  onAdd,
  onEdit,
  onDelete,
  readOnly = false,
}: SponsorListProps) {
  // Group sponsors by logo size
  const groupedSponsors = sponsors.reduce(
    (acc, sponsor) => {
      if (!acc[sponsor.logo_size]) {
        acc[sponsor.logo_size] = []
      }
      acc[sponsor.logo_size].push(sponsor)
      return acc
    },
    {} as Record<string, Sponsor[]>
  )

  const logoSizeTitles = {
    xlarge: 'Title Sponsors',
    large: 'Platinum Sponsors',
    medium: 'Gold Sponsors',
    small: 'Silver Sponsors',
    xsmall: 'Bronze Sponsors',
  }

  const sizeOrder = ['xlarge', 'large', 'medium', 'small', 'xsmall'] as const

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (sponsors.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No sponsors yet</h3>
        <p className="text-muted-foreground mb-6">
          Add sponsors to showcase their support for your event
        </p>
        {!readOnly && onAdd && (
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Sponsor
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Add Button */}
      {!readOnly && onAdd && (
        <div className="flex justify-end">
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Sponsor
          </Button>
        </div>
      )}

      {/* Grouped Sponsors */}
      {sizeOrder.map((size) => {
        const sizesponsors = groupedSponsors[size]
        if (!sizesponsors || sizesponsors.length === 0) return null

        return (
          <div key={size} className="space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">
              {logoSizeTitles[size]}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sizesponsors.map((sponsor) => (
                <SponsorCard
                  key={sponsor.id}
                  sponsor={sponsor}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
