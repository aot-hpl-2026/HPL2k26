const SectionHeader = ({ 
  title, 
  subtitle = null, 
  action = null,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-epic font-bold text-base-content">{title}</h2>
        {subtitle && (
          <p className="text-base-content/60 mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export default SectionHeader
