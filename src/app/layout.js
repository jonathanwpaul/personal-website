import { Fira_Code } from 'next/font/google'
import './globals.css'
import { ProjectProvider } from './ProjectProvider'

const font = Fira_Code({ subsets: ['latin'] })

export const metadata = {
  title: "Jonathan's Portfolio",
  description: 'A place to see all my work',
}

import TopBar from './TopBar'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${font.className} flex flex-col min-h-screen bg-background text-text`}>
        <ProjectProvider>
          <TopBar />
          <div className="flex-1 w-full">{children}</div>
        </ProjectProvider>
      </body>
    </html>
  )
}
