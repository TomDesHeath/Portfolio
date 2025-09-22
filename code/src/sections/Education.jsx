/**
 * Education Component
 *
 * Displays educational background:
 * - A simple list of qualifications.
 * - Matric (high school) summary.
 * - A table of university modules with marks and pass/fail status.
 *
 * Notes for reviewers:
 * - Data is hard-coded into local component constants ('matric', 'modules', 'quals').
 *   In a larger app, this would likely come from props, context, or a data fetch.
 * - Keys:
 *   - 'quals' uses the array index as a key (acceptable for static lists).
 *   - 'modules' uses 'm.code' as the key (stable identifier is preferred).
 * - The table is semantic HTML with <thead>/<tbody> for better accessibility and styling hooks.
 */

export default function Education() {
  // High school summary data for display under "Matric"
  const matric = {
    school: "Grey High School",
    year: "2020",
    results: "87% Average",
  };

  // University modules with their metadata.
  // Each object represents a module and its assessment outcome at a specific term.
  const modules = [
    {
      year: 2024,
      term: "Jun",
      code: "14026341",
      name: "Data Science",
      mark: 50,
      status: "Pass",
    },
    {
      year: 2024,
      term: "Jun",
      code: "18139314",
      name: "Computer Science",
      mark: 50,
      status: "Pass",
    },
    {
      year: 2024,
      term: "Jun",
      code: "20710314",
      name: "Applied Mathematics",
      mark: 50,
      status: "Pass",
    },
    {
      year: 2024,
      term: "Jun",
      code: "22853314",
      name: "Mathematical Statistics",
      mark: 50,
      status: "Pass",
    },
    {
      year: 2023,
      term: "Nov",
      code: "14026341",
      name: "Data Science",
      mark: 75,
      status: "Pass",
    },
    {
      year: 2023,
      term: "Nov",
      code: "18139314",
      name: "Computer Science",
      mark: 65,
      status: "Pass",
    },
    {
      year: 2023,
      term: "Nov",
      code: "20710314",
      name: "Applied Mathematics",
      mark: 80,
      status: "Pass",
    },
    {
      year: 2023,
      term: "Nov",
      code: "22853314",
      name: "Mathematical Statistics",
      mark: 70,
      status: "Pass",
    },
    {
      year: 2023,
      term: "Jun",
      code: "25419876",
      name: "Economics",
      mark: 45,
      status: "Fail",
    },
    {
      year: 2023,
      term: "Jun",
      code: "25419877",
      name: "Econometrics",
      mark: 55,
      status: "Pass",
    },
  ];

  // Qualifications list shown as bullet points.
  const quals = [
    "BDatSci: Applied Mathematics (in progress)",
    "ANUx: Astrophysics",
  ];

  return (
    <div>
      {/* Section title */}
      <h2>Education</h2>

      {/* Qualifications as a simple unordered list */}
      <h3>Qualifications</h3>
      <ul>
        {quals.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ul>

      {/* High school (matric) summary */}
      <h3>Matric</h3>
      <p>
        {matric.school} ({matric.year}) — {matric.results}
      </p>

      {/* Modules table: basic academic transcript view */}
      <h3>Modules & Marks</h3>
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Module</th>
            <th>Mark</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((m) => (
            <tr key={m.code}>
              <td>{m.year}</td>
              <td>{m.name}</td>
              <td>{m.mark}</td>
              <td>{m.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
