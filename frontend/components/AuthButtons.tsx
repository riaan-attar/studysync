// frontend/components/AuthButtons.tsx

'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { getApiUrl } from '@/lib/utils';

export default function AuthButtons() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetch(getApiUrl("/api/users/login"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      })
      .then(response => response.json())
      .then(data => console.log('Backend user session created:', data))
      .catch(error => console.error('Error notifying backend of login:', error));
    }
  }, [status, session]);

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <p className="text-sm text-[#94a3b8]">Signed in as {session.user?.email}</p>
        <Button
          onClick={() => signOut()}
          variant="outline"
          className="text-red-400 hover:bg-red-400/10 hover:text-red-300"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn('google')}
    >
      <LogIn className="w-4 h-4 mr-2" />
      Sign in with Google
    </Button>
  );
}