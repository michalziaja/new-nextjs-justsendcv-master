// app/(landing)/layout.tsx
import { ThemeProvider } from "@/providers/providers"
import UserInitializer from "@/components/UserInitializer"

export default function LandingLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen">
        <UserInitializer />
        <ThemeProvider>
            {children}
        </ThemeProvider>
      </div>
    );
  }
  