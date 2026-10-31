// useFormulaire.js — reusable logic for a "create / edit" side form
// Usage in a page:
//   const f = useFormulaire(FORM_VIDE);
//   f.ouvrirCreation();  f.form.nom;  <input name="nom" onChange={f.handleChange} />
import { useState } from "react";

export function useFormulaire(formVide) {
  const [ouvert, setOuvert] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating
  const [form, setForm] = useState(formVide);
  const [errors, setErrors] = useState({});

  // Open an empty form to CREATE
  function ouvrirCreation() {
    setEditingId(null);
    setForm(formVide);
    setErrors({});
    setOuvert(true);
  }

  // Open the form filled with existing values to EDIT
  function ouvrirModification(id, valeurs) {
    setEditingId(id);
    setForm(valeurs);
    setErrors({});
    setOuvert(true);
  }

  function fermer() {
    setOuvert(false);
    setEditingId(null);
  }

  // Generic handler: uses the input's "name" to know which field to update
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  // Everything the page needs, in one object
  return {
    ouvert,
    editingId,
    enModification: editingId !== null,
    form,
    errors,
    setErrors,
    setEditingId,
    handleChange,
    ouvrirCreation,
    ouvrirModification,
    fermer,
  };
}
