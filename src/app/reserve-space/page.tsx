'use client'

import { useState } from 'react'
import { Button } from '@/ui/button'
import { Card } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Separator } from '@/ui/separator'
import { IconX, IconCalendarEvent } from '@tabler/icons-react'

type DeskStatus = 'available' | 'reserved' | 'unavailable'

type Desk = {
  id: string
  name: string
  floor: number
  section: string
  status: DeskStatus
}

type Reservation = {
  deskId: string
  date: string
  userName: string
}

const desks: Desk[] = [
  { id: 'd1', name: 'Desk 101', floor: 1, section: 'A', status: 'available' },
  { id: 'd2', name: 'Desk 102', floor: 1, section: 'A', status: 'reserved' },
  { id: 'd3', name: 'Desk 103', floor: 1, section: 'A', status: 'available' },
  { id: 'd4', name: 'Desk 104', floor: 1, section: 'B', status: 'available' },
  { id: 'd5', name: 'Desk 105', floor: 1, section: 'B', status: 'available' },
  { id: 'd6', name: 'Desk 201', floor: 2, section: 'C', status: 'available' },
  { id: 'd7', name: 'Desk 202', floor: 2, section: 'C', status: 'reserved' },
  { id: 'd8', name: 'Desk 203', floor: 2, section: 'C', status: 'available' },
  { id: 'd9', name: 'Desk 204', floor: 2, section: 'D', status: 'available' },
  { id: 'd10', name: 'Desk 205', floor: 2, section: 'D', status: 'unavailable' },
]

const getStatusColor = (status: DeskStatus) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 dark:bg-green-900'
    case 'reserved':
      return 'bg-yellow-100 dark:bg-yellow-900'
    case 'unavailable':
      return 'bg-red-100 dark:bg-red-900'
  }
}

const getStatusBadge = (status: DeskStatus) => {
  switch (status) {
    case 'available':
      return <Badge className="bg-green-600">Available</Badge>
    case 'reserved':
      return <Badge className="bg-yellow-600">Reserved</Badge>
    case 'unavailable':
      return <Badge className="bg-red-600">Unavailable</Badge>
  }
}

export default function ReserveSpacePage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedDesk, setSelectedDesk] = useState<string | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [reservationMessage, setReservationMessage] = useState('')

  // Get today's date and 30 days ahead
  const today = new Date()
  const minDate = today.toISOString().split('T')[0]
  const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const handleReservation = () => {
    if (!selectedDate || !selectedDesk) {
      setReservationMessage('Please select both a date and a desk')
      return
    }

    const desk = desks.find(d => d.id === selectedDesk)
    if (desk?.status !== 'available') {
      setReservationMessage('This desk is not available for the selected date')
      return
    }

    const alreadyReserved = reservations.some(
      r => r.deskId === selectedDesk && r.date === selectedDate
    )

    if (alreadyReserved) {
      setReservationMessage('You have already reserved this desk for this date')
      return
    }

    // Add reservation
    setReservations([...reservations, {
      deskId: selectedDesk,
      date: selectedDate,
      userName: 'You'
    }])

    setReservationMessage('✓ Desk reserved successfully!')
    setSelectedDesk(null)
    setSelectedDate('')

    // Clear message after 3 seconds
    setTimeout(() => setReservationMessage(''), 3000)
  }

  const cancelReservation = (deskId: string, date: string) => {
    setReservations(reservations.filter(
      r => !(r.deskId === deskId && r.date === date)
    ))
  }

  const isReservedForDate = (deskId: string, date: string) => {
    return reservations.some(r => r.deskId === deskId && r.date === date)
  }

  // Group desks by floor and section
  const desksByFloor = desks.reduce((acc, desk) => {
    if (!acc[desk.floor]) acc[desk.floor] = {}
    if (!acc[desk.floor][desk.section]) acc[desk.floor][desk.section] = []
    acc[desk.floor][desk.section].push(desk)
    return acc
  }, {} as Record<number, Record<string, Desk[]>>)

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Reserve Space</h1>
        <p className="text-muted-foreground">
          Reserve a desk for your office days. You can reserve up to 30 days in advance or the same day if available.
        </p>
      </header>

      {/* Reservation Form */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">New Reservation</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Date</label>
            <input
              type="date"
              min={minDate}
              max={maxDate}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Desk</label>
            <select
              value={selectedDesk || ''}
              onChange={(e) => setSelectedDesk(e.target.value || null)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Choose a desk...</option>
              {desks.map(desk => (
                <option
                  key={desk.id}
                  value={desk.id}
                  disabled={desk.status !== 'available' || isReservedForDate(desk.id, selectedDate)}
                >
                  {desk.name} - Floor {desk.floor}, Section {desk.section}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button onClick={handleReservation} className="w-full">
          <IconCalendarEvent className="mr-2 size-4" />
          Reserve Desk
        </Button>
        {reservationMessage && (
          <p className={`text-sm ${reservationMessage.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
            {reservationMessage}
          </p>
        )}
      </Card>

      <Separator />

      {/* My Reservations */}
      {reservations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Reservations</h2>
          <div className="grid gap-3">
            {reservations.map((res, idx) => {
              const desk = desks.find(d => d.id === res.deskId)
              return (
                <Card key={idx} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{desk?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(res.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} • Floor {desk?.floor}, Section {desk?.section}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancelReservation(res.deskId, res.date)}
                  >
                    <IconX className="mr-1 size-4" />
                    Cancel
                  </Button>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <Separator />

      {/* Available Desks */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Available Desks by Floor</h2>
        {Object.entries(desksByFloor).sort().map(([floor, sections]) => (
          <div key={floor} className="space-y-4">
            <h3 className="text-lg font-medium">Floor {floor}</h3>
            {Object.entries(sections).sort().map(([section, sectionDesks]) => (
              <div key={section} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Section {section}</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sectionDesks.map(desk => (
                    <Card
                      key={desk.id}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedDesk === desk.id ? 'ring-2 ring-primary' : ''
                      } ${getStatusColor(desk.status)}`}
                      onClick={() => desk.status === 'available' && setSelectedDesk(desk.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{desk.name}</p>
                          <p className="text-xs text-muted-foreground">Floor {desk.floor}, Section {desk.section}</p>
                        </div>
                        {getStatusBadge(desk.status)}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <Card className="p-4 bg-muted/50">
        <p className="text-sm font-medium mb-3">Status Legend</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-600"></div>
            <span className="text-sm">Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-600"></div>
            <span className="text-sm">Unavailable</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
