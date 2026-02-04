"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { IconChevronDown, IconChevronUp, IconGripVertical, IconSearch, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react"

import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table"

export type Team = {
  id: string
  name: string
  description: string
  manager: string
  totalMembers: number
  officeToday: number
  officeThisWeek: number
  members?: {
    id: string
    name: string
    email: string
    officeToday: boolean
    daysThisWeek: number
  }[]
}

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const columns: ColumnDef<Team>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    accessorKey: "name",
    header: "Team Name",
    cell: ({ row }) => {
      // This will be handled in the component body to access onTeamClick
      return (
        <span className="font-medium text-sm">{row.original.name}</span>
      )
    },
  },
  {
    accessorKey: "manager",
    header: "Manager",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.manager}</span>
    ),
  },
  {
    accessorKey: "totalMembers",
    header: "Total Members",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-3 py-1.5">
        {row.original.totalMembers} people
      </Badge>
    ),
  },
  {
    accessorKey: "officeToday",
    header: "In Office Today",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
          {row.original.officeToday}
        </Badge>
        <span className="text-xs text-muted-foreground">
          ({Math.round((row.original.totalMembers > 0 ? row.original.officeToday / row.original.totalMembers : 0) * 100)}%)
        </span>
      </div>
    ),
  },
  {
    accessorKey: "officeThisWeek",
    header: "Attendance % This Week",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-muted-foreground">
          {Math.round((row.original.totalMembers > 0 ? row.original.officeThisWeek / row.original.totalMembers : 0) * 100)}%
        </Badge>
      </div>
    ),
  },
]

interface DragRowProps {
  row: any
  onTeamClick?: (team: Team) => void
}

function DragRow({ row, onTeamClick }: DragRowProps) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() && "selected"}
      className={`${isDragging ? "bg-muted" : "hover:bg-muted/50"}`}
    >
      {row.getVisibleCells().map((cell: any) => {
        if (cell.column.id === "name" && onTeamClick) {
          return (
            <TableCell key={cell.id} className="py-4">
              <button
                onClick={() => onTeamClick(row.original)}
                className="font-medium text-sm hover:underline cursor-pointer text-left"
              >
                {row.original.name}
              </button>
            </TableCell>
          )
        }
        return (
          <TableCell key={cell.id} className="py-4">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        )
      })}
    </TableRow>
  )
}

interface DataTableTeamsProps {
  data: Team[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onTeamClick?: (team: Team) => void
}

export function DataTableTeams({
  data: initialData,
  searchQuery,
  onSearchChange,
  onTeamClick,
}: DataTableTeamsProps) {
  const [data, setData] = React.useState(initialData)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      globalFilter: searchQuery,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: onSearchChange,
    onPaginationChange: setPagination,
    globalFilterFn: (row, _columnId, filterValue) => {
      const team = row.original
      return (
        team.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        team.description.toLowerCase().includes(filterValue.toLowerCase()) ||
        team.manager.toLowerCase().includes(filterValue.toLowerCase())
      )
    },
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const activeIndex = data.findIndex((team) => team.id === active.id)
      const overIndex = data.findIndex((team) => team.id === over.id)

      if (activeIndex !== -1 && overIndex !== -1) {
        const newData = arrayMove(data, activeIndex, overIndex)
        setData(newData)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-hidden rounded-lg border flex-1 overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b hover:bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-12">
                      {header.isPlaceholder ? null : header.id === "drag" ? null : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 px-0"
                          onClick={() =>
                            header.column.toggleSorting(
                              header.column.getIsSorted() === "asc"
                            )
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() ? (
                            header.column.getIsSorted() === "asc" ? (
                              <IconChevronUp className="size-4" />
                            ) : (
                              <IconChevronDown className="size-4" />
                            )
                          ) : null}
                        </Button>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <SortableContext
                items={table.getRowModel().rows.map((row: any) => row.original.id)}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row: any) => (
                    <DragRow key={row.id} row={row} onTeamClick={onTeamClick} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No teams found
                    </TableCell>
                  </TableRow>
                )}
              </SortableContext>
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4 py-4 border-t bg-background">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium text-foreground">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="h-8 w-20 text-foreground" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium text-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="text-foreground" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="text-foreground" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="text-foreground" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight className="text-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  )
}

