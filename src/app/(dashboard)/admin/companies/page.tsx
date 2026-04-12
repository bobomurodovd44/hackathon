import React from "react"
import { serverFetch } from "@/lib/server-api"
import { CompaniesClient } from "@/components/companies/companies-client"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function AdminCompaniesPage() {
  let initialData = { data: [], total: 0 }
  
  try {
    // Fetch first 10 companies sorted by creation date
    const result = await serverFetch('/companies?$limit=10&$sort[createdAt]=-1')
    if (result) {
      initialData = result
    } else {
      // If 401 or null, redirect to login
      redirect('/login')
    }
  } catch (error) {
    console.error("Error fetching initial companies on server:", error)
    // We can either redirect or just let the client try again
  }

  return (
    <CompaniesClient 
      initialCompanies={initialData.data} 
      initialTotal={initialData.total} 
    />
  )
}
