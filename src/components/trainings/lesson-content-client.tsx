'use client'

import React, { useEffect, useState, useRef } from "react"
import { Loader2, ArrowLeft, Save, Video, FileText } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { client } from "@/lib/feathers"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

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
  const [videoUrl, setVideoUrl] = useState("")
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const fetchContent = async () => {
      try {
        const result = await client.service("lesson-contents").find({
          query: { lessonId: lessonId }
        })
        if (result.data && result.data.length > 0) {
          const content = result.data[0]
          setExistingId(content._id)
          setMarkdown(content.markdown || "")
          setVideoUrl(content.videoUrl || "")
        }
      } catch (error) {
        console.error("Failed to load lesson content", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchContent()
  }, [lessonId])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        lessonId,
        markdown: markdown.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined
      }

      if (existingId) {
        await client.service("lesson-contents").patch(existingId, payload)
      } else {
        const created = await client.service("lesson-contents").create(payload)
        setExistingId(created._id)
      }
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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
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
              Provide markdown text or video links to build out the learning materials for this lesson.
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6 shadow-sm flex flex-col gap-8">
        {/* Video Link */}
        <FieldGroup>
          <Field>
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Video className="w-5 h-5" />
              <FieldLabel className="!mb-0 text-base">Video Configuration (Optional)</FieldLabel>
            </div>
            <Input 
              placeholder="e.g. https://youtube.com/..." 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Paste a video URL to embed content onto the layout banner.</p>
          </Field>
        </FieldGroup>

        {/* Markdown */}
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2 mb-2 text-primary">
              <FileText className="w-5 h-5" />
              <h3 className="font-medium text-base">Markdown Body (Optional)</h3>
           </div>
           <Tabs defaultValue="write" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="write" className="mt-4">
              <Textarea 
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Write your markdown here... Use # for headers, **bold**, *italics*, and lists!&#10;&#10;## Example&#10;- Point 1&#10;- Point 2"
                className="min-h-[400px] font-mono resize-y"
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-4 border rounded-md p-6 min-h-[400px] bg-background">
              {markdown.trim() ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdown}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm italic py-20">
                  Nothing to preview.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  )
}
