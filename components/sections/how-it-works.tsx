'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  UserPlus, 
  Upload, 
  Search, 
  Share, 
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up with your university email and create your student profile in minutes.',
    color: 'text-primary-400',
    bgColor: 'bg-primary-400/10'
  },
  {
    number: '02',
    icon: Upload,
    title: 'Upload Documents',
    description: 'Share your notes, assignments, and study materials with the community.',
    color: 'text-accent-400',
    bgColor: 'bg-accent-400/10'
  },
  {
    number: '03',
    icon: Search,
    title: 'Discover Resources',
    description: 'Browse through thousands of documents shared by students worldwide.',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10'
  },
  {
    number: '04',
    icon: Share,
    title: 'Connect & Collaborate',
    description: 'Build your network, join discussions, and collaborate on academic projects.',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10'
  }
]

const benefits = [
  'Free access to study materials',
  'Connect with peers globally',
  'Build your academic reputation',
  'Earn rewards for contributions',
  '24/7 community support',
  'Mobile-friendly platform'
]

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 bg-background">
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
            Get Started in 4 Simple Steps
          </h2>
          <p className="text-xl text-surface-300 max-w-2xl mx-auto">
            Join ScholarPhile and start sharing knowledge with fellow students in just a few minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-surface-800 border border-surface-700 rounded-full flex items-center justify-center text-sm font-bold text-foreground z-10">
                {step.number}
              </div>

              <Card className="h-full pt-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className={`${step.bgColor} ${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-surface-300 leading-relaxed text-center">
                    {step.description}
                  </p>
                </CardContent>
              </Card>

              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-0">
                  <ArrowRight className="h-6 w-6 text-surface-600" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Benefits and CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-surface-900 to-surface-800 rounded-2xl p-8 md:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Benefits */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Why Choose ScholarPhile?
              </h3>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-surface-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center lg:text-left">
              <h4 className="text-xl font-semibold text-foreground mb-4">
                Ready to Start Your Journey?
              </h4>
              <p className="text-surface-300 mb-6">
                Join thousands of students who are already sharing knowledge and building connections on ScholarPhile.
              </p>
              <div className="space-y-3">
                <Button size="lg" className="w-full lg:w-auto">
                  Create Free Account
                </Button>
                <p className="text-sm text-surface-400">
                  No credit card required • Setup takes 2 minutes
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
