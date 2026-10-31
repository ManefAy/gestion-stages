// PageHeader.jsx — title + subtitle + action buttons at the top of each page
// Usage: <PageHeader title="Gérer les comptes" subtitle="..." actions={<Button>...</Button>} />

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {/* Buttons on the right (they wrap below on small screens) */}
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}
