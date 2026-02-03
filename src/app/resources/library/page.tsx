'use client'

import { useState } from 'react'
import { Button } from '@/ui/button'

type ResourceCard = {
  id: string
  title: string
  description: string
  content: {
    sections: {
      heading: string
      subheadings?: {
        title: string
        content: string
      }[]
      content?: string
    }[]
  }
}

const resources: ResourceCard[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn how to request access, configure your workspace, and onboard new teammates.',
    content: {
      sections: [
        {
          heading: 'Welcome to Return 2 Office',
          content: 'The Return 2 Office initiative is designed to help our organization transition back to a hybrid work model while maintaining the flexibility and work-life balance our employees value. This program provides the tools, resources, and support needed to make your return to the office smooth and productive.',
        },
        {
          heading: 'What is Return 2 Office?',
          subheadings: [
            {
              title: 'Program Overview',
              content: 'Return 2 Office is a structured program that enables employees to work on-site on designated days while maintaining remote work flexibility. It emphasizes collaboration, team building, and access to office resources when needed.',
            },
            {
              title: 'Key Benefits',
              content: 'Enhanced collaboration with team members, access to specialized office equipment and resources, structured team days for better coordination, and the flexibility to work from home when focus is needed.',
            },
            {
              title: 'Flexibility & Balance',
              content: 'The program respects individual preferences and team dynamics. Work with your manager to establish a schedule that works for your role and team requirements.',
            },
          ],
        },
        {
          heading: 'Navigating the Sidebar',
          subheadings: [
            {
              title: 'Dashboard',
              content: 'The main hub showing your key metrics, upcoming schedules, and office utilization overview. Check here daily for your schedule and workspace status.',
            },
            {
              title: 'Workplace Utilization',
              content: 'View detailed analytics about office occupancy, peak hours, and desk availability. Use this to plan your office days around team availability.',
            },
            {
              title: 'Schedules',
              content: 'Manage your work schedule and designate your office days. Coordinate with your team to ensure proper coverage and collaboration.',
            },
            {
              title: 'Team',
              content: 'See your team members, their schedules, and availability. This helps you plan collaborative work sessions and sync-ups.',
            },
            {
              title: 'Resource Library',
              content: 'Find guides, policies, facility information, and support materials. Your go-to place for answers and guidelines.',
            },
          ],
        },
        {
          heading: 'Getting Started Steps',
          subheadings: [
            {
              title: 'Step 1: Complete Your Profile',
              content: 'Update your team information and preferences in your profile settings. This helps the system match you with appropriate resources.',
            },
            {
              title: 'Step 2: Review Policies',
              content: 'Read through the Facility Guidelines and workspace policies. Understanding these ensures a smooth experience for everyone.',
            },
            {
              title: 'Step 3: Coordinate with Your Manager',
              content: 'Discuss your return schedule and office days with your manager. Align on expectations and availability.',
            },
            {
              title: 'Step 4: Book Your Workspace',
              content: 'Use the workspace section to browse floor plans and reserve desks for your office days.',
            },
            {
              title: 'Step 5: Get Familiar',
              content: 'Explore the dashboard and familiarize yourself with all the tools. Check workplace utilization to understand peak times.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'facility-guidelines',
    title: 'Facility Guidelines',
    description: 'Review safety practices, shared space etiquette, and contact information for onsite assistance.',
    content: {
      sections: [
        {
          heading: 'Welcome',
          content: 'Our facility is designed to provide a safe, productive, and collaborative work environment for all employees.',
        },
        {
          heading: 'Safety Practices',
          subheadings: [
            {
              title: 'Emergency Procedures',
              content: 'Familiarize yourself with emergency exits, assembly points, and evacuation procedures. Emergency contacts are posted throughout the facility.',
            },
            {
              title: 'Health & Safety',
              content: 'Report any hazards immediately to facility management. Ergonomic assessments are available upon request.',
            },
            {
              title: 'Parking & Access',
              content: 'Use designated parking areas and badge your access card at entry points. Report lost badges to security immediately.',
            },
          ],
        },
        {
          heading: 'Shared Space Etiquette',
          subheadings: [
            {
              title: 'Conference Rooms',
              content: 'Book rooms through the scheduling system. Keep noise levels low and clean up after meetings.',
            },
            {
              title: 'Kitchen & Break Areas',
              content: 'Clean up after yourself, dispose of food properly, and label items in shared refrigerators with dates.',
            },
            {
              title: 'Quiet Zones',
              content: 'Designated quiet areas are for focused work. Keep conversations brief and at low volume.',
            },
          ],
        },
        {
          heading: 'Contact Information',
          subheadings: [
            {
              title: 'Facility Management',
              content: 'Email: facilities@company.com | Phone: 555-0100 | Available 8AM-6PM weekdays',
            },
            {
              title: 'Security',
              content: 'Email: security@company.com | Phone: 555-0101 | Available 24/7',
            },
            {
              title: 'IT Support',
              content: 'Email: itsupport@company.com | Phone: 555-0102 | Available 8AM-6PM weekdays',
            },
          ],
        },
      ],
    },
  },
]

export default function ResourceLibraryPage() {
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)

  const selectedResource = resources.find(r => r.id === selectedResourceId)

  if (selectedResource) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedResourceId(null)}>
            ← Back to Library
          </Button>
        </div>

        <header>
          <h1 className="text-4xl font-bold tracking-tight">{selectedResource.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            {selectedResource.description}
          </p>
        </header>

        <article className="space-y-8 max-w-4xl">
          {selectedResource.content.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
              
              {section.content && (
                <p className="text-base leading-relaxed text-foreground">
                  {section.content}
                </p>
              )}

              {section.subheadings && (
                <div className="space-y-4 pl-4">
                  {section.subheadings.map((sub, subIdx) => (
                    <div key={subIdx} className="space-y-2">
                      <h3 className="text-lg font-medium">{sub.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {sub.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </article>

        <div className="pt-6 border-t">
          <Button variant="outline" onClick={() => setSelectedResourceId(null)}>
            ← Back to Library
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Resource Library</h1>
        <p className="text-muted-foreground">
          Browse guides, policies, and support materials for the Return 2 Office initiative.
        </p>
      </header>
      <section className="flex flex-wrap gap-4">
        {resources.map((resource) => (
          <article
            key={resource.id}
            className="w-full sm:w-[320px] flex-none rounded-lg border bg-card p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedResourceId(resource.id)}
          >
            <h2 className="text-xl font-medium">{resource.title}</h2>
            <p className="text-sm text-muted-foreground">
              {resource.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  )
}
