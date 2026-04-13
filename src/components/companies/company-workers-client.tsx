'use client'

import React, { useEffect, useState, useCallback, useRef } from "react"
import {
  UserPlus, Search, Loader2, User as UserIcon, ArrowLeft, Trash2, AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { client } from "@/lib/feathers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"

const PAGE_LIMITS = [10, 20, 50]

interface CompanyWorkersClientProps {
  companyId: string
  companyName: string
  initialWorkers: any[]
  initialTotal: number
}

export function CompanyWorkersClient({
  companyId,
  companyName,
  initialWorkers,
  initialTotal,
}: CompanyWorkersClientProps) {
  const [workers, setWorkers] = useState<any[]>(initialWorkers)
  const [total, setTotal] = useState(initialTotal)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const isInitialRender = useRef(true)

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchWorkers = useCallback(async () => {
    setIsLoading(true)
    try {
      const query: any = {
        companyId,
        role: 'WORKER',
        $limit: limit,
        $skip: (page - 1) * limit,
        $sort: { createdAt: -1 },
      }
      if (debouncedSearch) {
        query.$or = [
          { firstName: { $regex: debouncedSearch, $options: 'i' } },
          { lastName: { $regex: debouncedSearch, $options: 'i' } },
          { email: { $regex: debouncedSearch, $options: 'i' } },
        ]
      }
      const result = await client.service('users').find({ query })
      setWorkers(result.data)
      setTotal(result.total)
    } catch (err) {
      console.error('Error fetching workers:', err)
    } finally {
      setIsLoading(false)
    }
  }, [companyId, page, limit, debouncedSearch])

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (isInitialRender.current) { isInitialRender.current = false; return }
    fetchWorkers()
  }, [page, limit, debouncedSearch, fetchWorkers])

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)
    const fd = new FormData(e.currentTarget)
    try {
      await client.service('users').create({
        firstName: fd.get('firstName'),
        lastName: fd.get('lastName'),
        email: fd.get('email'),
        password: fd.get('password'),
        age: Number(fd.get('age')),
        jobTitle: fd.get('jobTitle') || undefined,
        role: 'WORKER',
        companyId,
      })
      setIsCreateOpen(false)
      fetchWorkers()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create employee.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await client.service('users').remove(deleteTarget._id)
      setDeleteTarget(null)
      fetchWorkers()
    } catch (err: any) {
      alert(err.message || 'Failed to delete employee.')
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <Link
          href="/company"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">
              Manage employee accounts for <span className="font-medium text-foreground">{companyName}</span>.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={v => { setIsCreateOpen(v); setFormError(null) }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="size-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Create a new employee account linked to {companyName}.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                      <Input id="firstName" name="firstName" placeholder="John" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                      <Input id="lastName" name="lastName" placeholder="Doe" required />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" name="jobTitle" placeholder="e.g. Warehouse Operator" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                      <Input id="email" name="email" type="email" placeholder="john@company.com" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="age">Age <span className="text-destructive">*</span></Label>
                      <Input id="age" name="age" type="number" defaultValue="25" min="18" max="100" required />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                    <Input id="password" name="password" type="password" placeholder="Min 6 characters" required minLength={6} />
                  </div>

                  {formError && (
                    <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {formError}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Employee
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Search + limit ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            className="pl-10"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select value={limit.toString()} onValueChange={v => { setLimit(Number(v)); setPage(1) }}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent>
            {PAGE_LIMITS.map(l => (
              <SelectItem key={l} value={l.toString()}>{l} per page</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead className="text-right">Age</TableHead>
              <TableHead className="text-right">Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading employees…
                  </div>
                </TableCell>
              </TableRow>
            ) : workers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No employees found. Add your first employee above!
                </TableCell>
              </TableRow>
            ) : (
              workers.map(w => (
                <TableRow key={w._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {w.firstName?.[0]}{w.lastName?.[0]}
                      </div>
                      {w.firstName} {w.lastName}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{w.email}</TableCell>
                  <TableCell>
                    {w.jobTitle
                      ? <Badge variant="secondary">{w.jobTitle}</Badge>
                      : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-right">{w.age}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => setDeleteTarget(w)}
                      className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                      aria-label="Delete employee"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={e => { e.preventDefault(); if (page > 1) setPage(page - 1) }} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PaginationItem key={p}>
                <PaginationLink href="#" isActive={page === p} onClick={e => { e.preventDefault(); setPage(p) }}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={e => { e.preventDefault(); if (page < totalPages) setPage(page + 1) }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
