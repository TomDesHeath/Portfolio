/**
 * Experience Component
 *
 * Renders a simple resume-style section with:
 * - Work experience (role, organization, period, details).
 * - Skills grouped into "technical" and "soft".
 *
 * Data strategy:
 * - Uses hard-coded defaults for both skills and experience.
 * - Attempts to override defaults with values from localStorage keys:
 *     - "experience:skills"
 *     - "experience:list"
 *   If parsing fails or data is missing, falls back to defaults.
 *
 * Notes:
 * - This is a read-only view: no editing UI is exposed here.
 * - Keys in <li> use the index because the lists are relatively static; if you
 *   expect reordering or insertions, prefer a stable unique key from data.
 * - The 'key' function is currently an identity; it could be inlined, but it
 *   also serves as a single point to transform key names if needed later.
 */

export default function Experience() {
  // Identity function: returns the same key string.
  const key = (k) => k;

  // Defaults for display if nothing is in localStorage.
  const defaultSkills = {
    technical: ["Java", "Python", "HTML/CSS", "C", "JavaScript", "SQL"],
    soft: [
      "Communication",
      "Teamwork",
      "Problem-solving",
      "Adaptability",
      "Time Management",
    ],
  };
  const defaultExperience = [
    {
      role: "Data Analyst Intern",
      org: "Genergy",
      period: "2024",
      details:
        "Built power generation/consumption aggregators and estimators for existing and prospective solar installations.",
    },
    {
      role: "Software Development Intern",
      org: "Tech Solutions Inc.",
      period: "2023",
      details:
        "Developed and maintained internal tools using Python and Django, improving data processing efficiency by 15%.",
    },
  ];

  // Initialize with defaults; attempt to hydrate from localStorage.
  let skills = defaultSkills;
  let experience = defaultExperience;
  try {
    skills =
      JSON.parse(localStorage.getItem(key("experience:skills")) || "null") ||
      defaultSkills;
    experience =
      JSON.parse(localStorage.getItem(key("experience:list")) || "null") ||
      defaultExperience;
  } catch {} // Swallow JSON errors silently and keep defaults.

  return (
    <div>
      {/* Experience section */}
      <h2>Experience & Skills</h2>
      <h3>Experience</h3>
      <ul>
        {experience.map((e, i) => (
          <li key={i}>
            <strong>{e.role}</strong> — {e.org} ({e.period}) – {e.details}
          </li>
        ))}
      </ul>

      {/* Skills section */}
      <h3>Skills</h3>
      <p>
        <strong>Technical:</strong> {skills.technical.join(", ")}
      </p>
      <p>
        <strong>Soft:</strong> {skills.soft.join(", ")}
      </p>
    </div>
  );
}
