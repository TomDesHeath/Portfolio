/**
 * TagFilter Component
 *
 * Provides a set of buttons for filtering content by tags.
 * - Displays each unique tag passed in through props.
 * - Highlights selected tags and lets the user toggle them on/off.
 *
 * Props:
 * @param {{
 *   tags: string[],
 *   selected: string[],
 *   onToggle: (tag: string) => void
 * }} props
 *   - tags: list of all tags that may appear across posts/items.
 *   - selected: list of tags currently chosen by the user.
 *   - onToggle: callback to toggle a tag's selection state.
 */

export default function TagFilter({ tags, selected, onToggle }) {
  // Deduplicate tags by converting to a Set, then back to an array.
  const all = Array.from(new Set(tags));

  return (
    <div className="tags">
      {all.map((tag) => (
        <button
          key={tag}
          // If tag is selected, render as active; otherwise style as "ghost" (inactive).
          className={selected.includes(tag) ? "" : "ghost"}
          onClick={() => onToggle(tag)}
          // Inline style adds visual emphasis when a tag is active.
          style={
            selected.includes(tag)
              ? {
                  backgroundColor: "var(--accent)",
                  color: "white",
                  borderColor: "var(--accent)",
                }
              : {}
          }
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
