'use client'

import { useEffect, useState, use } from 'react'
import { EmbedCarousel } from './carousel'
import { ProjectPageSkeleton } from '@/components/Skeletons'
import { ThreeViewer } from '@/components/ThreeViewer'
import { ThumbnailPlaceholder } from '@/components/ThumbnailPlaceholder'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

export default function Details(props) {
  const params = use(props.params)
  const [project, setProject] = useState({})
  const [modelUrl, setModelUrl] = useState()
  const [thumbnailUrl, setThumbnailUrl] = useState(null)
  const [projectFiles, setProjectFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [animationLoading, setAnimationLoading] = useState(true)
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(true)

  const fetchProject = async (project_name) => {
    const resp = await fetch('/api/projects', {
      method: 'POST',
      body: project_name,
    })
    const response = await resp.json()
    setProject(response[0])
    setLoading(false)
  }

  const fetchProjectFiles = async (project_id) => {
    try {
      const resp = await fetch('/api/projects/files', {
        method: 'POST',
        body: String(project_id),
      })

      if (!resp.ok) return

      const files = await resp.json()
      if (!Array.isArray(files)) return

      // Find the first GLTF/GLB file to use as the model for the ThreeViewer
      const modelFile = files.find((file) =>
        /\.(gltf|glb)$/i.test(file?.file_name || ''),
      )
      setModelUrl(modelFile?.signed_url || null)

      // Filter out thumbnail files and animation/model files from downloadable list
      const downloadable = files.filter((file) => {
        const name = file?.file_name || ''
        const isThumbnail = /(?:^|\/)thumbnail\.[^./]+$/i.test(name)
        const isAnimation = /\.(gltf|glb)$/i.test(name)
        return !isThumbnail && !isAnimation
      })

      setProjectFiles(downloadable)
    } catch (e) {
      // Swallow errors; UI can fall back to no files / no model
    } finally {
      setAnimationLoading(false)
    }
  }

  const fetchThumbnail = async (project_id) => {
    try {
      const resp = await fetch('/api/projects/thumbnail', {
        method: 'POST',
        body: String(project_id),
      })
      if (!resp.ok) return
      const url = await resp.text()
      setThumbnailUrl(url || null)
    } catch (e) {
      // ignore thumbnail errors, placeholder will be shown
    }
  }

  const fetchSummary = async (projectName) => {
    try {
      setSummaryLoading(true)
      if (!projectName) return
      const encodedName = encodeURIComponent(projectName)
      const resp = await fetch(`/content/projects/${encodedName}.md`)
      if (!resp.ok) {
        setSummary('')
        return
      }
      const text = await resp.text()
      // Normalize Obsidian-style wiki links to standard markdown
      // ![[images/foo.png]] -> ![](images/foo.png)
      // [[page]] -> [page](page)
      const normalized = text
        .replace(/!\[\[([^\]]+?)\]\]/g, '![]($1)')
        .replace(/\[\[([^\]]+?)\]\]/g, '[$1]($1)')

      setSummary(normalized)
    } catch (e) {
      setSummary('')
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    if (!params?.project_name) return
    fetchProject(params.project_name)
    fetchSummary(params.project_name)
  }, [params?.project_name])

  useEffect(() => {
    if (!project || !project.id) return
    fetchProjectFiles(project.id)
    fetchThumbnail(project.id)
  }, [project])

  if (!project) return

  const { name, description, bom, web_link, project_files, project_videos } =
    project

  return (
    <div className="h-full w-full flex justify-center overflow-y-auto md:overflow-y-hidden pb-4">
      <div className="h-full w-full max-w-5xl px-4 py-6 md:py-8">
        {loading && <ProjectPageSkeleton />}
        {!loading && (
          <div className="h-full flex flex-col gap-8 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
            {/* Left column: thumbnail, title, description, links */}
            <section className="flex flex-col gap-4 md:pr-4">
              <div className="w-full rounded-lg border bg-card flex items-center justify-center overflow-hidden">
                {thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnailUrl}
                    alt={`${name} thumbnail`}
                    className="w-full h-40 md:h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 md:h-48 flex items-center justify-center">
                    <ThumbnailPlaceholder />
                  </div>
                )}
              </div>

              <h1 className="text-primary text-2xl font-bold text-left">
                {name}
              </h1>
              {description && (
                <p className="text-sm leading-relaxed text-foreground/90">
                  {description}
                </p>
              )}

              {projectFiles && projectFiles.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase mb-2">
                    Project Files
                  </h2>
                  <div className="flex flex-col gap-2">
                    {projectFiles.map((file) => {
                      const fileName =
                        (file.file_name || '').split('/').pop() || 'download'

                      return (
                        <a
                          key={file.file_name}
                          href={file.signed_url}
                          download={fileName}
                          className="inline-flex items-center justify-between rounded-md border border-primary/40 bg-primary/10 hover:bg-primary/20 text-xs md:text-sm text-primary hover:underline px-3 py-2 transition-colors"
                        >
                          <span className="truncate">{fileName}</span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {(web_link || (project_videos && project_videos.length > 0)) && (
                <div className="mt-4">
                  <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase mb-2">
                    Links
                  </h2>
                  <ul className="space-y-1 text-sm">
                    {web_link && (
                      <li>
                        <a
                          href={web_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline break-all"
                        >
                          {web_link}
                        </a>
                      </li>
                    )}
                    {project_videos &&
                      project_videos.map((video, index) => (
                        <li key={video.video_embed_link || index}>
                          <a
                            href={video.video_embed_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {`Video ${index + 1}`}
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Right column: scrollable markdown + media */}
            <section className="h-full min-h-0 md:border-l md:border-border md:pl-4">
              <div className="space-y-6 text-sm leading-relaxed pr-1 md:pr-2 md:h-full md:overflow-y-auto">
                {summary && (
                  <section className="pt-1 pb-4">
                    <div className="text-sm leading-relaxed space-y-3">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        urlTransform={(src) => {
                          if (!src) return src
                          if (/^https?:\/\//.test(src)) return src
                          if (src.startsWith('/')) return src

                          const cleaned = src.replace(/^\.\//, '')
                          if (cleaned.startsWith('images/')) {
                            return `/content/projects/${cleaned}`
                          }

                          return `/content/projects/${cleaned}`
                        }}
                        components={{
                          // Treat markdown H1s as styled section headings, slightly smaller than the page title
                          h1: ({ node, ...props }) => (
                            <h2
                              className="text-xl font-semibold mt-6 mb-3 text-foreground"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h3
                              className="text-lg font-semibold mt-5 mb-2 text-foreground"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h4
                              className="text-base font-semibold mt-4 mb-2 text-foreground"
                              {...props}
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p
                              className="mt-0 mb-3 text-foreground/90"
                              {...props}
                            />
                          ),
                          ul: ({ node, className = '', ...props }) => (
                            <ul
                              className={cn(
                                'my-2 ml-6 [&>li]:mb-1 [&>li]:pl-1 [&>li]:leading-relaxed marker:text-primary',
                                className.includes('contains-task-list')
                                  ? 'list-none mt-4 space-y-2'
                                  : 'list-disc',
                              )}
                              {...props}
                            />
                          ),
                          ol: ({ node, className = '', ...props }) => (
                            <ol
                              className={cn(
                                'my-2 ml-6 [&>li]:mb-1 [&>li]:pl-1 [&>li]:leading-relaxed marker:text-primary',
                                className.includes('contains-task-list')
                                  ? 'list-none mt-4 space-y-2'
                                  : 'list-decimal',
                              )}
                              {...props}
                            />
                          ),
                          li: ({ node, className = '', ...props }) => (
                            <li
                              className={cn(
                                'mt-0',
                                className.includes('task-list-item')
                                  ? 'list-none pl-1 [&>input]:mr-2 [&>input]:mt-0.5'
                                  : '',
                              )}
                              {...props}
                            />
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              className="text-primary hover:underline"
                              {...props}
                            />
                          ),
                          img: ({ node, ...props }) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              className="my-6 mx-auto block rounded-lg border border-border max-w-full h-auto"
                              {...props}
                            />
                          ),
                          table: ({ node, ...props }) => (
                            <div className="w-full overflow-x-auto my-4">
                              <table
                                className="w-full text-left border-collapse text-xs md:text-sm"
                                {...props}
                              />
                            </div>
                          ),
                          thead: ({ node, ...props }) => (
                            <thead className="bg-muted" {...props} />
                          ),
                          th: ({ node, ...props }) => (
                            <th
                              className="border border-border px-2 py-1 font-semibold text-foreground"
                              {...props}
                            />
                          ),
                          td: ({ node, ...props }) => (
                            <td
                              className="border border-border px-2 py-1 align-top text-foreground/90"
                              {...props}
                            />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              className="border-l-2 border-primary/40 pl-4 italic text-foreground/80 my-3"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {summary}
                      </ReactMarkdown>
                    </div>
                  </section>
                )}

                {modelUrl && (
                  <section>
                    <div className="w-full items-center justify-center rounded-lg border border-primary/30 bg-background/80 text-sm opacity-80">
                      <ThreeViewer
                        modelUrl={modelUrl}
                        autoPlay={true}
                        resumeDelayMs={5000}
                        minDistance={0.1}
                        maxDistance={1}
                      />
                    </div>
                  </section>
                )}

                {bom && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      Bill of Materials
                    </h2>
                    <ul className="list-disc list-inside mb-4">
                      {bom.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {project_videos && project_videos.length > 0 && (
                  <section className="mb-4">
                    <h2 className="text-2xl font-bold mb-4">{`Video${
                      project_videos.length > 1 ? 's' : ''
                    }`}</h2>
                    <EmbedCarousel
                      list={project_videos.map((e) => e.video_embed_link)}
                    />
                  </section>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
