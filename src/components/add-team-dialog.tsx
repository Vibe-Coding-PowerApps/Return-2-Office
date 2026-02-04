import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'

type Team = {
  id: string
  name: string
  description: string
  manager: string
  totalMembers: number
  officeToday: number
  officeThisWeek: number
  members: any[]
}

interface AddTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTeam: (team: Team) => void
}

export function AddTeamDialog({ open, onOpenChange, onAddTeam }: AddTeamDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [manager, setManager] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert('Team name is required')
      return
    }

    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name,
      description,
      manager,
      totalMembers: 0,
      officeToday: 0,
      officeThisWeek: 0,
      members: [],
    }

    onAddTeam(newTeam)
    
    // Reset form
    setName('')
    setDescription('')
    setManager('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Team</DialogTitle>
          <DialogDescription>
            Enter the details for the new team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name *</Label>
            <Input
              id="team-name"
              placeholder="e.g., Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-description">Description</Label>
            <Input
              id="team-description"
              placeholder="e.g., Software development and infrastructure"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-manager">Manager</Label>
            <Input
              id="team-manager"
              placeholder="e.g., John Smith"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Team</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
