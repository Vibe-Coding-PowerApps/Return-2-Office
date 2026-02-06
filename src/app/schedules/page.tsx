'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/ui/card'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/ui/sheet'
import { Separator } from '@/ui/separator'
import { IconUpload, IconPlus, IconFile, IconDownload, IconFilter } from '@tabler/icons-react'
import { Checkbox } from '@/ui/checkbox'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/ui/alert-dialog'
import { DataTableSchedules } from '@/components/data-table-schedules'
import { parseScheduleCSV } from './utils/csv-parser'
import { format } from 'date-fns'

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

type UserSchedule = {
  id: string
  name: string
  email: string
  schedule: {
    [key in DayOfWeek]?: boolean
  }
  addedDate: string
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<UserSchedule[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [filterDay, setFilterDay] = useState<string | null>(null)
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)

  // Manual add form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    schedule: {} as { [key in DayOfWeek]?: boolean },
  })

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    setUploadError(null)
    setUploadSuccess(null)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadError('Please upload a CSV file')
      return
    }

    try {
      const text = await file.text()
      const parsedSchedules = parseScheduleCSV(text)

      if (parsedSchedules.length === 0) {
        setUploadError('No valid schedules found in the CSV file')
        return
      }

      // Check for duplicates and merge if necessary
      const newSchedules = parsedSchedules.filter(
        (newSchedule) =>
          !schedules.some(
            (existing) =>
              existing.email.toLowerCase() === newSchedule.email.toLowerCase()
          )
      )

      const duplicateCount = parsedSchedules.length - newSchedules.length

      setSchedules([...schedules, ...newSchedules])
      setUploadSuccess(
        `Successfully imported ${newSchedules.length} schedule${newSchedules.length !== 1 ? 's' : ''}${
          duplicateCount > 0 ? ` (${duplicateCount} duplicate${duplicateCount !== 1 ? 's' : ''} skipped)` : ''
        }`
      )

      // Clear success message after 5 seconds
      setTimeout(() => setUploadSuccess(null), 5000)
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : 'Error parsing CSV file'
      )
    }
  }

  const handleAddSchedule = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setUploadError('Please enter name and email')
      return
    }

    if (editingScheduleId) {
      // Edit mode
      setSchedules(schedules.map((s) =>
        s.id === editingScheduleId
          ? {
              ...s,
              name: formData.name,
              email: formData.email,
              schedule: formData.schedule,
            }
          : s
      ))
      setUploadSuccess('Schedule updated successfully')
      setEditingScheduleId(null)
    } else {
      // Add mode
      // Check if email already exists
      if (
        schedules.some(
          (s) => s.email.toLowerCase() === formData.email.toLowerCase()
        )
      ) {
        setUploadError(`${formData.name} (${formData.email}) already exists in the schedules`)
        return
      }

      const newSchedule: UserSchedule = {
        id: `schedule_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        schedule: formData.schedule,
        addedDate: format(new Date(), 'yyyy-MM-dd'),
      }

      setSchedules([...schedules, newSchedule])
      setUploadSuccess('Schedule added successfully')
    }

    setFormData({ name: '', email: '', schedule: {} })
    setIsAddDrawerOpen(false)
    setTimeout(() => setUploadSuccess(null), 5000)
  }

  const handleEditRow = (scheduleId: string) => {
    // Find the schedule by ID
    const schedule = schedules.find((s) => s.id === scheduleId)
    
    if (schedule) {
      setFormData({
        name: schedule.name,
        email: schedule.email,
        schedule: schedule.schedule,
      })
      setEditingScheduleId(schedule.id)
      setIsAddDrawerOpen(true)
      setUploadError(null)
    }
  }

  const handleRemoveSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id))
    setScheduleToDelete(null)
  }

  const handleToggleDayInForm = (day: DayOfWeek) => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        [day]: !formData.schedule[day],
      },
    })
  }

  const filteredSchedules = filterDay
    ? schedules.filter((s) => s.schedule[filterDay as DayOfWeek])
    : schedules

  const downloadTemplate = () => {
    const headers = ['Name', 'Email', ...DAYS_OF_WEEK].join(',')
    const rows = [
      headers,
      'John Doe,john.doe@company.com,yes,yes,yes,yes,yes,no,no',
      'Jane Smith,jane.smith@company.com,yes,no,yes,no,yes,no,no',
    ]
    const csv = rows.join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'schedules-template.csv')
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Transform schedules to DataTable format
  const tableData = filteredSchedules.map((schedule, index) => {
    const selectedDays = DAYS_OF_WEEK.filter(day => schedule.schedule[day])
    const uniqueId = schedule.id.replace(/[^0-9]/g, '') // Extract all numbers from schedule.id
    
    return {
      id: uniqueId ? parseInt(uniqueId) : index + 1,
      header: schedule.name,
      type: schedule.email,
      status: selectedDays.length > 0 
        ? `${selectedDays.length} days`
        : 'No days',
      target: selectedDays.map(day => day.slice(0, 3)).join(', ') || 'None',
      limit: schedule.addedDate,
      startTime: '—',
      endTime: schedule.id,
      officeDay1: selectedDays,
      officeDay2: [],
      officeDay3: [],
    }
  })

  return (
    <div className="flex flex-col p-6 gap-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedules</h1>
          <p className="text-muted-foreground mt-2">
            Manage employee office attendance schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={isAddDrawerOpen} onOpenChange={(open) => {
            setIsAddDrawerOpen(open)
            if (!open) {
              setEditingScheduleId(null)
              setFormData({ name: '', email: '', schedule: {} })
              setUploadError(null)
            }
          }}>
            <SheetTrigger asChild>
              <Button className="gap-2">
                <IconPlus className="h-4 w-4" />
                Add Schedule
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>{editingScheduleId ? 'Edit Schedule' : 'Add Schedule'}</SheetTitle>
                <SheetDescription>
                  {editingScheduleId ? 'Update the employee schedule details' : 'Manually add an employee schedule'}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
              {uploadError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
                  {uploadError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="john.doe@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <label className="text-sm font-medium block">
                  Days in Office
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`form_${day}`}
                        checked={formData.schedule[day] || false}
                        onCheckedChange={() => handleToggleDayInForm(day)}
                      />
                      <label
                        htmlFor={`form_${day}`}
                        className="text-sm cursor-pointer"
                      >
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleAddSchedule} className="w-full">
                {editingScheduleId ? 'Update Schedule' : 'Add Schedule'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
          
          {/* Filter Button */}
          <Button variant="outline" size="sm" className="gap-2">
            <IconFilter className="h-4 w-4" />
            <Select value={filterDay || 'all'} onValueChange={(value) => setFilterDay(value === 'all' ? null : value)}>
              <SelectTrigger className="border-0 h-auto p-0 bg-transparent focus:ring-0">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {uploadError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
          {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div className="rounded-lg bg-green-100 border border-green-300 dark:bg-green-900/20 dark:border-green-800 p-4 text-sm text-green-800 dark:text-green-200">
          {uploadSuccess}
        </div>
      )}

      {/* Main Content */}
      {schedules.length === 0 ? (
        // Empty State
        <div className="grid gap-6">
          <Card className="border-2 border-dashed">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6 max-w-md mx-auto">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <IconUpload className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No schedules yet</h3>
                  <p className="text-muted-foreground">
                    Get started by uploading a CSV file with employee schedules or creating your first schedule manually.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  {/* Upload Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      aria-label="Upload CSV file"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <IconFile className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">
                          Drag & drop your CSV
                        </p>
                        <p className="text-xs text-muted-foreground">
                          or click to browse
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Or Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>

                  {/* Download Template Button */}
                  <Button 
                    variant="outline" 
                    className="w-full gap-2" 
                    onClick={downloadTemplate}
                  >
                    <IconDownload className="h-4 w-4" />
                    Download CSV Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Schedules List
        <div className="flex flex-col gap-6 flex-1 min-h-0">
          {/* Schedules Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredSchedules.length} of {schedules.length} schedule{schedules.length !== 1 ? 's' : ''}
          </div>

          {/* Schedules Table */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {filteredSchedules.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground">
                    No schedules found for the selected filter.
                  </p>
                </CardContent>
              </Card>
            ) : tableData && tableData.length > 0 ? (
              <DataTableSchedules data={tableData} onEditRow={handleEditRow} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Loading schedules...</p>
                </CardContent>
              </Card>
            )}
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Upload CSV file"
              id="hidden-csv-input"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!scheduleToDelete} onOpenChange={() => setScheduleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this schedule? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-6">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => scheduleToDelete && handleRemoveSchedule(scheduleToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
