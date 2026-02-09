import { Separator } from '@/ui/separator'
import { SidebarTrigger } from '@/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { useLocation } from 'react-router-dom'

const TAB_LABELS: { [key: string]: string } = {
  '/app/dashboard': 'Dashboard',
  '/app/workplace-utilization': 'Workplace Utilization',
  '/app/schedules': 'Schedules',
  '/app/team': 'Team',
  '/app/resources/library': 'Resource Library',
}

export function SiteHeader() {
  const location = useLocation();
  const pathname = location.pathname;

  // Find the best matching tab label
  let activeLabel = 'Workplace Hub';
  for (const route in TAB_LABELS) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      activeLabel = TAB_LABELS[route];
      break;
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) py-2">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 text-foreground" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium text-foreground">{activeLabel}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
