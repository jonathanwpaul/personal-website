'use client'
import { createContext, useState } from 'react'

export const Context = createContext()

export function ProjectProvider({ children }) {
  const [project, setProject] = useState()
  return (
    <Context.Provider value={{ project, setProject }}>
      {children}
    </Context.Provider>
  )
}

export default Context
