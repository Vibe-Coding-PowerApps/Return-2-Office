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
import { Label } from '@/ui/label'
import { Input } from '@/ui/input'
import { Upload } from 'lucide-react'

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

interface BulkUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadTeams: (teams: Team[]) => void
}

export function BulkUploadDialog({ open, onOpenChange, onUploadTeams }: BulkUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const parseCSV = (text: string): Team[] => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) {
      alert('CSV must have headers and at least one row')
      return []
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const teams: { [key: string]: Team } = {}

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      
      const row: { [key: string]: string } = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      if (!row.team_name) continue

      if (!teams[row.team_name]) {
        teams[row.team_name] = {
          id: `team_${Date.now()}_${Object.keys(teams).length}`,
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
        teams[row.team_name].members.push({
          id: `m_${Date.now()}_${Math.random()}`,
          name: row.member_name,
          email: row.member_email,
          officeToday: false,
          daysThisWeek: 0,
        })
        teams[row.team_name].totalMembers += 1
      }
    }

    return Object.values(teams)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setFile(files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file')
      return
    }

    setLoading(true)
    try {
      const text = await file.text()
      const teams = parseCSV(text)

      if (teams.length === 0) {
        alert('No teams found in CSV')
        return
      }

      onUploadTeams(teams)
      setFile(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Error parsing CSV:', error)
      alert('Error parsing CSV file. Please check the format.')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `team_name,team_description,manager,member_name,member_email
Engineering,Software development and infrastructure,Sarah Chen,John Smith,john.smith@company.com
Engineering,Software development and infrastructure,Sarah Chen,Emily Chen,emily.chen@company.com
Sales & Business Development,Revenue generation and client relations,James Martinez,Rachel Green,rachel.green@company.com
Operations & HR,Human resources and administration,Patricia Lee,Karen Rodriguez,karen.rodriguez@company.com`

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(template))
    element.setAttribute('download', 'teams_template.csv')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Teams & Members</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple teams and members at once.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>CSV File</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Required columns: team_name, team_description, manager, member_name, member_email
            </p>
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadTemplate}
              className="w-full justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Download(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  )
}
