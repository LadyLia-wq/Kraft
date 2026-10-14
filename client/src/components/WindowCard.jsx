function WindowCard({ title, className = '', children }) {
  return (
    <section className={`window-card ${className}`.trim()}>
      <header className="window-bar">
        <h3>{title}</h3>
        <span className="window-dots" aria-hidden="true">
          <i />
          <i />
        </span>
      </header>
      <div className="window-body">{children}</div>
    </section>
  )
}

export default WindowCard