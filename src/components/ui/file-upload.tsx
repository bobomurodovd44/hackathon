'use client'

import React, { useRef } from "react"
import { Upload, X, Loader2, Video as VideoIcon, FileUp, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  accept?: string
  value?: string | null
  onUpload: (file: File) => void
  onRemove: () => void
  isUploading?: boolean
  progress?: number
  status?: string
  label?: string
  type?: 'video' | 'image' | 'file'
  className?: string
}

export function FileUpload({
  accept,
  value,
  onUpload,
  onRemove,
  isUploading = false,
  progress = 0,
  status = "",
  label = "Upload Video",
  type = 'video',
  className
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      <div className="flex items-center gap-3 w-full">
        <Button
          type="button"
          variant="outline"
          className="shrink-0 gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : value ? (
            type === 'video' ? <VideoIcon className="h-4 w-4 text-primary" /> : <Upload className="h-4 w-4 text-primary" />
          ) : (
            <FileUp className="h-4 w-4" />
          )}
          {value ? (type === 'video' ? 'Change Video' : 'Change File') : label}
        </Button>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          {isUploading ? (
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <span className="truncate">{status || "Uploading..."}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5 w-full" />
            </div>
          ) : value ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
               <span className="text-sm text-muted-foreground truncate italic">
                 Video uploaded successfully
               </span>
               <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
               <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                onClick={onRemove}
               >
                 <X className="h-4 w-4" />
               </Button>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground italic">No video selected</span>
          )}
        </div>
      </div>
      
      {/* Small preview if value exists */}
      {value && !isUploading && type === 'video' && (
        <div className="mt-2 rounded-lg border bg-black aspect-video max-w-sm overflow-hidden flex items-center justify-center shadow-sm">
          <video src={value} controls className="max-h-full max-w-full" />
        </div>
      )}

      {value && !isUploading && type === 'image' && (
        <div className="mt-2 rounded-lg border aspect-video max-w-sm overflow-hidden flex items-center justify-center bg-muted">
          <img src={value} alt="Preview" className="object-cover w-full h-full" />
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  )
}
