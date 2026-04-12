'use client'

import React, { useEffect, useState, useCallback, useRef } from "react"
import { ShieldCheck, Plus, Search, Loader2, Image as ImageIcon, FileUp } from "lucide-react"
import { client } from "@/lib/feathers"
import { useAuth, UserRole } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

interface CompanyTrainingsClientProps {
  companyId: string
  companyName: string
  initialTrainings: any[]
  initialTotal: number
  isPortal?: boolean
}

const SPEC_OPTIONS = [
  { value: 'finance', label: 'Finance' },
  { value: 'sales-department', label: 'Sales Department' },
  { value: 'human-resources', label: 'Human Resources' }
]

export function CompanyTrainingsClient({ 
  companyId, 
  companyName, 
  initialTrainings, 
  initialTotal,
  isPortal = false
}: CompanyTrainingsClientProps) {
  const { user } = useAuth()
  const [trainings, setTrainings] = useState<any[]>(initialTrainings)
  const [total, setTotal] = useState(initialTotal)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchTrainings = useCallback(async () => {
    setIsLoading(true)
    try {
      const query: any = {
        companyId,
        $limit: limit,
        $skip: (page - 1) * limit,
        $sort: { createdAt: -1 }
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      }

      const result = await client.service("trainings").find({ query })
      setTrainings(result.data)
      setTotal(result.total)
    } catch (error) {
      console.error("Error fetching trainings:", error)
    } finally {
      setIsLoading(false)
    }
  }, [companyId, limit, page, search])

  // Initial fetch avoided due to initialTrainings from SSR
  useEffect(() => {
    // Only fetch if we're not on the initial state (e.g., search or page changed)
    if (search || page !== 1 || limit !== 10) {
      const timeout = setTimeout(fetchTrainings, 300)
      return () => clearTimeout(timeout)
    }
  }, [fetchTrainings, search, page, limit])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // In a real environment, we'd use FormData to hit the /uploads service
      // Feathers Client usually handles this if configured, but let's do a direct fetch for reliably
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'}/uploads`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('feathers-jwt') || ''}`
        }
      })

      if (!response.ok) throw new Error('Upload failed')
      
      const result = await response.json()
      setSelectedImageId(result._id)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image")
      setImagePreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddTraining = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedImageId) {
      alert("Please upload an image first")
      return
    }

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      image: selectedImageId,
      spec: formData.get("spec"),
      companyId: companyId,
    }

    try {
      await client.service("trainings").create(data)
      setIsAddDialogOpen(false)
      setSelectedImageId(null)
      setImagePreview(null)
      fetchTrainings()
    } catch (error) {
      console.error("Error creating training:", error)
      alert("Failed to create training. Check console for details.")
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search trainings..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {user?.role !== UserRole.ADMIN && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Training
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleAddTraining}>
                <DialogHeader>
                  <DialogTitle>Add New Training</DialogTitle>
                  <DialogDescription>
                    Create a new training material for {companyName}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="title">Title</FieldLabel>
                      <Input id="title" name="title" placeholder="e.g. Sales Onboarding" required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="description">Description</FieldLabel>
                      <Textarea 
                        id="description" 
                        name="description" 
                        placeholder="What will users learn?" 
                        className="min-h-[100px]"
                        required 
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="spec">Department (Specialization)</FieldLabel>
                        <Select name="spec" defaultValue="sales-department">
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {SPEC_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel>Training Image</FieldLabel>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full gap-2" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
                            {selectedImageId ? "Change Image" : "Upload Image"}
                          </Button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload} 
                          />
                        </div>
                      </Field>
                    </div>
                    {imagePreview && (
                      <div className="mt-2 relative rounded-md overflow-hidden border bg-muted aspect-video flex items-center justify-center">
                        <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                      </div>
                    )}
                  </FieldGroup>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUploading}>Create Training</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading trainings...
                  </div>
                </TableCell>
              </TableRow>
            ) : trainings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No trainings found for this company.
                </TableCell>
              </TableRow>
            ) : (
              trainings.map((training) => (
                <TableRow key={training._id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center overflow-hidden">
                      {training.image_url ? (
                        <img src={training.image_url} alt="" className="object-cover h-full w-full" />
                      ) : (
                        <ImageIcon className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{training.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {training.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {SPEC_OPTIONS.find(o => o.value === training.spec)?.label || training.spec}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {new Date(training.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {trainings.length} of {total} trainings
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1} className="hidden sm:inline-block">
                  <PaginationLink
                    onClick={() => setPage(i + 1)}
                    isActive={page === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
