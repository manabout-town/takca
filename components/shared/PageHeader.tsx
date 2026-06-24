interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 md:mb-8">
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm md:text-base text-gray-400 mt-1 md:mt-2">{description}</p>}
      </div>
      {action && <div className="shrink-0 mt-1">{action}</div>}
    </div>
  )
}
