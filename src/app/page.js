'use client'
import {
  GitHubIcon,
  PrintablesIcon,
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  LinkIcon,
} from '@/components/Icons'
import { createBlobFromSignedUrl } from '@/helpers'
import Image from 'next/image'
import Link from 'next/link'

import { useState, useEffect } from 'react'

function IconRow({ Icon, name, href, handle }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 text-sm hover:underline hover:text-primary"
      aria-label={name}
    >
      <Icon className="w-5 h-5" />
      <span className="font-mono">{`@${handle}`}</span>
    </a>
  )
}

export default function ProfileSection() {
  const [user, setUser] = useState()
  const [profilePictureUrl, setProfilePictureUrl] = useState()
  const [handles, setHandles] = useState([])

  useEffect(() => {
    if (!user) return

    console.log(user)
    const linksWithIcon = [
      { name: 'github', svg: GitHubIcon },
      { name: 'printables', svg: PrintablesIcon },
      { name: 'tiktok', svg: TikTokIcon },
      { name: 'instagram', svg: InstagramIcon },
      { name: 'youtube', svg: YouTubeIcon },
    ]

    const tmp = []
    user.handles.forEach((handle) => {
      const found = linksWithIcon.find((l) => handle.link.includes(l.name))
      if (found) {
        tmp.push({ ...handle, ...found })
      } else {
        tmp.push({ ...handle, svg: LinkIcon })
      }
    })

    setHandles(tmp)
  }, [user])

  useEffect(() => {
    const getUserDetails = async () => {
      const resp = await fetch('/api/user', {
        method: 'POST',
      })

      const user = await resp.json()

      const localProfileBase64 = localStorage.getItem('profile-picture-base64')

      if (!localProfileBase64) {
        const base64 = await createBlobFromSignedUrl(
          user.profilePictureUrl,
          'profile-picture-blob',
        )
        setProfilePictureUrl(base64)
      } else {
        setProfilePictureUrl(localProfileBase64)
      }

      setUser(user)
    }

    getUserDetails()
  }, [])

  const profilePictureClass = 'w-28 h-28 rounded-full'
  if (!user) return

  return (
    <div className="max-w-5xl h-full mx-auto px-6 py-8 overflow-y-auto snap-y snap-mandatory md:snap-none">
      <div className="flex h-full flex-col md:grid md:grid-cols-3 md:gap-12 items-stretch">
        {/* Profile column */}
        <section className="min-h-[calc(100vh-30px)] md:min-h-0 md:col-span-1 flex flex-col items-center gap-12 p-6 md:justify-center snap-start">
          <div className="flex-shrink-0 flex flex-col items-center gap-6">
            {profilePictureUrl ? (
              <img className={profilePictureClass} src={profilePictureUrl} />
            ) : (
              <div
                className={`${profilePictureClass} bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold`}
              >
                J
              </div>
            )}
            <h1 className="text-2xl font-semibold">
              <span>{user.first_name}</span>
              <span> {user.last_name}</span>
            </h1>
            <div className="flex flex-col">
              <p className="text-sm text-primary">{user.bio}</p>
              <div className="mt-10 flex flex-col gap-2">
                {handles.map((h) => (
                  <IconRow
                    key={h.name}
                    Icon={h.svg}
                    href={h.link}
                    handle={h.handle}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex text-secondary">
            <Link
              href="/projects"
              className="h-full flex flex-none px-3 py-2 rounded-md border transition border-secondary text-secondary items-center hover:bg-secondary hover:text-white"
            >
              View my projects
            </Link>
          </div>
        </section>

        {/* About column */}
        <section className="mt-12 md:mt-0 flex flex-col gap-4 md:col-span-2 md:justify-center md:px-8 min-h-[calc(100vh-30px)] md:min-h-0 snap-start">
          <h3 className="text-3xl font-bold text-center md:text-left">About</h3>
          <div
            className="[&>ul]:list-disc [&>ul]:m-4 [&>ul]:list-inside [&>ul]:pl-6 [&>ul>li::marker]:text-primary"
            dangerouslySetInnerHTML={{ __html: user.about }}
          ></div>
        </section>
      </div>
    </div>
  )
}
