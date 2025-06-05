'use client';

import { useEffect } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function BootstrapProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Initialize any Bootstrap components that need JavaScript
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => {
        // @ts-expect-error bootstrap.Tooltip is not defined
        return new window.bootstrap.Tooltip(tooltipTriggerEl);
      });

      return () => {
        // Cleanup tooltips when component unmounts
        tooltipList.forEach(tooltip => tooltip.dispose());
      };
    }
  }, []);

  return <>{children}</>;
}