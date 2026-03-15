import Link from 'next/link'
import Markdown from 'react-markdown'
import type { Components } from 'react-markdown'

function isInternalLink(href: string): boolean {
  return href.startsWith('/') || href.startsWith('#')
}

const components: Components = {
  h1: ({ children }) => <h1 className="text-h1 mb-6 mt-8 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-h2 mb-4 mt-8">{children}</h2>,
  h3: ({ children }) => <h3 className="text-h3 mb-3 mt-6">{children}</h3>,
  h4: ({ children }) => <h4 className="text-h4 mb-2 mt-4">{children}</h4>,
  h5: ({ children }) => <h5 className="text-h5 mb-2 mt-4">{children}</h5>,
  h6: ({ children }) => <h6 className="text-h6 mb-2 mt-4">{children}</h6>,
  p: ({ children }) => <p className="mb-4 text-base leading-relaxed text-base-content/70 last:mb-0">{children}</p>,
  a: ({ href, children }) => {
    if (!href) return <span>{children}</span>
    if (isInternalLink(href)) {
      return (
        <Link href={href} className="text-primary underline-offset-2 hover:underline">
          {children}
        </Link>
      )
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-2 hover:underline">
        {children}
      </a>
    )
  },
  ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-1 text-base-content/70 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-1 text-base-content/70 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-primary bg-base-200 py-3 pr-4 pl-4 rounded-r-lg">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return (
        <code className={`${className} block rounded-box bg-base-300 p-4 text-sm overflow-x-auto`}>
          {children}
        </code>
      )
    }
    return <code className="rounded bg-base-300 px-1.5 py-0.5 text-sm">{children}</code>
  },
  pre: ({ children }) => <pre className="my-4 last:my-0">{children}</pre>,
  hr: () => <div className="ornament my-8" />,
  strong: ({ children }) => <strong className="font-bold text-base-content">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="data-table">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th className="text-left">{children}</th>,
  td: ({ children }) => <td>{children}</td>,
}

type GuideContentProps = {
  content: string
}

export default function GuideContent({ content }: GuideContentProps) {
  return (
    <article>
      <Markdown components={components}>{content}</Markdown>
    </article>
  )
}
