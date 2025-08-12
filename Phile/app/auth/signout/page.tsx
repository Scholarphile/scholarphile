'use client'

import React, { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BookOpen, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    // Automatically sign out when the page loads
    signOut({ callbackUrl: '/' })
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-surface-900 border-surface-800 text-center">
          <CardHeader className="pb-6">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-12 w-12 text-primary-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Signing Out</h1>
            <p className="text-surface-300 mt-2">
              You are being signed out of ScholarPhile
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
            <p className="text-sm text-surface-400">
              Redirecting you back to the home page...
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
