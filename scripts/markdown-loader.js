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
        const images = [];
        const lines = galleryText.split('\n');

        let i = 0;
        while (i < lines.length) {
            const line = lines[i].trim();

            // Check if this line has an image
            const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);

            if (imageMatch) {
                const image = {
                    alt: imageMatch[1],
                    src: imageMatch[2],
                    title: '',
                    description: ''
                };

                // Check next line for title (wrapped in *)
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    const titleMatch = nextLine.match(/^\*(.+)\*$/);
                    if (titleMatch) {
                        image.title = titleMatch[1];
                        i++;
                    }
                }

                // Check line after that for description (wrapped in *)
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    const descMatch = nextLine.match(/^\*(.+)\*$/);
                    if (descMatch) {
                        image.description = descMatch[1];
                        i++;
                    }
                }

                images.push(image);
            }

            i++;
        }

        return images;
    }

    createGalleryHTML(images) {
        if (images.length === 0) return '';

        this.images = images;

        const items = images.map((img, index) => `
            <div class="portfolio-item" data-lightbox-index="${index}">
                <img src="${img.src}" alt="${img.alt || img.title}" loading="lazy">
                <div class="portfolio-item-content">
                    <h3>${img.title || 'Untitled'}</h3>
                    <p>${img.description || ''}</p>
                </div>
            </div>
        `).join('');

        return `
            <div class="description">
                <h2 style="margin-bottom: 20px; font-weight: normal">Gallery</h2>
            </div>
            <div class="portfolio-grid">${items}</div>
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

        // Extract and create gallery
        const images = this.extractGalleryImages(parsed.gallery);
        const galleryHTML = this.createGalleryHTML(images);

        // Convert after-gallery content
        const afterHTML = parsed.after ? this.convertTextToHTML(parsed.after) : '';

        // Combine everything
        projectDetail.innerHTML = beforeHTML + galleryHTML + afterHTML;

        console.log(`Loaded ${images.length} images`);
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
        if (!this.images || this.images.length === 0) return;

        this.currentIndex = index;
        const img = this.images[index];

        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="lightbox-close">&times;</span>
                <div class="lightbox-image-container">
                    <img src="${img.src}" alt="${img.alt || img.title}">
                    <div class="lightbox-nav">
                        <button class="lightbox-prev" ${index === 0 ? 'disabled' : ''}>‹</button>
                        <button class="lightbox-next" ${index === this.images.length - 1 ? 'disabled' : ''}>›</button>
                    </div>
                </div>
                <div class="lightbox-info">
                    <h3>${img.title || ''}</h3>
                    <p>${img.description || ''}</p>
                </div>
                <div class="lightbox-counter">${index + 1} / ${this.images.length}</div>
            </div>
        `;

        document.body.appendChild(lightbox);

        // Event listeners
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());

        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');

        if (prevBtn && !prevBtn.disabled) {
            prevBtn.addEventListener('click', () => this.navigateLightbox(-1));
        }

        if (nextBtn && !nextBtn.disabled) {
            nextBtn.addEventListener('click', () => this.navigateLightbox(1));
        }

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) this.closeLightbox();
        });

        this.boundKeyboardHandler = this.handleKeyboard.bind(this);
        document.addEventListener('keydown', this.boundKeyboardHandler);

        document.body.style.overflow = 'hidden';
    }

    navigateLightbox(direction) {
        const newIndex = this.currentIndex + direction;
        if (newIndex >= 0 && newIndex < this.images.length) {
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
            if (this.currentIndex < this.images.length - 1) {
                this.navigateLightbox(1);
            }
        }
    }
}

// Auto-load markdown if data-markdown attribute is present
document.addEventListener('DOMContentLoaded', () => {
    const contentElement = document.querySelector('[data-markdown]');
    if (contentElement) {
        const markdownPath = contentElement.getAttribute('data-markdown');
        console.log('Loading markdown from:', markdownPath);
        const loader = new MarkdownLoader(markdownPath);
        loader.load();
    }
});

// Export for manual use
window.MarkdownLoader = MarkdownLoader;