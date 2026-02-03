"use client"

import { type Icon } from "@tabler/icons-react"
import { Link, useLocation } from 'react-router-dom'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/ui/sidebar'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const location = useLocation()

  const isItemActive = (url: string) => {
    const pathname = location.pathname
    if (pathname === url) {
      return true
    }

    const normalizedUrl = url.endsWith("/") ? url.slice(0, -1) : url
    return pathname.startsWith(`${normalizedUrl}/`)
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2 px-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isItemActive(item.url)}
                className={isItemActive(item.url) ? "bg-white dark:bg-neutral-200 text-black dark:text-black hover:bg-white/90 dark:hover:bg-neutral-200/90 hover:text-black dark:hover:text-black" : ""}
              >
                <Link to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
