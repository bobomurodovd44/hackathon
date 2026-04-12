'use client'

import React, { useEffect, useState, useCallback, useRef } from "react"
import { Plus, Search, Loader2, Image as ImageIcon, FileUp, Pencil } from "lucide-react"
import { client } from "@/lib/feathers"
import api from "@/lib/api"
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

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' }
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Edit Form State
  const [editingTraining, setEditingTraining] = useState<any | null>(null)
  const [editFormTitle, setEditFormTitle] = useState("")
  const [editFormDescription, setEditFormDescription] = useState("")
  const [editFormSpec, setEditFormSpec] = useState("sales-department")
  const [editFormStatus, setEditFormStatus] = useState("active")
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [isEditUploading, setIsEditUploading] = useState(false)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Controlled form state to survive async operations
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formSpec, setFormSpec] = useState("sales-department")
  const [formStatus, setFormStatus] = useState("active")

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.")
      return
    }

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAddTraining = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile) {
      alert("Please select an image first")
      return
    }

    // Capture form values BEFORE any await — React nullifies e.currentTarget after async
    const title = formTitle
    const description = formDescription
    const spec = formSpec
    const status = formStatus

    setIsUploading(true)
    let imageId = null

    try {
      // 1. Upload the image using the axios instance (reads JWT from cookie automatically)
      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile)

      const uploadResponse = await api.post('/uploads', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      imageId = uploadResponse.data._id

      // 2. Create the training record using captured values
      await client.service("trainings").create({
        title,
        description,
        image: imageId,
        spec,
        status,
        companyId,
      })

      setIsAddDialogOpen(false)
      setSelectedFile(null)
      setImagePreview(null)
      setFormTitle("")
      setFormDescription("")
      setFormSpec("sales-department")
      setFormStatus("active")
      fetchTrainings()
    } catch (error) {
      console.error("Error creating training:", error)
      alert("Failed to create training. Check console for details.")
    } finally {
      setIsUploading(false)
    }
  }

  const openEditDialog = (training: any) => {
    setEditingTraining(training)
    setEditFormTitle(training.title)
    setEditFormDescription(training.description)
    setEditFormSpec(training.spec || "sales-department")
    setEditFormStatus(training.status || "active")
    setEditSelectedFile(null)
    setEditImagePreview(training.image_url || null)
  }

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.")
      return
    }
    setEditSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setEditImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleEditTraining = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTraining) return

    const title = editFormTitle
    const description = editFormDescription
    const spec = editFormSpec
    const status = editFormStatus

    setIsEditUploading(true)
    try {
      let imageId = editingTraining.image
      if (editSelectedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', editSelectedFile)
        const uploadResponse = await api.post('/uploads', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        imageId = uploadResponse.data._id
      }

      await client.service("trainings").patch(editingTraining._id, {
        title,
        description,
        image: imageId,
        spec,
        status
      })

      setEditingTraining(null)
      fetchTrainings()
    } catch (error) {
      console.error("Error creating training:", error)
      alert("Failed to update training.")
    } finally {
      setIsEditUploading(false)
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
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <form onSubmit={handleAddTraining} className="flex flex-col flex-1 overflow-hidden">
                <DialogHeader className="shrink-0">
                  <DialogTitle>Add New Training</DialogTitle>
                  <DialogDescription>
                    Create a new training material for {companyName}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 overflow-y-auto flex-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="title">Title <span className="text-destructive">*</span></FieldLabel>
                      <Input 
                        id="title" 
                        name="title" 
                        placeholder="e.g. Sales Onboarding" 
                        required 
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="description">Description <span className="text-destructive">*</span></FieldLabel>
                      <Textarea 
                        id="description" 
                        name="description" 
                        placeholder="What will users learn?" 
                        className="min-h-[100px]"
                        required 
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="spec">Department (Specialization) <span className="text-destructive">*</span></FieldLabel>
                        <Select name="spec" value={formSpec} onValueChange={setFormSpec}>
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
                        <FieldLabel htmlFor="status">Status <span className="text-destructive">*</span></FieldLabel>
                        <Select name="status" value={formStatus} onValueChange={setFormStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <Field>
                        <FieldLabel>Training Image <span className="text-destructive">*</span></FieldLabel>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full gap-2" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
                            {selectedFile ? "Change Image" : "Upload Image"}
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
                <DialogFooter className="shrink-0 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUploading}>Create Training</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {user?.role !== UserRole.ADMIN && (
          <Dialog open={!!editingTraining} onOpenChange={(open) => !open && setEditingTraining(null)}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <form onSubmit={handleEditTraining} className="flex flex-col flex-1 overflow-hidden">
                <DialogHeader className="shrink-0">
                  <DialogTitle>Edit Training</DialogTitle>
                  <DialogDescription>Make changes to the training material.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 overflow-y-auto flex-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="edit-title">Title <span className="text-destructive">*</span></FieldLabel>
                      <Input
                        id="edit-title"
                        required
                        value={editFormTitle}
                        onChange={(e) => setEditFormTitle(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="edit-description">Description <span className="text-destructive">*</span></FieldLabel>
                      <Textarea
                        id="edit-description"
                        className="min-h-[100px]"
                        required
                        value={editFormDescription}
                        onChange={(e) => setEditFormDescription(e.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Department <span className="text-destructive">*</span></FieldLabel>
                        <Select value={editFormSpec} onValueChange={setEditFormSpec}>
                          <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                          <SelectContent>
                            {SPEC_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel>Status <span className="text-destructive">*</span></FieldLabel>
                        <Select value={editFormStatus} onValueChange={setEditFormStatus}>
                          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <Field>
                        <FieldLabel>Training Image</FieldLabel>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => editFileInputRef.current?.click()}
                            disabled={isEditUploading}
                          >
                            {isEditUploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
                            Change Image
                          </Button>
                          <input
                            type="file"
                            ref={editFileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleEditImageUpload}
                          />
                        </div>
                      </Field>
                    </div>
                    {editImagePreview && (
                      <div className="mt-2 relative rounded-md overflow-hidden border bg-muted aspect-video flex items-center justify-center">
                        <img src={editImagePreview} alt="Preview" className="object-cover w-full h-full" />
                      </div>
                    )}
                  </FieldGroup>
                </div>
                <DialogFooter className="shrink-0 pt-4">
                  <Button type="button" variant="outline" onClick={() => setEditingTraining(null)}>Cancel</Button>
                  <Button type="submit" disabled={isEditUploading}>Save Changes</Button>
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Created At</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
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
                  <TableCell>
                    <Badge variant={training.status === 'active' ? 'default' : 'secondary'}>
                      {STATUS_OPTIONS.find(o => o.value === training.status)?.label || training.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {new Date(training.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {user?.role !== UserRole.ADMIN && (
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(training)}>
                        <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                    )}
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
