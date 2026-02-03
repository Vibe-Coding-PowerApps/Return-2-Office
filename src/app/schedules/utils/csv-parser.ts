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

const normalizeValue = (value: string): boolean => {
  const normalized = value.toLowerCase().trim()
  return ['yes', 'true', '1', 'y'].includes(normalized)
}

export const parseScheduleCSV = (csvText: string): UserSchedule[] => {
  const lines = csvText.trim().split('\n')
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row')
  }

  const headerLine = lines[0]
  const headers = headerLine.split(',').map(h => h.trim())

  // Find required columns
  const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name')
  const emailIndex = headers.findIndex(h => h.toLowerCase() === 'email')

  if (nameIndex === -1 || emailIndex === -1) {
    throw new Error('CSV must contain "Name" and "Email" columns')
  }

  // Find day columns
  const dayIndices: { [key in DayOfWeek]: number } = {} as any
  DAYS_OF_WEEK.forEach(day => {
    const index = headers.findIndex(h => h.toLowerCase() === day.toLowerCase())
    if (index !== -1) {
      dayIndices[day] = index
    }
  })

  if (Object.keys(dayIndices).length === 0) {
    throw new Error('CSV must contain at least one day column (Monday-Sunday)')
  }

  const schedules: UserSchedule[] = []

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Skip empty lines

    const columns = line.split(',').map(c => c.trim())

    const name = columns[nameIndex]?.trim()
    const email = columns[emailIndex]?.trim()

    if (!name || !email) {
      continue // Skip rows with missing name or email
    }

    const schedule: { [key in DayOfWeek]?: boolean } = {};
    
    (Object.entries(dayIndices) as Array<[DayOfWeek, number]>).forEach(([day, index]: [DayOfWeek, number]) => {
      if (columns[index]) {
        schedule[day as DayOfWeek] = normalizeValue(columns[index])
      }
    })

    schedules.push({
      id: `schedule_${Date.now()}_${i}`,
      name,
      email,
      schedule,
      addedDate: new Date().toISOString().split('T')[0],
    })
  }

  return schedules
}
