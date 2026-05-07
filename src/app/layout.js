import { Fira_Code } from 'next/font/google'
import './globals.css'
import TopBar from '@/components/TopBar'

const font = Fira_Code({ subsets: ['latin'] })

export const metadata = {
  title: "Jonathan's Portfolio",
  description: 'A place to see all my work',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${font.className} h-screen flex-col bg-background text-foreground overflow-y-auto`}
      >
        <TopBar />
        <main className="flex">{children}</main>
      </body>
    </html>
  )
}
