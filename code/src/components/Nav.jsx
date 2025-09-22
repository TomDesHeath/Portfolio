/**
 * Nav Component
 *
 * Displays a navigation bar with buttons to switch between different sections
 * of the portfolio (Education, Experience, Blog, Gallery).
 * Also includes a ThemeToggle button to switch between light/dark modes.
 *
 * @param {{ active: string, onChange: (tab: string) => void }} props
 *   - active: the currently selected tab label (e.g., "Blog").
 *   - onChange: callback to update the active tab when a button is clicked.
 */

export default function Nav({ active, onChange }) {
  // Define the available navigation tabs
  const tabs = ["Education", "Experience", "Blog", "Gallery"];

  return (
    <nav className="tabs">
      {tabs.map((t) => (
        <button
          key={t}
          // Apply an "active" CSS class if this tab is the current one
          className={t === active ? "active" : ""}
          // Notify parent of tab change when clicked
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}

      {/* Theme toggle button is placed at the end of the nav bar */}
      <ThemeToggle />
    </nav>
  );
}

/**
 * ThemeToggle Component
 *
 * Toggles between "light" and "dark" themes by updating the root <html>
 * element's 'data-theme' attribute. The CSS then reacts accordingly.
 */
function ThemeToggle() {
  // Flip the theme between light/dark on button press
  function toggle() {
    const html = document.documentElement;
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
  }

  return (
    <button onClick={toggle} style={{ marginLeft: "auto" }}>
      Toggle Theme
    </button>
  );
}
