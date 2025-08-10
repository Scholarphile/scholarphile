'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { 
  Upload, 
  Search, 
  Users, 
  Shield, 
  Zap, 
  Globe,
  FileText,
  MessageCircle,
  Star,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Upload,
    title: 'Easy Document Upload',
    description: 'Drag and drop your academic documents. We support PDFs, Word docs, presentations, and more.',
    color: 'text-primary-400'
  },
  {
    icon: Search,
    title: 'Smart Search & Discovery',
    description: 'Find exactly what you need with our intelligent search system and subject-based categorization.',
    color: 'text-accent-400'
  },
  {
    icon: Users,
    title: 'Student Community',
    description: 'Connect with peers from your university and beyond. Share insights and collaborate on projects.',
    color: 'text-primary-400'
  },
  {
    icon: Shield,
    title: 'Academic Integrity',
    description: 'Built-in plagiarism detection and citation tools to maintain academic standards.',
    color: 'text-green-400'
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'Get immediate access to study materials, notes, and resources shared by your community.',
    color: 'text-yellow-400'
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Access documents from students worldwide, expanding your learning horizons.',
    color: 'text-accent-400'
  }
]

const stats = [
  { icon: FileText, value: '10K+', label: 'Documents', color: 'text-primary-400' },
  { icon: Users, value: '5K+', label: 'Students', color: 'text-accent-400' },
  { icon: MessageCircle, value: '2K+', label: 'Discussions', color: 'text-green-400' },
  { icon: Star, value: '4.9/5', label: 'Rating', color: 'text-yellow-400' },
  { icon: TrendingUp, value: '95%', label: 'Satisfaction', color: 'text-primary-400' }
]

export const Features: React.FC = () => {
  return (
    <section className="py-20 bg-surface-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-surface-300 max-w-2xl mx-auto">
            ScholarPhile provides all the tools and features you need to excel in your academic journey.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className={`${feature.color} mb-4`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-surface-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-surface-800 rounded-2xl p-8 md:p-12"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Trusted by Students Worldwide
            </h3>
            <p className="text-surface-300">
              Join thousands of students who are already using ScholarPhile to enhance their learning experience.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`${stat.color} mb-2 flex justify-center`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-surface-400 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
