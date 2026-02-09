"use client"

import * as React from "react"
import { Link } from 'react-router-dom'
import {
  IconCamera,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFolder,
  IconBuildingSkyscraper,
  IconListDetails,
  IconUsers,
} from "@tabler/icons-react"
import { LayoutDashboard } from "lucide-react"

import { NavDocuments } from '@/components/nav-documents'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/ui/sidebar'

const data = {
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/app/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Workplace Utilization",
      url: "/app/workplace-utilization",
      icon: IconListDetails,
    },
    {
      title: "Schedules",
      url: "/app/schedules",
      icon: IconFolder,
    },
    {
      title: "Team",
      url: "/app/team",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Workspace",
      icon: IconCamera,
      isActive: true,
      url: "/app/workspace",
      items: [
        {
          title: "Floor Plans",
          url: "/app/workspace/floor-plans",
        },
        {
          title: "Desk Bookings",
          url: "/app/workspace/bookings",
        },
      ],
    },
    {
      title: "Policy",
      icon: IconFileDescription,
      url: "/app/policy",
      items: [
        {
          title: "RTO Policy",
          url: "/app/policy/rto",
        },
        {
          title: "Guidelines",
          url: "/app/policy/guidelines",
        },
      ],
    },
    {
      title: "Resources",
      icon: IconFileAi,
      url: "/app/resources",
      items: [
        {
          title: "Office Facilities",
          url: "/app/resources/facilities",
        },
        {
          title: "Equipment",
          url: "/app/resources/equipment",
        },
      ],
    },
  ],
  navSecondary: [],
  documents: [
    {
      name: "Resource Library",
      url: "/app/resources/library",
      icon: IconDatabase,
    },
  ],
}

export function AppSidebar({ userData, ...props }: React.ComponentProps<typeof Sidebar> & {
  userData?: {
    name: string
    email: string
    avatar: string
  }
}) {
  const user = userData || data.user
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="mb-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
            >
              <Link to="/app/dashboard">
                <IconBuildingSkyscraper className="!size-5" />
                <span className="text-base font-semibold">Return to Office</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
