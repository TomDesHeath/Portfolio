
# Project 1

A personal portfolio and blogging/gallery web application built with **React**, **Vite**, and **localStorage** persistence.

## Author

Created by Tom Des Heath (SU 24888923) as part of CS343.

## Features

- **Profile Section**  
  Editable profile with name, photo, summary, and future plans stored in localStorage.

- **Education & Experience**  
  Sections for showcasing your background, presented with a clean responsive design.

- **Blog**  
  - Default set of posts with titles, content, images, and tags.
  - Ability to add and delete posts when logged in.
  - Posts can be clicked to expand into a full modal view.

- **Gallery**  
  - Pinterest-style image wall with default seeded images.
  - Logged-in users can add or remove images.
  - Clicking any image opens a full lightbox overlay.

- **Authentication**  
  - Local, minimal authentication layer (username + password).
  - Supports account creation and login with localStorage persistence.

- **Theme Toggle**  
  Smooth light/dark theme switching with background image crossfade.

- **Responsive Design**  
  Works across desktop, tablet, and mobile with adaptive layouts.

## Usage Guide

Once the app is running locally (via `npm run dev`), you can interact with the different sections as follows:

### Authentication

- Click **Login** or **Create Account** in the Profile panel.
- Enter a username and password.  
  - Creating an account saves your credentials in `localStorage` (client-side only).  
  - Once authenticated, additional features (like deleting posts/images) become available.
- You can log out at any time using the **Logout** button in the Profile panel.

### Profile

- Editable fields: **photo**, **summary**, and **future plans**.
- When logged in, click directly on these fields (or the profile photo) to open an editor modal.
- Changes are persisted in `localStorage` and will remain after a page refresh.

### Blog

- The blog starts with three **default posts** (seeded at first run).
- **Create Post**:  
  - Enter a title, body, optional tags (comma-separated), and optionally attach an image.  
  - Posts are timestamped and saved to `localStorage`.
- **Expand Post**: Click a post to view it in a modal.  
- **Delete Post**: When logged in, a delete button appears on each post card and in the modal.

### Gallery

- Default gallery contains 9 seeded images.  
- **Add Image**:  
  - Click **+ Add Image** (visible only when logged in).  
  - Provide an image URL or upload a file (converted to base64).  
- **View Image**: Click any image to open it fullscreen in a modal.  
- **Delete Image**: When logged in, a delete button appears in the modal.

### Navigation

- The **tabs in the navigation bar** switch between sections: Education, Experience, Blog, and Gallery.  
- The currently active section is highlighted, and your last selected tab is saved to `localStorage`.

### Theme Toggle

- A **Toggle Theme** button in the nav bar switches between light and dark mode.  
- Backgrounds crossfade smoothly, and the preference is remembered between sessions.

### Responsive Layout

- Desktop: Profile sidebar + content side-by-side.  
- Tablet/Phone: Layout adapts to stacked view with scrollable sections.  
- Images and tables scale fluidly with viewport size.

## Tech Stack

- [Vite](https://vitejs.dev/) for bundling and development.
- [React](https://react.dev/) for UI components.
- [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) for persistence.
- Plain CSS (with custom properties and responsive media queries).

## Getting Started

Ensure you are in the /code directory.

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

Open [http://localhost:4173](http://localhost:4173).

### Clean

Remove `dist` and `node_modules`:

```bash
rm -rf dist node_modules
```

## File Structure

```markdown
code
 ┣ public
 ┃ ┣ hero-dark.JPG
 ┃ ┣ hero.JPG
 ┃ ┣ photo1.jpeg
 ┃ ┣ photo10.jpeg
 ┃ ┣ photo11.jpeg
 ┃ ┣ photo12.jpeg
 ┃ ┣ photo13.jpeg
 ┃ ┣ photo2.jpeg
 ┃ ┣ photo3.jpeg
 ┃ ┣ photo4.jpeg
 ┃ ┣ photo5.jpeg
 ┃ ┣ photo6.jpeg
 ┃ ┣ photo7.jpeg
 ┃ ┣ photo8.jpeg
 ┃ ┣ photo9.jpeg
 ┃ ┣ placeholder.jpg
 ┃ ┗ tomdesheath.jpg
 ┣ src
 ┃ ┣ components
 ┃ ┃ ┣ BlogList.jsx
 ┃ ┃ ┣ BlogPostForm.jsx
 ┃ ┃ ┣ Nav.jsx
 ┃ ┃ ┣ Profile.jsx
 ┃ ┃ ┣ SearchBar.jsx
 ┃ ┃ ┗ TagFilter.jsx
 ┃ ┣ context
 ┃ ┃ ┗ AuthContext.jsx
 ┃ ┣ hooks
 ┃ ┃ ┗ useLocalStorage.js
 ┃ ┣ sections
 ┃ ┃ ┣ Blog.jsx
 ┃ ┃ ┣ Education.jsx
 ┃ ┃ ┣ Experience.jsx
 ┃ ┃ ┗ Gallery.jsx
 ┃ ┣ styles
 ┃ ┃ ┗ global.css
 ┃ ┣ App.jsx
 ┃ ┗ main.jsx
 ┣ Makefile
 ┣ index.html
 ┣ package-lock.json
 ┣ package.json
 ┗ vite.config.js
```

## Known Limitations

- Authentication is stored in localStorage only (not secure for production).
- Posts and gallery items are client-side only — no backend persistence.
- Limited input validation.

## Testing

- Run the app locally and manually test login, blog posting, and gallery image add/remove.

## Academic Context

This project was submitted as part of CS343 (Web Application Development) at Stellenbosch University.

## Notes on AI Involvement
  
AI tools (such as ChatGPT) were used **only as a teaching and mentoring aid** - to explain concepts, provide guidance, and help debug issues. **No production code was directly generated or copy-pasted from AI.** All implementation decisions, architecture, and coding were performed manually. AI was used to help with commenting to keep things consistent and structured. Followed R&K commenting standard as learned in CS244.
