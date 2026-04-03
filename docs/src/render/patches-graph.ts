import type { PatchNotes } from '@core/types';
import { contentEl } from '../state';

export function renderPatchesGraph(data: PatchNotes[]) {
  // Sort patches by timestamp: latest first
  const sortedPatches = [...data].sort((a, b) => b.patch_timestamp - a.patch_timestamp);
  
  const container = document.createElement('div');
  container.className = 'patches-graph-container';
  
  if (data.length === 0) {
    container.innerHTML = '<div class="empty-state">No patches found</div>';
    contentEl.appendChild(container);
    return;
  }

  const width = Math.max(window.innerWidth - 200, sortedPatches.length * 150);
  const height = 300;
  const padding = 60;
  
  const latestTime = sortedPatches[0].patch_timestamp;
  const oldestTime = sortedPatches[sortedPatches.length - 1].patch_timestamp;
  const timeRange = latestTime - oldestTime || 1;

  const getX = (timestamp: number) => {
    // Latest (latestTime) will be at padding, oldest (oldestTime) will be at width - padding
    return padding + ((latestTime - timestamp) / timeRange) * (width - 2 * padding);
  };

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width.toString());
  svg.setAttribute('height', height.toString());
  svg.setAttribute('class', 'timeline-svg');

  // Draw main axis line
  const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  axis.setAttribute('x1', padding.toString());
  axis.setAttribute('y1', (height / 2).toString());
  axis.setAttribute('x2', (width - padding).toString());
  axis.setAttribute('y2', (height / 2).toString());
  axis.setAttribute('class', 'timeline-axis');
  svg.appendChild(axis);

  // Draw patches
  sortedPatches.forEach((patch, index) => {
    const x = getX(patch.patch_timestamp);
    const y = height / 2;
    
    // Y-offset to prevent overlap if dots are too close (simple staggered approach)
    const yOffset = (index % 2 === 0 ? -40 : 40);

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'patch-node');
    group.onclick = () => (window as any).showPatchDetails(patch.patch_name);

    // Connector line
    const connector = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    connector.setAttribute('x1', x.toString());
    connector.setAttribute('y1', y.toString());
    connector.setAttribute('x2', x.toString());
    connector.setAttribute('y2', (y + yOffset).toString());
    connector.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
    group.appendChild(connector);

    // Patch circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x.toString());
    circle.setAttribute('cy', (y + yOffset).toString());
    circle.setAttribute('r', '5');
    circle.setAttribute('fill', 'var(--primary)');
    group.appendChild(circle);

    // Version label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x.toString());
    text.setAttribute('y', (y + yOffset + (yOffset > 0 ? 25 : -15)).toString());
    text.setAttribute('class', 'version-label');
    text.textContent = patch.patch_name;
    group.appendChild(text);

    // Date label
    const dateText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    dateText.setAttribute('x', x.toString());
    dateText.setAttribute('y', (y + (yOffset > 0 ? -10 : 20)).toString());
    dateText.setAttribute('text-anchor', 'middle');
    dateText.setAttribute('class', 'date-label');
    dateText.textContent = new Date(patch.patch_timestamp * 1000).toLocaleDateString();
    group.appendChild(dateText);

    svg.appendChild(group);
  });

  container.appendChild(svg);
  contentEl.appendChild(container);
}
