import { Providers } from './providers';
import 'bootstrap/dist/css/bootstrap.min.css';
import BootstrapProvider from '@/components/BootstrapProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <BootstrapProvider>
            {children}
          </BootstrapProvider>
        </Providers>
      </body>
    </html>
  );
}