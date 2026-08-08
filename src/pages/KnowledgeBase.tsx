import { BookOpen, ChevronDown, HelpCircle, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatusChip } from '../components/ui/StatusChip'
import { KB_ARTICLES, type KbArticle } from '../data/knowledgeBase'
import { cn } from '../lib/cn'

function articleMatches(article: KbArticle, needle: string): boolean {
  if (!needle) return true
  const haystack = [
    article.title,
    article.category,
    article.summary,
    ...article.sections.flatMap((s) => [s.heading, ...(s.body ?? []), ...(s.bullets ?? []), ...(s.steps ?? [])]),
    ...article.faqs.flatMap((f) => [f.q, f.a]),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(needle.toLowerCase())
}

export function KnowledgeBase() {
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState(KB_ARTICLES[0]?.id ?? '')

  const filtered = useMemo(() => KB_ARTICLES.filter((a) => articleMatches(a, query)), [query])
  const active = filtered.find((a) => a.id === activeId) ?? filtered[0]

  const grouped = useMemo(() => {
    const map = new Map<string, KbArticle[]>()
    for (const a of filtered) {
      const list = map.get(a.category) ?? []
      list.push(a)
      map.set(a.category, list)
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">Knowledge Base</h1>
          <p className="text-sm text-muted">User documentation and FAQs for every feature of Best Cast e-QMS.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          className="input pl-9"
          placeholder="Search the knowledge base…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
        <nav className="space-y-4">
          {grouped.length === 0 && <p className="text-sm text-muted">No articles match “{query}”.</p>}
          {grouped.map(([category, articles]) => (
            <div key={category}>
              <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{category}</p>
              <ul className="space-y-1">
                {articles.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(a.id)}
                      className={cn(
                        'w-full rounded-md px-3 py-2 text-left text-sm',
                        active?.id === a.id ? 'bg-primary/12 font-medium text-primary' : 'text-text hover:bg-surface-2',
                      )}
                    >
                      {a.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {active && <Article article={active} />}
      </div>
    </div>
  )
}

function Article({ article }: { article: KbArticle }) {
  return (
    <article className="card space-y-6 p-5">
      <header className="space-y-2 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip value={article.category} tone="primary" />
          <StatusChip value={article.audience} tone="info" />
          <span className="text-[11px] text-muted">Updated {article.updated}</span>
        </div>
        <h2 className="text-lg font-bold text-text">{article.title}</h2>
        <p className="text-sm text-muted">{article.summary}</p>
      </header>

      <div className="space-y-5">
        {article.sections.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h3 className="text-sm font-semibold text-text">{section.heading}</h3>
            {section.body?.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted">
                {p}
              </p>
            ))}
            {section.steps && (
              <ol className="ml-5 list-decimal space-y-1 text-sm text-muted marker:text-primary">
                {section.steps.map((s, i) => (
                  <li key={i} className="pl-1">
                    {s}
                  </li>
                ))}
              </ol>
            )}
            {section.bullets && (
              <ul className="ml-5 list-disc space-y-1 text-sm text-muted marker:text-primary">
                {section.bullets.map((b, i) => (
                  <li key={i} className="pl-1">
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {article.faqs.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-text">Frequently asked questions</h3>
          </div>
          <div className="divide-y divide-border rounded-lg border border-border">
            {article.faqs.map((faq, i) => (
              <details key={i} className="group px-3 py-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-text">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
