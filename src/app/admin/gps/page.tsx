import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface Coordinates {
  lat: number
  lng: number
  label?: string | null
}

interface TrackingMeta {
  status?: string | null
  last_ping_at?: string | null
  last_known_location?: Coordinates | null
  history?: Array<{ timestamp: string; location: Coordinates }>
}

function parseTracking(specifications: Record<string, any> | null): TrackingMeta | null {
  if (!specifications || typeof specifications !== 'object') return null
  const data = specifications.gps_tracking
  if (!data || typeof data !== 'object') return null
  return {
    status: data.status ?? null,
    last_ping_at: data.last_ping_at ?? null,
    last_known_location: data.last_known_location ?? null,
    history: Array.isArray(data.history) ? data.history : undefined,
  }
}

function formatRelativeTime(value?: string | null) {
  if (!value) return 'No pings yet'
  const target = new Date(value)
  if (Number.isNaN(target.getTime())) return 'Unknown'
  const diffMs = target.getTime() - Date.now()
  const minutes = Math.round(diffMs / (1000 * 60))
  const hours = Math.round(diffMs / (1000 * 60 * 60))
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24))

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute')
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  return rtf.format(days, 'day')
}

function buildMapUrl(location: Coordinates | null | undefined) {
  if (!location) return null
  return `https://www.google.com/maps?q=${location.lat},${location.lng}`
}

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'GPS Tracking Overview — Admin',
}

export default async function AdminGpsPage() {
  const supabase = await createClient()
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('id, name, type, specifications, images')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Failed to load GPS data', error)
    return (
      <section className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-pine-800">GPS Tracking</h1>
            <p className="text-muted">Monitor the latest pings from your adventure fleet.</p>
          </div>
        </header>
        <div className="card border-red-200 bg-red-50 text-red-800">
          <p className="font-medium">Unable to load tracking information.</p>
          <p className="text-sm mt-1">Check Supabase connection and try again.</p>
        </div>
      </section>
    )
  }

  const enriched = (vehicles ?? []).map((vehicle) => ({
    ...vehicle,
    tracking: parseTracking(vehicle.specifications as Record<string, any> | null),
  }))

  const active = enriched.filter((vehicle) => vehicle.tracking && vehicle.tracking.last_known_location)
  const dormant = enriched.filter((vehicle) => !vehicle.tracking || !vehicle.tracking.last_known_location)

  return (
    <section className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-pine-800">GPS Tracking</h1>
          <p className="text-muted max-w-2xl">
            View the most recent GPS pings from vehicles currently out on the coast. Use this page to confirm locations,
            jump into detailed vehicle records, or trigger additional pings from the Vehicles tab.
          </p>
        </div>
        <Link
          href="/admin/vehicles"
          className="btn-secondary inline-flex items-center gap-2"
        >
          Manage Fleet
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-semibold text-pine-800 mb-3">Active Trackers</h2>
          {active.length === 0 ? (
            <p className="text-muted text-sm">No live locations yet. Trigger a GPS ping from the Vehicles page.</p>
          ) : (
            <ul className="space-y-4">
              {active.map((vehicle) => {
                const location = vehicle.tracking?.last_known_location
                const mapUrl = buildMapUrl(location)
                return (
                  <li key={vehicle.id} className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-pine-800">{vehicle.name}</h3>
                        <p className="text-xs uppercase tracking-wide text-orange-500">{vehicle.type.replace('_', ' ')}</p>
                      </div>
                      <Link
                        href={`/admin/vehicles/${vehicle.id}/edit`}
                        className="text-sm font-medium text-pine-700 hover:text-orange-500"
                      >
                        Open vehicle
                      </Link>
                    </div>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold text-rock-500 uppercase">Last ping</dt>
                        <dd className="text-sm text-pine-700">{formatRelativeTime(vehicle.tracking?.last_ping_at)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-rock-500 uppercase">Location</dt>
                        <dd className="text-sm text-pine-700">
                          {location?.label ?? `${location?.lat}, ${location?.lng}`}
                        </dd>
                      </div>
                    </dl>
                    {mapUrl && (
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-lagoon-600 hover:text-lagoon-700"
                        >
                          View on map ↗
                        </a>
                        {vehicle.tracking?.status && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-lagoon-50 px-3 py-1 text-xs font-semibold text-lagoon-700">
                            {vehicle.tracking.status}
                          </span>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-pine-800 mb-3">Awaiting Updates</h2>
          {dormant.length === 0 ? (
            <p className="text-muted text-sm">All vehicles reported in recently—great job keeping tabs!</p>
          ) : (
            <ul className="space-y-3">
              {dormant.map((vehicle) => (
                <li key={vehicle.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sand-100 bg-white/70 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-pine-800">{vehicle.name}</p>
                    <p className="text-xs text-muted">No recent GPS ping</p>
                  </div>
                  <Link
                    href={`/admin/vehicles/${vehicle.id}/edit`}
                    className="text-sm font-semibold text-orange-500 hover:text-orange-600"
                  >
                    Request ping
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
