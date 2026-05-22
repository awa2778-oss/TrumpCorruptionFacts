import { ThemeProvider } from "./theme-provider";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="admin-tracker-theme">
      {children}
    </ThemeProvider>
  );
}
