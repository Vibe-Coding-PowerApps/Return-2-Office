"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/ui/toggle-group"

export const description = "Peak hours by time range"

// Hourly data for this week (average across the week) - LOW occupancy, peak at 11 AM
const weekData = [
  { hour: "6 AM", peak: 15, average: 8 },
  { hour: "7 AM", peak: 28, average: 15 },
  { hour: "8 AM", peak: 42, average: 22 },
  { hour: "9 AM", peak: 58, average: 30 },
  { hour: "10 AM", peak: 72, average: 38 },
  { hour: "11 AM", peak: 95, average: 50 },
  { hour: "12 PM", peak: 85, average: 45 },
  { hour: "1 PM", peak: 65, average: 35 },
  { hour: "2 PM", peak: 52, average: 28 },
  { hour: "3 PM", peak: 38, average: 20 },
  { hour: "4 PM", peak: 25, average: 13 },
  { hour: "5 PM", peak: 15, average: 8 },
  { hour: "6 PM", peak: 8, average: 4 },
]

// Hourly data for last 30 days (average across the month) - MEDIUM occupancy, peak at 12 PM
const monthData = [
  { hour: "6 AM", peak: 45, average: 25 },
  { hour: "7 AM", peak: 85, average: 48 },
  { hour: "8 AM", peak: 135, average: 78 },
  { hour: "9 AM", peak: 175, average: 105 },
  { hour: "10 AM", peak: 210, average: 130 },
  { hour: "11 AM", peak: 240, average: 150 },
  { hour: "12 PM", peak: 280, average: 175 },
  { hour: "1 PM", peak: 250, average: 160 },
  { hour: "2 PM", peak: 200, average: 125 },
  { hour: "3 PM", peak: 145, average: 90 },
  { hour: "4 PM", peak: 95, average: 60 },
  { hour: "5 PM", peak: 55, average: 35 },
  { hour: "6 PM", peak: 25, average: 15 },
]

// Hourly data for last 3 months (average across the quarter) - HIGH occupancy, peak at 10 AM
const quarterData = [
  { hour: "6 AM", peak: 90, average: 50 },
  { hour: "7 AM", peak: 165, average: 95 },
  { hour: "8 AM", peak: 250, average: 150 },
  { hour: "9 AM", peak: 320, average: 195 },
  { hour: "10 AM", peak: 380, average: 240 },
  { hour: "11 AM", peak: 350, average: 225 },
  { hour: "12 PM", peak: 320, average: 205 },
  { hour: "1 PM", peak: 280, average: 180 },
  { hour: "2 PM", peak: 240, average: 155 },
  { hour: "3 PM", peak: 190, average: 125 },
  { hour: "4 PM", peak: 140, average: 90 },
  { hour: "5 PM", peak: 85, average: 55 },
  { hour: "6 PM", peak: 40, average: 25 },
]

const chartConfig = {
  peak: {
    label: "Peak Occupancy",
    color: "hsl(var(--primary))",
  },
  average: {
    label: "Average Occupancy",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

// Function to filter data by time period
const filterDataByTimePeriod = (data: typeof weekData, timePeriod: string) => {
  if (timePeriod === "morning") {
    // 6:00 AM - 12:00 PM (indices 0-6)
    return data.slice(0, 7)
  } else if (timePeriod === "afternoon") {
    // 12:00 PM - 6:00 PM (indices 6-12)
    return data.slice(6, 13)
  } else {
    // "current" - show full day from 6 AM to 6 PM
    return data
  }
}

interface ChartAreaInteractiveHourlyProps {
  selectedFloor?: number
  selectedTime?: string
}

export function ChartAreaInteractiveHourly({ selectedFloor = 1, selectedTime = "current" }: ChartAreaInteractiveHourlyProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("week")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("month")
    }
  }, [isMobile])

  // Force chart to re-render when selectedFloor or selectedTime changes
  React.useEffect(() => {
    // This effect ensures the component updates when parent props change
  }, [selectedFloor, selectedTime])

  const rawChartData = React.useMemo(() => {
    if (timeRange === "month") {
      return monthData
    }
    if (timeRange === "quarter") {
      return quarterData
    }
    return weekData
  }, [timeRange])

  const chartData = React.useMemo(() => {
    return filterDataByTimePeriod(rawChartData, selectedTime || "current")
  }, [rawChartData, selectedTime, selectedFloor])

  const getDataKey = () => {
    return "hour"
  }

  return (
    <Card className="@container/card dark:bg-zinc-900/50">
      <CardHeader>
        <div className="space-y-1.5">
          <CardTitle>Peak Hours by Period</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Floor {selectedFloor} • {selectedTime === 'current' ? 'Current time' : selectedTime === 'morning' ? '6:00 AM - 12:00 PM' : '12:00 PM - 6:00 PM'} • Maximum and average desk occupancy
            </span>
            <span className="@[540px]/card:hidden">Occupancy trends</span>
          </CardDescription>
        </div>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            className="hidden @[767px]/card:flex"
          >
            <ToggleGroupItem value="week">This Week</ToggleGroupItem>
            <ToggleGroupItem value="month">Last 30 Days</ToggleGroupItem>
            <ToggleGroupItem value="quarter">Last 3 Months</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="h-8 w-40 @[767px]/card:hidden"
              aria-label="Select a value"
            >
              <SelectValue placeholder="This Week" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="week" className="rounded-lg">
                This Week
              </SelectItem>
              <SelectItem value="month" className="rounded-lg">
                Last 30 Days
              </SelectItem>
              <SelectItem value="quarter" className="rounded-lg">
                Last 3 Months
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 40,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={getDataKey()}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillPeak" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillAverage" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="average"
              type="natural"
              fill="url(#fillAverage)"
              fillOpacity={0.4}
              stroke="hsl(var(--primary))"
              stackId="a"
            />
            <Area
              dataKey="peak"
              type="natural"
              fill="url(#fillPeak)"
              fillOpacity={0.4}
              stroke="hsl(var(--primary))"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Peak occupancy trending <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing maximum availability patterns
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
