/**
 * SearchBar Component
 *
 * A controlled input field for filtering blog posts (or other lists).
 * Parent components provide the current search value and a handler to update it.
 *
 * Props:
 * @param {{ value: string, onChange: (next: string) => void }} props
 *   - value: the current search string.
 *   - onChange: callback to update the search string when the user types.
 */

export default function SearchBar({ value, onChange }) {
  return (
    <input
      className="input"
      placeholder="Search posts..."
      // The value of the input is controlled by the parent state
      value={value}
      // Whenever the user types, call the parent's onChange with the new string
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
