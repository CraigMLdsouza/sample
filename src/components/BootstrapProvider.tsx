'use client';

import { useEffect } from 'react';

export default function BootstrapProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // @ts-expect-error: No type for bootstrap.bundle.min.js, safe to ignore for dynamic import
      import('bootstrap/dist/js/bootstrap.bundle.min.js').then(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => {
          // @ts-expect-error bootstrap.Tooltip is not defined
          return new window.bootstrap.Tooltip(tooltipTriggerEl);
        });
        return () => {
          tooltipList.forEach(tooltip => tooltip.dispose());
        };
      });
    }
  }, []);

  return <>{children}</>;
}