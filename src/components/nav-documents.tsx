"use client"

import { type Icon } from "@tabler/icons-react"
import { Link, useLocation } from 'react-router-dom'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/ui/sidebar'

export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon?: Icon
  }[]
}) {
  const location = useLocation()

  const isActive = (url: string) => {
    const pathname = location.pathname
    if (pathname === url) {
      return true
    }

    const normalizedUrl = url.endsWith("/") ? url.slice(0, -1) : url
    return pathname.startsWith(`${normalizedUrl}/`)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                tooltip={item.name}
                asChild
                isActive={isActive(item.url)}
                className={isActive(item.url) ? "bg-white dark:bg-neutral-200 text-black dark:text-black hover:bg-white/90 dark:hover:bg-neutral-200/90 hover:text-black dark:hover:text-black" : ""}
              >
                <Link to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
