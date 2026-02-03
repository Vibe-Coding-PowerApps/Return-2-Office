import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from '@/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/ui/card'

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card dark:bg-zinc-900/50">
        <CardHeader>
          <div className="flex flex-col gap-1.5">
            <CardDescription className="text-foreground">Total In Office</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
              1,250
            </CardTitle>
          </div>
          <CardAction>
            <Badge variant="outline" className="text-foreground">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
            Office attendance up this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Compared to last month
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card dark:bg-zinc-900/50">
        <CardHeader>
          <div className="flex flex-col gap-1.5">
            <CardDescription className="text-foreground">Expected Today</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
              1,087
            </CardTitle>
          </div>
          <CardAction>
            <Badge variant="outline" className="text-foreground">
              <IconTrendingDown />
              -12%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
            Lower than average <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Based on schedules
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card dark:bg-zinc-900/50">
        <CardHeader>
          <div className="flex flex-col gap-1.5">
            <CardDescription className="text-foreground">Active Employees</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
              2,450
            </CardTitle>
          </div>
          <CardAction>
            <Badge variant="outline" className="text-foreground">
              <IconTrendingUp />
              +8.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
            Strong office participation <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Exceeding engagement targets</div>
        </CardFooter>
      </Card>
      <Card className="@container/card dark:bg-zinc-900/50">
        <CardHeader>
          <div className="flex flex-col gap-1.5">
            <CardDescription className="text-foreground">Occupancy Rate</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
              67.8%
            </CardTitle>
          </div>
          <CardAction>
            <Badge variant="outline" className="text-foreground">
              <IconTrendingUp />
              +5.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-foreground">
            Steady occupancy increase <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets occupancy targets</div>
        </CardFooter>
      </Card>
    </div>
  )
}
