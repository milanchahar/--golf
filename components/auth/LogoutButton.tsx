'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button, ButtonProps } from '@/components/ui/Button'
import { LogOut } from 'lucide-react'

export function LogoutButton({ className, variant = 'ghost', ...props }: ButtonProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <Button 
      variant={variant} 
      onClick={handleLogout} 
      className={className} 
      {...props}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}
