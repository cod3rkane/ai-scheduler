import { Outlet } from '@modern-js/runtime/router';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Outlet />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
