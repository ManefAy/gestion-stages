// Badge.jsx — colored pill to show a status
// Usage: <Badge tone="success">Acceptée</Badge>
//    or: <Badge status="EN_ATTENTE" />

// Map: enum value (StatutCandidature) → French label + color
const STATUS_MAP = {
  EN_ATTENTE: { label: "En attente", tone: "warning" },
  ACCEPTEE: { label: "Acceptée", tone: "success" },
  REFUSEE: { label: "Refusée", tone: "danger" },
};

export default function Badge({ tone = "neutral", status, children }) {
  // If a status is given, use the map. Otherwise use tone + children directly.
  const config = status ? STATUS_MAP[status] : null;

  const finalTone = config ? config.tone : tone;
  const finalText = config ? config.label : children;

  return <span className={`badge badge-${finalTone}`}>{finalText}</span>;
}
