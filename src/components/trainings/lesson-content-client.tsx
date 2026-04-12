'use client'

import React, { useEffect, useState, useRef } from "react"
import { Loader2, ArrowLeft, Save, Video, FileText, Upload, X, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { client } from "@/lib/feathers"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { uploadFile } from "@/lib/upload"
import { FileUpload } from "@/components/ui/file-upload"
import jsCookie from "js-cookie"

interface LessonContentClientProps {
  companyId?: string
  trainingId: string
  lessonId: string
  lessonTitle: string
  isPortal?: boolean
}

export function LessonContentClient({
  companyId,
  trainingId,
  lessonId,
  lessonTitle,
  isPortal = false
}: LessonContentClientProps) {
  const [existingId, setExistingId] = useState<string | null>(null)
  
  const [markdown, setMarkdown] = useState("")
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState("")
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const initialized = useRef(false)
  const initialDataLoaded = useRef(false)

  // 1. Fetch data on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const fetchContent = async () => {
      try {
        const result = await client.service("lesson-contents").find({
          query: { lessonId: lessonId }
        })
        
        let loadedMarkdown = ""
        let loadedVideoId = null
        let loadedVideoUrl = null

        if (result.data && result.data.length > 0) {
          const content = result.data[0]
          setExistingId(content._id)
          loadedMarkdown = content.markdown || ""
          loadedVideoId = content.videoId || null
          
          if (loadedVideoId) {
            try {
              const upload = await client.service("uploads").get(loadedVideoId)
              loadedVideoUrl = upload.url
            } catch (e) {
              console.warn("Could not fetch video URL", e)
            }
          }
        }

        // Check local storage for drafts
        const draft = localStorage.getItem(`draft_lesson_${lessonId}`)
        if (draft && draft !== loadedMarkdown) {
          if (confirm("Found an unsaved draft in your browser. Would you like to restore it?")) {
            loadedMarkdown = draft
            setHasUnsavedChanges(true)
          } else {
            localStorage.removeItem(`draft_lesson_${lessonId}`)
          }
        }

        setMarkdown(loadedMarkdown)
        setVideoId(loadedVideoId)
        setVideoUrl(loadedVideoUrl)
        initialDataLoaded.current = true
      } catch (error) {
        console.error("Failed to load lesson content", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchContent()
  }, [lessonId])

  // 2. Draft Saving & BeforeUnload logic
  useEffect(() => {
    if (!initialDataLoaded.current) return
    
    const saveDraft = () => {
      if (markdown) {
        localStorage.setItem(`draft_lesson_${lessonId}`, markdown)
      } else {
        localStorage.removeItem(`draft_lesson_${lessonId}`)
      }
    }

    const timer = setTimeout(saveDraft, 1000)
    return () => clearTimeout(timer)
  }, [markdown, lessonId])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = "" // Standard browser prompt
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleMarkdownChange = (val: string) => {
    setMarkdown(val)
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        lessonId,
        markdown: markdown.trim() || undefined,
        videoId: videoId || undefined
      }

      if (existingId) {
        await client.service("lesson-contents").patch(existingId, payload)
      } else {
        const created = await client.service("lesson-contents").create(payload)
        setExistingId(created._id)
      }
      
      localStorage.removeItem(`draft_lesson_${lessonId}`)
      setHasUnsavedChanges(false)
      alert("Lesson content saved successfully!")
    } catch (error: any) {
      console.error(error)
      alert(error.message || "Failed to save lesson content. Check rules.")
    } finally {
      setIsSaving(false)
    }
  }

  const backUrl = isPortal 
    ? `/company/trainings/${trainingId}/lessons` 
    : `/admin/companies/${companyId}/trainings/${trainingId}/lessons`

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20">
      <div className="flex flex-col gap-4">
        <Link 
          href={backUrl} 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          Back to Lessons
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content: {lessonTitle}</h1>
            <p className="text-muted-foreground">
              Configure videos and markdown body for this lesson.
            </p>
          </div>
          <div className="flex items-center gap-3">
             {hasUnsavedChanges && (
               <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
             )}
            <Button onClick={handleSave} disabled={isSaving || isUploading}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6 shadow-sm flex flex-col gap-8">
        {/* Video Upload 섹션 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary">
            <Video className="w-5 h-5" />
            <h3 className="font-medium text-lg leading-none">Video Material</h3>
          </div>
          
          <FileUpload
            type="video"
            accept="video/*"
            value={videoUrl}
            isUploading={isUploading}
            progress={uploadProgress}
            status={uploadStatus}
            onUpload={async (file) => {
              setIsUploading(true)
              setUploadProgress(0)
              setUploadStatus("Preparing upload...")
              try {
                const token = jsCookie.get("feathers-jwt") || ""
                const result = await uploadFile(file, token, (msg) => {
                  setUploadStatus(msg)
                  if (msg.includes("Uploading...")) {
                    const match = msg.match(/(\d+\.?\d*)\sMB\s\/\s(\d+\.?\d*)\sMB/)
                    if (match) {
                      const current = parseFloat(match[1])
                      const total = parseFloat(match[2])
                      setUploadProgress(Math.round((current / total) * 100))
                    }
                  }
                })
                setVideoId(result._id)
                setVideoUrl(result.url)
                setHasUnsavedChanges(true)
                setUploadProgress(100)
                setUploadStatus("Upload complete!")
              } catch (error: any) {
                alert(`Upload failed: ${error.message}`)
              } finally {
                setIsUploading(false)
              }
            }}
            onRemove={() => {
              setVideoId(null)
              setVideoUrl(null)
              setHasUnsavedChanges(true)
            }}
            label="Click to upload lesson video"
          />
        </div>

        {/* Markdown Body 섹션 */}
        <div className="flex flex-col gap-4">
           <div className="flex items-center gap-2 text-primary">
              <FileText className="w-5 h-5" />
              <h3 className="font-medium text-lg leading-none">Lesson Body</h3>
           </div>
           
           <Tabs defaultValue="write" className="w-full border rounded-lg p-2 bg-muted/20">
            <TabsList className="bg-transparent border-b rounded-none px-0 h-10 gap-4 mb-4">
              <TabsTrigger 
                value="write" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-0"
              >
                Write
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-0"
              >
                Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="write" className="mt-0 focus-visible:outline-none">
              <Textarea 
                value={markdown}
                onChange={(e) => handleMarkdownChange(e.target.value)}
                placeholder="Compose your lesson content using Markdown..."
                className="min-h-[500px] font-mono resize-y bg-background border-none shadow-none focus-visible:ring-0 text-base"
              />
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0 focus-visible:outline-none">
              <div className="min-h-[500px] rounded-md p-6 bg-background border border-transparent">
                {markdown.trim() ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {markdown}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex h-[400px] items-center justify-center text-muted-foreground text-sm italic">
                    Nothing to preview yet.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  )
}
