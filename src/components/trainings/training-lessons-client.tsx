'use client'

import React, { useEffect, useState, useCallback, useRef } from "react"
import { Plus, Loader2, BookOpen, ArrowLeft, Pencil } from "lucide-react"
import Link from "next/link"
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
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

interface TrainingLessonsClientProps {
  trainingId: string
  trainingTitle: string
  companyId: string
  initialLessons: any[]
  isPortal?: boolean
}

export function TrainingLessonsClient({ 
  trainingId, 
  trainingTitle,
  companyId,
  initialLessons,
  isPortal = false
}: TrainingLessonsClientProps) {
  const { user } = useAuth()
  const [lessons, setLessons] = useState<any[]>(initialLessons)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add form state
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formType, setFormType] = useState("teach")
  const [formStatus, setFormStatus] = useState("active")

  // Edit form state
  const [editingLesson, setEditingLesson] = useState<any | null>(null)
  const [editFormTitle, setEditFormTitle] = useState("")
  const [editFormDescription, setEditFormDescription] = useState("")
  const [editFormType, setEditFormType] = useState("teach")
  const [editFormStatus, setEditFormStatus] = useState("active")
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  
  const isInitialRender = useRef(true)

  const fetchLessons = useCallback(async () => {
    setIsLoading(true)
    try {
      const query: any = {
        trainingId,
        $sort: { order: 1 }
      }
      const result = await client.service("lessons").find({ query })
      setLessons(result.data)
    } catch (error) {
      console.error("Error fetching lessons:", error)
    } finally {
      setIsLoading(false)
    }
  }, [trainingId])

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    fetchLessons()
  }, [fetchLessons])

  const handleCreateLesson = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    
    try {
      await client.service("lessons").create({
        trainingId,
        title: formTitle,
        description: formDescription,
        type: formType,
        status: formStatus
      })

      setIsCreateDialogOpen(false)
      setFormTitle("")
      setFormDescription("")
      setFormType("teach")
      setFormStatus("active")
      fetchLessons()
    } catch (error) {
      console.error("Error creating lesson:", error)
      alert("Failed to create lesson")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (lesson: any) => {
    setEditingLesson(lesson)
    setEditFormTitle(lesson.title)
    setEditFormDescription(lesson.description || "")
    setEditFormType(lesson.type || "teach")
    setEditFormStatus(lesson.status || "active")
  }

  const handleEditLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingLesson) return

    setIsEditSubmitting(true)
    try {
      await client.service("lessons").patch(editingLesson._id, {
        title: editFormTitle,
        description: editFormDescription,
        type: editFormType,
        status: editFormStatus
      })

      setEditingLesson(null)
      fetchLessons()
    } catch (error) {
      console.error("Error updating lesson:", error)
      alert("Failed to update lesson.")
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const backUrl = isPortal 
    ? `/company/trainings` 
    : `/admin/companies/${companyId}/trainings`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link 
          href={backUrl} 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          Back to Trainings
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{trainingTitle} — Lessons</h1>
            <p className="text-muted-foreground">
              Manage the learning steps sequentially for this given training.
            </p>
          </div>
          {user?.role !== UserRole.ADMIN && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="size-4" />
                  Add Lesson
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleCreateLesson}>
                  <DialogHeader>
                    <DialogTitle>Add New Lesson</DialogTitle>
                    <DialogDescription>
                      Create a new sequential step in this training. Orders are generated automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <FieldGroup className="py-4">
                    <Field>
                      <FieldLabel htmlFor="title">Title <span className="text-destructive">*</span></FieldLabel>
                      <Input 
                        id="title" 
                        value={formTitle} 
                        onChange={(e) => setFormTitle(e.target.value)} 
                        placeholder="e.g. Introduction to Sales" 
                        required 
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="description">Description <span className="text-destructive">*</span></FieldLabel>
                      <Textarea 
                        id="description" 
                        value={formDescription} 
                        onChange={(e) => setFormDescription(e.target.value)} 
                        placeholder="Brief summary of the lesson..." 
                        required 
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Type <span className="text-destructive">*</span></FieldLabel>
                        <Select value={formType} onValueChange={setFormType}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="teach">Teach</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel>Status <span className="text-destructive">*</span></FieldLabel>
                        <Select value={formStatus} onValueChange={setFormStatus}>
                          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </FieldGroup>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Save Lesson
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {user?.role !== UserRole.ADMIN && (
            <Dialog open={!!editingLesson} onOpenChange={(open) => !open && setEditingLesson(null)}>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleEditLesson}>
                  <DialogHeader>
                    <DialogTitle>Edit Lesson</DialogTitle>
                    <DialogDescription>Modify existing lesson details.</DialogDescription>
                  </DialogHeader>
                  <FieldGroup className="py-4">
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
                        required
                        value={editFormDescription}
                        onChange={(e) => setEditFormDescription(e.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Type <span className="text-destructive">*</span></FieldLabel>
                        <Select value={editFormType} onValueChange={setEditFormType}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="teach">Teach</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel>Status <span className="text-destructive">*</span></FieldLabel>
                        <Select value={editFormStatus} onValueChange={setEditFormStatus}>
                          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </FieldGroup>
                  <DialogFooter className="shrink-0 pt-4">
                    <Button type="button" variant="outline" onClick={() => setEditingLesson(null)}>Cancel</Button>
                    <Button type="submit" disabled={isEditSubmitting}>Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Created At</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading lessons...
                  </div>
                </TableCell>
              </TableRow>
            ) : lessons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No lessons found for this training.
                </TableCell>
              </TableRow>
            ) : (
              lessons.map((lesson) => (
                <TableRow key={lesson._id}>
                  <TableCell className="font-medium text-center">
                    <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center p-0">
                      {lesson.order}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{lesson.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {lesson.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {lesson.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={lesson.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                      {lesson.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {new Date(lesson.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {user?.role !== UserRole.ADMIN && (
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(lesson)}>
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

    </div>
  )
}
