import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

import ReserveVehicleForm from './ReserveVehicleForm'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const DEFAULT_IMAGE = '/utv-placeholder.svg'

type Vehicle = Database['public']['Tables']['vehicles']['Row']
type ReservationSummary = Pick<Database['public']['Tables']['rentals']['Row'], 'start_date' | 'end_date' | 'status'>
type RelatedVehicle = Pick<Vehicle, 'id' | 'name' | 'price_per_day' | 'images' | 'type'>

interface ListingPageProps {
  params: Promise<{ id: string }>
}

async function fetchVehicle(id: string) {
  const supabase = await createClient()

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !vehicle) {
    console.error('Vehicle not found:', error)
    return null
  }

  const { data: reservations } = await supabase
    .from('rentals')
    .select('start_date, end_date, status')
    .eq('vehicle_id', id)
    .in('status', ['pending', 'confirmed', 'active'])
    .order('start_date', { ascending: true })

  const { data: related } = await supabase
    .from('vehicles')
    .select('id, name, price_per_day, images, type')
    .neq('id', id)
    .eq('type', vehicle.type)
    .limit(3)

  return {
    vehicle: vehicle as Vehicle,
    reservations: (reservations ?? []) as ReservationSummary[],
    related: (related ?? []) as RelatedVehicle[],
  }
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params
  const data = await fetchVehicle(id)

  if (!data) {
    return {
      title: 'Vehicle not found',
    }
  }

  const { vehicle } = data

  return {
    title: `${vehicle.name} | Beachside Rentals`,
    description: vehicle.description ?? 'Explore our premium coastal adventures.',
    openGraph: {
      title: vehicle.name,
      description: vehicle.description ?? undefined,
      images: vehicle.images && vehicle.images.length > 0 ? vehicle.images : [DEFAULT_IMAGE],
    },
  }
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { id } = await params
  const data = await fetchVehicle(id)

  if (!data) {
    notFound()
  }

  const { vehicle, reservations, related } = data
  const heroImage = vehicle.images?.[0] ?? DEFAULT_IMAGE

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingReservations = reservations.filter((reservation) => {
    const end = new Date(reservation.end_date)
    end.setHours(23, 59, 59, 999)
    return end >= today
  })

  const hasBlockingReservation = upcomingReservations.some((reservation) => {
    const start = new Date(reservation.start_date)
    const end = new Date(reservation.end_date)
    end.setHours(23, 59, 59, 999)
    return start <= today && today <= end && reservation.status !== 'pending'
  })

  const vehicleAvailable = vehicle.available && !hasBlockingReservation

  const specificationEntries = vehicle.specifications
    ? Object.entries(vehicle.specifications)
    : []

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <Link href="/listings" className="inline-flex items-center text-pine-600 hover:text-orange-500">
        ← Back to listings
      </Link>

      <div className="grid lg:grid-cols-[2fr,1fr] gap-10 items-start">
        <article className="space-y-8">
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg border border-sand-200">
            <Image
              src={heroImage}
              alt={vehicle.name}
              fill
              priority
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-cover"
            />
          </div>

          <header className="space-y-2">
            <span className="uppercase tracking-wide text-sm text-orange-500 font-semibold">
              {vehicle.type === 'guided_tour' ? 'Guided Tour' : vehicle.type === 'utv' ? 'UTV Adventure' : 'Motorcycle'}
            </span>
            <h1 className="text-4xl font-bold text-pine-800">{vehicle.name}</h1>
            <p className="text-lg text-rock-600 leading-relaxed">
              {vehicle.description ?? 'Ready for an unforgettable coastal ride.'}
            </p>
          </header>

          <section className="grid md:grid-cols-3 gap-6">
            <div className="card bg-white shadow-sm">
              <p className="text-sm text-rock-500">Daily rate</p>
              <p className="text-2xl font-semibold text-pine-800">
                {currencyFormatter.format(vehicle.price_per_day)}
              </p>
            </div>
            <div className="card bg-white shadow-sm">
              <p className="text-sm text-rock-500">Availability</p>
              <p className={`text-lg font-semibold ${vehicleAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                {vehicleAvailable ? 'Available' : 'Currently booked'}
              </p>
              {hasBlockingReservation && (
                <p className="text-sm text-rock-500 mt-1">Bookings may lift soon—check back shortly!</p>
              )}
            </div>
            <div className="card bg-white shadow-sm">
              <p className="text-sm text-rock-500">What to expect</p>
              <p className="text-base text-rock-600">
                Sunset coastlines, warm breezes, and turquoise trails—perfect for a beachside escape.
              </p>
            </div>
          </section>

          {specificationEntries.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-pine-800">Highlights</h2>
              <dl className="grid md:grid-cols-2 gap-4">
                {specificationEntries.map(([key, value]) => (
                  <div key={key} className="card bg-sand-50 border border-sand-200">
                    <dt className="text-sm uppercase tracking-wide text-orange-500">{key.replace(/_/g, ' ')}</dt>
                    <dd className="text-lg font-medium text-pine-800">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {upcomingReservations.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-pine-800">Upcoming reservations</h2>
              <div className="overflow-hidden rounded-2xl border border-sand-200">
                <table className="min-w-full divide-y divide-sand-200">
                  <thead className="bg-sand-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-rock-500 uppercase tracking-wider">Start</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-rock-500 uppercase tracking-wider">End</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-rock-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-sand-100">
                    {upcomingReservations.map((reservation) => {
                      const start = new Date(reservation.start_date)
                      const end = new Date(reservation.end_date)
                      const statusLabel =
                        reservation.status === 'pending'
                          ? 'Pending approval'
                          : reservation.status === 'confirmed'
                          ? 'Confirmed'
                          : 'In progress'

                      return (
                        <tr key={`${reservation.start_date}-${reservation.end_date}`}>
                          <td className="px-4 py-3 text-sm text-rock-600">{start.toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm text-rock-600">{end.toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm font-medium text-pine-700">{statusLabel}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </article>

        <aside className="space-y-6">
          <ReserveVehicleForm
            vehicleId={vehicle.id}
            pricePerDay={vehicle.price_per_day}
            unavailableRanges={upcomingReservations}
            vehicleAvailable={vehicleAvailable}
          />

          {related.length > 0 && (
            <div className="card space-y-4">
              <h2 className="text-xl font-semibold text-pine-800">Similar adventures</h2>
              <ul className="space-y-4">
                {related.map((item) => {
                  const image = item.images?.[0] ?? DEFAULT_IMAGE
                  return (
                    <li key={item.id} className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-sand-200">
                        <Image src={image} alt={item.name} fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <Link href={`/listings/${item.id}`} className="font-medium text-pine-700 hover:text-orange-500">
                          {item.name}
                        </Link>
                        <p className="text-sm text-rock-500">
                          {currencyFormatter.format(item.price_per_day)} / day
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
