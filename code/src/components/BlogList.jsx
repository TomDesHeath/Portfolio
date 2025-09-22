/**
 * BlogList Component
 *
 * Expects a 'posts' prop which is an array of objects with the following shape:
 *
 * @typedef {Object} Post
 * @property {string|number} id        - Unique identifier for the post (used as React key).
 * @property {string} title            - Title text of the blog post.
 * @property {string} body             - Main content of the blog post.
 * @property {string[]} tags           - Array of string tags (e.g., ["react", "webdev"]).
 * @property {string|number|Date} createdAt - Timestamp or Date when the post was created.
 * @property {string} [image]          - Optional image URL to display with the post.
 *
 * @param {{ posts: Post[] }} props
 */

// BlogList is a React functional component that displays a list of blog posts.
// It accepts a 'posts' prop, which should be an array of post objects.

export default function BlogList({ posts }) {
  // If the posts array is empty, render a fallback message instead of an empty list.
  if (!posts.length) return <p>No posts yet.</p>;

  // Otherwise, render the list of posts as <article> elements.
  return (
    <div className="list">
      {posts.map((p) => (
        // Each post is wrapped in an article element styled as a card.
        // The 'key' is set to the post's unique id.
        <article className="post card" key={p.id}>
          {/* If an image is provided for the post, render it at the top. */}
          {p.image && <img src={p.image} alt="attachment" />}

          {/* Post title */}
          <h3>{p.title}</h3>

          {/* Render tags associated with the post, each prefixed with '#' */}
          <div className="tags">
            {p.tags.map((t) => (
              <span key={t} className="tag">
                #{t}
              </span>
            ))}
          </div>

          {/* Display the creation time as a string. */}
          <small style={{ color: "var(--muted)" }}>
            {new Date(p.createdAt).toLocaleString()}
          </small>

          {/* Post body text */}
          <p>{p.body}</p>
        </article>
      ))}
    </div>
  );
}
