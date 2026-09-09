# Rajvir Parmar's portfolio

An editorial engineering notebook at [rajvirparmar.ca](https://rajvirparmar.ca/), built with static HTML, CSS, and JavaScript. No build step or runtime packages.

The visual identity uses warm paper, graphite, terracotta, editorial section headings, and a bold sans-serif name. Theme tokens live at the top of `style.css`. A drafting grid reacts to the pointer without particles, twinkling, or glows. The name uses a simple underline hover; the portrait retains its layered 3D tilt without bursts, glare, tape, or handwritten decoration.

## Exploring the site

- **Explore / Ctrl+K or Cmd+K:** search sections and projects, or use the Motion setting to pause/resume animations. Use Tab to reach controls, arrow keys for results, Enter to select, and Escape to close.
- **Navigation:** section visits update the URL fragment and support Back/Forward. The menu collapses when enlarged text needs more room, not only at mobile widths.
- **Projects:** combine search terms, categories, and technology filters; sort by year, preview a project, or try "Surprise me." Technology chips filter the collection. Reset restores the featured order and the original six-card view.
- **Experience:** expand a role for its tools, focus areas, and resume link.
- **Engineering sketch:** in About, switch between systems, machine learning, and games. Select a step or run a trace, then open the corresponding project. These are illustrative concept sketches, not claims of complete project architectures.
- **Background:** the grid bends subtly near a mouse pointer and is otherwise static. "Pause motion" inside Explore stops grid interaction, typing, name emphasis, photo tilt, sketch trace, and hover effects for this page visit. Device reduced-motion preferences take priority and update live. Traces show their final step immediately when motion is disabled.
- **Contact:** optional opening lines never overwrite an existing message. The counter and readiness indicator update as you write. New edits made during a submission are retained. Requests time out after 30 seconds with an explicit delivery-uncertain message and a preserved draft. Clipboard failures show a manual-copy alternative. Drafts are not stored in browser storage.
- **Fallbacks:** without JavaScript, static content, social links, the resume, and direct email remain available; the JavaScript-dependent form is hidden. Printing makes unscrolled content visible and omits interactive controls. Missing canvas support uses a static CSS grid without affecting other interactions.

Content lives in `index.html`: `EXPERIENCES`, `PROJECTS`, `INTERESTS`, and `CURRENTLY`. The notes in the margins are grounded in existing projects rather than inferred hobbies; the notebook overview uses the experience and project data. Project previews, filters, and quick navigation reuse these data rather than a second project list. `background.js` renders the drafting grid; `interactions.js` handles dialogs, sketches, and contact helpers.

Each project has a stable `id`. Notes and sketches link by that ID, so inserting or reordering projects does not change their destinations. Put the newest featured project first in `PROJECTS`; its card, preview, search entry, and notebook count update from that data.

Serve this directory with a local static HTTP server to preview it. Contact submission uses the existing Google Apps Script endpoint; intercept it during automated checks rather than sending test messages.
