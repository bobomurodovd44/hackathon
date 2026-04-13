'use client'

import React, { useEffect, useState } from "react"
import { Loader2, Search, BookOpen, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { client } from "@/lib/feathers"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function LearnerTrainingList() {
  const { user } = useAuth()
  const [trainings, setTrainings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchTrainings = async () => {
      if (!user?.companyId) return
      
      setIsLoading(true)
      try {
        const query: any = {
          companyId: user.companyId,
          status: 'active',
          $sort: { createdAt: -1 }
        }
        
        if (searchQuery) {
          query.title = { $regex: searchQuery, $options: 'i' }
        }

        const result = await client.service("trainings").find({ query })
        setTrainings(result.data)
      } catch (error) {
        console.error("Error fetching trainings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrainings()
  }, [user?.companyId, searchQuery])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Available Trainings</h1>
          <p className="text-muted-foreground">
            Explore and start your learning journey.
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search trainings..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : trainings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-xl bg-card/50 border-dashed border-primary/20">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">No active trainings found.</p>
          <p className="text-sm text-muted-foreground">Check back later for new content.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trainings.map((training) => (
            <Card key={training._id} className="group overflow-hidden flex flex-col transition-all hover:shadow-lg hover:border-primary/20">
              <div className="aspect-video relative overflow-hidden bg-muted">
                {training.image_url ? (
                  <Image 
                    src={training.image_url} 
                    alt={training.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="h-10 w-10 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                   <Badge className="bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90 capitalize border-none">
                     {training.spec?.replace('-', ' ')}
                   </Badge>
                </div>
              </div>
              <CardHeader className="flex-1">
                <CardTitle className="line-clamp-1">{training.title}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px]">
                  {training.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                   <div className="flex items-center gap-1">
                     <Clock className="w-3.5 h-3.5" />
                     {new Date(training.createdAt).toLocaleDateString()}
                   </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button asChild className="w-full group/btn">
                  <Link href={`/user/trainings/${training._id}`}>
                    Start Learning
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
