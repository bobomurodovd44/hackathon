'use client'

import React, { useEffect, useState, useCallback, useRef } from "react"
import { UserPlus, Search, Loader2, User as UserIcon, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { client } from "@/lib/feathers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

const PAGE_LIMITS = [10, 20, 50]

interface CompanyUsersClientProps {
  companyId: string
  companyName: string
  initialUsers: any[]
  initialTotal: number
}

export function CompanyUsersClient({ 
  companyId, 
  companyName, 
  initialUsers, 
  initialTotal 
}: CompanyUsersClientProps) {
  const [users, setUsers] = useState<any[]>(initialUsers)
  const [total, setTotal] = useState(initialTotal)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isInitialRender = useRef(true)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const query: any = {
        companyId,
        $limit: limit,
        $skip: (page - 1) * limit,
        $sort: { createdAt: -1 }
      }

      if (debouncedSearch) {
        query.$or = [
          { firstName: { $regex: debouncedSearch, $options: "i" } },
          { lastName: { $regex: debouncedSearch, $options: "i" } },
          { email: { $regex: debouncedSearch, $options: "i" } }
        ]
      }

      const result = await client.service("users").find({ query })
      setUsers(result.data)
      setTotal(result.total)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }, [companyId, page, limit, debouncedSearch])

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    fetchUsers()
  }, [page, limit, debouncedSearch, fetchUsers])

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      age: Number(formData.get("age")),
      role: "COMPANY_ADMIN",
      companyId: companyId,
    }

    try {
      await client.service("users").create(data)
      setIsCreateDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Failed to create user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link 
          href="/admin/companies" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          Back to Companies
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{companyName} Users</h1>
            <p className="text-muted-foreground">
              Manage administrators and staff for this company.
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="size-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleCreateUser}>
                <DialogHeader>
                  <DialogTitle>Add New Company User</DialogTitle>
                  <DialogDescription>
                    Create a new account linked to {companyName}.
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup className="py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="firstName">First Name <span className="text-destructive">*</span></FieldLabel>
                      <Input id="firstName" name="firstName" placeholder="John" required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="lastName">Last Name <span className="text-destructive">*</span></FieldLabel>
                      <Input id="lastName" name="lastName" placeholder="Doe" required />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="email">Email <span className="text-destructive">*</span></FieldLabel>
                      <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="password">Password <span className="text-destructive">*</span></FieldLabel>
                      <Input id="password" name="password" type="password" placeholder="••••••••" required />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="age">Age <span className="text-destructive">*</span></FieldLabel>
                      <Input 
                        id="age" 
                        name="age" 
                        type="number" 
                        defaultValue="25" 
                        min="18" 
                        required 
                      />
                    </Field>
                  </div>
                </FieldGroup>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create User
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <Select value={limit.toString()} onValueChange={(v) => {
          setLimit(Number(v))
          setPage(1)
        }}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Limit" />
          </SelectTrigger>
          <SelectContent>
            {PAGE_LIMITS.map(l => (
              <SelectItem key={l} value={l.toString()}>{l} per page</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Age</TableHead>
              <TableHead className="text-right">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading users...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No users found for this company.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <UserIcon className="size-4" />
                      </div>
                      {user.firstName} {user.lastName}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right">{user.age}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) setPage(page - 1)
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink 
                  href="#" 
                  isActive={page === p}
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(p)
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  if (page < totalPages) setPage(page + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
