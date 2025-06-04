import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/globals.css';
import { Auth0Provider } from '@auth0/nextjs-auth0';

export const metadata = {
  title: "AI Chat",
  description: "Mobile-only ChatGPT Clone powered by Gemini, Supabase, Auth0, and Bootstrap 5.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Auth0Provider>
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
}
