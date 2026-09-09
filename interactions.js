/* Navigation and exploration share the portfolio data in index.html. */
(function () {
  'use strict';

  const explorer = document.getElementById('explorer');
  const explorerSearch = document.getElementById('explorer-search');
  const results = document.getElementById('explorer-results');
  const preview = document.getElementById('project-preview');
  let previewReturnTarget;

  function openProject(id, returnTarget = document.activeElement) {
    const project = getProject(id);
    previewReturnTarget = returnTarget;
    document.getElementById('preview-title').textContent = project.title;
    document.getElementById('preview-meta').textContent =
      'ENTRY ' + String(PROJECTS.indexOf(project) + 1).padStart(2, '0') + ' / ' + project.subtitle + ' / ' + project.year;
    document.getElementById('preview-description').textContent = project.description;
    const image = document.getElementById('preview-image');
    image.src = project.image;
    image.alt = project.title;
    document.getElementById('preview-source').href = project.github;
    const tags = document.getElementById('preview-tags');
    tags.replaceChildren();
    project.tags.forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'tag';
      chip.textContent = tag;
      tags.appendChild(chip);
    });
    preview.showModal();
    preview.scrollTop = 0;
    preview.querySelector('.dialog-close').focus();
  }

  preview.addEventListener('close', () => {
    // A search result disappears with its dialog; return to the visible trigger instead.
    if (previewReturnTarget instanceof HTMLElement && previewReturnTarget.isConnected) {
      previewReturnTarget.focus({ preventScroll: true });
    }
  });

  const destinations = [
    { id: 'hero', title: 'Back to the beginning', hint: 'Meet Rajvir' },
    { id: 'about', title: 'About me', hint: 'My background and toolkit' },
    { id: 'experience', title: 'Experience', hint: 'SOTI, Solink, Riipen, Loblaw Digital, Scotiabank, Humber' },
    { id: 'projects', title: 'Browse my projects', hint: 'Search, filter, and explore the source' },
    { id: 'beyond', title: 'In the margins', hint: 'Beyond the code: ideas, interests, and side projects' },
    { id: 'contact', title: 'Get in touch', hint: 'Send a message or copy my email' }
  ];
  let explorerReturnTarget;

  function renderExplorer() {
    const terms = explorerSearch.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const entries = [
      ...destinations.map(destination => ({
        title: destination.title, hint: destination.hint, keywords: destination.id, type: 'Section',
        run: () => navigateToSection(destination.id)
      })),
      ...PROJECTS.map(project => ({
        title: project.title, hint: [project.subtitle, ...project.tags].join(' / '), type: 'Project',
        run: () => openProject(project.id, explorerReturnTarget)
      }))
    ].filter(entry => terms.every(term => [entry.title, entry.hint, entry.keywords || ''].join(' ').toLowerCase().includes(term)));
    results.replaceChildren();
    document.getElementById('explorer-count').textContent = `${entries.length} results`;
    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = 'dialog-hint';
      empty.textContent = 'No matches. Try a technology, project name, or section.';
      results.appendChild(empty);
    }
    entries.forEach(entry => {
      const button = document.createElement('button');
      button.className = 'explorer-result';
      const title = document.createElement('strong');
      title.textContent = entry.title;
      const hint = document.createElement('span');
      hint.textContent = entry.type + ' / ' + entry.hint;
      button.append(title, hint);
      button.addEventListener('click', () => {
        explorer.close();
        entry.run();
      });
      results.appendChild(button);
    });
  }

  function openExplorer(trigger) {
    if (preview.open) return;
    if (mobileMenu.open) mobileMenu.close();
    explorerReturnTarget = trigger;
    explorerSearch.value = '';
    renderExplorer();
    explorer.showModal();
    explorerSearch.focus();
  }

  explorerSearch.addEventListener('input', renderExplorer);
  explorerSearch.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      results.querySelector('button')?.focus();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      results.querySelector('button')?.click();
    }
  });
  results.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const buttons = [...results.querySelectorAll('button')];
    const current = buttons.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
      : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus();
  });

  document.addEventListener('keydown', event => {
    const editing = event.target instanceof Element
      && event.target.closest('input, textarea, select, [contenteditable="true"]');
    if (event.key.toLowerCase() !== 'k' || !(event.ctrlKey || event.metaKey) || editing || event.repeat) return;
    event.preventDefault();
    if (explorer.open) explorer.close();
    else openExplorer(document.activeElement);
  });

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-open-explorer')) openExplorer(button);
    else if (button.hasAttribute('data-project-open')) openProject(button.dataset.projectOpen, button);
    else if (button.hasAttribute('data-project-tech')) selectProjectTechnology(button.dataset.projectTech);
    else if (button.hasAttribute('data-random-project')) openProject(PROJECTS[Math.floor(Math.random() * PROJECTS.length)].id, button);
  });

  // Keep Tab cycling through controls rather than leaving for browser chrome.
  [explorer, preview, mobileMenu].forEach(dialog => {
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        dialog.close();
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled)')]
        .filter(control => control.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog
        && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) {
        dialog.close();
      }
    });
  });

  const sketches = {
    systems: {
      project: 'microservice-app',
      steps: [
        ['Service', 'Start with a service.', "Go is part of the Microservice-App's toolkit. This project explores services alongside tracing, metrics, and load testing."],
        ['Data', 'Give the data a home.', 'PostgreSQL is the database in this project. The full experiment also uses Docker and OpenTelemetry.'],
        ['Signals', 'See what the system is doing.', 'Tracing, metrics, and load testing make this an observability experiment. Prometheus and Grafana are part of the stack.']
      ]
    },
    ml: {
      project: 'capstone',
      steps: [
        ['Data', 'Start with market data.', 'My capstone covers a financial-market prediction pipeline, beginning with data ingestion and preparation.'],
        ['Model', 'Put a model to work.', 'The pipeline uses XGBoost, with Python, Pandas, and scikit-learn in the toolkit.'],
        ['Backtest', 'Test the prediction.', 'Model evaluation and backtesting complete the pipeline. A prediction is only one part of the experiment.']
      ]
    },
    games: {
      project: 'ai-ping-pong',
      steps: [
        ['Play', 'A familiar playing field.', 'AIPingPong is a ping-pong game built with Python and Pygame.'],
        ['Evolve', 'Try a different kind of training.', 'The AI opponent is trained with NEAT, a neuroevolution algorithm.'],
        ['Opponent', 'Let the code play.', 'The result is an AI game opponent. Open the project to explore the source behind the experiment.']
      ]
    }
  };
  const sketch = document.getElementById('engineering-sketch');
  const modeButtons = [...sketch.querySelectorAll('[data-sketch-mode]')];
  const stepButtons = [...sketch.querySelectorAll('[data-sketch-step]')];
  const runTrace = document.getElementById('sketch-run');
  const sketchStatus = document.getElementById('sketch-status');
  let sketchMode = 'systems';
  let traceTimer = null;
  let traceStep = 0;

  function stopTrace() {
    clearTimeout(traceTimer);
    traceTimer = null;
    sketch.classList.remove('is-running');
    runTrace.textContent = 'Run the trace \u2192';
  }

  function showStep(index) {
    const step = sketches[sketchMode].steps[index];
    stepButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    document.querySelector('#sketch-note h4').textContent = step[1];
    document.querySelector('#sketch-note p').textContent = step[2];
  }

  function setSketchMode(mode) {
    stopTrace();
    sketchMode = mode;
    modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.sketchMode === mode)));
    stepButtons.forEach((button, i) => {
      button.querySelector('strong').textContent = sketches[mode].steps[i][0];
    });
    document.getElementById('sketch-project').dataset.projectOpen = sketches[mode].project;
    sketchStatus.textContent = 'A concept sketch, not a complete architecture.';
    showStep(0);
  }

  modeButtons.forEach(button => button.addEventListener('click', () => setSketchMode(button.dataset.sketchMode)));
  stepButtons.forEach((button, i) => button.addEventListener('click', () => {
    stopTrace();
    showStep(i);
    sketchStatus.textContent = `Inspecting step ${i + 1} of 3.`;
  }));
  function advanceTrace() {
    showStep(traceStep);
    sketchStatus.textContent = `Following the idea: step ${traceStep + 1} of 3.`;
    if (traceStep === 2) {
      stopTrace();
      sketchStatus.textContent = 'Trace complete. Open the project notes to keep exploring.';
    } else {
      traceStep++;
      traceTimer = setTimeout(advanceTrace, 850);
    }
  }
  runTrace.addEventListener('click', () => {
    if (traceTimer !== null) {
      stopTrace();
      sketchStatus.textContent = 'Trace stopped. You can still inspect any step.';
      return;
    }
    traceStep = motionEnabled() ? 0 : 2;
    sketch.classList.add('is-running');
    runTrace.textContent = 'Stop trace';
    advanceTrace();
  });
  function suspendTrace() {
    if (traceTimer !== null) {
      stopTrace();
      sketchStatus.textContent = 'Trace paused. Select a step to inspect it.';
    }
  }
  document.addEventListener('motionchange', suspendTrace);
  document.addEventListener('visibilitychange', () => { if (document.hidden) suspendTrace(); });
  setSketchMode(sketchMode);

  const message = document.getElementById('contact-message');
  const starters = [...document.querySelectorAll('[data-contact-topic]')];
  const openings = {
    collaboration: "Hi Rajvir,\n\nI'd love to build something together. Here's what I have in mind:\n\n",
    opportunity: "Hi Rajvir,\n\nI'd like to chat about an opportunity. Here are a few details:\n\n",
    hello: "Hey Rajvir,\n\nI came across your portfolio and wanted to say hi!\n\n"
  };
  function updateFormFeedback() {
    const fields = [document.getElementById('contact-name'), document.getElementById('contact-email'), message];
    fields.forEach(field => {
      field.setCustomValidity(field.value && !field.value.trim() ? 'Please enter more than spaces.' : '');
    });
    const ready = fields.filter(field => field.value.trim() && field.validity.valid).length;
    document.getElementById('form-progress').textContent = `${ready} of 3 fields ready`;
    document.getElementById('message-count').textContent =
      `${message.value.length} character${message.value.length === 1 ? '' : 's'}`;
    starters.forEach(button => { button.disabled = message.value.length > 0; });
  }
  starters.forEach(button => button.addEventListener('click', () => {
    message.value = openings[button.dataset.contactTopic];
    updateFormFeedback();
    message.focus();
    message.setSelectionRange(message.value.length, message.value.length);
  }));
  form.addEventListener('input', updateFormFeedback);
  form.addEventListener('reset', () => queueMicrotask(updateFormFeedback));
  updateFormFeedback();

  const copyButton = document.getElementById('copy-email');
  const copyStatus = document.getElementById('copy-status');
  copyButton.addEventListener('click', async () => {
    copyStatus.textContent = '';
    if (!navigator.clipboard) {
      copyStatus.textContent = 'Copy is unavailable here. Select the email address above, or open the email link.';
      return;
    }
    copyButton.disabled = true;
    try {
      await navigator.clipboard.writeText('rajvirparmar32@gmail.com');
      copyStatus.textContent = 'Email copied. Talk soon!';
    } catch (error) {
      console.warn('Clipboard access failed:', error);
      copyStatus.textContent = 'Clipboard access was blocked. Select the email address above to copy it.';
    } finally {
      copyButton.disabled = false;
    }
  });
})();
