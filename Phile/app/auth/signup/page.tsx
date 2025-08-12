'use client'

import React from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BookOpen, ArrowLeft, Users, FileText, Share2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SignUpPage() {
  const handleGoogleSignUp = async () => {
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Sign up error:', error)
    }
  }

  const benefits = [
    {
      icon: FileText,
      title: 'Share Documents',
      description: 'Upload and share your study materials with the community'
    },
    {
      icon: Users,
      title: 'Connect with Peers',
      description: 'Build your academic network and collaborate on projects'
    },
    {
      icon: Share2,
      title: 'Discover Resources',
      description: 'Access thousands of documents shared by students worldwide'
    }
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Back to Home */}
        <Link 
          href="/" 
          className="inline-flex items-center text-surface-400 hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <BookOpen className="h-10 w-10 text-primary-500 mr-3" />
                <h1 className="text-3xl font-bold text-foreground">Join ScholarPhile</h1>
              </div>
              <p className="text-xl text-surface-300">
                Start your journey of knowledge sharing and community building
              </p>
            </div>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-surface-300">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Sign Up Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-surface-900 border-surface-800">
              <CardHeader className="text-center pb-6">
                <h2 className="text-2xl font-bold text-foreground">Create Your Account</h2>
                <p className="text-surface-300">
                  Join thousands of students already sharing knowledge
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleGoogleSignUp}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </Button>

                <div className="text-center">
                  <p className="text-sm text-surface-400">
                    By signing up, you agree to our{' '}
                    <Link href="/terms" className="text-primary-400 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-400 hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-surface-400">
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-primary-400 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
