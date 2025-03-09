import "@/styles/globals.css";
import clsx from "clsx";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { AuthProvider } from "./auth-provider";
import { metadata } from "./metadata";

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#4b2e83" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class" }}>
          <AuthProvider>
            <div className="relative flex flex-col h-screen">
              <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
                {children}
              </main>
              <footer className="w-full flex items-center justify-center py-3 fixed bottom-0 left-0 right-0 bg-white/5 backdrop-blur-sm border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <p>
                  ©INFO 442: Group 5 (Sirak Yohannes, Aaron Jones, Christopher
                  May Chen, Mykyta Lepikash, Sid Jayadev)
                </p>
              </footer>
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
