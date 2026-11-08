import { MasterPlanOutput, PlotRecord, UNITS } from './geometry/types';
import { toFtIn, polygonCentroid, round2 } from './geometry/polygon';
import siteData from './data/site.json';
import plotsData from './data/plots.json';

const plan = plotsData as MasterPlanOutput;

// State
let currentFilter = 'ALL';
let selectedPlotId: string | null = null;
let zoomLevel = 1.0;

// ViewBox initial bounds
const baseViewBox = {
  x: -60,
  y: -60,
  width: 1060,
  height: 520
};

let currentViewBox = { ...baseViewBox };

function initApp() {
  updateHeaderBadges();
  renderSvgMasterPlan();
  setupPanZoom();
  setupSearch();
  setupFilters();
  setupModals();
  updateInspector(null);
}

function updateHeaderBadges() {
  const b = plan.balanceSheet;
  const s = plan.statistics;

  const badgePlotCount = document.getElementById('badgePlotCount');
  if (badgePlotCount) badgePlotCount.textContent = `${s.totalCount} PLOTS`;

  const badgePlottedPct = document.getElementById('badgePlottedPct');
  if (badgePlottedPct) badgePlottedPct.textContent = `${b.totalPlots.pct}% PLOTTED (${b.totalPlots.areaGaj} GAJ)`;

  const badgeParksPct = document.getElementById('badgeParksPct');
  if (badgeParksPct) badgeParksPct.textContent = `${b.parks.pct}% PARKS`;

  const headerSubtitle = document.getElementById('headerSubtitle');
  if (headerSubtitle) {
    headerSubtitle.textContent = `${b.totalSite.areaSqM} m² (${b.totalSite.bighas} Bighas / ${b.totalSite.areaGaj} Gaj) • ${b.totalPlots.pct}% High-Yield Plotted • ~120 Gaj Standard (Front ≥ 22') • 12m Boulevard Entry`;
  }

  // Inspector Township Master Stats
  document.getElementById('statTotalPlots')!.textContent = `${s.totalCount} Plots`;
  document.getElementById('statResPlots')!.textContent = `${s.residentialCount} Plots`;
  document.getElementById('statComPlots')!.textContent = `${s.commercialCount} Plots`;
  document.getElementById('statAvgGaj')!.textContent = `${s.areaGaj.avg} Gaj (120 Gaj standard)`;
  document.getElementById('statFrontRange')!.textContent = `${toFtIn(s.frontFt.min)} to ${toFtIn(s.frontFt.max)}`;
  document.getElementById('statEastFacing')!.textContent = `${s.facing.east.count} Plots (${s.facing.east.pct}%)`;
  document.getElementById('statWestFacing')!.textContent = `${s.facing.west.count} Plots (${s.facing.west.pct}%)`;
  document.getElementById('statNorthFacing')!.textContent = `${s.facing.north.count} Plots (${s.facing.north.pct}%)`;
  document.getElementById('statParksPct')!.textContent = `${b.parks.pct}% (${b.parks.areaGaj} Gaj)`;
  document.getElementById('statRoadsPct')!.textContent = `${b.roads.pct}% (${b.roads.areaGaj} Gaj)`;
  document.getElementById('statUtilsPct')!.textContent = `${b.utilities.pct}% (${b.utilities.areaGaj} Gaj)`;
}

// Convert CAD coordinates (SW=(0,0), x=East, y=North) to SVG coordinates (SVG y goes down)
// SVG y = 412.46 - CAD y
const Y_MAX = 412.46;
function toSvgPt(x: number, y: number): [number, number] {
  return [x, Y_MAX - y];
}

function renderSvgMasterPlan() {
  const gBoundary = document.getElementById('svgGroupBoundary')!;
  const gRoads = document.getElementById('svgGroupRoads')!;
  const gParks = document.getElementById('svgGroupParks')!;
  const gUtilities = document.getElementById('svgGroupUtilities')!;
  const gPlots = document.getElementById('svgGroupPlots')!;
  const gLabels = document.getElementById('svgGroupLabels')!;

  gBoundary.innerHTML = '';
  gRoads.innerHTML = '';
  gParks.innerHTML = '';
  gUtilities.innerHTML = '';
  gPlots.innerHTML = '';
  gLabels.innerHTML = '';

  // 1. Boundary Polyline
  const boundarySvgPts = siteData.vertices
    .map((v: { x: number; y: number }) => toSvgPt(v.x, v.y).join(','))
    .join(' ');

  gBoundary.innerHTML = `
    <polygon points="${boundarySvgPts}" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <polygon points="-18,-20 229,-20 229,85 469,85 548,120 948,130 948,148 535,138 453.96,103.75 211.08,103.75 211.08,0 0,0 -18,0" fill="url(#chakroadHatch)" stroke="#ef4444" stroke-width="1.2" stroke-dasharray="6,4" opacity="0.6" />
    <polyline points="0,103.75 0,0 211.08,0 211.08,103.75 453.96,103.75 535.0,138.0 931.75,147.96" fill="none" stroke="#ef4444" stroke-width="2" />
    <text x="680" y="142" fill="#fca5a5" font-size="7.5" font-family="JetBrains Mono" font-weight="700">CHAKROAD (NORTH BOUNDARY — NO ACCESS)</text>
  `;

  // 2. Roads
  for (const road of plan.roads) {
    const pts = road.vertices.map(p => toSvgPt(p[0], p[1]).join(',')).join(' ');
    const isSpine = road.role === 'SPINE';
    const isLoop = road.role === 'LOOP';

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'cad-interactive road-entity');
    g.setAttribute('data-id', road.id);

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', pts);
    poly.setAttribute('fill', '#0f172a');
    poly.setAttribute('stroke', isSpine ? '#0284c7' : (isLoop ? '#10b981' : '#334155'));
    poly.setAttribute('stroke-width', isSpine ? '2.0' : '1.2');
    g.appendChild(poly);

    // Centerline
    const c = polygonCentroid(road.vertices);
    const svgC = toSvgPt(c[0], c[1]);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', svgC[0].toString());
    label.setAttribute('y', svgC[1].toString());
    label.setAttribute('fill', isSpine ? '#fde047' : '#94a3b8');
    label.setAttribute('font-size', isSpine ? '8' : '6');
    label.setAttribute('font-family', 'JetBrains Mono');
    label.setAttribute('font-weight', '700');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('pointer-events', 'none');
    if (!isSpine && !isLoop && road.role === 'AVENUE') {
      label.setAttribute('transform', `rotate(-90 ${svgC[0]} ${svgC[1]})`);
    }
    label.textContent = road.name;
    g.appendChild(label);

    gRoads.appendChild(g);
  }

  // 3. Parks
  for (const park of plan.parks) {
    const pts = park.vertices.map(p => toSvgPt(p[0], p[1]).join(',')).join(' ');
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'cad-interactive park-entity');
    g.setAttribute('data-id', park.id);

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', pts);
    poly.setAttribute('fill', 'url(#parkGrassPattern)');
    poly.setAttribute('stroke', '#10b981');
    poly.setAttribute('stroke-width', '1.8');
    g.appendChild(poly);

    const c = polygonCentroid(park.vertices);
    const svgC = toSvgPt(c[0], c[1]);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', svgC[0].toString());
    label.setAttribute('y', svgC[1].toString());
    label.setAttribute('fill', '#ecfdf5');
    label.setAttribute('font-size', '8');
    label.setAttribute('font-family', 'JetBrains Mono');
    label.setAttribute('font-weight', '800');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('pointer-events', 'none');
    label.textContent = `${park.name} (${park.areaGaj} Gaj)`;
    g.appendChild(label);

    gParks.appendChild(g);
  }

  // 4. Utilities
  for (const util of plan.utilities) {
    const pts = util.vertices.map(p => toSvgPt(p[0], p[1]).join(',')).join(' ');
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'cad-interactive util-entity');
    g.setAttribute('data-id', util.id);

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', pts);
    poly.setAttribute('fill', '#1e1b4b');
    poly.setAttribute('stroke', '#818cf8');
    poly.setAttribute('stroke-width', '1.4');
    g.appendChild(poly);

    const c = polygonCentroid(util.vertices);
    const svgC = toSvgPt(c[0], c[1]);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', svgC[0].toString());
    label.setAttribute('y', svgC[1].toString());
    label.setAttribute('fill', '#c7d2fe');
    label.setAttribute('font-size', '6');
    label.setAttribute('font-family', 'JetBrains Mono');
    label.setAttribute('font-weight', '700');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('pointer-events', 'none');
    label.textContent = util.name;
    g.appendChild(label);

    gUtilities.appendChild(g);
  }

  // 5. Plots
  for (const plot of plan.plots) {
    const pts = plot.vertices.map(p => toSvgPt(p[0], p[1]).join(',')).join(' ');

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'cad-interactive plot-entity');
    g.setAttribute('data-id', plot.id);
    g.setAttribute('data-block', plot.block);
    g.setAttribute('data-type', plot.type);
    g.setAttribute('data-facing', plot.facing);
    g.setAttribute('data-premium', plot.premium ? 'true' : 'false');

    let fillColor = '#064e3b'; // Default emerald
    let strokeColor = '#10b981';

    if (plot.type === 'COM') {
      fillColor = '#78350f'; // Commercial Amber
      strokeColor = '#f59e0b';
    } else if (plot.premium) {
      fillColor = '#581c87'; // Premium Purple
      strokeColor = '#a855f7';
    } else if (plot.facing === 'W') {
      fillColor = '#1e1b4b'; // West Indigo
      strokeColor = '#6366f1';
    } else if (plot.facing === 'N') {
      fillColor = '#0c4a6e'; // North Sky
      strokeColor = '#0284c7';
    }

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', pts);
    poly.setAttribute('fill', fillColor);
    poly.setAttribute('fill-opacity', '0.85');
    poly.setAttribute('stroke', strokeColor);
    poly.setAttribute('stroke-width', '1.0');
    g.appendChild(poly);

    // Plot text label
    const c = polygonCentroid(plot.vertices);
    const svgC = toSvgPt(c[0], c[1]);

    const textId = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textId.setAttribute('x', svgC[0].toString());
    textId.setAttribute('y', (svgC[1] - 3).toString());
    textId.setAttribute('fill', '#ffffff');
    textId.setAttribute('font-size', '5.5');
    textId.setAttribute('font-family', 'JetBrains Mono');
    textId.setAttribute('font-weight', '800');
    textId.setAttribute('text-anchor', 'middle');
    textId.setAttribute('pointer-events', 'none');
    textId.textContent = `#${plot.id}`;
    g.appendChild(textId);

    const textGaj = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textGaj.setAttribute('x', svgC[0].toString());
    textGaj.setAttribute('y', (svgC[1] + 4).toString());
    textGaj.setAttribute('fill', plot.type === 'COM' ? '#fbbf24' : '#6ee7b7');
    textGaj.setAttribute('font-size', '4.2');
    textGaj.setAttribute('font-family', 'JetBrains Mono');
    textGaj.setAttribute('font-weight', '700');
    textGaj.setAttribute('text-anchor', 'middle');
    textGaj.setAttribute('pointer-events', 'none');
    textGaj.textContent = `${round2(plot.areaGaj)}G`;
    g.appendChild(textGaj);

    g.addEventListener('click', (e) => {
      e.stopPropagation();
      selectPlot(plot.id);
    });

    gPlots.appendChild(g);
  }
}

function selectPlot(id: string) {
  selectedPlotId = id;
  const plot = plan.plots.find(p => p.id === id);

  document.querySelectorAll('.plot-entity').forEach(el => {
    el.classList.remove('cad-selected');
  });

  const dimGroup = document.getElementById('svgGroupDimensions')!;
  dimGroup.innerHTML = '';

  if (!plot) {
    updateInspector(null);
    return;
  }

  const el = document.querySelector(`.plot-entity[data-id="${id}"]`);
  if (el) {
    el.classList.add('cad-selected');
  }

  // Draw dimension lines on selected plot
  drawPlotDimensions(plot);
  updateInspector(plot);
}

function drawPlotDimensions(plot: PlotRecord) {
  const dimGroup = document.getElementById('svgGroupDimensions')!;
  dimGroup.innerHTML = '';

  const vs = plot.vertices.map(p => toSvgPt(p[0], p[1]));

  // Draw CAD dimension lines with arrows
  const p0 = vs[0];
  const p1 = vs[1];
  const p2 = vs[2];

  dimGroup.innerHTML = `
    <!-- Front dimension line -->
    <line x1="${p0[0]}" y1="${p0[1]}" x2="${p1[0]}" y2="${p1[1]}" stroke="#facc15" stroke-width="1.8" marker-start="url(#dimArrowStart)" marker-end="url(#dimArrowEnd)" />
    <text x="${(p0[0] + p1[0]) / 2}" y="${(p0[1] + p1[1]) / 2 - 2}" fill="#fef08a" font-size="6" font-family="JetBrains Mono" font-weight="700" text-anchor="middle">${toFtIn(plot.frontFt)}</text>

    <!-- Depth dimension line -->
    <line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="#facc15" stroke-width="1.8" marker-start="url(#dimArrowStart)" marker-end="url(#dimArrowEnd)" />
    <text x="${(p1[0] + p2[0]) / 2 + 3}" y="${(p1[1] + p2[1]) / 2}" fill="#fef08a" font-size="6" font-family="JetBrains Mono" font-weight="700" text-anchor="middle">${toFtIn(plot.depthFt)}</text>
  `;
}

function updateInspector(plot: PlotRecord | null) {
  if (!plot) {
    document.getElementById('inspectPlotNo')!.textContent = 'Click any entity';
    document.getElementById('inspectUse')!.textContent = '--';
    document.getElementById('inspectFacing')!.textContent = '--';
    document.getElementById('inspectDims')!.textContent = '--';
    document.getElementById('inspectArea')!.textContent = '--';
    document.getElementById('inspectRoad')!.textContent = '--';
    document.getElementById('inspectPremium')!.textContent = '--';
    document.getElementById('inspectorBadge')!.textContent = 'CLICK TO SELECT';
    return;
  }

  document.getElementById('inspectPlotNo')!.textContent = `Plot #${plot.id}`;
  document.getElementById('inspectUse')!.textContent = plot.type === 'COM' ? 'COMMERCIAL SHOWROOM' : 'RESIDENTIAL PLOT';
  document.getElementById('inspectFacing')!.textContent = `${plot.facing === 'E' ? 'EAST' : (plot.facing === 'W' ? 'WEST' : 'NORTH')}-FACING`;
  document.getElementById('inspectDims')!.textContent = `${toFtIn(plot.frontFt)} Front × ${toFtIn(plot.depthFt)} Depth`;
  document.getElementById('inspectArea')!.textContent = `${plot.areaGaj} Gaj (${plot.areaSqFt} Sq.Ft | ${plot.areaSqM} m²)`;
  document.getElementById('inspectRoad')!.textContent = plot.roadName;
  document.getElementById('inspectPremium')!.textContent = plot.premiumReason || 'Standard';
  document.getElementById('inspectorBadge')!.textContent = `BLOCK ${plot.block}`;
}

function setupPanZoom() {
  const container = document.getElementById('cadCanvasContainer')!;
  const svg = document.getElementById('masterPlanSvg') as unknown as SVGSVGElement;

  let isDragging = false;
  let startX = 0;
  let startY = 0;

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = (e.clientX - startX) * (currentViewBox.width / container.clientWidth);
    const dy = (e.clientY - startY) * (currentViewBox.height / container.clientHeight);

    currentViewBox.x -= dx;
    currentViewBox.y -= dy;
    startX = e.clientX;
    startY = e.clientY;
    updateViewBox();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Wheel Zoom
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
    zoom(zoomFactor, e.clientX, e.clientY);
  }, { passive: false });

  // Buttons
  document.getElementById('btnZoomIn')!.addEventListener('click', () => {
    zoom(0.8);
  });
  document.getElementById('btnZoomOut')!.addEventListener('click', () => {
    zoom(1.25);
  });
  document.getElementById('btnResetView')!.addEventListener('click', () => {
    currentViewBox = { ...baseViewBox };
    updateViewBox();
  });

  function zoom(factor: number, clientX?: number, clientY?: number) {
    const rect = container.getBoundingClientRect();
    const cx = clientX !== undefined ? (clientX - rect.left) / rect.width : 0.5;
    const cy = clientY !== undefined ? (clientY - rect.top) / rect.height : 0.5;

    const newW = currentViewBox.width * factor;
    const newH = currentViewBox.height * factor;

    currentViewBox.x += (currentViewBox.width - newW) * cx;
    currentViewBox.y += (currentViewBox.height - newH) * cy;
    currentViewBox.width = newW;
    currentViewBox.height = newH;

    updateViewBox();
  }

  function updateViewBox() {
    svg.setAttribute(
      'viewBox',
      `${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.width} ${currentViewBox.height}`
    );
    zoomLevel = round2(baseViewBox.width / currentViewBox.width);
    document.getElementById('zoomLevelReadout')!.textContent = `${Math.round(zoomLevel * 100)}%`;
  }
}

function setupSearch() {
  const input = document.getElementById('plotSearchInput') as HTMLInputElement;
  const btn = document.getElementById('btnPlotSearch')!;

  const doSearch = () => {
    const query = input.value.trim().toUpperCase();
    if (!query) return;

    const plot = plan.plots.find(p => p.id.toUpperCase() === query || p.id === query.replace('PLOT', '').trim());
    if (plot) {
      selectPlot(plot.id);
      // Zoom to plot
      const c = polygonCentroid(plot.vertices);
      const svgC = toSvgPt(c[0], c[1]);
      currentViewBox.x = svgC[0] - 100;
      currentViewBox.y = svgC[1] - 60;
      currentViewBox.width = 200;
      currentViewBox.height = 120;
      const svg = document.getElementById('masterPlanSvg')!;
      svg.setAttribute('viewBox', `${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.width} ${currentViewBox.height}`);
    } else {
      alert(`Plot "${query}" not found!`);
    }
  };

  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
}

function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('bg-slate-700', 'text-white'));
      btn.classList.add('bg-slate-700', 'text-white');

      currentFilter = btn.getAttribute('data-filter') || 'ALL';
      applyFilter();
    });
  });
}

function applyFilter() {
  document.querySelectorAll('.plot-entity').forEach(el => {
    const type = el.getAttribute('data-type');
    const facing = el.getAttribute('data-facing');
    const isPremium = el.getAttribute('data-premium') === 'true';

    let show = true;
    if (currentFilter === 'COM') show = type === 'COM';
    else if (currentFilter === 'E') show = facing === 'E';
    else if (currentFilter === 'W') show = facing === 'W';
    else if (currentFilter === 'N') show = facing === 'N';
    else if (currentFilter === 'PREMIUM') show = isPremium;

    if (show) {
      el.classList.remove('plot-dimmed');
    } else {
      el.classList.add('plot-dimmed');
    }
  });
}

function setupModals() {
  // Area Modal
  const modalArea = document.getElementById('areaStatementModal')!;
  document.getElementById('btnOpenAreaModal')!.addEventListener('click', () => {
    populateAreaTable();
    modalArea.classList.remove('hidden');
  });
  document.getElementById('btnCloseAreaModal')!.addEventListener('click', () => {
    modalArea.classList.add('hidden');
  });

  // Options Modal
  const modalOptions = document.getElementById('optionsModal')!;
  document.getElementById('btnOptionsModal')!.addEventListener('click', () => {
    populateOptionsGrid();
    modalOptions.classList.remove('hidden');
  });
  document.getElementById('btnCloseOptionsModal')!.addEventListener('click', () => {
    modalOptions.classList.add('hidden');
  });
}

function populateAreaTable() {
  const tbody = document.getElementById('areaTableBody')!;
  const b = plan.balanceSheet;

  const rows = [
    { cat: b.residentialPlots, bg: 'bg-sky-950/20', text: 'text-sky-300' },
    { cat: b.commercialPlots, bg: 'bg-amber-950/25', text: 'text-amber-300' },
    { cat: b.totalPlots, bg: 'bg-emerald-950/40 border-y border-emerald-500/40', text: 'text-emerald-200 font-bold' },
    { cat: b.parks, bg: 'bg-emerald-950/20', text: 'text-emerald-300 font-bold' },
    { cat: b.roads, bg: '', text: 'text-slate-200' },
    { cat: b.utilities, bg: '', text: 'text-indigo-300' },
    { cat: b.totalSite, bg: 'bg-slate-800/90 border-t-2 border-slate-700 font-bold', text: 'text-white' }
  ];

  tbody.innerHTML = rows.map(r => `
    <tr class="${r.bg}">
      <td class="py-2.5 px-3 font-sans ${r.text}">${r.cat.name}</td>
      <td class="py-2.5 px-3 text-right ${r.text}">${r.cat.areaSqM.toFixed(2)}</td>
      <td class="py-2.5 px-3 text-right ${r.text}">${r.cat.areaGaj.toFixed(2)}</td>
      <td class="py-2.5 px-3 text-right ${r.text}">${r.cat.areaSqFt.toFixed(2)}</td>
      <td class="py-2.5 px-3 text-right ${r.text}">${r.cat.bighas.toFixed(2)}</td>
      <td class="py-2.5 px-3 text-right ${r.text}">${r.cat.pct.toFixed(2)}%</td>
    </tr>
  `).join('');
}

function populateOptionsGrid() {
  const grid = document.getElementById('optionsComparisonGrid')!;
  grid.innerHTML = plan.optionsComparison.map(opt => `
    <div class="bg-slate-950 p-4 rounded-xl border ${opt.optionId === plan.chosenOption ? 'border-emerald-500/60 ring-1 ring-emerald-500/40' : 'border-slate-800'} space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-white text-sm">${opt.name}</h3>
        ${opt.optionId === plan.chosenOption ? '<span class="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">SELECTED</span>' : ''}
      </div>
      <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
        <div>Nominal Depth: <span class="font-mono text-amber-300">${opt.nominalDepthFtIn}</span></div>
        <div>Nominal Front: <span class="font-mono text-amber-300">${opt.nominalFrontFtIn}</span></div>
        <div>Total Plots: <span class="font-mono text-white font-bold">${opt.plotCount.total}</span></div>
        <div>Saleable Gaj: <span class="font-mono text-emerald-400 font-bold">${opt.plottedAreaGaj} Gaj</span></div>
        <div>Plotted Share: <span class="font-mono text-emerald-400 font-bold">${opt.plottedPct}%</span></div>
        <div>Parks Share: <span class="font-mono text-emerald-300 font-bold">${opt.parkPct}%</span></div>
        <div>Roads Share: <span class="font-mono text-sky-300">${opt.roadPct}%</span></div>
        <div>Internal Avenues: <span class="font-mono text-white">${opt.avenueCount} Avenues</span></div>
      </div>
      <div class="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
        Facing: East: ${opt.facing.east} | West: ${opt.facing.west} | North: ${opt.facing.north} | South: 0 (0%)
      </div>
    </div>
  `).join('');
}

// Kickoff
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

