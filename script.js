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
const color = d3.scaleOrdinal(d3.schemeCategory10);

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
