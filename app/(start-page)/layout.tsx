// app/(landing)/layout.tsx
import { ThemeProvider } from "@/providers/providers"


export default function LandingLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen">

        <ThemeProvider>
            {children}
        </ThemeProvider>
      </div>
    );
  }
  