/**
 * Fixed Markdown Loader - Properly displays gallery as grid
 */

class MarkdownLoader {
    constructor(markdownPath, contentSelector = '.content') {
        this.markdownPath = markdownPath;
        this.contentSelector = contentSelector;
        this.content = null;
        this.images = [];
    }

    async load() {
        try {
            const response = await fetch(this.markdownPath);
            if (!response.ok) {
                throw new Error(`Failed to load markdown: ${response.statusText}`);
            }
            this.content = await response.text();
            this.render();
            this.initLightbox();
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

    extractGalleryImages(galleryText) {
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

                // Check for additional images on following lines (before title/description)
                while (i < lines.length) {
                    const nextLine = lines[i].trim();
                    const additionalImageMatch = nextLine.match(/!\[([^\]]*)\]\(([^)]+)\)/);

                    if (additionalImageMatch) {
                        item.images.push({
                            alt: additionalImageMatch[1],
                            src: additionalImageMatch[2]
                        });
                        i++;
                    } else {
                        break;
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

    createGalleryHTML(items) {
        if (items.length === 0) return '';

        this.items = items;

        const gridItems = items.map((item, index) => {
            const coverImage = item.images[0];
            const hasInfo = item.title || item.description;
            const overlayContent = hasInfo ? `
                <div class="portfolio-item-overlay">
                    ${item.title ? `<h3>${item.title}</h3>` : ''}
                    ${item.description ? `<p>${item.description}</p>` : ''}
                </div>
            ` : '';

            return `
                <div class="portfolio-item" data-lightbox-index="${index}">
                    <img src="${coverImage.src}" alt="${coverImage.alt || item.title}" loading="lazy">
                    ${overlayContent}
                </div>
            `;
        }).join('');

        return `<div class="portfolio-grid">${gridItems}</div>`;
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

        // Extract and create gallery
        const items = this.extractGalleryImages(parsed.gallery);
        const galleryHTML = this.createGalleryHTML(items);

        // Convert after-gallery content
        const afterHTML = parsed.after ? this.convertTextToHTML(parsed.after) : '';

        // Combine everything (no Gallery header)
        projectDetail.innerHTML = beforeHTML + galleryHTML + afterHTML;

        console.log(`Loaded ${items.length} portfolio items`);
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

    initLightbox() {
        setTimeout(() => {
            const items = document.querySelectorAll('.portfolio-item[data-lightbox-index]');
            console.log(`Initializing lightbox for ${items.length} items`);
            items.forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.getAttribute('data-lightbox-index'));
                    this.openLightbox(index);
                });
            });
        }, 200);
    }

    openLightbox(index) {
        if (!this.items || this.items.length === 0) return;

        this.currentIndex = index;
        const item = this.items[index];
        const hasMultipleImages = item.images.length > 1;

        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';

        if (hasMultipleImages) {
            // Show grid of all images
            const imageGrid = item.images.map((img, imgIndex) =>
                `<img src="${img.src}" alt="${img.alt}" data-image-index="${imgIndex}">`
            ).join('');

            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <span class="lightbox-close">&times;</span>
                    <div class="lightbox-multi-grid">
                        ${imageGrid}
                    </div>
                    <div class="lightbox-info">
                        ${item.title ? `<h3>${item.title}</h3>` : ''}
                        ${item.description ? `<p>${item.description}</p>` : ''}
                    </div>
                    <div class="lightbox-counter">${index + 1} / ${this.items.length}</div>
                </div>
            `;

            // Add click handlers to grid images
            setTimeout(() => {
                const gridImages = lightbox.querySelectorAll('.lightbox-multi-grid img');
                gridImages.forEach(img => {
                    img.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const imgIndex = parseInt(e.target.getAttribute('data-image-index'));
                        this.openSingleImageLightbox(index, imgIndex);
                    });
                });
            }, 100);
        } else {
            // Show single image with navigation
            const img = item.images[0];
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <span class="lightbox-close">&times;</span>
                    <div class="lightbox-image-container">
                        <img src="${img.src}" alt="${img.alt || item.title}">
                        <div class="lightbox-nav">
                            <button class="lightbox-prev" ${index === 0 ? 'disabled' : ''}>‹</button>
                            <button class="lightbox-next" ${index === this.items.length - 1 ? 'disabled' : ''}>›</button>
                        </div>
                    </div>
                    <div class="lightbox-info">
                        ${item.title ? `<h3>${item.title}</h3>` : ''}
                        ${item.description ? `<p>${item.description}</p>` : ''}
                    </div>
                    <div class="lightbox-counter">${index + 1} / ${this.items.length}</div>
                </div>
            `;

            const prevBtn = lightbox.querySelector('.lightbox-prev');
            const nextBtn = lightbox.querySelector('.lightbox-next');

            if (prevBtn && !prevBtn.disabled) {
                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.navigateLightbox(-1);
                });
            }

            if (nextBtn && !nextBtn.disabled) {
                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.navigateLightbox(1);
                });
            }
        }

        document.body.appendChild(lightbox);

        // Event listeners
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) this.closeLightbox();
        });

        this.boundKeyboardHandler = this.handleKeyboard.bind(this);
        document.addEventListener('keydown', this.boundKeyboardHandler);

        document.body.style.overflow = 'hidden';
    }

    openSingleImageLightbox(itemIndex, imageIndex) {
        this.closeLightbox();

        setTimeout(() => {
            const item = this.items[itemIndex];
            const img = item.images[imageIndex];

            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <span class="lightbox-close">&times;</span>
                    <div class="lightbox-image-container">
                        <img src="${img.src}" alt="${img.alt}">
                        <div class="lightbox-nav">
                            <button class="lightbox-prev" ${imageIndex === 0 ? 'disabled' : ''}>‹</button>
                            <button class="lightbox-next" ${imageIndex === item.images.length - 1 ? 'disabled' : ''}>›</button>
                        </div>
                    </div>
                    <div class="lightbox-info">
                        ${item.title ? `<h3>${item.title}</h3>` : ''}
                        ${item.description ? `<p>${item.description}</p>` : ''}
                    </div>
                    <div class="lightbox-counter">${imageIndex + 1} / ${item.images.length}</div>
                </div>
            `;

            document.body.appendChild(lightbox);

            lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
                this.closeLightbox();
                setTimeout(() => this.openLightbox(itemIndex), 100);
            });

            const prevBtn = lightbox.querySelector('.lightbox-prev');
            const nextBtn = lightbox.querySelector('.lightbox-next');

            if (prevBtn && !prevBtn.disabled) {
                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openSingleImageLightbox(itemIndex, imageIndex - 1);
                });
            }

            if (nextBtn && !nextBtn.disabled) {
                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openSingleImageLightbox(itemIndex, imageIndex + 1);
                });
            }

            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    this.closeLightbox();
                    setTimeout(() => this.openLightbox(itemIndex), 100);
                }
            });

            this.boundKeyboardHandler = ((e) => {
                if (e.key === 'Escape') {
                    this.closeLightbox();
                    setTimeout(() => this.openLightbox(itemIndex), 100);
                } else if (e.key === 'ArrowLeft' && imageIndex > 0) {
                    this.openSingleImageLightbox(itemIndex, imageIndex - 1);
                } else if (e.key === 'ArrowRight' && imageIndex < item.images.length - 1) {
                    this.openSingleImageLightbox(itemIndex, imageIndex + 1);
                }
            });

            document.addEventListener('keydown', this.boundKeyboardHandler);
            document.body.style.overflow = 'hidden';
        }, 100);
    }

    navigateLightbox(direction) {
        const newIndex = this.currentIndex + direction;
        if (newIndex >= 0 && newIndex < this.items.length) {
            this.closeLightbox();
            setTimeout(() => this.openLightbox(newIndex), 100);
        }
    }

    closeLightbox() {
        const lightbox = document.querySelector('.lightbox');
        if (lightbox) {
            lightbox.remove();
        }
        if (this.boundKeyboardHandler) {
            document.removeEventListener('keydown', this.boundKeyboardHandler);
        }
        document.body.style.overflow = '';
    }

    handleKeyboard(e) {
        if (e.key === 'Escape') {
            this.closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            if (this.currentIndex > 0) {
                this.navigateLightbox(-1);
            }
        } else if (e.key === 'ArrowRight') {
            if (this.currentIndex < this.items.length - 1) {
                this.navigateLightbox(1);
            }
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