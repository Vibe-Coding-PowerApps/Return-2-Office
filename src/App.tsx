import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getContext } from '@microsoft/power-apps/app'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/ui/sidebar'

// Page imports
import DashboardPage from './app/dashboard/page'
import WorkplaceUtilizationPage from './app/workplace-utilization/page'
import ResourceLibraryPage from './app/resources/library/page'
import SchedulesPage from './app/schedules/page'

// Placeholder pages for other routes

function TeamPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Team</h1>
        <p className="text-muted-foreground">Coming soon</p>
      </div>
    </div>
  )
}

function AppContent({ userData }: { userData: any }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" userData={userData} />
      <SidebarInset>
        <SiteHeader />
        <Routes>
          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/app/dashboard" element={<DashboardPage />} />
          <Route path="/app/workplace-utilization" element={<WorkplaceUtilizationPage />} />
          <Route path="/app/schedules" element={<SchedulesPage />} />
          <Route path="/app/team" element={<TeamPage />} />
          <Route path="/app/resources/library" element={<ResourceLibraryPage />} />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  )
}

function App() {
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatars/shadcn.jpg",
  })

  useEffect(() => {
    const loadUserContext = async () => {
      try {
        // Only try to load context in Power Apps environment
        if (window.location.host.includes('powerapps.com')) {
          const ctx = await getContext()

          // Get user's basic information
          const fullName = ctx.user.fullName
          const userEmail = ctx.user.userPrincipalName

          if (fullName && userEmail) {
            setUserData({
              name: fullName,
              email: userEmail,
              avatar: "/avatars/shadcn.jpg",
            })
          }
        }
      } catch (error) {
        console.error("Error loading user context:", error)
      }
    }

    loadUserContext()
  }, [])

  return (
    <BrowserRouter>
      <AppContent userData={userData} />
    </BrowserRouter>
  )
}

export default App
