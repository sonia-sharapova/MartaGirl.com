// layout.js - Fixed version
document.addEventListener('DOMContentLoaded', function() {
    const gridViewBtn = document.getElementById('gridView');
    const flipViewBtn = document.getElementById('flipView');
    const gridContent = document.getElementById('gridContent');
    const flipContent = document.getElementById('flipContent');

    // Function to initialize grid view
    function initGridView() {
        // Clear any existing content
        gridContent.innerHTML = '<div class="project-detail"><p style="color: #999;">Loading grid content...</p></div>';

        const loader = new MarkdownLoader('generation-conscious.md');
        loader.contentSelector = '#gridContent';
        loader.load();
    }

    // Function to initialize flipbook view
    function initFlipView() {
        // Clear any existing content
        flipContent.innerHTML = '<div class="project-detail"><p style="color: #999;">Loading flipbook content...</p></div>';

        const loader = new FlipLoader('generation-flip.md');
        loader.contentSelector = '#flipContent';
        loader.load();
    }

    // Event listeners for toggle buttons
    gridViewBtn.addEventListener('click', function() {
        gridViewBtn.classList.add('active');
        flipViewBtn.classList.remove('active');
        gridContent.style.display = 'block';
        flipContent.style.display = 'none';

        // Re-initialize grid view if it hasn't been loaded yet
        if (gridContent.querySelector('.portfolio-grid') === null) {
            initGridView();
        }
    });

    flipViewBtn.addEventListener('click', function() {
        flipViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        flipContent.style.display = 'block';
        gridContent.style.display = 'none';

        // Re-initialize flip view if it hasn't been loaded yet
        if (flipContent.querySelector('.flip-container') === null) {
            initFlipView();
        }
    });

    // Load initial view (grid view)
    initGridView();
});