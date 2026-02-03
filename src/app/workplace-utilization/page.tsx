'use client'

import { useState, useEffect, useRef } from 'react'
import FloorMapImage from '@/components/floor-map-image'
import { ChartAreaInteractiveHourly } from '@/components/chart-area-interactive-hourly'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/ui/sheet'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { Input } from '@/ui/input'
import { IconArmchair, IconCalendarEvent, IconX, IconCalendar, IconPencil, IconPlus, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'
import { DatePickerCalendar } from '@/components/date-picker-calendar'
import { format } from 'date-fns'

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

export default function WorkplaceUtilizationPage() {
  const [selectedFloor, setSelectedFloor] = useState(1)
  const [selectedTime, setSelectedTime] = useState('current')
  const [loading, setLoading] = useState(false)
  const [isReserveDrawerOpen, setIsReserveDrawerOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedDesk, setSelectedDesk] = useState<string | null>(null)
  const [reservationFloor, setReservationFloor] = useState('1')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [reservationMessage, setReservationMessage] = useState('')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelingReservation, setCancelingReservation] = useState<{ deskId: string; date: string } | null>(null)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminPasswordDialog, setShowAdminPasswordDialog] = useState(false)
  const [showAddDesksDialog, setShowAddDesksDialog] = useState(false)
  const [deskNamingPrefix, setDeskNamingPrefix] = useState('MZ')
  const [numberOfDesks, setNumberOfDesks] = useState('78')
  const [editingNamingPrefix, setEditingNamingPrefix] = useState(false)
  const floorMapRef = useRef<any>(null)

  // Simulate fetching from Dataverse
  const fetchDesksFromDataverse = async () => {
    setLoading(true)
    try {
      // In a real implementation, this would call MicrosoftDataverseService
      // const result = await MicrosoftDataverseService.GetMetadataForGetEntity('desks')
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Error fetching from Dataverse:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminModeToggle = () => {
    if (!isAdminMode) {
      setShowAdminPasswordDialog(true)
    } else {
      setIsAdminMode(false)
      setAdminPassword('')
    }
  }

  const verifyAdminPassword = () => {
    // Simple password check - in production, use proper authentication
    const ADMIN_PASSWORD = 'admin123' // Change this to your secure password
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminMode(true)
      setShowAdminPasswordDialog(false)
      setAdminPassword('')
    } else {
      alert('Incorrect password')
      setAdminPassword('')
    }
  }

  const handleDeskCoordinatesChange = (deskId: string, xN: number, yN: number) => {
    console.log(`Desk ${deskId} moved to coordinates: x=${xN.toFixed(3)}, y=${yN.toFixed(3)}`)
  }

  const handleAddDesksClick = () => {
    setShowAddDesksDialog(true)
  }

  const handleGenerateDesks = () => {
    const count = parseInt(numberOfDesks)
    if (isNaN(count) || count <= 0) {
      alert('Please enter a valid number of desks')
      return
    }
    
    const prefix = deskNamingPrefix.trim()
    if (!prefix) {
      alert('Please enter a naming prefix')
      return
    }

    // Call the floor map's bulk add function
    if (floorMapRef.current?.addMultipleDesks) {
      floorMapRef.current.addMultipleDesks(prefix, count)
    }

    setShowAddDesksDialog(false)
    setNumberOfDesks('78')
  }

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
    setCancelingReservation({ deskId, date })
    setCancelDialogOpen(true)
  }

  const confirmCancelReservation = () => {
    if (cancelingReservation) {
      setReservations(reservations.filter(
        r => !(r.deskId === cancelingReservation.deskId && r.date === cancelingReservation.date)
      ))
      setCancelDialogOpen(false)
      setCancelingReservation(null)
    }
  }

  const isReservedForDate = (deskId: string, date: string) => {
    return reservations.some(r => r.deskId === deskId && r.date === date)
  }

  // Get available desks filtered by floor
  const getAvailableDesksByFloor = (floor: number) => {
    return desks.filter(d => d.floor === floor && d.status === 'available')
  }

  const availableDesksForFloor = getAvailableDesksByFloor(parseInt(reservationFloor))

  useEffect(() => {
    fetchDesksFromDataverse()
  }, [])

  return (
    <div className="@container/main flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto py-4 md:gap-6 md:py-6">
        {/* Controls */}
        <div className="px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Floor</label>
              <Select value={selectedFloor.toString()} onValueChange={(val) => setSelectedFloor(Number(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Floor 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Time</SelectItem>
                  <SelectItem value="morning">6:00 AM - 12:00 PM</SelectItem>
                  <SelectItem value="afternoon">12:00 PM - 6:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={handleAdminModeToggle}
            >
              <IconPencil className="size-4" />
              {isAdminMode ? 'Exit Admin Mode' : 'Admin Mode'}
            </Button>
            {isAdminMode && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 ml-2"
                onClick={handleAddDesksClick}
              >
                <IconPlus className="size-4" />
                Add Desks
              </Button>
            )}
            {!isAdminMode && (
              <Sheet open={isReserveDrawerOpen} onOpenChange={setIsReserveDrawerOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2 ml-2">
                    <IconArmchair className="size-4" />
                    <span className="hidden sm:inline">Reserve a Desk</span>
                  </Button>
                </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Reserve a Desk</SheetTitle>
                  <SheetDescription>
                    Reserve a desk for your office days. You can reserve up to 30 days in advance.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                  {/* Reserve a Desk Form */}
                  <div className="space-y-8">
                    <h3 className="font-semibold text-sm">Reserve a Desk</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="reserve-floor" className="text-sm font-medium">Select Floor</label>
                        <Select value={reservationFloor} onValueChange={setReservationFloor}>
                          <SelectTrigger id="reserve-floor">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Floor 1</SelectItem>
                            <SelectItem value="2">Floor 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="reserve-date" className="text-sm font-medium">Select Date</label>
                        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal px-4 py-2.5"
                            >
                              <IconCalendar className="mr-2 h-4 w-4" />
                              {selectedDate ? format(new Date(selectedDate), 'MMM dd, yyyy') : 'Pick a date...'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <DatePickerCalendar
                              selectedDate={selectedDate}
                              onSelectDate={setSelectedDate}
                              minDate={minDate}
                              maxDate={maxDate}
                              onClose={() => setIsDatePickerOpen(false)}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="start-time" className="text-sm font-medium">Start Time</label>
                          <Input
                            id="start-time"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="end-time" className="text-sm font-medium">End Time</label>
                          <Input
                            id="end-time"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="reserve-desk" className="text-sm font-medium">
                          Select Desk {availableDesksForFloor.length > 0 && <span className="text-muted-foreground text-xs">({availableDesksForFloor.length} available)</span>}
                        </label>
                        <Select value={selectedDesk || ''} onValueChange={(val) => setSelectedDesk(val || null)}>
                          <SelectTrigger id="reserve-desk">
                            <SelectValue placeholder="Choose a desk..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDesksForFloor.length > 0 ? (
                              availableDesksForFloor.map(desk => (
                                <SelectItem key={desk.id} value={desk.id} disabled={isReservedForDate(desk.id, selectedDate)}>
                                  {desk.name} • Section {desk.section}
                                  {isReservedForDate(desk.id, selectedDate) && ' (Already reserved)'}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                No available desks on this floor
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleReservation} className="w-full" disabled={availableDesksForFloor.length === 0}>
                        <IconCalendarEvent className="mr-2 size-4" />
                        Reserve
                      </Button>
                      {reservationMessage && (
                        <p className={`text-sm ${reservationMessage.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                          {reservationMessage}
                        </p>
                      )}
                    </div>
                  </div>

                  {reservations.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">My Reservations</h3>
                        <div className="space-y-2">
                          {reservations.map((res, idx) => {
                            const desk = desks.find(d => d.id === res.deskId)
                            return (
                              <Card key={idx} className="p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{desk?.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(res.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • Floor {desk?.floor}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => cancelReservation(res.deskId, res.date)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <IconX className="size-4" />
                                  </Button>
                                </div>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Confirmation Dialog for Canceling Reservation */}
                  {cancelDialogOpen && (
                    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center pointer-events-none">
                      <Card className="w-96 p-6 space-y-4 pointer-events-auto">
                        <div>
                          <h2 className="text-lg font-semibold">Cancel Reservation</h2>
                          <p className="text-sm text-muted-foreground mt-2">
                            Are you sure you want to cancel your reservation for <strong>{cancelingReservation && desks.find(d => d.id === cancelingReservation.deskId)?.name}</strong> on <strong>{cancelingReservation && new Date(cancelingReservation.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>? This action cannot be undone.
                          </p>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={(e) => {
                            e.stopPropagation()
                            setCancelDialogOpen(false)
                          }}>
                            Keep Reservation
                          </Button>
                          <Button variant="default" onClick={(e) => {
                            e.stopPropagation()
                            confirmCancelReservation()
                          }}>
                            Cancel Reservation
                          </Button>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          <Card className="@container/card dark:bg-zinc-900/50">
            <CardHeader>
              <div className="flex flex-col gap-1.5">
                <CardDescription className="text-foreground">Total Desks</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
                  66
                </CardTitle>
              </div>
              <CardAction>
                <Badge variant="outline" className="text-foreground">
                  <IconTrendingUp />
                  +8.2%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
                Desk availability increased <IconTrendingUp className="size-4" />
              </div>
              <div className="text-muted-foreground">
                Available on floor
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card dark:bg-zinc-900/50">
            <CardHeader>
              <div className="flex flex-col gap-1.5">
                <CardDescription className="text-foreground">Occupied</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
                  49
                </CardTitle>
              </div>
              <CardAction>
                <Badge variant="outline" className="text-foreground">
                  <IconTrendingDown />
                  -5.1%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
                Moderate desk utilization <IconTrendingDown className="size-4" />
              </div>
              <div className="text-muted-foreground">
                Desks in use
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card dark:bg-zinc-900/50">
            <CardHeader>
              <div className="flex flex-col gap-1.5">
                <CardDescription className="text-foreground">Available</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
                  17
                </CardTitle>
              </div>
              <CardAction>
                <Badge variant="outline" className="text-foreground">
                  <IconTrendingUp />
                  +12.5%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
                Strong desk availability <IconTrendingUp className="size-4" />
              </div>
              <div className="text-muted-foreground">
                Ready to use
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card dark:bg-zinc-900/50">
            <CardHeader>
              <div className="flex flex-col gap-1.5">
                <CardDescription className="text-foreground">Occupancy Rate</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
                  74%
                </CardTitle>
              </div>
              <CardAction>
                <Badge variant="outline" className="text-foreground">
                  <IconTrendingUp />
                  +3.8%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
                Steady utilization growth <IconTrendingUp className="size-4" />
              </div>
              <div className="text-muted-foreground">
                Floor utilization
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Floor Map and Chart Tabs */}
        <div className="px-4 lg:px-6">
          <Tabs defaultValue="floormap" className="w-full">
            <TabsList>
              <TabsTrigger value="floormap">Floor Map</TabsTrigger>
              <TabsTrigger value="timeline">Occupancy Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="floormap">
              <Card className="dark:bg-zinc-900/50 flex flex-col overflow-hidden min-h-[700px]">
                <CardHeader>
                  <CardTitle>Floor 1 - Real-time Utilization</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-auto rounded-b-lg">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Loading floor data...</p>
                    </div>
                  ) : (
                    <FloorMapImage 
                      ref={floorMapRef}
                      isAdminMode={isAdminMode}
                      onDeskCoordinatesChange={handleDeskCoordinatesChange}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline">
              <ChartAreaInteractiveHourly selectedFloor={selectedFloor} selectedTime={selectedTime} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Admin Password Dialog */}
      {showAdminPasswordDialog && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center pointer-events-none">
          <Card className="w-96 p-6 space-y-4 pointer-events-auto">
            <div>
              <h2 className="text-lg font-semibold">Admin Mode</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Enter the admin password to enable desk repositioning mode.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium">Password</label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && verifyAdminPassword()}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setShowAdminPasswordDialog(false)
                setAdminPassword('')
              }}>
                Cancel
              </Button>
              <Button onClick={verifyAdminPassword}>
                Enable Admin Mode
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Desks Dialog */}
      {showAddDesksDialog && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center pointer-events-none">
          <Card className="w-96 p-6 space-y-4 pointer-events-auto">
            <div>
              <h2 className="text-lg font-semibold">Add Desks</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Configure and generate desks for your floor plan.
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Naming Prefix Section */}
              <div className="space-y-2 border-b pb-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Naming Prefix</label>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingNamingPrefix(!editingNamingPrefix)}
                  >
                    {editingNamingPrefix ? 'Done' : 'Edit'}
                  </Button>
                </div>
                {editingNamingPrefix ? (
                  <Input
                    placeholder="e.g., MZ, DESK, etc."
                    value={deskNamingPrefix}
                    onChange={(e) => setDeskNamingPrefix(e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                ) : (
                  <div className="bg-muted p-2 rounded text-sm font-medium">
                    {deskNamingPrefix}001, {deskNamingPrefix}002, {deskNamingPrefix}003...
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Naming convention will be saved for future use
                </p>
              </div>

              {/* Number of Desks Section */}
              <div className="space-y-2">
                <label htmlFor="desk-count" className="text-sm font-medium">Number of Desks</label>
                <Input
                  id="desk-count"
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="e.g., 78"
                  value={numberOfDesks}
                  onChange={(e) => setNumberOfDesks(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Will generate {deskNamingPrefix}001 through {deskNamingPrefix}{String(parseInt(numberOfDesks) || 0).padStart(3, '0')}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setShowAddDesksDialog(false)
                setEditingNamingPrefix(false)
              }}>
                Cancel
              </Button>
              <Button onClick={handleGenerateDesks}>
                Generate Desks
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

