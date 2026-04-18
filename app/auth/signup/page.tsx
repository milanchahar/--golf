'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Heart } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  // Step 1 State
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Step 2 State (Charity)
  const [charities, setCharities] = useState<any[]>([])
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null)
  const [contributionPercent, setContributionPercent] = useState(10)
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load charities for step 2
    async function loadCharities() {
      const { data } = await supabase.from('charities').select('*').eq('is_active', true)
      if (data) setCharities(data)
    }
    loadCharities()
  }, [])

  const handleSignupBase = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    // Proceed to charity step without actually creating auth user yet, 
    // or create auth user and update profile next. Better to create user first.
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      setLoading(false)
      setStep(2)
    }
  }

  const handleCompleteSignup = async () => {
    setLoading(true)
    
    // Auth user is already created, now we update profile.
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id

    if (userId && selectedCharity) {
      await supabase.from('profiles').update({
        selected_charity_id: selectedCharity,
        charity_contribution_percent: contributionPercent
      }).eq('id', userId)
    }
    
    router.push('/dashboard')
    router.refresh()
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-emerald-400 flex items-center justify-center gap-2">
            <Heart className="w-6 h-6 fill-current"/> Choose your Charity
          </h2>
          <p className="text-sm text-slate-400">At least 10% of your subscription goes to a charity of your choice</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {charities.map(charity => (
              <div 
                key={charity.id}
                onClick={() => setSelectedCharity(charity.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedCharity === charity.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'}`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                   {charity.logo_url ? (
                     <img src={charity.logo_url} alt={charity.name} className="w-12 h-12 rounded-full object-cover"/>
                   ) : (
                     <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                       <Heart className="text-slate-400 w-6 h-6"/>
                     </div>
                   )}
                   <div>
                     <h3 className="font-semibold text-slate-200 text-sm leading-tight">{charity.name}</h3>
                     <span className="text-xs text-slate-400 mt-1 block">€{charity.total_raised} raised</span>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {selectedCharity && (
             <div className="space-y-3 bg-[#1E293B] p-5 rounded-xl border border-slate-700">
               <label className="text-sm font-medium text-slate-300 block">Contribution Amount: {contributionPercent}%</label>
               <input 
                 type="range" 
                 min="10" 
                 max="50" 
                 step="1"
                 value={contributionPercent} 
                 onChange={(e) => setContributionPercent(parseInt(e.target.value))}
                 className="w-full accent-emerald-500"
               />
               <p className="text-xs text-slate-400 text-center">You can update this at any time in your dashboard.</p>
             </div>
          )}

          <Button onClick={handleCompleteSignup} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading || !selectedCharity}>
            {loading ? 'Finalizing...' : 'Complete Account'}
          </Button>
          
          <button onClick={() => {
            router.push('/dashboard')
            router.refresh()
          }} className="w-full text-slate-500 hover:text-slate-300 text-sm mt-3">
            Skip for now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">Create an account</h2>
        <p className="text-sm text-slate-400">Sign up to get started with Golf Heroes</p>
      </div>

      <form onSubmit={handleSignupBase} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="fullName">Full Name</label>
          <Input 
            id="fullName" 
            type="text" 
            placeholder="Tiger Woods" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="email">Email</label>
          <Input 
            id="email" 
            type="email" 
            placeholder="tiger@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="password">Password</label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="confirmPassword">Confirm Password</label>
          <Input 
            id="confirmPassword" 
            type="password" 
            placeholder="••••••••" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-950/30 border border-red-900/50 rounded-md">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Continue to Step 2'}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-400 mt-4">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-brand-blue hover:underline font-medium text-blue-400">
          Sign in here
        </Link>
      </div>
    </div>
  )
}
