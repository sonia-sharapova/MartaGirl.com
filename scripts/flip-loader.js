/**
 * Flip Loader - Display images that can be flipped through
 * Single images display centered, pairs display side-by-side
 */

class FlipLoader {
    constructor(markdownPath, contentSelector = '.content') {
        this.markdownPath = markdownPath;
        this.contentSelector = contentSelector;
        this.content = null;
        this.items = [];
        this.currentIndex = 0;
    }

    async load() {
        try {
            const response = await fetch(this.markdownPath);
            if (!response.ok) {
                throw new Error(`Failed to load markdown: ${response.statusText}`);
            }
            this.content = await response.text();
            this.render();
        } catch (error) {
            console.error('Error loading markdown:', error);
            this.renderError();
        }
    }

    parseMarkdown(markdown) {
        // Split content by the gallery section
        const parts = markdown.split(/## Gallery\s*\n\s*<div class="portfolio-grid">/i);

        let beforeGallery = '';
        let galleryContent = '';
        let afterGallery = '';

        if (parts.length > 1) {
            beforeGallery = parts[0];
            const remaining = parts[1].split('</div>');
            galleryContent = remaining[0];
            afterGallery = remaining.slice(1).join('</div>');
        } else {
            beforeGallery = markdown;
        }

        return {
            before: beforeGallery,
            gallery: galleryContent,
            after: afterGallery
        };
    }

    convertTextToHTML(text) {
        let html = text;

        // Convert headers
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        html = html.replace(/^## (.+)$/gm, '<h2 style="margin-bottom: 20px; font-weight: normal">$1</h2>');
        html = html.replace(/^### (.+)$/gm, '<h3 style="margin-bottom: 20px; font-weight: normal">$1</h3>');

        // Convert bold and italic
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Convert links (but not images)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

        // Wrap paragraphs
        const paragraphs = html.split('\n\n').filter(p => p.trim());
        const wrappedParagraphs = paragraphs.map(para => {
            para = para.trim();
            if (!para) return '';

            if (para.startsWith('<h1>') || para.startsWith('<h2>') || para.startsWith('<h3>')) {
                return para;
            } else if (para.startsWith('<')) {
                return para;
            } else {
                return `<div class="description"><p>${para}</p></div>`;
            }
        });

        return wrappedParagraphs.join('\n');
    }

    extractFlipItems(galleryText) {
        const items = [];
        const lines = galleryText.split('\n');

        let i = 0;
        while (i < lines.length) {
            const line = lines[i].trim();

            // Check if this line has an image
            const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);

            if (imageMatch) {
                const item = {
                    images: [{
                        alt: imageMatch[1],
                        src: imageMatch[2]
                    }],
                    title: '',
                    description: ''
                };

                i++;

                // Check for second image on the next line (for pair display)
                if (i < lines.length) {
                    const nextLine = lines[i].trim();
                    const secondImageMatch = nextLine.match(/!\[([^\]]*)\]\(([^)]+)\)/);

                    if (secondImageMatch) {
                        item.images.push({
                            alt: secondImageMatch[1],
                            src: secondImageMatch[2]
                        });
                        i++;
                    }
                }

                // Check for title (wrapped in *)
                if (i < lines.length) {
                    const nextLine = lines[i].trim();
                    const titleMatch = nextLine.match(/^\*(.+)\*$/);
                    if (titleMatch) {
                        item.title = titleMatch[1];
                        i++;
                    }
                }

                // Check for description (wrapped in *)
                if (i < lines.length) {
                    const nextLine = lines[i].trim();
                    const descMatch = nextLine.match(/^\*(.+)\*$/);
                    if (descMatch) {
                        item.description = descMatch[1];
                        i++;
                    }
                }

                items.push(item);
            } else {
                i++;
            }
        }

        return items;
    }

    createFlipHTML(items) {
        if (items.length === 0) return '';

        this.items = items;
        const firstItem = items[0];

        // Create the flip container
        const isSingleImage = firstItem.images.length === 1;
        const containerClass = isSingleImage ? 'flip-container single' : 'flip-container pair';

        const imagesHTML = firstItem.images.map(img =>
            `<img src="${img.src}" alt="${img.alt}" class="flip-image">`
        ).join('');

        // Only show navigation if there's more than one item
        const navigationHTML = items.length > 1 ? `
            <div class="flip-navigation">
                <button class="flip-prev" id="flipPrev">‹ Previous</button>
                <span class="flip-counter" id="flipCounter">1 / ${items.length}</span>
                <button class="flip-next" id="flipNext">Next ›</button>
            </div>
        ` : '';

        return `
            <div class="${containerClass}" id="flipContainer">
                <div class="flip-images">
                    ${imagesHTML}
                </div>
                <div class="flip-info">
                    ${firstItem.title ? `<h3>${firstItem.title}</h3>` : ''}
                    ${firstItem.description ? `<p>${firstItem.description}</p>` : ''}
                </div>
                ${navigationHTML}
            </div>
        `;
    }

    render() {
        const parsed = this.parseMarkdown(this.content);
        const container = document.querySelector(this.contentSelector);
        const projectDetail = container.querySelector('.project-detail');

        if (!projectDetail) {
            console.error('Project detail container not found');
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
        projectDetail.innerHTML = beforeHTML + flipHTML + afterHTML;

        console.log(`Loaded ${items.length} flip items`);

        // Initialize navigation
        this.initNavigation();
    }

    renderError() {
        const container = document.querySelector(this.contentSelector);
        const projectDetail = container.querySelector('.project-detail');

        if (projectDetail) {
            projectDetail.innerHTML = `
                <div class="description">
                    <p style="color: #ff6b9d;">Error loading content. Please check that the markdown file exists at: ${this.markdownPath}</p>
                </div>
            `;
        }
    }

    initNavigation() {
        const prevBtn = document.getElementById('flipPrev');
        const nextBtn = document.getElementById('flipNext');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigate(-1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigate(1));
        }

        // Keyboard navigation (only if we have multiple items)
        if (this.items.length > 1) {
            this.boundKeyHandler = this.handleKeyboard.bind(this);
            document.addEventListener('keydown', this.boundKeyHandler);
        }
    }

    navigate(direction) {
        let newIndex = this.currentIndex + direction;

        // Circular navigation
        if (newIndex < 0) {
            newIndex = this.items.length - 1;
        } else if (newIndex >= this.items.length) {
            newIndex = 0;
        }

        this.currentIndex = newIndex;
        this.updateDisplay();
    }

    updateDisplay() {
        const item = this.items[this.currentIndex];
        const container = document.getElementById('flipContainer');
        const counter = document.getElementById('flipCounter');

        // Update container class based on number of images
        const isSingleImage = item.images.length === 1;
        container.className = isSingleImage ? 'flip-container single' : 'flip-container pair';

        // Update images
        const imagesHTML = item.images.map(img =>
            `<img src="${img.src}" alt="${img.alt}" class="flip-image">`
        ).join('');

        const flipImages = container.querySelector('.flip-images');
        flipImages.innerHTML = imagesHTML;

        // Update info
        const flipInfo = container.querySelector('.flip-info');
        flipInfo.innerHTML = `
            ${item.title ? `<h3>${item.title}</h3>` : ''}
            ${item.description ? `<p>${item.description}</p>` : ''}
        `;

        // Update counter
        counter.textContent = `${this.currentIndex + 1} / ${this.items.length}`;

        // Add fade animation
        container.classList.add('flip-transition');
        setTimeout(() => {
            container.classList.remove('flip-transition');
        }, 300);
    }

    handleKeyboard(e) {
        if (e.key === 'ArrowLeft') {
            this.navigate(-1);
        } else if (e.key === 'ArrowRight') {
            this.navigate(1);
        }
    }

    destroy() {
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
        }
    }
}

// In both markdown-loader.js and flip-loader.js, modify the auto-loader:
document.addEventListener('DOMContentLoaded', () => {
    // Only auto-load if no manual layout is present
    const hasManualLayout = document.querySelector('.layout-toggle');

    if (!hasManualLayout) {
        const contentElement = document.querySelector('[data-markdown]');
        if (contentElement) {
            const markdownPath = contentElement.getAttribute('data-markdown');
            console.log('Auto-loading markdown from:', markdownPath);
            const loader = new MarkdownLoader(markdownPath);
            loader.load();
        }
    }
});

// Export for manual use
window.FlipLoader = FlipLoader;