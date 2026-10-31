// Field.jsx — label + input + hint/error message
// Usage:
// <Field label="Email" id="email" error={errors.email}>
//   <input id="email" className="input" />
// </Field>

export default function Field({ label, id, hint, error, children }) {
  return (
    <div className="field">
      {/* htmlFor links the label to the input: clicking the label focuses the input */}
      <label htmlFor={id} className="field-label">
        {label}
      </label>

      {children}

      {/* Show the error if there is one, otherwise the hint (if there is one) */}
      {error ? (
        // role="alert": screen readers announce the error immediately
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : (
        hint && <span className="field-hint">{hint}</span>
      )}
    </div>
  );
}
