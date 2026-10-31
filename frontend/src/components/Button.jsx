// Button.jsx — one button for the whole app
// Usage: <Button variant="danger" icon={Trash2} onClick={...}>Supprimer</Button>

export default function Button({
  variant = "primary", // 'primary' | 'secondary' | 'danger'
  size = "md", // 'md' | 'sm' (sm = inside table rows)
  icon: Icon, // optional Lucide icon component (capital I because it's a component)
  children, // the text between <Button> and </Button>
  ...rest // every other prop: onClick, type, disabled...
}) {
  // Build the CSS class list, e.g. "btn btn-danger btn-sm"
  const classes = `btn btn-${variant} ${size === "sm" ? "btn-sm" : ""}`;

  return (
    // type="button" by default, so a button inside a <form> doesn't submit it by accident
    <button type="button" className={classes} {...rest}>
      {/* Show the icon only if one was given. aria-hidden: the text already says what it does */}
      {Icon && <Icon size={18} aria-hidden="true" />}
      {children}
    </button>
  );
}
