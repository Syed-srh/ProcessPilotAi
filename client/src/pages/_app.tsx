import type { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import '../styles/globals.css';
import { useAuthStore } from '../store/authStore';

export default function App({ Component, pageProps }: AppProps) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <Component {...pageProps} />;
}
