# Rajvir Parmar's portfolio

An editorial engineering notebook at [rajvirparmar.ca](https://rajvirparmar.ca/), built with static HTML, CSS, and JavaScript. No build step or runtime packages.

The visual identity uses warm paper, graphite, terracotta, editorial section headings, and a bold sans-serif name. The hero includes the rotating "I build..." line and latest-project link alongside the compact full-color portrait, captions, and role details. The portrait sits closer to the intro on wider screens. Theme tokens live at the top of `style.css`. The name retains a simple underline hover and the portrait retains its layered 3D tilt.

## Exploring the site

- **Explore / Ctrl+K or Cmd+K:** search sections and projects, or use the Motion setting to pause/resume animations. Use Tab to reach controls, arrow keys for results, Enter to select, and Escape to close.
- **Navigation:** section visits update the URL fragment and support Back/Forward. The menu collapses when enlarged text needs more room, not only at mobile widths.
- **Hero layout:** the portrait and heading use compact proportions on shorter desktop viewports so the main section stays visible. Content remains scrollable on very short screens, mobile devices, and with enlarged text.
- **Projects:** combine search terms, categories, and technology filters; sort by year, preview a project, or try "Surprise me." Technology chips filter the collection. Reset restores the featured order and the original six-card view.
- **Experience:** expand a role for its tools, focus areas, and resume link.
- **Engineering sketch:** in About, switch between systems, machine learning, and games. Select a step or run a trace, then open the corresponding project. These are illustrative concept sketches, not claims of complete project architectures.
- **Background:** scrolling blends distinct section colors and more pronounced wireframe shapes, with thicker lines and stronger pointer response. There are no particles or autonomous drifting effects. Scene boundaries update when filters, expanded experience cards, or viewport size change the layout. "Pause motion" inside Explore freezes the current background and stops typing, name emphasis, photo tilt, sketch traces, and hover effects. Device reduced-motion preferences take priority; a fresh reduced-motion visit uses a static grid and traces show their final step immediately.
- **Typing line:** cycles through systems, apps, ML, and cloud phrases. Space is reserved for the longest phrase to avoid moving the hero controls. Reduced motion, manual pause, printing, and the no-JavaScript fallback show the complete "I build scalable systems." line.
- **Contact:** optional opening lines never overwrite an existing message. The counter and readiness indicator update as you write. New edits made during a submission are retained. Requests time out after 30 seconds with an explicit delivery-uncertain message and a preserved draft. Clipboard failures show a manual-copy alternative. Drafts are not stored in browser storage.
- **Fallbacks:** without JavaScript, static content, social links, the resume, and direct email remain available; the JavaScript-dependent form is hidden. Printing makes unscrolled content visible and omits interactive controls. Missing canvas support uses a static CSS grid without affecting other interactions.

Content lives in `index.html`: `EXPERIENCES`, `PROJECTS`, `INTERESTS`, and `CURRENTLY`. The notes in the margins are grounded in existing projects rather than inferred hobbies; the notebook overview uses the experience and project data. Project previews, filters, and quick navigation reuse these data rather than a second project list. `background.js` contains the section-keyed color/wireframe scene presets; `interactions.js` handles dialogs, sketches, and contact helpers.

Each project has a stable `id`. Notes and sketches link by that ID, so inserting or reordering projects does not change their destinations. Put the newest featured project first in `PROJECTS`; its card, hero link, preview, search entry, and notebook count update from that data.

Serve this directory with a local static HTTP server to preview it. Contact submission uses the existing Google Apps Script endpoint; intercept it during automated checks rather than sending test messages.
