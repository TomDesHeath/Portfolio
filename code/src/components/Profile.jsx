import { useState, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Profile Component
 *
 * Renders a user profile panel with photo, summary, and plans. Fields are persisted to localStorage
 * via a custom hook. Auth state gates editing: logged-out users see Login/Create buttons,
 * logged-in users can edit fields and logout.
 *
 * Key ideas:
 * - **State sources**: canonical values live in localStorage (via useLocalStorage);
 *   editing uses local "draft" state so the user can cancel/confirm changes.
 * - **Accessibility**: editable labels get role="button", keyboard handlers (Enter/Space),
 *   and a visible "edit chip" affordance when authed.
 * - **Modal UX**: editing opens a portal-rendered modal; body scroll is locked while open;
 *   Escape closes the modal.
 *
 * Props:
 * @param {{ onRequestAuth?: (mode: 'login' | 'create') => void }} props
 *   Optional callback to open the global auth modal in a given mode.
 */

export default function Profile({ onRequestAuth }) {
  const { isAuthed, logout } = useAuth(); // authentication state + logout action

  // Persistent profile fields (read/write from localStorage).
  // Note: default photo is a URL object; localStorage hook handles serialization.
  const [summary, setSummary] = useLocalStorage(
    "profile:summary",
    "I'm a curious and driven third-year student at Stellenbosch University, majoring in Data Science and Applied Mathematics. I have strong people, leadership, and organizational skills."
  );
  const [plans, setPlans] = useLocalStorage(
    "profile:plans",
    "Looking ahead, I want to use my skills in data analysis and machine learning to pivot into the finance and technology sectors. I am eager to connect with professionals in these fields to learn more about potential career paths and am open to new opportunities that allow me to apply my skills to real-world challenges."
  );
  const [photo, setPhoto] = useLocalStorage("profile:photo", {
    url: "/tomdesheath.jpg",
  });

  // Local "draft" editing state; mirrors the persisted values during editing.
  const [editing, setEditing] = useState(false);
  const [draftSummary, setDraftSummary] = useState(summary);
  const [draftPlans, setDraftPlans] = useState(plans);
  const [draftPhoto, setDraftPhoto] = useState(photo);
  const [editMode, setEditMode] = useState("summary"); // 'summary' | 'plans' | 'photo'

  // Keep drafts synchronized with canonical values (ensures preview == current storage).
  useEffect(() => {
    setDraftSummary(summary);
    setDraftPlans(plans);
    setDraftPhoto(photo);
  }, [summary, plans, photo]);

  // While the modal is open, lock body scroll to prevent background content from moving.
  useEffect(() => {
    if (!editing) return;
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = prev;
    };
  }, [editing]);

  // Open/close editing modal; choose which field to edit.
  function openEditor(mode = "summary") {
    setEditMode(mode);
    setEditing(true);
  }
  function closeEditor() {
    setEditing(false);
  }

  // Persist changes from drafts back to localStorage based on the active edit mode.
  function saveEdits() {
    if (editMode === "summary") {
      setSummary(draftSummary.trim());
    } else if (editMode === "plans") {
      setPlans(draftPlans.trim());
    } else if (editMode === "photo") {
      setPhoto(draftPhoto);
    }
    setEditing(false);
  }

  // Global keyboard shortcut: Escape closes the editor when open.
  useEffect(() => {
    if (!editing) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeEditor();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);

  // Image upload handler: downscale + encode to base64 for storage/preview.
  // This reduces localStorage bloat and speeds up rendering.
  async function onPhotoChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const b64 = await downscaleAndEncode(f, 640, 0.85);
      setDraftPhoto(b64);
    } catch (err) {
      console.error(err);
      alert(
        "Could not process image. Try a different file or a smaller image."
      );
    }
  }

  return (
    <>
      {/* Profile card container */}
      <div className="profile">
        {/* Photo block with edit affordance when authed */}
        <div
          style={{ position: "relative", maxWidth: "240px", margin: "auto" }}
        >
          <img
            src={photo}
            alt="Profile"
            style={{
              borderRadius: "10px",
              maxWidth: "240px",
              width: "100%",
              display: "block",
              cursor: isAuthed ? "pointer" : "default",
            }}
            onClick={() => isAuthed && openEditor("photo")}
            title={isAuthed ? "Click to change photo" : undefined}
          />
          {isAuthed && (
            <span
              className="edit-chip"
              title="Click to edit photo"
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {/* Name / heading */}
        <h2
          style={{
            textAlign: "center",
            marginTop: 8,
            marginBottom: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Tom Des Heath
        </h2>

        {/* Summary and Plans sections with inline edit affordances */}
        <div>
          <p
            className={'editable ${isAuthed ? "editable--enabled" : ""}'}
            style={{
              color: "var(--accent)",
              fontStyle: "oblique",
              fontSize: 15,
              opacity: "80%",
              display: "flex",
              alignItems: "center",
              margin: "0",
            }}
            onClick={() => isAuthed && openEditor("summary")}
            onKeyDown={(e) => {
              if (isAuthed && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                openEditor();
              }
            }}
            role={isAuthed ? "button" : undefined}
            tabIndex={isAuthed ? 0 : undefined}
            title={isAuthed ? "Click to edit" : undefined}
          >
            Summary:
            {isAuthed && <span className="edit-chip" title="Click to edit" />}
          </p>
          <p style={{ margin: "0", position: "flex", alignSelf: "center" }}>
            {summary}
          </p>

          <p
            className={'editable ${isAuthed ? "editable--enabled" : ""}'}
            style={{
              color: "var(--accent)",
              fontStyle: "oblique",
              fontSize: 15,
              opacity: "80%",
              display: "flex",
              alignItems: "center",
              margin: "0",
            }}
            onClick={() => isAuthed && openEditor("plans")}
            onKeyDown={(e) => {
              if (isAuthed && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                openEditor();
              }
            }}
            role={isAuthed ? "button" : undefined}
            tabIndex={isAuthed ? 0 : undefined}
            title={isAuthed ? "Click to edit" : undefined}
          >
            Plans:
            {isAuthed && <span className="edit-chip" title="Click to edit" />}
          </p>
          <p style={{ margin: "0", position: "flex", alignSelf: "center" }}>
            {plans}
          </p>
        </div>

        {/* Auth controls: either show Login/Create or Logout */}
        <footer>
          {!isAuthed ? (
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                marginTop: 8,
              }}
            >
              <button
                className="ghost"
                onClick={() => onRequestAuth?.("login")}
              >
                Login
              </button>
              <button
                className="ghost"
                onClick={() => onRequestAuth?.("create")}
              >
                Create Account
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 8,
              }}
            >
              <button className="ghost" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </footer>
      </div>

      {/* Editing modal (portaled to body so it overlays the full app) */}
      {editing &&
        createPortal(
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Edit Profile"
            onClick={closeEditor}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              {/* Modal header with context-aware title */}
              <div className="modal__header">
                <h3 style={{ margin: 0 }}>
                  {editMode === "photo" ? "Edit Photo" : "Edit Profile"}
                </h3>
                <button
                  className="ghost"
                  onClick={closeEditor}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Modal body: renders a different editor based on editMode */}
              <div className="modal__body">
                {editMode == "photo" && (
                  <>
                    <label>
                      <div style={{ display: "grid", gap: 8 }}>
                        <img
                          src={draftPhoto}
                          alt="Preview"
                          style={{
                            maxHeight: "300px",
                            marginLeft: "auto",
                            marginRight: "auto",
                            borderRadius: 10,
                          }}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onPhotoChange}
                        />
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => setDraftPhoto("/placeholder.jpg")}
                        >
                          Remove photo
                        </button>
                      </div>
                    </label>
                  </>
                )}

                {editMode == "summary" && (
                  <>
                    <label>
                      <small>Summary</small>
                      <textarea
                        className="input"
                        rows="4"
                        value={draftSummary}
                        onChange={(e) => setDraftSummary(e.target.value)}
                      />
                    </label>
                  </>
                )}

                {editMode == "plans" && (
                  <>
                    <label>
                      <small>Plans</small>
                      <textarea
                        className="input"
                        rows="4"
                        value={draftPlans}
                        onChange={(e) => setDraftPlans(e.target.value)}
                      />
                    </label>
                  </>
                )}

                {/* Modal action buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <button className="ghost" type="button" onClick={closeEditor}>
                    Cancel
                  </button>
                  <button className="active" type="button" onClick={saveEdits}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

/**
 * Utility: file -> base64 string using FileReader.
 * Returns a Promise that resolves with the data URL representation.
 */
function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/**
 * downscaleAndEncode
 * Loads an image, proportionally downsizes it so that the longest dimension
 * is at most 'maxDim', draws to a canvas, and exports a JPEG data URL at
 * the given 'quality'.
 *
 * Rationale: reduces storage size (good for localStorage) and memory use
 * while keeping a decent preview quality.
 *
 * @param {File} file
 * @param {number} [maxDim=640]
 * @param {number} [quality=0.85] - JPEG quality (0..1)
 * @returns {Promise<string>} data URL of the downscaled image
 */
async function downscaleAndEncode(file, maxDim = 640, quality = 0.85) {
  const dataUrl = await toBase64(file);
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const { width, height } = img;
  if (Math.max(width, height) <= maxDim) return dataUrl; // already small enough

  // Compute scale factor to fit the largest dimension within maxDim.
  const scale = maxDim / Math.max(width, height);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  // Draw scaled bitmap to an offscreen canvas and export as JPEG.
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}
