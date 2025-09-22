import { useEffect, useMemo, useState, useRef } from "react";
import SearchBar from "../components/SearchBar.jsx";
import TagFilter from "../components/TagFilter.jsx";
import BlogPostForm from "../components/BlogPostForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createPortal } from "react-dom";

/**
 * Blog Section (Component)
 *
 * High-level responsibilities:
 * - Seed and persist blog posts in localStorage.
 * - Provide search, tag-based filtering, and sort (newest/oldest).
 * - Support creating posts (via BlogPostForm) and deleting (when authed).
 * - Show a full post preview in a modal (using a React portal).
 * - Manage some UX polish: intersection-based reveal, body scroll lock, ESC to close modal.
 *
 * Data model (post shape):
 * {
 *   id: string,               // unique ID for React keys and deletion
 *   title: string,            // post title
 *   body?: string,            // main content (used in modal)
 *   content?: string,         // optional alt content key supported in search/modal
 *   excerpt?: string,         // optional short summary used in card view
 *   tags: string[],           // tag list
 *   image?: string,           // image URL or base64 data URL
 *   createdAt: number|string, // timestamp or date-like string
 *   date|publishedAt?: string // alternative timestamp fields for robustness
 * }
 */

/**
 * Helper: read posts from localStorage or seed defaults on first run.
 * - Ensures each post has an id.
 * - Writes defaults back to storage if none found (so the app starts with content).
 */
function getPosts() {
  const makeDefaults = () => {
    const now = Date.now();
    return [
      {
        id: crypto.randomUUID(),
        title: "Welcome to the Blog",
        body: "This is your first post. You can edit or delete it, or create your own. Pro tip: add tags like #intro to make filtering easier.",
        tags: ["intro", "welcome"],
        image: "/placeholder.jpg",
        createdAt: now,
      },
      {
        id: crypto.randomUUID(),
        title: "Adding Images to Posts",
        body: "Attach a photo to your post. Large images are downscaled in some places to keep things snappy.",
        tags: ["howto", "images"],
        image: "/placeholder.jpg",
        createdAt: now - 1000 * 60 * 60 * 24, // 1 day ago
      },
      {
        id: crypto.randomUUID(),
        title: "Tag Filtering Demo",
        body: "Use the tag chips above the list to filter posts. Try clicking on #demo or #tips.",
        tags: ["demo", "tips"],
        image: "/placeholder.jpg",
        createdAt: now - 1000 * 60 * 60 * 48, // 2 days ago
      },
    ];
  };

  try {
    const raw = JSON.parse(localStorage.getItem("posts") || "[]");
    if (Array.isArray(raw) && raw.length > 0) {
      // Normalize any missing IDs (backward compatibility with older data)
      return raw.map((p) => ({ ...p, id: p.id ?? crypto.randomUUID() }));
    }
    // Seed defaults if nothing is stored yet
    const defaults = makeDefaults();
    savePosts(defaults);
    return defaults;
  } catch {
    // If parsing fails, reset to defaults to keep the app usable
    const defaults = makeDefaults();
    savePosts(defaults);
    return defaults;
  }
}

/**
 * Helper: persist posts to localStorage (or clear when empty).
 */
function savePosts(posts) {
  try {
    if (Array.isArray(posts) && posts.length === 0) {
      localStorage.removeItem("posts");
      return;
    }
    localStorage.setItem("posts", JSON.stringify(posts));
  } catch (err) {
    console.error("[posts] Failed to persist posts to localStorage:", err);
  }
}

export default function Blog() {
  const { isAuthed } = useAuth(); // controls whether "Delete" buttons appear
  const [posts, setPosts] = useState(getPosts()); // canonical posts state
  const [search, setSearch] = useState(""); // search query string
  const [selectedTags, setSelectedTags] = useState([]); // active tag filters
  const [sort, setSort] = useState("newest"); // "newest" | "oldest"
  const [selected, setSelected] = useState(null); // currently opened post in modal

  const cardRef = useRef(null); // used for intersection-based reveal animation

  // Persist posts whenever they change
  useEffect(() => {
    savePosts(posts);
  }, [posts]);

  // IntersectionObserver for a simple "appear" effect when the card scrolls into view
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("is-visible");
        else el.classList.remove("is-visible");
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Close modal with Escape key
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  // While modal is open, lock background scroll
  useEffect(() => {
    if (!selected) return;
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = prev;
    };
  }, [selected]);

  // Compute the set of all tags (unique) across all posts
  const allTags = useMemo(() => {
    const tags = posts.flatMap((p) => (Array.isArray(p.tags) ? p.tags : []));
    return Array.from(new Set(tags));
  }, [posts]);

  // Derived list: apply search filter, tag filter, and sorting
  const filtered = useMemo(() => {
    const list = [...posts];
    const needle = search.trim().toLowerCase();

    // Text search against title + content-like fields + tags
    let out = !needle
      ? list
      : list.filter((p) => {
          const title = (p.title || "").toLowerCase();
          const content = (
            p.content ||
            p.body ||
            p.excerpt ||
            ""
          ).toLowerCase();
          const tags = (Array.isArray(p.tags) ? p.tags : []).map((t) =>
            (t || "").toLowerCase()
          );
          return (
            title.includes(needle) ||
            content.includes(needle) ||
            tags.some((t) => t.includes(needle))
          );
        });

    // Tag filter: require every selected tag to be present on the post
    if (selectedTags.length) {
      out = out.filter((p) => {
        const tags = Array.isArray(p.tags) ? p.tags : [];
        return selectedTags.every((t) => tags.includes(t));
      });
    }

    // Robust timestamp extraction (supports numeric or date-like strings)
    const getTime = (p) => {
      if (typeof p.createdAt === "number") return p.createdAt;
      const t = Date.parse(p.date || p.publishedAt || p.createdAt);
      return Number.isNaN(t) ? 0 : t;
    };

    // Sort final list by time
    out.sort((a, b) =>
      sort === "newest" ? getTime(b) - getTime(a) : getTime(a) - getTime(b)
    );
    return out;
  }, [posts, search, selectedTags, sort]);

  // Toggle a tag filter on/off
  function onToggleTag(tag) {
    setSelectedTags((t) =>
      t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]
    );
  }

  // Remove a post by id
  function deletePost(id) {
    setPosts((ps) => ps.filter((p) => p.id !== id));
  }

  return (
    <div>
      {/* Modal: full post view (portal to body ensures it overlays the whole app) */}
      {selected &&
        createPortal(
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Post details"
            onClick={() => setSelected(null)}
          >
            <div
              className="modal modal--lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal__header">
                <h3 className="post-modal__title">{selected.title}</h3>
                <button
                  className="ghost"
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="modal__body">
                <small className="post-modal__meta">
                  {selected.createdAt
                    ? new Date(
                        typeof selected.createdAt === "number"
                          ? selected.createdAt
                          : Date.parse(selected.createdAt)
                      ).toLocaleString()
                    : ""}
                </small>
                {selected.image && (
                  <img
                    className="post-modal__img"
                    src={selected.image}
                    alt={selected.title || "Post image"}
                  />
                )}
                <div className="post-modal__body">
                  {selected.excerpt || selected.content || selected.body || ""}
                </div>
                {Array.isArray(selected.tags) && selected.tags.length > 0 && (
                  <div className="post-modal__tags">
                    {selected.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Main card container (observed for "is-visible" reveal) */}
      <div ref={cardRef} id="BlogCard">
        <header className="card__header">
          <h2>Blog</h2>

          {/* Creation form: pushes the new post to the top of the list */}
          <BlogPostForm onCreate={(p) => setPosts((ps) => [p, ...ps])} />

          {/* Search + sort controls */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              margin: "10px 0",
            }}
          >
            <SearchBar value={search} onChange={setSearch} />
            <select
              className="input"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* Tag filter chips built from allTags */}
          <TagFilter
            tags={allTags}
            selected={selectedTags}
            onToggle={onToggleTag}
          />
        </header>

        {/* Post grid/list */}
        <div className="list">
          {filtered.map((p) => {
            // Derive a short date string for the card
            const ts =
              typeof p.createdAt === "number"
                ? p.createdAt
                : Date.parse(p.date || p.publishedAt || p.createdAt);
            const when = Number.isNaN(ts)
              ? ""
              : new Date(ts).toLocaleDateString();

            return (
              <article
                key={p.id ?? p.title} // fallback key if id is missing (legacy)
                className="post"
                role="button"
                tabIndex={0}
                onClick={() => setSelected(p)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelected(p);
                }}
              >
                {/* Header row: title/date and optional Delete (if authed) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div>
                    <h3 style={{ marginBottom: 4 }}>{p.title}</h3>
                    {when && <small style={{ opacity: 0.7 }}>{when}</small>}
                  </div>
                  {isAuthed && (
                    <button
                      className="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this post?")) deletePost(p.id);
                      }}
                      aria-label={'Delete ${p.title}'}
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* Optional image preview */}
                {p.image && <img src={p.image} alt={p.title || "Post image"} />}

                {/* Short text on card; full body is shown in the modal */}
                <p>{p.excerpt || p.content || ""}</p>

                {/* Tag pills (read-only on card) */}
                <tags className="tags">
                  {Array.isArray(p.tags)
                    ? p.tags.map((t) => (
                        <span
                          key={t}
                          className="tag"
                          style={{
                            color: "var(--muted)",
                            borderColor: "var(--muted)",
                          }}
                        >
                          {t}
                        </span>
                      ))
                    : null}
                </tags>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
