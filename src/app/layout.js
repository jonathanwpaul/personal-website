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
        className={`${font.className} flex flex-col h-screen bg-background text-foreground`}
      >
        <TopBar />
        <main className="flex flex-1 min-h-0 h-[95%]">{children}</main>
      </body>
    </html>
  )
}
