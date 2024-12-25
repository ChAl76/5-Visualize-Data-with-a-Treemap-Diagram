const DATASETS = {
  kickstarter: {
    TITLE: 'Kickstarter Pledges',
    DESCRIPTION:
      'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
    FILE_PATH:
      'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json',
  },
  videogames: {
    TITLE: 'Video Game Sales',
    DESCRIPTION: 'Top 100 Most Sold Video Games',
    FILE_PATH:
      'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json',
  },
  movies: {
    TITLE: 'Movie Sales',
    DESCRIPTION: 'Top 100 Highest Grossing Movies Grouped By Genre',
    FILE_PATH:
      'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json',
  },
};

// Clear previous visualization and tooltip
d3.select('#visualization-container').html('');
d3.select('#tooltip').remove();

// Get container width
const containerWidth = document.getElementById(
  'visualization-container'
).offsetWidth;
const aspectRatio = 0.8;

// Calculate responsive dimensions
const margin = { top: 60, right: 10, bottom: 100, left: 10 };
const width = Math.min(containerWidth - margin.left - margin.right, 1000);
const height = width * aspectRatio;

// Create SVG
const svg = d3
  .select('#visualization-container')
  .append('svg')
  .attr('id', 'tree-map')
  .attr(
    'viewBox',
    `0 0 ${width + margin.left + margin.right} ${
      height + margin.top + margin.bottom
    }`
  )
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Get current dataset
const DATASET =
  DATASETS[new URLSearchParams(window.location.search).get('data')] ||
  DATASETS.kickstarter;

// Create color scale
const color = d3.scaleOrdinal(d3.schemePaired);

// Create treemap layout
const treemap = d3.treemap().size([width, height]).paddingInner(1);

// Create tooltip (append to body, not visualization container)
const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .style('position', 'absolute')
  .style('opacity', 0)
  .style('pointer-events', 'none');

// Dynamically calculate font size for title and description
const TITLE_FONT_SIZE = Math.min(width / 25, 14);
const DESCRIPTION_FONT_SIZE = Math.min(width / 40, 10);
const DESCRIPTION_MARGIN = Math.min(TITLE_FONT_SIZE + 10, 30);

// Add title and description
svg
  .append('text')
  .attr('id', 'title')
  .attr('x', width / 2)
  .attr('y', -margin.top / 1.95)
  .attr('text-anchor', 'middle')
  .text(DATASET.TITLE)
  .attr('font-size', `${TITLE_FONT_SIZE}px`);

svg
  .append('text')
  .attr('id', 'description')
  .attr('x', width / 2)
  .attr('y', -margin.top / 1.85 + DESCRIPTION_MARGIN)
  .attr('text-anchor', 'middle')
  .text(DATASET.DESCRIPTION)
  .attr('font-size', `${DESCRIPTION_FONT_SIZE}px`);

// Load and process data
d3.json(DATASET.FILE_PATH).then((data) => {
  const root = d3
    .hierarchy(data)
    .eachBefore((d) => {
      d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
    })
    .sum((d) => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  treemap(root);

  // Create cells
  const cell = svg
    .selectAll('g')
    .data(root.leaves())
    .join('g')
    .attr('class', 'group')
    .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

  // Add rectangles
  cell
    .append('rect')
    .attr('class', 'tile')
    .attr('data-name', (d) => d.data.name)
    .attr('data-category', (d) => d.data.category)
    .attr('data-value', (d) => d.data.value)
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0)
    .attr('fill', (d) => color(d.data.category))
    .on('mousemove', (event, d) => {
      tooltip
        .style('opacity', 0.9)
        .html(
          `<strong>${d.data.name}</strong><br>
            Category: ${d.data.category}<br>
            Value: ${d.data.value}`
        )
        .attr('data-value', d.data.value)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });

  // Add text labels
  cell
    .append('text')
    .attr('clip-path', (d, i) => `url(#clip-${i})`)
    .selectAll('tspan')
    .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .join('tspan')
    .attr('x', 4)
    .attr('y', (d, i) => 13 + i * 10)
    .text((d) => d)
    .attr('font-size', `${Math.max(width / 100, 6)}px`);

  // Add clip paths for each cell
  cell
    .append('clipPath')
    .attr('id', (d, i) => `clip-${i}`)
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0);

  // Create legend
  const categories = Array.from(
    new Set(root.leaves().map((d) => d.data.category))
  );
  const LEGEND_RECT_SIZE = Math.max(width / 100, 14);
  const LEGEND_TEXT_SIZE = Math.max(width / 100, 10);
  const LEGEND_SPACING = LEGEND_RECT_SIZE * 10;
  const LEGEND_ITEMS_PER_ROW = Math.floor(width / LEGEND_SPACING);

  const legend = svg
    .append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(0, ${height + 20})`);

  const legendItem = legend
    .selectAll('g')
    .data(categories)
    .join('g')
    .attr('transform', (d, i) => {
      const row = Math.floor(i / LEGEND_ITEMS_PER_ROW);
      const col = i % LEGEND_ITEMS_PER_ROW;
      return `translate(${col * LEGEND_SPACING}, ${
        row * (LEGEND_RECT_SIZE + 5)
      })`;
    });

  legendItem
    .append('rect')
    .attr('class', 'legend-item')
    .attr('width', LEGEND_RECT_SIZE)
    .attr('height', LEGEND_RECT_SIZE)
    .attr('fill', (d) => color(d));

  legendItem
    .append('text')
    .attr('x', LEGEND_RECT_SIZE + 5)
    .attr('y', LEGEND_RECT_SIZE - 2)
    .text((d) => d)
    .attr('font-size', `${LEGEND_TEXT_SIZE}px`);
});
