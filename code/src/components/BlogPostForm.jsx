import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * BlogPostForm Component
 *
 * Allows an authenticated user to create a new blog post with title, body, tags, and an optional image.
 * Converts uploaded images into base64 strings so they can be persisted directly in localStorage.
 *
 * @typedef {Object} Post
 * @property {string|number} id        - Unique identifier (UUID generated on creation).
 * @property {string} title            - Title text of the blog post.
 * @property {string} body             - Main content of the blog post.
 * @property {string[]} tags           - Tags split from a comma-separated input.
 * @property {string} [image]          - Base64-encoded image string or URL.
 * @property {number} createdAt        - Unix timestamp when the post was created.
 *
 * @param {{ onCreate: (post: Post) => void }} props
 *   - onCreate: callback function provided by parent component to handle new posts.
 */

export default function BlogPostForm({ onCreate }) {
  const { isAuthed } = useAuth(); // Access authentication state from context
  const [title, setTitle] = useState(""); // Controlled input for post title
  const [body, setBody] = useState(""); // Controlled input for main text
  const [tags, setTags] = useState(""); // Controlled input for comma-separated tags
  const [image, setImage] = useState(""); // Holds base64-encoded preview of uploaded image

  // If the user is not authenticated, block access and show a message
  if (!isAuthed) return <p>Login to create a post.</p>;

  // Handle image uploads: convert file -> base64 string for storage and preview
  async function onImage(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await toBase64(f);
    setImage(b64);
  }

  // Handle form submission
  function submit(e) {
    e.preventDefault();
    if (!title.trim()) return; // Require a title before posting

    // Construct the post object with trimmed inputs
    const post = {
      id: crypto.randomUUID(), // Generate unique identifier
      title: title.trim(),
      body: body.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim()) // Clean whitespace around tags
        .filter(Boolean), // Remove empty entries
      image,
      createdAt: Date.now(),
    };

    onCreate(post); // Pass new post back to parent for persistence
    // Reset the form fields
    setTitle("");
    setBody("");
    setTags("");
    setImage("");
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3>Create Post</h3>
      {/* Input for post title */}
      <input
        className="input"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Textarea for post body */}
      <textarea
        className="input"
        rows="4"
        placeholder="Write your post..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      {/* Input for comma-separated tags */}
      <input
        className="input"
        placeholder="tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      {/* Image uploader + preview */}
      <div style={{ display: "grid", gap: 8 }}>
        <input type="file" accept="image/*" onChange={onImage} />
        {image && (
          <div>
            {/* Preview of selected image */}
            <img
              src={image}
              alt="Selected"
              style={{ maxWidth: "100%", borderRadius: 10 }}
            />
            <button
              type="button"
              className="ghost"
              onClick={() => setImage("")}
              style={{ marginTop: 8 }}
            >
              Remove image
            </button>
          </div>
        )}
      </div>

      {/* Submit button */}
      <button className="ghost" style={{ margin: "10px", marginLeft: "0" }}>
        Create
      </button>
    </form>
  );
}

// Utility: converts a File object into a base64 string using FileReader API.
// Useful for storing images in localStorage or inline <img> src attributes.
function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
