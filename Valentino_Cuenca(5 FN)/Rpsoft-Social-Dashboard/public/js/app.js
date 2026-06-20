const API_BASE = '/api';
let timelineChart = null;
let ytSubsChart = null;
let ytBrandChart = null;
let igSubsChart = null;
let igTimelineChart = null;
let fbSubsChart = null;
let fbGroupChart = null;
let fbGroupTimelineChart = null;
let ttSubsChart = null;
let ttLikesChart = null;
let ttTimelineChart = null;
let currentData = null;
let currentSocialData = null;
let savedVideos = JSON.parse(localStorage.getItem('ytSavedVideos') || '[]');

/* ─── NAVIGATION ─── */
function navigateTo(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const viewEl = document.getElementById('view-' + view);
  if (viewEl) viewEl.classList.add('active');

  const navEl = document.querySelector(`.nav-item[data-view="${view}"]`);
  if (navEl) navEl.classList.add('active');

  const titles = { dashboard: 'Dashboard Principal', youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram', facebook: 'Facebook' };
  document.getElementById('pageTitle').textContent = titles[view] || 'Dashboard';

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
  }

  if (view === 'dashboard') { loadBrands(); fetchData(); loadMultiNetworkSummary(); }
  if (view === 'youtube')   { showChannelsList(); loadChannels(); renderSavedVideos(); loadYtCharts(); }
  if (view === 'instagram') { loadInstagramData(); }
  if (view === 'facebook')  { loadFacebookData(); }
  if (view === 'tiktok')    { loadTikTokData(); }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

/* ─── DASHBOARD ─── */
function showStatus(message, type = 'success') {
  const el = document.getElementById('statusMessage');
  if (!el) return;
  el.textContent = message;
  el.className = `status-message ${type}`;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

function getPeriod()    { return document.getElementById('periodSelect').value; }
function getBrands()    { return document.getElementById('brandSelect').value; }
function getThreshold() { return parseFloat(document.getElementById('thresholdInput').value) || 0.5; }

function getDateRange(period) {
  const today = new Date();
  const end = today.toISOString().split('T')[0];
  let start;
  if (period === 'week')  { start = new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0]; }
  else if (period === 'month') { start = new Date(today.getTime() - 30 * 86400000).toISOString().split('T')[0]; }
  else { start = '2026-01-01'; }
  return { start, end };
}

function showSkeleton(tableBodyId, cols) {
  const tbody = document.getElementById(tableBodyId);
  if (!tbody) return;
  let html = '';
  for (let r = 0; r < 5; r++) {
    html += '<tr class="skeleton-row">';
    for (let c = 0; c < cols; c++) html += '<td><div class="skeleton"></div></td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
}

async function fetchData() {
  const period = getPeriod();
  const brands = getBrands();
  const threshold = getThreshold();
  const { start, end } = getDateRange(period);

  if (document.getElementById('growthTableBody')) showSkeleton('growthTableBody', 7);
  if (document.getElementById('topVideosBody'))   showSkeleton('topVideosBody', 9);

  const stagnantContent = document.getElementById('stagnantContent');
  const trendsContent   = document.getElementById('trendsContent');
  if (stagnantContent) stagnantContent.innerHTML = '<p class="text-center text-muted"><span class="loading-pulse">Cargando...</span></p>';
  if (trendsContent)   trendsContent.innerHTML   = '<p class="text-center text-muted"><span class="loading-pulse">Cargando...</span></p>';

  ['kpiChannels','kpiTotalSubs','kpiStagnant','kpiAvgEngagement'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '...';
  });

  let url = `${API_BASE}/analytics/dashboard?startDate=${start}&endDate=${end}`;
  if (brands) url += `&brands=${brands}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    currentData = await res.json();

    const srcRes  = await fetch(`${API_BASE}/youtube/status`);
    const srcData = await srcRes.json();

    updateDataSource(srcData);
    updateKPI(currentData);
    renderDashChannelCards(currentData.channelsSummary || []);

    if (document.getElementById('growthTableBody')) renderGrowthTable(currentData.channelGrowth, threshold);
    if (document.getElementById('topVideosBody'))   renderTopVideos(currentData.topVideos);
    if (document.getElementById('contentTypeGrid')) renderContentType(currentData.contentTypeComparison);
    if (stagnantContent) renderStagnant(currentData.channelGrowth, threshold);
    if (trendsContent)   renderTrends(currentData.trends);
    if (document.getElementById('timelineChart')) renderTimeline(currentData.timeline);
  } catch (err) {
    showStatus('Error al cargar datos: ' + err.message, 'error');
  }
}

async function fetchFromApi() {
  const btn = document.querySelector('#view-dashboard .btn-secondary');
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = 'Jalando...';
  try {
    const res  = await fetch(`${API_BASE}/youtube/fetch`, { method: 'POST' });
    const data = await res.json();
    showStatus(`Datos obtenidos desde ${data.source}. ${data.channels} canales actualizados.${data.error ? ' ' + data.error : ''}`, data.source === 'backup' ? 'warning' : 'success');
    await fetchData();
  } catch (err) {
    showStatus('Error al jalar datos: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Jalar datos ahora';
  }
}

async function loadBrands() {
  try {
    const res    = await fetch(`${API_BASE}/channels/brands`);
    const brands = await res.json();
    const select = document.getElementById('brandSelect');
    if (!select) return;
    select.innerHTML = '<option value="">Todas las marcas</option>';
    brands.forEach(b => { select.innerHTML += `<option value="${b}">${b}</option>`; });
  } catch (err) { console.error('Error loading brands:', err); }
}

function updateDataSource(srcData) {
  const dot   = document.getElementById('sourceDot');
  const label = document.getElementById('sourceLabel');
  if (!dot || !label) return;
  if (srcData.usingBackup) { dot.className = 'data-source-dot backup'; label.textContent = 'Respaldo'; }
  else { dot.className = 'data-source-dot api'; label.textContent = 'API YouTube'; }
  const update = document.getElementById('lastUpdate');
  if (update) update.textContent = new Date().toLocaleString('es-PE');
}

function updateKPI(data) {
  // Use all channels (including those with no growth data) for totals
  const summary = data.channelsSummary || [];
  const channels = summary.length || data.channelGrowth?.ranking?.length || 0;
  const stagnant = data.channelGrowth?.stagnant?.length || 0;
  const totalSubs = summary.length
    ? summary.reduce((s, c) => s + (c.subscribers || 0), 0)
    : (data.channelGrowth?.ranking || []).reduce((s, c) => s + c.endSubs, 0);

  let avgEngagement = 0, engCount = 0;
  (data.topVideos || []).forEach(v => { if (v.engagementRate !== null) { avgEngagement += v.engagementRate; engCount++; } });
  avgEngagement = engCount > 0 ? (avgEngagement / engCount).toFixed(2) : '-';

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('kpiChannels',      channels);
  setText('kpiTotalSubs',     totalSubs.toLocaleString());
  setText('kpiStagnant',      stagnant);
  setText('kpiAvgEngagement', engCount > 0 ? `${avgEngagement}%` : '-');
}

/* ─── DASHBOARD CHANNEL CARDS ─── */
function renderDashChannelCards(summary) {
  const grid  = document.getElementById('dashChannelCards');
  const count = document.getElementById('dashChannelCount');
  if (!grid) return;
  if (count) count.textContent = `${summary.length} canales`;

  if (summary.length === 0) {
    grid.innerHTML = '<p class="text-center text-muted" style="padding:24px;grid-column:1/-1">No hay canales registrados. Ve a YouTube para agregar canales.</p>';
    return;
  }

  grid.innerHTML = summary.map(ch => {
    const thumb = ch.thumbnailUrl || avatarSvg(56, ch.title);
    const subs  = ch.subscribers > 0 ? ch.subscribers.toLocaleString() : '—';
    let growthBadge = '';
    if (ch.growthRate !== null) {
      const cls  = ch.growthRate > 0 ? 'positive' : (ch.growthRate < 0 ? 'negative' : 'neutral');
      const sign = ch.growthRate > 0 ? '+' : '';
      growthBadge = `<span class="dash-channel-growth ${cls}">${sign}${ch.growthRate.toFixed(2)}%</span>`;
    } else {
      growthBadge = `<span class="dash-channel-growth neutral">Solo 1 día</span>`;
    }
    return `
      <div class="dash-channel-card" onclick="navigateTo('youtube');setTimeout(()=>showChannelDetail('${encodeURIComponent(ch.channelId)}'),300)">
        <img class="dash-channel-avatar" src="${thumb}" alt="${escapeHtml(ch.title)}" loading="lazy" onerror="this.src='${avatarSvg(56, ch.title)}'">
        <div class="dash-channel-name">${escapeHtml(ch.title)}</div>
        <div class="dash-channel-brand">${escapeHtml(ch.brand)}</div>
        <div class="dash-channel-subs">${subs}</div>
        <div class="dash-channel-subs-label">Suscriptores</div>
        ${growthBadge}
      </div>`;
  }).join('');
}

function renderGrowthTable(channelGrowth, threshold) {
  const tbody   = document.getElementById('growthTableBody');
  const ranking = channelGrowth?.ranking || [];
  if (ranking.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="text-center">Sin datos suficientes</td></tr>'; return; }
  tbody.innerHTML = ranking.map((ch, i) => {
    const isStagnant = ch.growthRate !== null && ch.growthRate <= threshold;
    const rateStr    = ch.growthRate !== null ? ch.growthRate.toFixed(2) + '%' : 'sin historial';
    const rateClass  = ch.growthRate !== null ? (ch.growthRate > 0 ? 'growth-positive' : 'growth-negative') : '';
    const rowClass   = isStagnant ? 'stagnant-row' : '';
    const growthStr  = ch.netGrowth >= 0 ? `+${ch.netGrowth.toLocaleString()}` : ch.netGrowth.toLocaleString();
    const subsStart  = ch.startSubs > 0 ? ch.startSubs.toLocaleString() : '—';
    const subsEnd    = ch.endSubs   > 0 ? ch.endSubs.toLocaleString()   : '—';
    return `<tr class="${rowClass}"><td><span class="rank">${i + 1}</span></td><td><strong>${escapeHtml(ch.title)}</strong></td><td>${escapeHtml(ch.brand)}</td><td>${subsStart}</td><td>${subsEnd}</td><td class="${rateClass}">${ch.netGrowth !== 0 ? growthStr : '—'}</td><td class="${rateClass}">${rateStr}</td></tr>`;
  }).join('');
}

function renderTopVideos(videos) {
  const tbody = document.getElementById('topVideosBody');
  const list  = videos || [];
  if (list.length === 0) { tbody.innerHTML = '<tr><td colspan="9" class="text-center">Sin videos en el periodo</td></tr>'; return; }
  tbody.innerHTML = list.map((v, i) => {
    const typeBadge = v.isShort ? '<span class="short-badge">Short</span>' : '<span class="long-badge">Video</span>';
    return `<tr><td><span class="rank">${i + 1}</span></td><td style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(v.title)}</td><td>${escapeHtml(v.channelTitle)}</td><td>${v.views.toLocaleString()}</td><td>${v.likes.toLocaleString()}</td><td>${v.comments.toLocaleString()}</td><td><strong>${v.interactions.toLocaleString()}</strong></td><td>${v.engagementLabel}</td><td>${typeBadge}</td></tr>`;
  }).join('');
}

function renderContentType(ct) {
  const grid = document.getElementById('contentTypeGrid');
  if (!ct) { grid.innerHTML = '<div class="text-center" style="grid-column:1/-1;">Sin datos</div>'; return; }
  const s = ct.shorts, l = ct.longVideos;
  let winner = null;
  if (s.avgEngagement !== null && l.avgEngagement !== null) { winner = s.avgEngagement > l.avgEngagement ? 'shorts' : (l.avgEngagement > s.avgEngagement ? 'long' : 'equal'); }
  else if (s.avgEngagement !== null) winner = 'shorts';
  else if (l.avgEngagement !== null) winner = 'long';
  grid.innerHTML = `
    <div class="content-type-card ${winner === 'shorts' ? 'winner' : ''}"><h3>Shorts (≤60s)</h3><div class="ct-value">${s.avgEngagement !== null ? s.avgEngagement.toFixed(2) + '%' : 'sin datos'}</div><div class="ct-label">Engagement promedio</div><div style="margin-top:12px;font-size:0.875rem;">${s.totalInteractions.toLocaleString()} interacciones · ${s.videoCount} videos · ${s.totalViews.toLocaleString()} vistas</div>${winner === 'shorts' ? '<div class="winner-badge">✓ Genera más interacción</div>' : ''}</div>
    <div class="content-type-card ${winner === 'long' ? 'winner' : ''}"><h3>Videos largos (&gt;60s)</h3><div class="ct-value">${l.avgEngagement !== null ? l.avgEngagement.toFixed(2) + '%' : 'sin datos'}</div><div class="ct-label">Engagement promedio</div><div style="margin-top:12px;font-size:0.875rem;">${l.totalInteractions.toLocaleString()} interacciones · ${l.videoCount} videos · ${l.totalViews.toLocaleString()} vistas</div>${winner === 'long' ? '<div class="winner-badge">✓ Genera más interacción</div>' : ''}</div>`;
}

function renderStagnant(channelGrowth, threshold) {
  const container = document.getElementById('stagnantContent');
  if (!container) return;
  const ranking = channelGrowth?.ranking || [];
  if (ranking.length === 0) { container.innerHTML = '<p class="text-center text-muted">Sin datos suficientes</p>'; return; }
  const stagnant = ranking.filter(ch => ch.growthRate !== null && ch.growthRate <= threshold);
  if (stagnant.length === 0) { container.innerHTML = '<div class="no-stagnant">✓ No hay canales estancados con el umbral actual de ' + threshold + '%</div>'; return; }
  container.innerHTML = `<div class="stagnant-list"><p style="padding:0 20px;font-size:0.875rem;color:var(--text-muted);">Canales con tasa de crecimiento ≤ ${threshold}% (umbral configurable)</p>${stagnant.map(ch => `<div class="stagnant-item"><div><span class="stagnant-title">${escapeHtml(ch.title)}</span><span style="color:var(--text-muted);font-size:0.8rem;"> · ${escapeHtml(ch.brand)}</span></div><div class="stagnant-rate">${ch.growthRate !== null ? ch.growthRate.toFixed(2) + '%' : 'sin datos'}</div></div>`).join('')}</div>`;
}

function renderTrends(trends) {
  const container = document.getElementById('trendsContent');
  if (!container) return;
  const list = trends || [];
  if (list.length === 0) {
    container.innerHTML = '<p class="text-center text-muted" style="padding:24px;">Sin suficiente historial para identificar tendencias. Acumula más snapshots con "Jalar datos".</p>';
    return;
  }
  const icons = {
    creciente:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    decreciente:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
    plana:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  };
  container.innerHTML = `<div class="trends-list">${list.map(t => {
    const cls  = t.trend === 'creciente' ? 'trend-creciente' : t.trend === 'decreciente' ? 'trend-decreciente' : 'trend-plana';
    const icon = icons[t.trend] || icons.plana;
    return `
      <div class="trend-item">
        <div class="trend-item-left">
          <span class="trend-icon ${cls}">${icon}</span>
          <div class="trend-item-info">
            <span class="trend-label">${escapeHtml(t.title)}</span>
            <span class="trend-reason">${escapeHtml(t.reason)}</span>
          </div>
        </div>
        <span class="trend-badge ${cls}">${t.trend}</span>
      </div>`;
  }).join('')}</div>`;
}

function renderTimeline(timeline) {
  const ctx = document.getElementById('timelineChart');
  if (!ctx) return;
  const c    = ctx.getContext('2d');
  const data = timeline || {};
  if (timelineChart) { timelineChart.destroy(); timelineChart = null; }
  const channelIds = Object.keys(data);
  if (channelIds.length === 0) {
    c.clearRect(0, 0, ctx.width, ctx.height);
    return;
  }

  // Check if there's enough data for a meaningful chart
  let totalPoints = 0;
  let hasMultiPoint = false;
  channelIds.forEach(chId => {
    const pts = data[chId] || [];
    totalPoints += pts.length;
    if (pts.length >= 2) hasMultiPoint = true;
  });

  if (!hasMultiPoint && totalPoints > 0) {
    c.clearRect(0, 0, ctx.width, ctx.height);
    const w = ctx.width || 400;
    const cx = w / 2;
    const cy = 160;
    ctx.fillStyle = '#8888aa';
    ctx.font = '600 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Se necesita más de 1 snapshot para mostrar la evolución', cx, cy);
    ctx.font = '400 13px Inter, sans-serif';
    ctx.fillStyle = '#aaaacc';
    ctx.fillText('Usa "Jalar datos" diariamente para construir el historial', cx, cy + 28);
    return;
  }

  const colors  = ['#5b3ef5','#06b6d4','#f59e0b','#ef4444','#ff0033','#00b97d','#8b5cf6','#f97316'];
  const datasets = [];
  const allDates = new Set();
  channelIds.forEach((chId, i) => {
    const points = data[chId] || [];
    points.forEach(p => allDates.add(p.date));
    if (points.length > 0) {
      const color = colors[i % colors.length];
      const grad = c.createLinearGradient(0, 0, 0, ctx.height || 400);
      const alpha = hexToRgba(color, 0.15);
      grad.addColorStop(0, hexToRgba(color, 0.25));
      grad.addColorStop(0.5, hexToRgba(color, 0.08));
      grad.addColorStop(1, hexToRgba(color, 0.01));
      const firstSubs = points[0]?.subscribers || 0;
      const lastSubs  = points[points.length - 1]?.subscribers || 0;
      const growth    = firstSubs > 0 ? ((lastSubs - firstSubs) / firstSubs * 100) : 0;
      const growthIcon = growth > 0
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
        : growth < 0
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
      datasets.push({
        label: `${points[0]?.title || chId}  ${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
        data: points.map(p => ({ x: p.date, y: p.subscribers })),
        borderColor: color,
        backgroundColor: grad,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 10,
        pointBackgroundColor: 'white',
        pointBorderColor: color,
        pointBorderWidth: 3,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 3,
        borderWidth: 3,
      });
    }
  });
  const sortedDates = [...allDates].sort();
  timelineChart = new Chart(c, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: 'easeInOutQuart',
      },
      interaction: { intersect: false, mode: 'index' },
      scales: {
        x: {
          type: 'category',
          labels: sortedDates,
          grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false, display: true },
          ticks: {
            color: '#8888aa',
            font: { family: 'Inter', size: 11 },
            maxRotation: 0,
            maxTicksLimit: 10,
          },
          border: { display: false },
        },
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(0,0,0,0.05)',
            drawBorder: false,
            borderDash: [4, 4],
          },
          ticks: {
            color: '#8888aa',
            font: { family: 'Inter', size: 11 },
            padding: 8,
            callback: v => v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v
          },
          border: { display: false },
        },
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#4a4a6a',
            usePointStyle: true,
            pointStyleWidth: 12,
            padding: 24,
            font: { family: 'Inter', size: 12, weight: '600' },
            boxWidth: 20,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(255,255,255,0.98)',
          titleColor: '#0d0d1a',
          titleFont: { family: 'Inter', size: 12, weight: '700' },
          bodyColor: '#4a4a6a',
          bodyFont: { family: 'Inter', size: 13, weight: '500' },
          borderColor: 'rgba(91,62,245,0.15)',
          borderWidth: 1.5,
          padding: 16,
          boxPadding: 8,
          cornerRadius: 14,
          titleAlign: 'center',
          callbacks: {
            title: items => {
              if (!items.length) return '';
              const idx = items[0].dataIndex;
              const date = sortedDates[idx] || '';
              const d = new Date(date + 'T00:00:00');
              return d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            },
            label: ctx => {
              const val = parseInt(ctx.raw.y).toLocaleString();
              const ds = ctx.dataset;
              const label = ds.label.replace(/[\s]*[📈📉➡️].*$/, '').trim();
              return ` ${label}: ${val} suscriptores`;
            },
            afterBody: items => {
              if (items.length < 2) return '';
              let maxLabel = '', maxVal = 0;
              items.forEach(item => {
                const v = item.raw.y;
                if (v > maxVal) { maxVal = v; maxLabel = item.dataset.label.replace(/\s*[+-]\d+\.\d+%$/, '').trim(); }
              });
              return `\n Mayor comunidad: ${maxLabel} (${maxVal.toLocaleString()})`;
            },
          },
        },
      },
    },
  });
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ─── YOUTUBE CHARTS ─── */
async function loadYtCharts() {
  try {
    const res      = await fetch(`${API_BASE}/channels/consolidated`);
    const channels = await res.json();
    if (channels.length === 0) return;

    // KPIs
    const totalSubs   = channels.reduce((s, c) => s + (c.subscribers || 0), 0);
    const totalVideos = channels.reduce((s, c) => s + (c.videoCount || 0), 0);
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('ytKpiChannels', channels.length);
    setText('ytKpiSubs',     totalSubs.toLocaleString());
    setText('ytKpiVideos',   totalVideos.toLocaleString());

    // Best growth from analytics
    try {
      const { start, end } = getDateRange('month');
      const gr = await fetch(`${API_BASE}/analytics/top-channels?startDate=${start}&endDate=${end}`);
      const grData = await gr.json();
      const top = (grData.ranking || []).find(r => r.growthRate !== null);
      if (top) setText('ytKpiTopGrowth', `${top.title} +${top.growthRate?.toFixed(2)}%`);
      else setText('ytKpiTopGrowth', '—');
    } catch (e) { setText('ytKpiTopGrowth', '—'); }

    // Chart: suscriptores por canal
    const ctxSubs = document.getElementById('ytSubsChart');
    if (ctxSubs) {
      if (ytSubsChart) ytSubsChart.destroy();
      const palette = ['#5b3ef5','#06b6d4','#f59e0b','#ef4444','#ff0033','#00b97d','#8b5cf6','#f97316','#ec4899','#14b8a6'];
      ytSubsChart = new Chart(ctxSubs.getContext('2d'), {
        type: 'bar',
        data: {
          labels: channels.map(c => c.title),
          datasets: [{ label: 'Suscriptores', data: channels.map(c => c.subscribers || 0), backgroundColor: channels.map((_, i) => palette[i % palette.length] + 'cc'), borderColor: channels.map((_, i) => palette[i % palette.length]), borderWidth: 2, borderRadius: 8, borderSkipped: false }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: 'rgba(255,255,255,0.98)', titleColor: '#0d0d1a', bodyColor: '#4a4a6a', borderColor: 'rgba(91,62,245,0.15)', borderWidth: 1, padding: 12, callbacks: { label: ctx => ` ${ctx.raw.toLocaleString()} suscriptores` } }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#8888aa', font: { size: 10 }, maxRotation: 35 } },
            y: { grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false }, ticks: { color: '#8888aa', font: { size: 11 }, callback: v => v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v } }
          }
        }
      });
    }

    // Chart: distribución por marca (dona)
    const ctxBrand = document.getElementById('ytBrandChart');
    if (ctxBrand) {
      if (ytBrandChart) ytBrandChart.destroy();
      const brandMap = new Map();
      channels.forEach(c => { brandMap.set(c.brand, (brandMap.get(c.brand) || 0) + (c.subscribers || 0)); });
      const brands = [...brandMap.keys()];
      const subs   = brands.map(b => brandMap.get(b));
      const palette = ['#5b3ef5','#06b6d4','#f59e0b','#ef4444','#00b97d','#8b5cf6','#f97316','#ec4899'];
      ytBrandChart = new Chart(ctxBrand.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: brands,
          datasets: [{ data: subs, backgroundColor: brands.map((_, i) => palette[i % palette.length] + 'cc'), borderColor: brands.map((_, i) => palette[i % palette.length]), borderWidth: 2, hoverOffset: 8 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#4a4a6a', padding: 12, font: { family: 'Inter', size: 11 } } },
            tooltip: { backgroundColor: 'rgba(255,255,255,0.98)', titleColor: '#0d0d1a', bodyColor: '#4a4a6a', borderColor: 'rgba(91,62,245,0.15)', borderWidth: 1, padding: 12, callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw.toLocaleString()} subs` } }
          },
          cutout: '60%'
        }
      });
    }
  } catch (err) { console.error('Error loading YT charts:', err); }
}

/* ─── YOUTUBE SECTION ─── */
let currentChannelVideos = [];
let selectedChannelId    = null;

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function avatarSvg(size, letter) {
  const colors = ['#5b3ef5','#8b5cf6','#06b6d4','#00b97d','#f59e0b'];
  const hash   = (letter || '?').charCodeAt(0) % colors.length;
  const bg     = colors[hash];
  const l      = (letter || '?').charAt(0).toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${bg}"/><stop offset="100%" style="stop-color:${bg}cc"/></linearGradient></defs><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#g)"/><text x="50%" y="50%" text-anchor="middle" dy=".35em" fill="white" font-size="${size*0.42}" font-weight="800" font-family="Outfit,Inter,sans-serif">${l}</text></svg>`)}`;
}

function videoPlaceholderSvg() {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#eeeef8"/><stop offset="100%" style="stop-color:#e0e0f0"/></linearGradient></defs><rect fill="url(#bg)" width="320" height="180" rx="8"/><circle cx="160" cy="82" r="28" fill="rgba(91,62,245,0.12)"/><path d="M152 70l20 12-20 12z" fill="rgba(91,62,245,0.35)"/><rect x="110" y="118" width="100" height="6" rx="3" fill="rgba(91,62,245,0.1)"/><rect x="120" y="130" width="80" height="4" rx="2" fill="rgba(91,62,245,0.07)"/></svg>`)}`;
}

function extractChannelId(input) {
  let s = input.trim();
  if (!s) return null;
  const channelIdMatch = s.match(/^UC_?[a-zA-Z0-9_-]{21,23}$/);
  if (channelIdMatch) return s;
  const handleUrlMatch = s.match(/(?:youtube\.com\/)?@([a-zA-Z0-9_-]+)/);
  if (handleUrlMatch) return '@' + handleUrlMatch[1];
  const channelUrlMatch = s.match(/(?:youtube\.com\/channel\/)(UC_?[a-zA-Z0-9_-]+)/);
  if (channelUrlMatch) return channelUrlMatch[1];
  const customMatch = s.match(/(?:youtube\.com\/(?:c|user)\/)?([a-zA-Z0-9_-]{3,})/);
  if (customMatch) { let id = customMatch[1]; if (id.length >= 10) return '@' + id; return null; }
  if (s.startsWith('@')) { const handle = s.slice(1).split(/[?#\s]/)[0]; if (handle.length >= 3) return '@' + handle; }
  return null;
}

/* CHANNELS LIST */
async function loadChannels() {
  const grid = document.getElementById('channelGrid');
  if (!grid) return;
  try {
    const res  = await fetch(`${API_BASE}/channels/consolidated`);
    let channels = await res.json();
    const count  = document.getElementById('channelCount');
    if (count) count.textContent = channels.length + ' canales';

    if (channels.length === 0) {
      grid.innerHTML = '<p class="text-center text-muted" style="padding:24px;">No hay canales agregados aún. Agrega uno arriba.</p>';
      return;
    }

    // Fetch live data for channels without snapshots
    const liveData     = new Map();
    const staleChannels = channels.filter(ch => !ch.subscribers && !ch.videoCount);
    if (staleChannels.length > 0) {
      const results = await Promise.allSettled(
        staleChannels.map(ch =>
          fetch(`${API_BASE}/youtube/channel-info?channelId=${encodeURIComponent(ch.channelId)}`)
            .then(r => r.json())
            .then(data => ({ channelId: ch.channelId, data }))
        )
      );
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value.data && r.value.data.channelId) {
          liveData.set(r.value.channelId, r.value.data);
        }
      }
    }

    channels = channels.map(ch => {
      const live = liveData.get(ch.channelId);
      if (live) return { ...ch, subscribers: live.subscribers || ch.subscribers, videoCount: live.videoCount || ch.videoCount, thumbnailUrl: live.thumbnailUrl || ch.thumbnailUrl, description: live.description || ch.description };
      return ch;
    });

    grid.innerHTML = channels.map(ch => {
      const safeId = encodeURIComponent(ch.channelId);
      const subs   = ch.subscribers > 0 ? ch.subscribers.toLocaleString() : '<span class="text-muted">Pendiente</span>';
      const vids   = ch.videoCount  > 0 ? ch.videoCount.toLocaleString()  : '<span class="text-muted">Pendiente</span>';
      const thumb  = ch.thumbnailUrl || avatarSvg(64, ch.title);
      return `
      <div class="channel-card" onclick="showChannelDetail('${safeId}')">
        <img class="channel-card-avatar" src="${thumb}" alt="${escapeHtml(ch.title)}" loading="lazy" onerror="this.src='${avatarSvg(64, ch.title)}'">
        <div class="channel-card-info">
          <div class="channel-card-title" data-channel-id="${escapeHtml(ch.channelId)}">${escapeHtml(ch.title)}</div>
          <div class="channel-card-brand">${escapeHtml(ch.brand)}</div>
          <div class="channel-card-stats">
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> ${subs}</span>
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> ${vids}</span>
          </div>
        </div>
        <div class="channel-card-actions" onclick="event.stopPropagation()">
          <button class="btn-small btn-danger" onclick="deleteChannel('${safeId}')">Eliminar</button>
        </div>
      </div>`;
    }).join('');
  } catch (err) {
    grid.innerHTML = '<p class="text-center text-muted" style="padding:24px;">Error al cargar canales</p>';
  }
}

/* ADD CHANNEL */
async function addChannel() {
  const urlInput   = document.getElementById('channelUrlInput');
  const nameInput  = document.getElementById('channelNameInput');
  const brandInput = document.getElementById('channelBrandInput');
  const rawId  = urlInput.value.trim();
  const brand  = brandInput.value.trim() || 'Default';
  if (!rawId) { showStatus('Ingresa una URL o ID de canal', 'error'); return; }
  const channelId = extractChannelId(rawId);
  if (!channelId) { showStatus('No se pudo reconocer el ID del canal. Ingresa una URL válida o el ID directamente.', 'error'); return; }
  try {
    const infoRes = await fetch(`${API_BASE}/youtube/channel-info?channelId=${encodeURIComponent(channelId)}`);
    const info    = await infoRes.json();
    if (!info || !info.title) { showStatus('No se pudo obtener info del canal. Verifica el ID.', 'error'); return; }
    const resolvedChannelId = info.channelId || channelId;
    const res = await fetch(`${API_BASE}/channels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId: resolvedChannelId, title: info.title, brand, thumbnailUrl: info.thumbnailUrl || '', description: info.description || '', publishedAt: info.publishedAt || null, subscribers: info.subscribers || 0, totalViews: info.totalViews || 0, videoCount: info.videoCount || 0 }),
    });
    if (!res.ok) throw new Error('Error al agregar canal');

    // Fetch videos and save them with snapshot
    try {
      const videosRes = await fetch(`${API_BASE}/youtube/channel-videos?channelId=${encodeURIComponent(resolvedChannelId)}`);
      const videosData = await videosRes.json();
      if (videosData.items && videosData.items.length > 0) {
        await fetch(`${API_BASE}/channels/save-videos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelId: resolvedChannelId,
            subscribers: info.subscribers || 0,
            totalViews: info.totalViews || 0,
            videoCount: info.videoCount || 0,
            videos: videosData.items.map(v => ({
              videoId: v.videoId,
              title: v.title,
              publishedAt: v.publishedAt,
              durationSec: v.durationSec,
              views: v.views,
              likes: v.likes,
              comments: v.comments,
            })),
          }),
        });
      }
    } catch (videoErr) {
      console.warn('No se pudieron guardar los videos:', videoErr);
    }

    showStatus(`Canal "${info.title}" agregado correctamente`, 'success');
    urlInput.value = ''; nameInput.value = ''; brandInput.value = '';
    fetchFromApi();
    loadMultiNetworkSummary();
    loadChannels();
    loadYtCharts();
  } catch (err) { showStatus('Error: ' + err.message, 'error'); }
}

async function deleteChannel(encodedId) {
  const channelId   = decodeURIComponent(encodedId);
  const channelName = document.querySelector(`[data-channel-id="${channelId}"]`)?.textContent || channelId;
  if (!confirm(`¿Eliminar definitivamente "${channelName}"? Se borrarán todos sus datos.`)) return;
  try {
    const res = await fetch(`${API_BASE}/channels?channelId=${encodeURIComponent(channelId)}`, { method: 'DELETE' });
    if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.message || `Error del servidor (${res.status})`); }
    showStatus('Canal eliminado correctamente', 'success');
    if (selectedChannelId === channelId) showChannelsList();
    else loadChannels();
    loadYtCharts();
  } catch (err) { showStatus('Error al eliminar: ' + err.message, 'error'); }
}

/* CHANNEL DETAIL VIEW */
async function showChannelDetail(encodedId) {
  const channelId = decodeURIComponent(encodedId);
  selectedChannelId = channelId;
  document.getElementById('ytChannelsListView').style.display = 'none';
  document.getElementById('ytChannelDetail').style.display    = 'block';
  const breadcrumb = document.getElementById('ytBreadcrumb');
  breadcrumb.style.display = 'flex';
  const container = document.getElementById('channelVideosContainer');
  container.innerHTML = '<p class="text-center text-muted" style="padding:40px;">Cargando videos...</p>';
  try {
    const [channelsRes, liveInfoRes] = await Promise.all([
      fetch(`${API_BASE}/channels/consolidated`),
      fetch(`${API_BASE}/youtube/channel-info?channelId=${encodeURIComponent(channelId)}`)
    ]);
    const channels = await channelsRes.json();
    let liveInfo = null;
    try { liveInfo = await liveInfoRes.json(); } catch (e) {}
    const ch = channels.find(c => c.channelId === channelId);
    if (ch) {
      document.getElementById('channelDetailTitle').textContent        = ch.title;
      document.getElementById('channelDetailSubs').textContent         = (liveInfo?.subscribers || ch.subscribers).toLocaleString();
      document.getElementById('channelDetailVideos').textContent       = (liveInfo?.videoCount  || ch.videoCount).toLocaleString();
      document.getElementById('channelDetailBrand').textContent        = ch.brand || '-';
      document.getElementById('channelDetailDescription').textContent  = liveInfo?.description || ch.description || '';
      document.getElementById('ytBreadcrumbCurrent').textContent       = ch.title;
      const thumbEl = document.getElementById('channelDetailThumb');
      thumbEl.src    = liveInfo?.thumbnailUrl || ch.thumbnailUrl || avatarSvg(100, ch.title);
      thumbEl.onerror = function() { this.src = avatarSvg(100, ch.title); };
    } else if (liveInfo) {
      document.getElementById('channelDetailTitle').textContent       = liveInfo.title || channelId;
      document.getElementById('channelDetailSubs').textContent        = (liveInfo.subscribers || 0).toLocaleString();
      document.getElementById('channelDetailVideos').textContent      = (liveInfo.videoCount   || 0).toLocaleString();
      document.getElementById('channelDetailBrand').textContent       = '-';
      document.getElementById('channelDetailDescription').textContent = liveInfo.description || '';
      document.getElementById('ytBreadcrumbCurrent').textContent      = liveInfo.title || channelId;
      const thumbEl = document.getElementById('channelDetailThumb');
      thumbEl.src    = liveInfo.thumbnailUrl || avatarSvg(100, liveInfo.title || channelId);
      thumbEl.onerror = function() { this.src = avatarSvg(100, liveInfo.title || channelId); };
    }
    const videoRes = await fetch(`${API_BASE}/youtube/channel-videos?channelId=${encodeURIComponent(channelId)}`);
    const data     = await videoRes.json();
    if (data.error) { container.innerHTML = `<p class="text-center text-muted" style="padding:40px;">Error: ${data.error}</p>`; return; }
    currentChannelVideos = data.items || [];
    if (currentChannelVideos.length === 0) { container.innerHTML = '<p class="text-center text-muted" style="padding:40px;">No se encontraron videos</p>'; return; }
    renderChannelVideos(currentChannelVideos);
    document.getElementById('channelVideoSearch').value = '';
  } catch (err) { container.innerHTML = `<p class="text-center text-muted" style="padding:40px;">Error: ${err.message}</p>`; }
}

function renderChannelVideos(videos) {
  const container = document.getElementById('channelVideosContainer');
  if (videos.length === 0) { container.innerHTML = '<p class="text-center text-muted" style="padding:40px;">No hay videos que coincidan</p>'; return; }
  container.innerHTML = `<div class="channel-videos-grid">${videos.map(v => {
    const isSaved  = savedVideos.some(sv => sv.videoId === v.videoId);
    const duration = formatDuration(v.durationSec);
    return `
      <div class="video-card">
        <div class="video-card-thumb-wrap">
          <img class="video-card-thumb" src="${v.thumbnail || ''}" alt="${escapeHtml(v.title)}" loading="lazy" onerror="this.src='${videoPlaceholderSvg()}'">
          <span class="video-duration">${duration}</span>
        </div>
        <div class="video-card-body">
          <div class="video-card-title">${escapeHtml(v.title)}</div>
          <div class="video-card-stats">
            <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> ${v.views.toLocaleString()}</span>
            <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg> ${v.likes.toLocaleString()}</span>
            <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> ${v.comments.toLocaleString()}</span>
          </div>
          <div class="video-card-actions">
            <a href="https://www.youtube.com/watch?v=${v.videoId}" target="_blank" class="btn-small btn-youtube">Ver en YouTube</a>
            <button class="btn-small ${isSaved ? 'btn-saved' : 'btn-outline'}" onclick="toggleSavedVideo('${v.videoId}','${escapeHtml(v.title)}','${escapeHtml(v.channelTitle || document.getElementById('channelDetailTitle').textContent)}','${v.thumbnail || ''}','${v.channelId || selectedChannelId}')">${isSaved ? '✓ Guardado' : 'Guardar'}</button>
          </div>
        </div>
      </div>`;
  }).join('')}</div>`;
}

function filterChannelVideos() {
  const query = document.getElementById('channelVideoSearch').value.trim().toLowerCase();
  if (!query) { renderChannelVideos(currentChannelVideos); return; }
  renderChannelVideos(currentChannelVideos.filter(v => v.title.toLowerCase().includes(query)));
}

/* ─── VIDEO SEARCH ─── */
async function searchVideos() {
  const input     = document.getElementById('videoSearchInput');
  const container = document.getElementById('videoSearchResults');
  const query     = input.value.trim();
  if (!query) { container.innerHTML = ''; return; }
  container.innerHTML = '<p class="text-center text-muted" style="padding:20px;"><span class="loading-pulse">Buscando...</span></p>';
  try {
    const res   = await fetch(`${API_BASE}/youtube/search?q=${encodeURIComponent(query)}`);
    const data  = await res.json();
    const items = data.items || [];
    if (items.length === 0) { container.innerHTML = '<p class="text-center text-muted" style="padding:20px;">Sin resultados</p>'; return; }
    container.innerHTML = `<div class="channel-videos-grid">${items.map(v => {
      const duration = formatDuration(v.durationSec);
      return `
        <div class="video-card">
          <div class="video-card-thumb-wrap">
            <img class="video-card-thumb" src="${v.thumbnail || ''}" alt="${escapeHtml(v.title)}" loading="lazy" onerror="this.src='${videoPlaceholderSvg()}'">
            <span class="video-duration">${duration}</span>
          </div>
          <div class="video-card-body">
            <div class="video-card-title">${escapeHtml(v.title)}</div>
            <div class="video-card-channel">${escapeHtml(v.channelTitle)}</div>
            <div class="video-card-stats">
              <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> ${v.views.toLocaleString()}</span>
              <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg> ${v.likes.toLocaleString()}</span>
            </div>
            <div class="video-card-actions">
              <a href="https://www.youtube.com/watch?v=${v.videoId}" target="_blank" class="btn-small btn-youtube">Ver en YouTube</a>
              <button class="btn-small ${savedVideos.some(sv => sv.videoId === v.videoId) ? 'btn-saved' : 'btn-outline'}" onclick="toggleSavedVideo('${v.videoId}','${escapeHtml(v.title)}','${escapeHtml(v.channelTitle)}','${v.thumbnail || ''}','${v.channelId || ''}')">${savedVideos.some(sv => sv.videoId === v.videoId) ? '✓ Guardado' : 'Guardar'}</button>
            </div>
          </div>
        </div>`;
    }).join('')}</div>`;
  } catch (err) { container.innerHTML = `<p class="text-center text-muted" style="padding:20px;">Error: ${err.message}</p>`; }
}

function showChannelsList() {
  selectedChannelId    = null;
  currentChannelVideos = [];
  document.getElementById('ytChannelsListView').style.display = 'block';
  document.getElementById('ytChannelDetail').style.display    = 'none';
  document.getElementById('ytBreadcrumb').style.display       = 'none';
  loadChannels();
}

function formatDuration(sec) {
  if (!sec) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

/* SAVED VIDEOS */
function toggleSavedVideo(videoId, title, channelTitle, thumbnail, channelId) {
  const idx = savedVideos.findIndex(v => v.videoId === videoId);
  if (idx >= 0) { savedVideos.splice(idx, 1); }
  else { savedVideos.push({ videoId, title, channelTitle, thumbnail, channelId, savedAt: new Date().toISOString() }); }
  localStorage.setItem('ytSavedVideos', JSON.stringify(savedVideos));
  renderSavedVideos();
  if (selectedChannelId) renderChannelVideos(currentChannelVideos);
}

function renderSavedVideos() {
  const container = document.getElementById('yt-saved-videos');
  const count     = document.getElementById('savedCount');
  if (!container) return;
  if (count) count.textContent = savedVideos.length;
  if (savedVideos.length === 0) { container.innerHTML = '<p class="text-center text-muted" style="padding:24px;">No hay videos guardados aún.</p>'; return; }
  container.innerHTML = `<div class="video-grid">${savedVideos.map(v => `
    <div class="video-card">
      <div class="video-card-thumb-wrap">
        <img class="video-card-thumb" src="${v.thumbnail || ''}" alt="${escapeHtml(v.title)}" loading="lazy" onerror="this.src='${videoPlaceholderSvg()}'">
      </div>
      <div class="video-card-body">
        <div class="video-card-title">${escapeHtml(v.title)}</div>
        <div class="video-card-channel">${escapeHtml(v.channelTitle)}</div>
        <div class="video-card-actions">
          <a href="https://www.youtube.com/watch?v=${v.videoId}" target="_blank" class="btn-small btn-youtube">Ver</a>
          <button class="btn-small btn-danger" onclick="toggleSavedVideo('${v.videoId}','${escapeHtml(v.title)}','${escapeHtml(v.channelTitle)}','${v.thumbnail || ''}','${v.channelId || ''}')">Eliminar</button>
        </div>
      </div>
    </div>
  `).join('')}</div>`;
}

async function apiFetch(url, options) {
  const res = await fetch(url, options);
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ─── MULTI-NETWORK DASHBOARD ─── */
async function loadMultiNetworkSummary() {
  const container = document.getElementById('multiNetworkSummary');
  if (!container) return;

  try {
    const { start, end } = getDateRange(getPeriod());
    const [socialRes, ytRes] = await Promise.all([
      fetch(`${API_BASE}/social/summary?startDate=${start}&endDate=${end}`),
      fetch(`${API_BASE}/channels/consolidated`)
    ]);
    const social = await socialRes.json();
    const ytChannels = await ytRes.json();

    // Update total community KPI (YT subs + all social followers/members)
    const ytTotal = ytChannels.reduce((s, c) => s + (c.subscribers || 0), 0);
    const socialTotal = social.totalCommunity || 0;
    const totalEl = document.getElementById('kpiTotalSubs');
    if (totalEl) totalEl.textContent = (ytTotal + socialTotal).toLocaleString();

    const platforms = [
      {
        label: 'YouTube',
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#ff0033"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
        color: '#ff0033',
        accounts: ytChannels.length,
        followers: ytTotal,
        label2: 'canales',
        top: null,
      },
      {
        label: 'Facebook Páginas',
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
        color: '#1877f2',
        accounts: (social.byPlatform?.facebook_page || []).length,
        followers: (social.byPlatform?.facebook_page || []).reduce((s, a) => s + (a.currentFollowers || 0), 0),
        label2: 'páginas',
        top: (social.topGrowing || []).find(a => a.platform === 'facebook_page'),
      },
      {
        label: 'Instagram',
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#e1306c"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`,
        color: '#e1306c',
        accounts: (social.byPlatform?.instagram || []).length,
        followers: (social.byPlatform?.instagram || []).reduce((s, a) => s + (a.currentFollowers || 0), 0),
        label2: 'cuentas',
        top: (social.topGrowing || []).find(a => a.platform === 'instagram'),
      },
      {
        label: 'Grupos Facebook',
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#1877f2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        color: '#1877f2',
        accounts: (social.byPlatform?.facebook_group || []).length,
        followers: (social.byPlatform?.facebook_group || []).reduce((s, a) => s + (a.currentFollowers || 0), 0),
        label2: 'grupos',
        top: (social.topGrowing || []).find(a => a.platform === 'facebook_group'),
      },
    ];

    container.innerHTML = platforms.map(p => {
      const growthStr = p.top && p.top.growthRate !== null
        ? `<span class="dash-channel-growth ${p.top.growthRate > 0 ? 'positive' : 'negative'}">${p.top.growthRate > 0 ? '+' : ''}${p.top.growthRate.toFixed(2)}% — ${escapeHtml(p.top.name)}</span>`
        : `<span class="dash-channel-growth neutral">Sin crecimiento calculado</span>`;
      return `
        <div class="multi-network-card" style="--net-color:${p.color}">
          <div class="multi-network-card-header">
            ${p.icon}
            <span class="multi-network-label">${p.label}</span>
          </div>
          <div class="multi-network-stat">${p.followers.toLocaleString()}</div>
          <div class="multi-network-sublabel">seguidores / miembros · ${p.accounts} ${p.label2}</div>
          <div style="margin-top:8px;">${growthStr}</div>
        </div>`;
    }).join('');

  } catch (err) {
    if (container) container.innerHTML = `<p class="text-center text-muted" style="grid-column:1/-1;padding:24px;">Error al cargar redes: ${err.message}</p>`;
  }
}

/* ─── TIKTOK ─── */
async function loadTikTokData() {
  try {
    const { start, end } = getDateRange('month');
    const res = await fetch(`${API_BASE}/social/summary?startDate=${start}&endDate=${end}`);
    const data = await res.json();
    const accounts = (data.byPlatform?.tiktok || []);

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const totalFollowers = accounts.reduce((s, a) => s + (a.currentFollowers || 0), 0);
    const totalLikes     = accounts.reduce((s, a) => s + ((a.snapshots || []).slice(-1)[0]?.likes || 0), 0);
    const topGrowth      = accounts.filter(a => a.growthRate !== null).sort((a, b) => b.growthRate - a.growthRate)[0];

    setText('ttKpiAccounts',  accounts.length);
    setText('ttKpiFollowers', totalFollowers.toLocaleString());
    setText('ttKpiLikes',     totalLikes.toLocaleString());
    setText('ttKpiGrowth',    topGrowth ? `${topGrowth.name} +${topGrowth.growthRate?.toFixed(2)}%` : '—');

    const palette = ['#010101', '#69C9D0', '#EE1D52', '#aaa', '#555'];

    // Bar chart — followers
    const ctxSubs = document.getElementById('ttSubsChart');
    if (ctxSubs) {
      if (ttSubsChart) ttSubsChart.destroy();
      ttSubsChart = new Chart(ctxSubs.getContext('2d'), {
        type: 'bar',
        data: {
          labels: accounts.map(a => a.name),
          datasets: [{ label: 'Seguidores', data: accounts.map(a => a.currentFollowers || 0), backgroundColor: accounts.map((_, i) => palette[i % palette.length] + 'bb'), borderColor: accounts.map((_, i) => palette[i % palette.length]), borderWidth: 2, borderRadius: 8 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw.toLocaleString()} seguidores` } } }, scales: { x: { grid: { display: false }, ticks: { color: '#8888aa', font: { size: 11 } } }, y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8888aa', callback: v => v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v } } } }
      });
    }

    // Bar chart — total likes
    const ctxLikes = document.getElementById('ttLikesChart');
    if (ctxLikes) {
      if (ttLikesChart) ttLikesChart.destroy();
      ttLikesChart = new Chart(ctxLikes.getContext('2d'), {
        type: 'bar',
        data: {
          labels: accounts.map(a => a.name),
          datasets: [{ label: 'Likes acumulados', data: accounts.map(a => (a.snapshots || []).slice(-1)[0]?.likes || 0), backgroundColor: ['#EE1D5299', '#69C9D099', '#01010199'], borderColor: ['#EE1D52', '#69C9D0', '#010101'], borderWidth: 2, borderRadius: 8 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw.toLocaleString()} likes` } } }, scales: { x: { grid: { display: false }, ticks: { color: '#8888aa', font: { size: 11 } } }, y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8888aa', callback: v => v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v } } } }
      });
    }

    // Top videos list with SVG icons
    const videosEl = document.getElementById('ttTopVideos');
    if (videosEl) {
      const allVideos = accounts.flatMap(a => (a.topPosts || []).map(v => ({ ...v, accountName: a.name })));
      allVideos.sort((a, b) => ((b.likes||0) + (b.comments||0) + (b.shares||0)) - ((a.likes||0) + (a.comments||0) + (a.shares||0)));
      if (allVideos.length === 0) {
        videosEl.innerHTML = '<p class="text-center text-muted" style="padding:24px;">Sin videos</p>';
      } else {
        videosEl.innerHTML = allVideos.slice(0, 8).map((v, i) => {
          const interactions = (v.likes||0) + (v.comments||0) + (v.shares||0);
          const views = v.views || 0;
          const eng = views > 0 ? ((((v.likes||0) + (v.comments||0)) / views) * 100).toFixed(2) + '%' : 'sin datos';
          const isShort = (v.durationSec || 0) <= 60;
          return `<div class="social-post-card">
            <div class="social-post-rank">${i + 1}</div>
            <div class="social-post-type tt-type">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            </div>
            <div class="social-post-info">
              <div class="social-post-account">${escapeHtml(v.accountName)}</div>
              <div class="social-post-caption">${escapeHtml((v.description || '').slice(0, 72))}${(v.description||'').length > 72 ? '…' : ''}</div>
            </div>
            <div class="social-post-stats">
              <span class="social-post-stat">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ${views.toLocaleString()}
              </span>
              <span class="social-post-stat">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                ${(v.likes||0).toLocaleString()}
              </span>
              <span class="social-post-stat">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                ${(v.shares||0).toLocaleString()}
              </span>
              <span class="social-post-stat"><span class="social-post-engagement">${eng}</span></span>
            </div>
          </div>`;
        }).join('');
      }
    }

    // Timeline
    const ctxTl = document.getElementById('ttTimelineChart');
    if (ctxTl) {
      if (ttTimelineChart) ttTimelineChart.destroy();
      const datasets = accounts.map((acc, i) => ({
        label: acc.name,
        data: (acc.snapshots || []).map(s => ({ x: s.date, y: s.followers || 0 })),
        borderColor: palette[i % palette.length],
        backgroundColor: 'transparent',
        fill: false, tension: 0.35, pointRadius: 3, pointHoverRadius: 7,
        pointBackgroundColor: 'white', pointBorderColor: palette[i % palette.length],
        pointBorderWidth: 2, borderWidth: 2.5,
      }));
      const allDates = [...new Set(accounts.flatMap(a => (a.snapshots || []).map(s => s.date)))].sort();
      ttTimelineChart = new Chart(ctxTl.getContext('2d'), {
        type: 'line', data: { datasets },
        options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' }, scales: { x: { type: 'category', labels: allDates, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8888aa', font: { size: 11 }, maxRotation: 0 }, border: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8888aa', callback: v => v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v }, border: { display: false } } }, plugins: { legend: { position: 'top', labels: { color: '#4a4a6a', usePointStyle: true, padding: 18, font: { family: 'Inter', size: 12 } } }, tooltip: { backgroundColor: 'rgba(255,255,255,0.98)', titleColor: '#0d0d1a', bodyColor: '#4a4a6a', borderColor: 'rgba(0,0,0,0.08)', borderWidth: 1, padding: 12, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${parseInt(ctx.raw.y).toLocaleString()} seguidores` } } } }
      });
    }
  } catch (err) { showStatus('Error al cargar TikTok: ' + err.message, 'error'); }
}

/* ─── INSTAGRAM ─── */
async function loadInstagramData() {
  try {
    const { start, end } = getDateRange('month');
    const res = await fetch(`${API_BASE}/social/summary?startDate=${start}&endDate=${end}`);
    const data = await res.json();
    const accounts = (data.byPlatform?.instagram || []);

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const totalFollowers = accounts.reduce((s, a) => s + (a.currentFollowers || 0), 0);
    const topGrowth = accounts.filter(a => a.growthRate !== null).sort((a, b) => b.growthRate - a.growthRate)[0];
    const avgLikes = (() => {
      const snaps = accounts.flatMap(a => a.snapshots || []).filter(s => s.avgLikes);
      return snaps.length ? Math.round(snaps.reduce((s, x) => s + x.avgLikes, 0) / snaps.length) : 0;
    })();

    setText('igKpiAccounts', accounts.length);
    setText('igKpiFollowers', totalFollowers.toLocaleString());
    setText('igKpiGrowth', topGrowth ? `${topGrowth.name} +${topGrowth.growthRate?.toFixed(2)}%` : '—');
    setText('igKpiAvgLikes', avgLikes.toLocaleString());

    // Bar chart: followers per account
    const ctxSubs = document.getElementById('igSubsChart');
    if (ctxSubs) {
      if (igSubsChart) igSubsChart.destroy();
      const palette = ['#e1306c', '#f77737', '#c13584', '#833ab4', '#5851db', '#405de6'];
      igSubsChart = new Chart(ctxSubs.getContext('2d'), {
        type: 'bar',
        data: {
          labels: accounts.map(a => a.name),
          datasets: [{ label: 'Seguidores', data: accounts.map(a => a.currentFollowers || 0), backgroundColor: accounts.map((_, i) => palette[i % palette.length] + 'cc'), borderColor: accounts.map((_, i) => palette[i % palette.length]), borderWidth: 2, borderRadius: 8 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw.toLocaleString()} seguidores` } } }, scales: { x: { grid: { display: false }, ticks: { color: '#8888aa', font: { size: 11 } } }, y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8888aa', font: { size: 11 }, callback: v => v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v } } } }
      });
    }

    // Top posts list
    const postsEl = document.getElementById('igTopPosts');
    if (postsEl) {
      const allPosts = accounts.flatMap(a => (a.topPosts || []).map(p => ({ ...p, accountName: a.name })));
      allPosts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
      if (allPosts.length === 0) { postsEl.innerHTML = '<p class="text-center text-muted" style="padding:16px;">Sin posts</p>'; }
      else {
        postsEl.innerHTML = allPosts.slice(0,8).map((p, i) => {
          const interactions = (p.likes || 0) + (p.comments || 0);
          const saves = p.saves || 0;
          const views = p.views || 0;
          const eng = views > 0 ? (((p.likes||0) + (p.comments||0)) / views * 100).toFixed(2) + '%' : null;
          const typeIcon = p.type === 'reel'
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M2 7h20M7 2v5M12 2v5M17 2v5"/></svg>`
            : p.type === 'carousel'
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>`
            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="15" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
          return `<div class="social-post-card">
            <div class="social-post-rank">${i + 1}</div>
            <div class="social-post-type ig-type">${typeIcon}</div>
            <div class="social-post-info">
              <div class="social-post-account">${escapeHtml(p.accountName)}</div>
              <div class="social-post-caption">${escapeHtml((p.caption || '').slice(0, 72))}${p.caption?.length > 72 ? '…' : ''}</div>
            </div>
            <div class="social-post-stats">
              ${views > 0 ? `<span class="social-post-stat"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>${views.toLocaleString()}</span>` : ''}
              <span class="social-post-stat">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                ${(p.likes||0).toLocaleString()}
              </span>
              <span class="social-post-stat">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                ${(p.comments||0).toLocaleString()}
              </span>
              ${saves > 0 ? `<span class="social-post-stat"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>${saves.toLocaleString()}</span>` : ''}
              ${eng ? `<span class="social-post-stat"><span class="social-post-engagement">${eng}</span></span>` : ''}
            </div>
          </div>`;
        }).join('');
      }
    }

    // Timeline: followers over time
    const ctxTl = document.getElementById('igTimelineChart');
    if (ctxTl) {
      if (igTimelineChart) igTimelineChart.destroy();
      const palette = ['#e1306c', '#f77737', '#c13584', '#833ab4', '#5851db'];
      const datasets = accounts.map((acc, i) => ({
        label: acc.name,
        data: (acc.snapshots || []).map(s => ({ x: s.date, y: s.followers || 0 })),
        borderColor: palette[i % palette.length],
        backgroundColor: 'transparent',
        fill: false, tension: 0.35, pointRadius: 3, pointHoverRadius: 7,
        pointBackgroundColor: 'white', pointBorderColor: palette[i % palette.length],
        pointBorderWidth: 2, borderWidth: 2.5,
      }));
      const allDates = [...new Set(accounts.flatMap(a => (a.snapshots || []).map(s => s.date)))].sort();
      igTimelineChart = new Chart(ctxTl.getContext('2d'), {
        type: 'line', data: { datasets },
        options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' }, scales: { x: { type: 'category', labels: allDates, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8888aa', font: { size: 11 }, maxRotation: 0 }, border: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8888aa', font: { size: 11 }, callback: v => v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v }, border: { display: false } } }, plugins: { legend: { position: 'top', labels: { color: '#4a4a6a', usePointStyle: true, padding: 18, font: { family: 'Inter', size: 12 } } }, tooltip: { backgroundColor: 'rgba(255,255,255,0.98)', titleColor: '#0d0d1a', bodyColor: '#4a4a6a', borderColor: 'rgba(225,48,108,0.15)', borderWidth: 1, padding: 12, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${parseInt(ctx.raw.y).toLocaleString()} seguidores` } } } }
      });
    }
  } catch (err) { showStatus('Error al cargar Instagram: ' + err.message, 'error'); }
}

/* ─── FACEBOOK ─── */
async function loadFacebookData() {
  try {
    const { start, end } = getDateRange('month');
    const [socialRes, groupsRes] = await Promise.all([
      fetch(`${API_BASE}/social/summary?startDate=${start}&endDate=${end}`),
      fetch(`${API_BASE}/social/groups`)
    ]);
    const data   = await socialRes.json();
    const groups = await groupsRes.json();
    const pages  = data.byPlatform?.facebook_page  || [];
    const fbGroups = data.byPlatform?.facebook_group || [];

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('fbKpiPages',        pages.length);
    setText('fbKpiFollowers',    pages.reduce((s, a) => s + (a.currentFollowers || 0), 0).toLocaleString());
    setText('fbKpiGroups',       groups.length);
    setText('fbKpiGroupMembers', fbGroups.reduce((s, a) => s + (a.currentFollowers || 0), 0).toLocaleString());

    // Bar chart: followers per page
    const ctxPages = document.getElementById('fbSubsChart');
    if (ctxPages) {
      if (fbSubsChart) fbSubsChart.destroy();
      const palette = ['#1877f2', '#42b0ff', '#0a5fcc', '#4299e1', '#63b3ed'];
      fbSubsChart = new Chart(ctxPages.getContext('2d'), {
        type: 'bar',
        data: {
          labels: pages.map(p => p.name),
          datasets: [{ label: 'Seguidores', data: pages.map(p => p.currentFollowers || 0), backgroundColor: pages.map((_, i) => palette[i % palette.length] + 'cc'), borderColor: pages.map((_, i) => palette[i % palette.length]), borderWidth: 2, borderRadius: 8 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw.toLocaleString()} seguidores` } } }, scales: { x: { grid: { display: false }, ticks: { color: '#8888aa', font: { size: 10 }, maxRotation: 25 } }, y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8888aa', callback: v => v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v } } } }
      });
    }

    // Donut: members per group
    const ctxGroup = document.getElementById('fbGroupChart');
    if (ctxGroup) {
      if (fbGroupChart) fbGroupChart.destroy();
      const palette = ['#1877f2', '#42b0ff', '#0a5fcc', '#4299e1'];
      fbGroupChart = new Chart(ctxGroup.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: fbGroups.map(g => g.name),
          datasets: [{ data: fbGroups.map(g => g.currentFollowers || 0), backgroundColor: fbGroups.map((_, i) => palette[i % palette.length] + 'cc'), borderColor: fbGroups.map((_, i) => palette[i % palette.length]), borderWidth: 2, hoverOffset: 8 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { color: '#4a4a6a', padding: 12, font: { family: 'Inter', size: 11 } } }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw.toLocaleString()} miembros` } } } }
      });
    }

    // Groups table
    const tableEl = document.getElementById('fbGroupsTable');
    if (tableEl && groups.length > 0) {
      tableEl.innerHTML = `<table class="table" style="margin:0"><thead><tr><th>Grupo</th><th>Marca</th><th>Tipo</th><th>Miembros</th><th>Snapshots</th></tr></thead><tbody>${groups.map(g => `<tr><td><strong>${escapeHtml(g.name)}</strong></td><td>${escapeHtml(g.brand)}</td><td>${escapeHtml(g.type)}</td><td>${(g.latestMembers||0).toLocaleString()}</td><td>${g.snapshotCount}</td></tr>`).join('')}</tbody></table>`;
    }

    // Facebook top posts (from pages)
    const fbPostsEl = document.getElementById('fbTopPosts');
    if (fbPostsEl) {
      const allPosts = pages.flatMap(p => (p.topPosts || []).map(post => ({ ...post, pageName: p.name })));
      allPosts.sort((a, b) => (b.likes + b.comments + (b.shares||0)) - (a.likes + a.comments + (a.shares||0)));
      if (allPosts.length === 0) {
        fbPostsEl.innerHTML = '<p class="text-center text-muted" style="padding:16px;">Sin publicaciones</p>';
      } else {
        fbPostsEl.innerHTML = allPosts.slice(0, 6).map((p, i) => {
          const interactions = (p.likes||0) + (p.comments||0) + (p.shares||0);
          const views = p.views || 0;
          const eng = views > 0 ? (((p.likes||0) + (p.comments||0)) / views * 100).toFixed(2) + '%' : null;
          return `<div class="social-post-card">
            <div class="social-post-rank">${i + 1}</div>
            <div class="social-post-type fb-type">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div class="social-post-info">
              <div class="social-post-account">${escapeHtml(p.pageName)}</div>
              <div class="social-post-caption">${escapeHtml((p.content || '').slice(0, 72))}${(p.content||'').length > 72 ? '…' : ''}</div>
            </div>
            <div class="social-post-stats">
              <span class="social-post-stat"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>${(p.likes||0).toLocaleString()}</span>
              <span class="social-post-stat"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>${(p.comments||0).toLocaleString()}</span>
              ${p.shares ? `<span class="social-post-stat"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>${p.shares.toLocaleString()}</span>` : ''}
              ${eng ? `<span class="social-post-stat"><span class="social-post-engagement">${eng}</span></span>` : ''}
            </div>
          </div>`;
        }).join('');
      }
    }

    // Populate group select
    const sel = document.getElementById('fbGroupSelect');
    if (sel && groups.length > 0) {
      sel.innerHTML = '<option value="">Selecciona un grupo...</option>' + groups.map(g => `<option value="${g.groupId}">${escapeHtml(g.name)}</option>`).join('');
    }
    // Set default date to today
    const dateInput = document.getElementById('fbGroupDate');
    if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];

    // Timeline: members over time per group
    const ctxTl = document.getElementById('fbGroupTimelineChart');
    if (ctxTl) {
      if (fbGroupTimelineChart) fbGroupTimelineChart.destroy();
      const palette = ['#1877f2', '#42b0ff', '#0a5fcc'];
      const datasets = fbGroups.map((grp, i) => ({
        label: grp.name,
        data: (grp.snapshots || []).map(s => ({ x: s.date, y: s.members || 0 })),
        borderColor: palette[i % palette.length],
        backgroundColor: 'transparent',
        fill: false, tension: 0.35, pointRadius: 4, pointHoverRadius: 8,
        pointBackgroundColor: 'white', pointBorderColor: palette[i % palette.length],
        pointBorderWidth: 2.5, borderWidth: 2.5,
      }));
      const allDates = [...new Set(fbGroups.flatMap(g => (g.snapshots || []).map(s => s.date)))].sort();
      fbGroupTimelineChart = new Chart(ctxTl.getContext('2d'), {
        type: 'line', data: { datasets },
        options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' }, scales: { x: { type: 'category', labels: allDates, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8888aa', font: { size: 11 }, maxRotation: 0 }, border: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8888aa', font: { size: 11 }, callback: v => v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v }, border: { display: false } } }, plugins: { legend: { position: 'top', labels: { color: '#4a4a6a', usePointStyle: true, padding: 18, font: { family: 'Inter', size: 12 } } }, tooltip: { backgroundColor: 'rgba(255,255,255,0.98)', titleColor: '#0d0d1a', bodyColor: '#4a4a6a', borderColor: 'rgba(24,119,242,0.15)', borderWidth: 1, padding: 12, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${parseInt(ctx.raw.y).toLocaleString()} miembros` } } } }
      });
    }
  } catch (err) { showStatus('Error al cargar Facebook: ' + err.message, 'error'); }
}

/* ─── MANUAL GROUP SNAPSHOT ─── */
async function addGroupSnapshot() {
  const groupId = document.getElementById('fbGroupSelect')?.value;
  const date    = document.getElementById('fbGroupDate')?.value;
  const members = parseInt(document.getElementById('fbGroupMembers')?.value);

  if (!groupId) { showStatus('Selecciona un grupo', 'error'); return; }
  if (!date)    { showStatus('Ingresa la fecha', 'error'); return; }
  if (isNaN(members) || members < 0) { showStatus('Ingresa un número de miembros válido', 'error'); return; }

  try {
    const res  = await fetch(`${API_BASE}/social/groups/snapshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, date, members }),
    });
    const data = await res.json();
    if (data.success) {
      showStatus(data.message, 'success');
      document.getElementById('fbGroupMembers').value = '';
      loadFacebookData(); // Refresh charts
    } else {
      showStatus(data.message, 'error');
    }
  } catch (err) { showStatus('Error: ' + err.message, 'error'); }
}

/* ─── TOP DE LA SEMANA POR VELOCIDAD ─── */
async function loadTopByVelocity() {
  const container = document.getElementById('topVelocityBody');
  if (!container) return;
  container.innerHTML = '<tr><td colspan="6" class="text-center"><span class="loading-pulse">Calculando velocidad...</span></td></tr>';
  try {
    const today   = new Date();
    const end     = today.toISOString().split('T')[0];
    const weekAgo = new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0];
    const res  = await fetch(`${API_BASE}/analytics/top-videos?startDate=${weekAgo}&endDate=${end}`);
    const data = await res.json();
    const videos = (data.videos || data.topVideos || data || []).slice(0, 10);

    if (videos.length === 0) {
      container.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Sin videos en los últimos 7 días</td></tr>';
      return;
    }

    container.innerHTML = videos.map((v, i) => {
      const interactions = v.interactions || (v.likes + v.comments) || 0;
      const eng = v.engagementLabel || (v.views > 0 ? ((interactions / v.views) * 100).toFixed(2) + '%' : 'sin datos');
      const typeBadge = v.isShort ? '<span class="short-badge">Short</span>' : '<span class="long-badge">Video</span>';
      return `<tr>
        <td><span class="rank">${i + 1}</span></td>
        <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(v.title)}</td>
        <td>${escapeHtml(v.channelTitle || v.channel || '')}</td>
        <td><strong>${interactions.toLocaleString()}</strong></td>
        <td>${eng}</td>
        <td>${typeBadge}</td>
      </tr>`;
    }).join('');
  } catch (err) {
    container.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Error: ${err.message}</td></tr>`;
  }
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('dashboard');

  const periodSelect   = document.getElementById('periodSelect');
  const brandSelect    = document.getElementById('brandSelect');
  const thresholdInput = document.getElementById('thresholdInput');

  if (periodSelect) periodSelect.addEventListener('change', () => { fetchData(); loadMultiNetworkSummary(); });
  if (brandSelect)  brandSelect.addEventListener('change', () => { fetchData(); loadMultiNetworkSummary(); });

  const videoSearchInput = document.getElementById('videoSearchInput');
  if (videoSearchInput) videoSearchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchVideos(); });

  if (thresholdInput) thresholdInput.addEventListener('change', () => {
    if (currentData) {
      if (document.getElementById('growthTableBody')) renderGrowthTable(currentData.channelGrowth, getThreshold());
      if (document.getElementById('stagnantContent')) renderStagnant(currentData.channelGrowth, getThreshold());
    }
  });

  setInterval(() => {
    const el = document.getElementById('lastUpdate');
    if (el) el.textContent = new Date().toLocaleString();
  }, 60000);

  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !e.target.closest('.sidebar-toggle')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      }
    }
  });
});