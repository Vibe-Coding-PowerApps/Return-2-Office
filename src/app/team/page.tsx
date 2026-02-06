'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction, CardFooter } from '@/ui/card'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/ui/sheet'
import { Separator } from '@/ui/separator'
import { IconUpload, IconPlus, IconFile, IconDownload, IconTrendingUp } from '@tabler/icons-react'
import { Badge } from '@/ui/badge'
import { DataTableMembers } from '@/components/data-table-members'

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
  members?: TeamMember[]
}

export default function TeamPage() {
  // Single team for the signed-in team lead
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAddMemberDrawerOpen, setIsAddMemberDrawerOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [drawerError, setDrawerError] = useState<string | null>(null)
  const [editDrawerError, setEditDrawerError] = useState<string | null>(null)

  // Manual add member form state
  const [formData, setFormData] = useState({
    memberName: '',
    memberEmail: '',
  })

  // Edit member form state
  const [editFormData, setEditFormData] = useState({
    memberName: '',
    memberEmail: '',
  })

  // Helper function to check if member email already exists
  const isDuplicateEmail = (email: string, excludeId?: string) => {
    if (!currentTeam?.members) return false
    return currentTeam.members.some(member => 
      member.email.toLowerCase() === email.toLowerCase() && member.id !== excludeId
    )
  }

  // Initialize with a default team (in real app, this would come from auth/context)
  const initializeTeam = () => {
    if (!currentTeam) {
      setCurrentTeam({
        id: 'team_current',
        name: 'My Team',
        description: 'My team members',
        manager: 'Team Lead Name',
        totalMembers: 0,
        officeToday: 0,
        officeThisWeek: 0,
        members: [],
      })
    }
  }

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

  const parseTeamCSV = (text: string): TeamMember[] => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) {
      setUploadError('CSV must have headers and at least one row')
      return []
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const members: TeamMember[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      
      const row: { [key: string]: string } = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      if (!row.member_name || !row.member_email) continue

      members.push({
        id: `m_${Date.now()}_${Math.random()}`,
        name: row.member_name,
        email: row.member_email,
        officeToday: false,
        daysThisWeek: 0,
      })
    }

    return members
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadError('Please upload a CSV file')
      return
    }

    try {
      const text = await file.text()
      const members = parseTeamCSV(text)

      if (members.length === 0) {
        setUploadError('No valid members found in the CSV file')
        return
      }

      // Filter out duplicates from CSV
      const existingEmails = currentTeam?.members?.map(m => m.email.toLowerCase()) || []
      const uniqueMembers = members.filter(member => {
        const isDuplicate = existingEmails.includes(member.email.toLowerCase())
        return !isDuplicate
      })

      if (uniqueMembers.length === 0) {
        setUploadError('All members from the CSV already exist in the team')
        return
      }

      if (uniqueMembers.length < members.length) {
        const duplicateCount = members.length - uniqueMembers.length
        setUploadSuccess(
          `Successfully imported ${uniqueMembers.length} member${uniqueMembers.length !== 1 ? 's' : ''} (${duplicateCount} duplicate${duplicateCount !== 1 ? 's' : ''} skipped)`
        )
      } else {
        setUploadSuccess(`Successfully imported ${uniqueMembers.length} member${uniqueMembers.length !== 1 ? 's' : ''}`)
      }

      setUploadError(null)

      // Update current team with new unique members (initialize if needed)
      setCurrentTeam(prev => {
        if (!prev) {
          return {
            id: 'team_current',
            name: 'My Team',
            description: 'My team members',
            manager: 'Team Lead Name',
            totalMembers: uniqueMembers.length,
            officeToday: 0,
            officeThisWeek: 0,
            members: uniqueMembers,
          }
        }

        return {
          ...prev,
          members: [...(prev.members || []), ...uniqueMembers],
          totalMembers: (prev.totalMembers || 0) + uniqueMembers.length,
        }
      })

      // Clear success message after 5 seconds
      setTimeout(() => setUploadSuccess(null), 5000)
    } catch (error) {
      console.error('Error parsing CSV:', error)
      setUploadError('Error parsing CSV file. Please check the format.')
    }
  }

  const handleAddMember = () => {
    if (!formData.memberName.trim() || !formData.memberEmail.trim()) {
      setDrawerError('Member name and email are required')
      return
    }

    // Check for duplicate email
    if (isDuplicateEmail(formData.memberEmail)) {
      setDrawerError(`${formData.memberName} (${formData.memberEmail}) already exists in your team`)
      return
    }

    const newMember: TeamMember = {
      id: `m_${Date.now()}`,
      name: formData.memberName,
      email: formData.memberEmail,
      officeToday: false,
      daysThisWeek: 0,
    }

    setCurrentTeam(prev => {
      // If no current team, initialize it with the new member
      if (!prev) {
        return {
          id: 'team_current',
          name: 'My Team',
          description: 'My team members',
          manager: 'Team Lead Name',
          totalMembers: 1,
          officeToday: 0,
          officeThisWeek: 0,
          members: [newMember],
        }
      }
      
      // Add member to existing team
      return {
        ...prev,
        members: [...(prev.members || []), newMember],
        totalMembers: (prev.totalMembers || 0) + 1,
      }
    })

    setFormData({ memberName: '', memberEmail: '' })
    setDrawerError(null)
    setIsAddMemberDrawerOpen(false)
    setUploadSuccess('Member added successfully')
    setTimeout(() => setUploadSuccess(null), 5000)
  }

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member)
    setEditFormData({
      memberName: member.name,
      memberEmail: member.email,
    })
  }

  const handleUpdateMember = () => {
    if (!editFormData.memberName.trim() || !editFormData.memberEmail.trim()) {
      setEditDrawerError('Member name and email are required')
      return
    }

    if (!editingMember) return

    // Check for duplicate email (excluding current member)
    if (isDuplicateEmail(editFormData.memberEmail, editingMember.id)) {
      setEditDrawerError('A team member with this email already exists')
      return
    }

    setCurrentTeam(prev => {
      if (!prev) return prev
      return {
        ...prev,
        members: prev.members?.map(member => 
          member.id === editingMember.id 
            ? { ...member, name: editFormData.memberName, email: editFormData.memberEmail }
            : member
        ) || [],
      }
    })

    setEditingMember(null)
    setEditFormData({ memberName: '', memberEmail: '' })
    setEditDrawerError(null)
    setUploadSuccess('Member updated successfully')
    setTimeout(() => setUploadSuccess(null), 5000)
  }

  const handleCopyMember = (member: TeamMember) => {
    // Generate a unique email by appending timestamp
    const timestamp = Date.now()
    const emailParts = member.email.split('@')
    const uniqueEmail = emailParts.length === 2 
      ? `${emailParts[0]}_copy_${timestamp}@${emailParts[1]}`
      : `${member.email}_copy_${timestamp}`

    const newMember: TeamMember = {
      id: `m_${timestamp}`,
      name: `${member.name} (Copy)`,
      email: uniqueEmail,
      officeToday: member.officeToday,
      daysThisWeek: member.daysThisWeek,
    }

    setCurrentTeam(prev => {
      if (!prev) return prev
      return {
        ...prev,
        members: [...(prev.members || []), newMember],
        totalMembers: (prev.totalMembers || 0) + 1,
      }
    })

    setUploadSuccess('Member copied successfully')
    setTimeout(() => setUploadSuccess(null), 5000)
  }

  const handleFavoriteMember = (member: TeamMember) => {
    setUploadSuccess(`${member.name} added to favorites`)
    setTimeout(() => setUploadSuccess(null), 5000)
  }

  const handleDeleteMember = (memberId: string) => {
    setCurrentTeam(prev => {
      if (!prev) return prev
      const memberToDelete = prev.members?.find(m => m.id === memberId)
      return {
        ...prev,
        members: prev.members?.filter(member => member.id !== memberId) || [],
        totalMembers: Math.max(0, (prev.totalMembers || 0) - 1),
      }
    })

    const memberToDelete = currentTeam?.members?.find(m => m.id === memberId)
    setUploadSuccess(`${memberToDelete?.name || 'Member'} deleted successfully`)
    setTimeout(() => setUploadSuccess(null), 5000)
  }

  const downloadTemplate = () => {
    const template = `member_name,member_email
John Smith,john.smith@company.com
Emily Chen,emily.chen@company.com
Rachel Green,rachel.green@company.com
Karen Rodriguez,karen.rodriguez@company.com`

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'team-members-template.csv')
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="@container/main flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto py-4 md:gap-6 md:py-6">
        {/* Header */}
        <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground mt-2">
            Manage team members and office attendance
          </p>
        </div>
        <div className="flex gap-2">
          {/* Add Member Button */}
          <Sheet open={isAddMemberDrawerOpen} onOpenChange={(open) => {
            setIsAddMemberDrawerOpen(open)
            if (!open) setDrawerError(null)
          }}>
            <SheetTrigger asChild>
              <Button className="gap-2">
                <IconPlus className="h-4 w-4" />
                Add Member
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add Team Member</SheetTitle>
                <SheetDescription>
                  Add a new member to your team
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {drawerError && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
                    {drawerError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Member Name *</label>
                  <Input
                    placeholder="John Smith"
                    value={formData.memberName}
                    onChange={(e) =>
                      setFormData({ ...formData, memberName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Member Email *</label>
                  <Input
                    placeholder="john.smith@company.com"
                    value={formData.memberEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, memberEmail: e.target.value })
                    }
                  />
                </div>

                <Button 
                  onClick={(e) => {
                    e.preventDefault()
                    handleAddMember()
                  }} 
                  className="w-full"
                >
                  Add Member
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        </div>

      {/* Team Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card dark:bg-zinc-900/50">
          <CardHeader>
            <div className="flex flex-col gap-1.5">
              <CardDescription className="text-foreground">In Office Today</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
                {currentTeam?.officeToday ?? 0}
              </CardTitle>
            </div>
            <CardAction>
              <Badge variant="outline" className="text-foreground">
                <IconTrendingUp className="h-4 w-4" />
                +0%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
              Office attendance active <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              {currentTeam ? `of ${currentTeam.totalMembers} members` : 'Load team to see details'}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card dark:bg-zinc-900/50">
          <CardHeader>
            <div className="flex flex-col gap-1.5">
              <CardDescription className="text-foreground">Occupancy Rate</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
                {currentTeam && currentTeam.totalMembers > 0 ? Math.round((currentTeam.officeToday / currentTeam.totalMembers) * 100) : 0}%
              </CardTitle>
            </div>
            <CardAction>
              <Badge variant="outline" className="text-foreground">
                <IconTrendingUp className="h-4 w-4" />
                +0%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
              Team occupancy tracking <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              {currentTeam ? 'Based on current schedules' : 'No team data available'}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card dark:bg-zinc-900/50">
          <CardHeader>
            <div className="flex flex-col gap-1.5">
              <CardDescription className="text-foreground">Weekly Average</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
                {currentTeam && currentTeam.totalMembers > 0 ? Math.round((currentTeam.officeThisWeek / currentTeam.totalMembers) * 100) : 0}%
              </CardTitle>
            </div>
            <CardAction>
              <Badge variant="outline" className="text-foreground">
                <IconTrendingUp className="h-4 w-4" />
                +0%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
              Weekly attendance patterns <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              {currentTeam ? 'This week' : 'Awaiting team information'}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card dark:bg-zinc-900/50">
          <CardHeader>
            <div className="flex flex-col gap-1.5">
              <CardDescription className="text-foreground">Total Members</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
                {currentTeam?.totalMembers ?? 0}
              </CardTitle>
            </div>
            <CardAction>
              <Badge variant="outline" className="text-foreground">
                <IconTrendingUp className="h-4 w-4" />
                +0%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
              Team size overview <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              {currentTeam ? 'Active members' : 'Team size pending'}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Alerts */}
      {uploadError && (
        <div className="px-4 lg:px-6">
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
            {uploadError}
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div className="px-4 lg:px-6">
          <div className="rounded-lg bg-green-100 border border-green-300 dark:bg-green-900/20 dark:border-green-800 p-4 text-sm text-green-800 dark:text-green-200">
            {uploadSuccess}
          </div>
        </div>
      )}

      {/* Main Content */}
      {!currentTeam ? (
        // Empty State - Initialize Team
        <div className="px-4 lg:px-6">
          <Card className="border-2 border-dashed">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6 max-w-md mx-auto">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <IconUpload className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Add team members</h3>
                  <p className="text-muted-foreground">
                    Get started by uploading a CSV file with your team members or add them manually.
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
                      className="hidden"
                      id="csv-upload-empty"
                    />
                    <label
                      htmlFor="csv-upload-empty"
                      className="cursor-pointer flex flex-col gap-2 items-center"
                    >
                      <IconFile className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm">
                        Drag and drop your CSV file here, or click to select
                      </span>
                    </label>
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
        // Team Loaded - Show Member Details
        <div className="px-4 lg:px-6 flex-1 flex flex-col min-h-0">
          {/* Team Members Table */}
          {currentTeam.members && currentTeam.members.length > 0 ? (
            <>
              <DataTableMembers
                data={currentTeam.members}
                onEditMember={handleEditMember}
                onCopyMember={handleCopyMember}
                onFavoriteMember={handleFavoriteMember}
                onDeleteMember={handleDeleteMember}
              />
              
              {/* Edit Member Sheet */}
              <Sheet open={!!editingMember} onOpenChange={(open) => {
                if (!open) {
                  setEditingMember(null)
                  setEditDrawerError(null)
                }
              }}>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Edit Team Member</SheetTitle>
                    <SheetDescription>
                      Update member information
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {editDrawerError && (
                      <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
                        {editDrawerError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Member Name *</label>
                      <Input
                        placeholder="John Smith"
                        value={editFormData.memberName}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, memberName: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Member Email *</label>
                      <Input
                        placeholder="john.smith@company.com"
                        value={editFormData.memberEmail}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, memberEmail: e.target.value })
                        }
                      />
                    </div>

                    <Button onClick={handleUpdateMember} className="w-full">
                      Update Member
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-3">
                  <p className="text-muted-foreground">No team members yet</p>
                  <p className="text-sm text-muted-foreground">Upload a CSV file or add members manually to get started</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      </div>
    </div>
  )
}
