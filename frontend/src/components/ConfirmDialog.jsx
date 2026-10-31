// ConfirmDialog.jsx — "Are you sure?" box before a destructive action
// Usage: <ConfirmDialog open={...} title="..." message="..." onConfirm={...} onCancel={...} />
import { useEffect, useRef, useId } from "react";
import { Trash2 } from "lucide-react";
import Button from "./Button";

export default function ConfirmDialog({
  open, // true → the dialog is shown
  title,
  message,
  confirmLabel = "Supprimer",
  onConfirm, // called when the user confirms
  onCancel, // called on "Annuler" or Esc key
}) {
  const dialogRef = useRef(null); // pointer to the real <dialog> element
  const titleId = useId(); // unique id, so several dialogs never clash

  // Runs AFTER each render where "open" has changed
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal(); // open as a modal (with backdrop)
    if (!open && dialog.open) dialog.close();
  }, [open]); // ← dependency list: re-run only when "open" changes

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby={titleId}
      // Esc key → the browser fires "cancel". We stop its default closing
      // and let the PARENT decide (it sets open=false → useEffect closes it).
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <h2 id={titleId}>{title}</h2>
      <p>{message}</p>
      <div className="dialog-actions">
        {/* "Annuler" comes first: the safe choice gets the focus first */}
        <Button variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button variant="danger" icon={Trash2} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
