const workspaceItems = [
  { value: '01', title: 'Model workspace', detail: 'Keep model selection, prompt work, and delivery in one focused surface.', icon: 'grid_view' },
  { value: '02', title: 'Usage visibility', detail: 'Read requests, token movement, and response health without leaving the console.', icon: 'query_stats' },
  { value: '03', title: 'Key control', detail: 'Create, scope, and review access keys with clear limits and expiry details.', icon: 'key' },
]

export default function ModelWorkspace() {
  return (
    <section className="py-20 reveal">
      <div className="border-y border-outline-variant/70 py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">ModelNex workspace</p>
            <h2 className="mt-3 font-display text-4xl text-on-surface sm:text-5xl">A calmer way to run model work.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-on-surface-variant sm:text-base">
            A dedicated workspace for the pieces that matter once a prototype becomes routine: model choice, access, usage, and review.
          </p>
        </div>

        <div className="mt-12 grid gap-0 divide-y divide-outline-variant/70 border-t border-outline-variant/70 md:grid-cols-3 md:divide-x md:divide-y-0">
          {workspaceItems.map((item) => (
            <div key={item.value} className="min-h-56 px-0 py-7 md:px-7 md:py-0 first:md:pl-0 last:md:pr-0">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-on-surface-variant">{item.value}</span>
                <span className="material-symbols-outlined text-xl text-primary">{item.icon}</span>
              </div>
              <h3 className="mt-12 text-lg font-semibold text-on-surface">{item.title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-on-surface-variant">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
