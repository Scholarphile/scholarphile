'use client'

import React, { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  User, 
  LogOut, 
  Settings, 
  ChevronDown,
  BookOpen,
  Upload,
  Heart
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export const UserProfile: React.FC = () => {
  const { data: session } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  if (!session?.user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const userMenuItems = [
    {
      icon: BookOpen,
      label: 'My Documents',
      href: '/documents',
    },
    {
      icon: Upload,
      label: 'Upload',
      href: '/upload',
    },
    {
      icon: Heart,
      label: 'Favorites',
      href: '/favorites',
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
    },
  ]

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 text-foreground hover:bg-surface-800"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <User className="h-5 w-5" />
        )}
        <span className="hidden sm:block text-sm font-medium">
          {session.user.name || 'User'}
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-surface-900 border border-surface-800 rounded-lg shadow-lg z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-surface-800">
              <div className="flex items-center space-x-3">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-500" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {session.user.name || 'User'}
                  </p>
                  <p className="text-xs text-surface-400">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {userMenuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-surface-300 hover:text-foreground hover:bg-surface-800 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Sign Out */}
            <div className="border-t border-surface-800 py-2">
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-surface-800 w-full transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}
