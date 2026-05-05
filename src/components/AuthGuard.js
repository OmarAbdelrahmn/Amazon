'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/components/Header';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const isValidToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';
    
    // Allow access to login page
    if (pathname === '/login') {
      if (isValidToken) {
        router.push('/');
      } else {
        setAuthorized(true);
      }
    } else {
      // For any other page, require valid token
      if (!isValidToken) {
        // Clear it just in case it was a bad string
        localStorage.removeItem('auth_token');
        router.push('/login');
      } else {
        setAuthorized(true);
      }
    }
  }, [pathname, router]);

  if (!authorized) {
    return <div className="loading-screen" />;
  }

  const isLoginPage = pathname === '/login';

  return (
    <>
      {!isLoginPage && <Header />}
      <main className="container animate-fade-in" style={{ padding: isLoginPage ? '0' : '2rem 1.5rem', maxWidth: isLoginPage ? '100%' : '1200px' }}>
        {children}
      </main>
    </>
  );
}
