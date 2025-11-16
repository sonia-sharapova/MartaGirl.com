// table-layout.js - Fixed version
document.addEventListener('DOMContentLoaded', function() {
    const gridViewBtn = document.getElementById('tableGridView');
    const flipViewBtn = document.getElementById('tableFlipView');
    const gridContent = document.getElementById('tableGridContent');
    const flipContent = document.getElementById('tableFlipContent');

    let gridLoader = null;
    let flipLoader = null;
    let gridLoaded = false;
    let flipLoaded = false;

    // Function to initialize grid view
    function initGridView() {
        if (!gridLoaded) {
            console.log('Initializing grid view...');

            // Create a custom loader that targets the right container
            gridLoader = new MarkdownLoader('table-settings.md');

            // Override the contentSelector to point directly to our container
            gridLoader.contentSelector = '#tableGridContent';

            // Override the render method to use our specific container
            const originalRender = gridLoader.render.bind(gridLoader);
            gridLoader.render = function() {
                const parsed = this.parseMarkdown(this.content);
                const container = document.querySelector(this.contentSelector);

                if (!container) {
                    console.error('Grid container not found:', this.contentSelector);
                    return;
                }

                // Convert before-gallery content
                const beforeHTML = this.convertTextToHTML(parsed.before);

                // Extract and create gallery
                const items = this.extractGalleryImages(parsed.gallery);
                const galleryHTML = this.createGalleryHTML(items);

                // Convert after-gallery content
                const afterHTML = parsed.after ? this.convertTextToHTML(parsed.after) : '';

                // Combine everything (no Gallery header)
                container.innerHTML = beforeHTML + galleryHTML + afterHTML;

                console.log(`Loaded ${items.length} portfolio items`);

                // Initialize lightbox
                setTimeout(() => {
                    this.initLightbox();
                }, 100);
            };

            gridLoader.load();
            gridLoaded = true;
        }
    }

    // Function to initialize flipbook view
    function initFlipView() {
        if (!flipLoaded) {
            console.log('Initializing flipbook view...');

            flipLoader = new FlipLoader('table-flip.md');
            flipLoader.contentSelector = '#tableFlipContent';

            // Override the render method for flip loader
            const originalFlipRender = flipLoader.render.bind(flipLoader);
            flipLoader.render = function() {
                const parsed = this.parseMarkdown(this.content);
                const container = document.querySelector(this.contentSelector);

                if (!container) {
                    console.error('Flip container not found:', this.contentSelector);
                    return;
                }

                // Convert before-gallery content
                const beforeHTML = this.convertTextToHTML(parsed.before);

                // Extract and create flip interface
                const items = this.extractFlipItems(parsed.gallery);
                const flipHTML = this.createFlipHTML(items);

                // Convert after-gallery content
                const afterHTML = parsed.after ? this.convertTextToHTML(parsed.after) : '';

                // Combine everything
                container.innerHTML = beforeHTML + flipHTML + afterHTML;

                console.log(`Loaded ${items.length} flip items`);

                // Initialize navigation
                this.initNavigation();
            };

            flipLoader.load();
            flipLoaded = true;
        }
    }

    // Event listeners for toggle buttons
    gridViewBtn.addEventListener('click', function() {
        console.log('Switching to grid view');
        gridViewBtn.classList.add('active');
        flipViewBtn.classList.remove('active');
        gridContent.style.display = 'block';
        flipContent.style.display = 'none';

        initGridView();
    });

    flipViewBtn.addEventListener('click', function() {
        console.log('Switching to flipbook view');
        flipViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        gridContent.style.display = 'none';
        flipContent.style.display = 'block';

        initFlipView();
    });

    // Load initial view (grid view)
    console.log('Loading initial grid view...');
    initGridView();
});