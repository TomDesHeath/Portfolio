import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLocalStorage } from "../hooks/useLocalStorage.js";

/**
 * Gallery Component
 *
 * Provides a Pinterest-style image wall with:
 * - Default seeded images (by filename or data URL).
 * - Add image (URL paste or file upload → base64) when authenticated.
 * - Click-to-enlarge lightbox (modal overlay via React portal).
 * - Delete image in the lightbox when authenticated.
 * - Persistence of the gallery list via localStorage.
 *
 * UX/System notes:
 * - Uses CSS columns (inline styles) to create a masonry-like layout without JS.
 * - The lightbox locks background scroll by setting body.overflow = "hidden".
 * - createPortal mounts the lightbox at document.body so it overlays the whole app.
 * - Local state is source-of-truth, mirrored to localStorage via useLocalStorage.
 */

export default function Gallery() {
  const { isAuthed } = useAuth();

  // Default seed images; used on first run or when localStorage is empty.
  // Each item has a unique id to support deletion and React keys.
  const defaultImages = [
    { id: crypto.randomUUID(), url: "photo1.jpeg" },
    { id: crypto.randomUUID(), url: "photo2.jpeg" },
    { id: crypto.randomUUID(), url: "photo10.jpeg" },
    { id: crypto.randomUUID(), url: "photo4.jpeg" },
    { id: crypto.randomUUID(), url: "photo11.jpeg" },
    { id: crypto.randomUUID(), url: "photo6.jpeg" },
    { id: crypto.randomUUID(), url: "photo7.jpeg" },
    { id: crypto.randomUUID(), url: "photo9.jpeg" },
    { id: crypto.randomUUID(), url: "photo12.jpeg" },
    { id: crypto.randomUUID(), url: "photo3.jpeg" },
    { id: crypto.randomUUID(), url: "photo5.jpeg" },
    { id: crypto.randomUUID(), url: "photo8.jpeg" },
    { id: crypto.randomUUID(), url: "photo13.jpeg" },
  ];

  // images is persisted state (useLocalStorage syncs with "gallery:images")
  const [images, setImages] = useLocalStorage("gallery:images", defaultImages);

  // UI state for adding flow (show/hide controls) and new URL input
  const [adding, setAdding] = useState(false);
  const [newImage, setNewImage] = useState("");

  // Currently selected image object (opens in lightbox)
  const [selected, setSelected] = useState(null);

  // While lightbox is open, lock background scroll (restore on close)
  useEffect(() => {
    if (!selected) return;
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = prev;
    };
  }, [selected]);

  // Add a new image entry to the start of the list; reset add state
  function addImage(url) {
    const entry = { id: crypto.randomUUID(), url };
    const updated = [entry, ...images];
    setImages(updated);
    setNewImage("");
    setAdding(false);
  }

  // Delete the selected image by id, with a user confirmation
  function deleteImage(id) {
    if (!confirm("Delete this image?")) return;
    setImages(images.filter((img) => img.id !== id));
  }

  // Handle file uploads: convert to base64 and then add to gallery
  async function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await toBase64(f);
    addImage(b64);
  }

  return (
    <div>
      <h2>Gallery</h2>

      {/* Auth-gated controls: add via URL or file upload */}
      {isAuthed && (
        <div style={{ marginBottom: 16 }}>
          {adding ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                className="input"
                placeholder="Paste image URL…"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
              />
              <button
                className="active"
                onClick={() => {
                  if (newImage.trim()) addImage(newImage.trim());
                }}
              >
                Add
              </button>
              <input type="file" accept="image/*" onChange={onFileChange} />
              <button className="ghost" onClick={() => setAdding(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="ghost" onClick={() => setAdding(true)}>
              + Add Image
            </button>
          )}
        </div>
      )}

      {/* Masonry-like layout using CSS columns.
          Fallback: if images array is empty, render defaultImages (read-only). */}
      {images.length === 0 ? (
        <div
          style={{
            columnCount: 3,
            columnGap: "1em",
            maxWidth: 900,
            margin: "auto",
          }}
        >
          {defaultImages.map((img) => (
            <div
              key={img.id}
              style={{
                breakInside: "avoid",
                marginBottom: "1em",
                position: "relative",
              }}
              onClick={() => setSelected(img)}
            >
              <img
                src={img.url}
                alt="Gallery item"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  display: "block",
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            columnCount: 3,
            columnGap: "1em",
            maxWidth: 900,
            margin: "auto",
          }}
        >
          {images.map((img) => (
            <div
              key={img.id}
              style={{
                breakInside: "avoid",
                marginBottom: "1em",
                position: "relative",
              }}
              onClick={() => setSelected(img)}
            >
              <img
                src={img.url}
                alt="Gallery item"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  display: "block",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / modal overlay (portal) for selected image
         - Click backdrop to close
         - Close button at top-right
         - Delete (if authed) at bottom-right */}
      {selected &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="View image"
            onClick={() => setSelected(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              zIndex: 2147483647,
              display: "grid",
              placeItems: "center",
              padding: "4vmin",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                maxWidth: "min(1400px, 96vw)",
                maxHeight: "96vh",
                display: "grid",
                placeItems: "center",
              }}
            >
              <img
                src={selected.url}
                alt="Selected"
                style={{
                  maxWidth: "95vw",
                  maxHeight: "95vh",
                  objectFit: "contain",
                  borderRadius: 12,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
                }}
              />
              <button
                className="ghost"
                onClick={() => setSelected(null)}
                aria-label="Close"
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  fontSize: 18,
                }}
              >
                ✕
              </button>
              {isAuthed && (
                <button
                  className="ghost"
                  onClick={() => {
                    deleteImage(selected.id);
                    setSelected(null);
                  }}
                  style={{ position: "absolute", bottom: 16, right: 16 }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

/**
 * Utility: convert a File to a base64-encoded data URL.
 * Used for inline storage/preview of uploaded images without external hosting.
 */
function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
