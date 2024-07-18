'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        className: 'bg-background text-foreground',
        duration: 5000,
      }}
    />
  );
}