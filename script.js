// Portfolio Website Helper Functions

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Image lazy loading
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Active navigation highlighting
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a, .secondary-nav a, .tertiary-nav a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage || 
            link.getAttribute('href') === './' + currentPage) {
            link.classList.add('active');
        }
    });
}

// Call on page load
document.addEventListener('DOMContentLoaded', setActiveNav);

// Mobile menu toggle (if you add a mobile menu button)
function toggleMobileMenu() {
    const nav = document.querySelector('nav');
    nav.classList.toggle('mobile-open');
}

// Image gallery lightbox (optional enhancement)
class Lightbox {
    constructor() {
        this.images = document.querySelectorAll('.portfolio-item img, .project-images img');
        this.currentIndex = 0;
        this.init();
    }
    
    init() {
        this.images.forEach((img, index) => {
            img.addEventListener('click', () => this.open(index));
        });
    }
    
    open(index) {
        this.currentIndex = index;
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="lightbox-close">&times;</span>
                <img src="${this.images[index].src}" alt="${this.images[index].alt}">
                <div class="lightbox-nav">
                    <button class="lightbox-prev">&lsaquo;</button>
                    <button class="lightbox-next">&rsaquo;</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(lightbox);
        
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.close());
        lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.prev());
        lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.next());
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) this.close();
        });
        
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    close() {
        const lightbox = document.querySelector('.lightbox');
        if (lightbox) {
            lightbox.remove();
        }
    }
    
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        const img = document.querySelector('.lightbox img');
        img.src = this.images[this.currentIndex].src;
    }
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        const img = document.querySelector('.lightbox img');
        img.src = this.images[this.currentIndex].src;
    }
    
    handleKeyboard(e) {
        if (e.key === 'Escape') this.close();
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
    }
}

// Initialize lightbox if images are present
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelectorAll('.portfolio-item img, .project-images img').length > 0) {
        new Lightbox();
    }
});

// Add lightbox styles dynamically
const lightboxStyles = `
    .lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
    }
    
    .lightbox img {
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
    }
    
    .lightbox-close {
        position: absolute;
        top: -40px;
        right: 0;
        color: white;
        font-size: 40px;
        cursor: pointer;
        font-weight: 300;
    }
    
    .lightbox-nav {
        position: absolute;
        top: 50%;
        width: 100%;
        display: flex;
        justify-content: space-between;
        transform: translateY(-50%);
    }
    
    .lightbox-nav button {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 40px;
        padding: 10px 20px;
        cursor: pointer;
        transition: background 0.3s;
    }
    
    .lightbox-nav button:hover {
        background: rgba(255, 255, 255, 0.4);
    }
    
    .lightbox-prev {
        margin-left: -60px;
    }
    
    .lightbox-next {
        margin-right: -60px;
    }
`;

// Inject lightbox styles
const styleSheet = document.createElement('style');
styleSheet.textContent = lightboxStyles;
document.head.appendChild(styleSheet);
