
(function(){
  // Mobile nav
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  if(menuBtn && menu){
    menuBtn.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  // Theme toggle: 'auto' (default), 'light', 'dark'
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'auto';
  applyTheme(savedTheme);
  if(themeBtn){
    themeBtn.addEventListener('click', () => {
      const current = localStorage.getItem('theme') || 'auto';
      const next = current === 'auto' ? 'light' : (current === 'light' ? 'dark' : 'auto');
      localStorage.setItem('theme', next);
      applyTheme(next);
    });
  }
  function applyTheme(mode){
    root.removeAttribute('data-theme');
    if(mode === 'light'){ root.setAttribute('data-theme', 'light'); }
    if(mode === 'dark'){ root.setAttribute('data-theme', 'dark'); }
    if(themeBtn){ themeBtn.textContent = mode[0].toUpperCase() + mode.slice(1); }
  }

  // Helper: load JSON
  async function loadProjects(){
    const res = await fetch('data/projects.json', {cache:'no-store'});
    if(!res.ok) throw new Error('Failed to load projects.json');
    return await res.json();
  }

  // Render featured projects on index
  async function renderFeatured(){
    const el = document.getElementById('featured'); if(!el) return;
    try{
      const data = await loadProjects();
      const featured = data.projects.filter(p => p.featured).slice(0, 3);
      el.innerHTML = featured.map(cardHTML).join('');
    }catch(err){
      el.innerHTML = '<p class="small">Could not load projects.</p>';
      console.error(err);
    }
  }

  function cardHTML(p){
    return `
      <article class="card">
        <a href="project.html?slug=${encodeURIComponent(p.slug)}" aria-label="${escapeHTML(p.title)}">
          <div class="thumb"><img src="${p.thumbnail || 'assets/img/thumb-800x450.svg'}" alt="${escapeHTML(p.title)} thumbnail" style="width:100%; height:100%; object-fit:cover"></div>
        </a>
        <div class="content">
          <div class="small" style="display:flex; gap:.5rem; flex-wrap:wrap">
            ${(p.tags||[]).slice(0,3).map(t=>`<span class="badge">${escapeHTML(t)}</span>`).join('')}
          </div>
          <h3 style="margin:.3rem 0 .2rem"><a href="project.html?slug=${encodeURIComponent(p.slug)}">${escapeHTML(p.title)}</a></h3>
          <p class="small">${escapeHTML(p.subtitle || p.description || '')}</p>
        </div>
      </article>`;
  }

  function escapeHTML(s){
    return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;'}[m]));
  }

  // Render projects page with filters/search
  async function renderProjects(){
    const wrap = document.getElementById('projects'); if(!wrap) return;
    const search = document.getElementById('search');
    const filters = document.getElementById('filters');
    try{
      const data = await loadProjects();
      const allTags = Array.from(new Set(data.projects.flatMap(p => p.tags || []))).sort();
      const active = new Set();

      // Build tag filter chips
      filters.innerHTML = allTags.map(t => `<button class="tag" role="switch" aria-pressed="false" data-tag="${escapeHTML(t)}">${escapeHTML(t)}</button>`).join('');
      filters.addEventListener('click', (e)=>{
        const btn = e.target.closest('.tag'); if(!btn) return;
        const tag = btn.getAttribute('data-tag');
        if(btn.getAttribute('aria-pressed') === 'true'){ btn.setAttribute('aria-pressed','false'); active.delete(tag); }
        else { btn.setAttribute('aria-pressed','true'); active.add(tag); }
        update();
      });

      // Search
      if(search){
        search.addEventListener('input', update);
      }

      function update(){
        const q = (search?.value || '').toLowerCase().trim();
        const filtered = data.projects.filter(p => {
          const matchesQ = !q || (p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || (p.tags||[]).some(t=>t.toLowerCase().includes(q)));
          const matchesTags = active.size === 0 || (p.tags||[]).some(t => active.has(t));
          return matchesQ && matchesTags;
        });
        wrap.innerHTML = filtered.map(cardHTML).join('') || '<p class="small">No projects matched.</p>';
      }

      update();
    }catch(err){
      wrap.innerHTML = '<p class="small">Could not load projects.</p>';
      console.error(err);
    }
  }

  // Render project detail
  async function renderProjectDetail(){
    const titleEl = document.getElementById('proj-title'); if(!titleEl) return;
    const metaEl = document.getElementById('proj-meta');
    const coverEl = document.getElementById('proj-cover');
    const contentEl = document.getElementById('proj-content');
    const detailsEl = document.getElementById('proj-details');
    const linksEl = document.getElementById('proj-links');

    const params = new URLSearchParams(location.search);
    const slug = params.get('slug');
    if(!slug){ titleEl.textContent = 'Project not found'; return; }

    try{
      const data = await loadProjects();
      const p = data.projects.find(x => x.slug === slug);
      if(!p){ titleEl.textContent = 'Project not found'; return; }

      document.title = `${p.title} — Abdolrahim Tooranian`;
      titleEl.textContent = p.title;
      metaEl.innerHTML = [p.date, p.role, (p.tech||[]).join(' · ')].filter(Boolean).map(x=>`<span>${escapeHTML(x)}</span>`).join(' · ');
      coverEl.src = p.cover || 'assets/img/cover-1200x600.svg';
      coverEl.alt = `${p.title} cover image`;

      const sections = p.content || [
        {title:'Overview', body:p.description || ''},
        {title:'Approach', body:''},
        {title:'Results', body:''}
      ];
      contentEl.innerHTML = sections.map(s => `
        <section class="section card section-card">
          <h2>${escapeHTML(s.title)}</h2>
          <p>${(s.body||'').split('\n').map(par => `<span>${escapeHTML(par)}</span>`).join('<br>')}</p>
        </section>`).join('');

      detailsEl.innerHTML = `
        ${p.client ? `<div><strong>Client:</strong> ${escapeHTML(p.client)}</div>` : ''}
        ${p.role ? `<div><strong>Role:</strong> ${escapeHTML(p.role)}</div>` : ''}
        ${p.date ? `<div><strong>Date:</strong> ${escapeHTML(p.date)}</div>` : ''}
        ${(p.tech||[]).length ? `<div><strong>Tech:</strong> ${p.tech.map(t=>`<span class="badge">${escapeHTML(t)}</span>`).join(' ')}</div>` : ''}
      `;

      const linkParts = [];
      if(p.links){
        if(p.links.demo) linkParts.push(`<a class="btn" href="${p.links.demo}" target="_blank" rel="noopener">Live Demo</a>`);
        if(p.links.github) linkParts.push(`<a class="btn secondary" href="${p.links.github}" target="_blank" rel="noopener">GitHub</a>`);
        if(p.links.article) linkParts.push(`<a class="btn ghost" href="${p.links.article}" target="_blank" rel="noopener">Article</a>`);
      }
      linksEl.innerHTML = linkParts.length ? `<div style="display:flex; flex-direction:column; gap:.5rem"><strong>Links</strong>${linkParts.join('')}</div>` : '';

    }catch(err){
      titleEl.textContent = 'Error loading project';
      console.error(err);
    }
  }

  renderFeatured();
  renderProjects();
  renderProjectDetail();
})();
