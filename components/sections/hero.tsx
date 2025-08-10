'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, FileText, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-surface-900 to-background py-20 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-surface-800/50 border border-surface-700 rounded-full px-4 py-2 mb-8"
        >
          <Sparkles className="h-4 w-4 text-primary-400" />
          <span className="text-sm text-surface-300">Join thousands of students sharing knowledge</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
        >
          Share Knowledge,
          <br />
          <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            Build Community
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-surface-300 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          ScholarPhile is the premier platform for college students to share academic documents, 
          collaborate on projects, and build a community of learners. Upload, discover, and connect.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Button size="lg" className="group">
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg">
            Browse Documents
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <FileText className="h-8 w-8 text-primary-400" />
            </div>
            <div className="text-2xl font-bold text-foreground">10K+</div>
            <div className="text-surface-400">Documents Shared</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Users className="h-8 w-8 text-accent-400" />
            </div>
            <div className="text-2xl font-bold text-foreground">5K+</div>
            <div className="text-surface-400">Active Students</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <BookOpen className="h-8 w-8 text-primary-400" />
            </div>
            <div className="text-2xl font-bold text-foreground">50+</div>
            <div className="text-surface-400">Subjects Covered</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
