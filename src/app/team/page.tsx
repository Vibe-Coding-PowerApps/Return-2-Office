'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/ui/card'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/ui/sheet'
import { Separator } from '@/ui/separator'
import { IconUpload, IconPlus, IconFile, IconDownload } from '@tabler/icons-react'
import { DataTableTeams } from '@/components/data-table-teams'

type TeamMember = {
  id: string
  name: string
  email: string
  officeToday: boolean
  daysThisWeek: number
}

type Team = {
  id: string
  name: string
  description: string
  manager: string
  totalMembers: number
  officeToday: number
  officeThisWeek: number
  members: TeamMember[]
}

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)

  // Manual add form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager: '',
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

  const parseTeamCSV = (text: string): Team[] => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) {
      setUploadError('CSV must have headers and at least one row')
      return []
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const teamsMap: { [key: string]: Team } = {}

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      
      const row: { [key: string]: string } = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      if (!row.team_name) continue

      if (!teamsMap[row.team_name]) {
        teamsMap[row.team_name] = {
          id: `team_${Date.now()}_${Object.keys(teamsMap).length}`,
          name: row.team_name,
          description: row.team_description || '',
          manager: row.manager || '',
          totalMembers: 0,
          officeToday: 0,
          officeThisWeek: 0,
          members: [],
        }
      }

      if (row.member_name && row.member_email) {
        teamsMap[row.team_name].members.push({
          id: `m_${Date.now()}_${Math.random()}`,
          name: row.member_name,
          email: row.member_email,
          officeToday: false,
          daysThisWeek: 0,
        })
        teamsMap[row.team_name].totalMembers += 1
      }
    }

    return Object.values(teamsMap)
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadError('Please upload a CSV file')
      return
    }

    try {
      const text = await file.text()
      const parsedTeams = parseTeamCSV(text)

      if (parsedTeams.length === 0) {
        setUploadError('No valid teams found in the CSV file')
        return
      }

      setTeams([...teams, ...parsedTeams])
      setUploadSuccess(`Successfully imported ${parsedTeams.length} team${parsedTeams.length !== 1 ? 's' : ''}`)
      setTimeout(() => setUploadSuccess(null), 3000)
    } catch (error) {
      console.error('Error parsing CSV:', error)
      setUploadError('Error parsing CSV file. Please check the format.')
    }
  }

  const handleAddTeam = () => {
    if (!formData.name.trim()) {
      setUploadError('Team name is required')
      return
    }

    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      manager: formData.manager,
      totalMembers: 0,
      officeToday: 0,
      officeThisWeek: 0,
      members: [],
    }

    setTeams([...teams, newTeam])
    setFormData({ name: '', description: '', manager: '' })
    setIsAddDrawerOpen(false)
    setUploadSuccess('Team added successfully')
    setTimeout(() => setUploadSuccess(null), 3000)
  }

  const downloadTemplate = () => {
    const template = `team_name,team_description,manager,member_name,member_email
Engineering,Software development and infrastructure,Sarah Chen,John Smith,john.smith@company.com
Engineering,Software development and infrastructure,Sarah Chen,Emily Chen,emily.chen@company.com
Sales & Business Development,Revenue generation and client relations,James Martinez,Rachel Green,rachel.green@company.com
Operations & HR,Human resources and administration,Patricia Lee,Karen Rodriguez,karen.rodriguez@company.com`

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'teams-template.csv')
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="@container/main flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto py-4 md:gap-6 md:py-6">
        {/* Header */}
        <div className="px-4 lg:px-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground mt-2">
              Manage teams and team members
            </p>
          </div>
        </div>

        {/* Alerts */}
        {uploadError && (
          <div className="px-4 lg:px-6 rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
            {uploadError}
          </div>
        )}

        {uploadSuccess && (
          <div className="px-4 lg:px-6 rounded-lg bg-green-100 border border-green-300 dark:bg-green-900/20 dark:border-green-800 p-4 text-sm text-green-800 dark:text-green-200">
            {uploadSuccess}
          </div>
        )}

        {/* Main Content */}
        {teams.length === 0 ? (
          // Empty State
          <div className="px-4 lg:px-6 grid gap-6">
            <Card className="border-2 border-dashed">
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-6 max-w-md mx-auto">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-primary/10 p-4">
                      <IconUpload className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No teams yet</h3>
                    <p className="text-muted-foreground">
                      Get started by uploading a CSV file with team information and members or creating your first team manually.
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

                    <Separator />

                    {/* Add Team Manual Button */}
                    <Sheet open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen}>
                      <SheetTrigger asChild>
                        <Button className="w-full gap-2">
                          <IconPlus className="h-4 w-4" />
                          Add Team Manually
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Add Team</SheetTitle>
                          <SheetDescription>
                            Create a new team manually
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Team Name *</label>
                            <Input
                              placeholder="Engineering"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                              placeholder="Software development and infrastructure"
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Manager</label>
                            <Input
                              placeholder="John Smith"
                              value={formData.manager}
                              onChange={(e) =>
                                setFormData({ ...formData, manager: e.target.value })
                              }
                            />
                          </div>

                          <Button onClick={handleAddTeam} className="w-full">
                            Add Team
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Teams List
          <div className="flex flex-col gap-6 flex-1 min-h-0 px-4 lg:px-6">
            {/* Teams Count and Actions */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {teams.length} team{teams.length !== 1 ? 's' : ''}
              </div>
              <Sheet open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen}>
                <SheetTrigger asChild>
                  <Button className="gap-2">
                    <IconPlus className="h-4 w-4" />
                    Add Team
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Add Team</SheetTitle>
                    <SheetDescription>
                      Create a new team
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Team Name *</label>
                      <Input
                        placeholder="Engineering"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        placeholder="Software development and infrastructure"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Manager</label>
                      <Input
                        placeholder="John Smith"
                        value={formData.manager}
                        onChange={(e) =>
                          setFormData({ ...formData, manager: e.target.value })
                        }
                      />
                    </div>

                    <Button onClick={handleAddTeam} className="w-full">
                      Add Team
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Teams Table */}
            <div 
              className="flex-1 flex flex-col min-h-0 overflow-y-auto"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <DataTableTeams
                data={teams}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
