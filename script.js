// Portfolio Website Helper Functions

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add this at the very beginning of your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    // Wait a brief moment for nav-generator to initialize
    setTimeout(() => {
        console.log('Checking navigation state:', {
            desktopNav: document.querySelector('nav ul')?.children.length,
            mobileNav: document.querySelector('.mobile-nav-menu ul')?.children.length,
            navGenerator: typeof NavigationGenerator
        });

        // If navigation isn't populated, try to initialize it manually
        const mobileNav = document.querySelector('.mobile-nav-menu ul');
        const desktopNav = document.querySelector('nav ul');

        if (mobileNav && mobileNav.children.length === 0) {
            console.log('Navigation not populated, attempting manual initialization');
            // You might need to manually trigger nav generation here
        }
    }, 100);
});

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

// Mobile menu toggle (legacy function)
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
        background: rgba(246, 245, 245, 0.95);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        animation: fadeIn 0.2s forwards;
    }
        
    @keyframes fadeIn {
        to {
            opacity: 1;
        }
    }
    
    .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .lightbox-image-container {
        position: relative;
        max-width: 100%;
        max-height: 80vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .lightbox img {
        width: 100%;
        max-height:40vh;
        object-fit: contain;
        border-radius: 2px;
        box-shadow: 0 10px 50px rgba(0,0,0,0.5);
    }
    
    /* Multi-image grid in lightbox */
    .lightbox-multi-grid {
        display: flex;
        flex-direction: row;
        gap: 10px;
        max-width: 70vw;
        max-height: 85vh;
        overflow-x: auto;
        overflow-y: hidden;
        padding: 30px;
        justify-content: center;
        align-items: center;
        margin: 0 auto;
        scrollbar-width: thin;
        scrollbar-color: #ff6b9d rgba(0, 0, 0, 0.1);
    }
    
    /* Custom scrollbar for Webkit browsers */
    .lightbox-multi-grid::-webkit-scrollbar {
        height: 8px;
    }
    
    .lightbox-multi-grid::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
    }
    
    .lightbox-multi-grid::-webkit-scrollbar-thumb {
        background: #ff6b9d;
        border-radius: 3px;
    }
    
    .lightbox-multi-grid::-webkit-scrollbar-thumb:hover {
        background: #ff4d8d;
    }
    
    .lightbox-multi-grid img {
        width: auto;
        height: auto;
        max-width: 40vw;
        max-height: 35vh;
        object-fit: contain;
        cursor: pointer;
        border-radius: 4px;
        transition: transform 0.3s ease;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        flex-shrink: 0;
    }
    
    .lightbox-multi-grid img:hover {
        transform: scale(1.02);
    }
    
    /* Ensure images maintain their aspect ratio */
    .lightbox-multi-grid img[width][height] {
        /* Respect original dimensions if available */
        width: auto;
        height: auto;
    }
    
    /* Single image - make it extra large and centered */
    .lightbox-multi-grid:has(img:only-child) {
        justify-content: center;
    }
    
    .lightbox-multi-grid:has(img:only-child) img {
        max-width: 90vw;
        max-height: 85vh;
    }
    
    /* Two images - space them evenly */
    .lightbox-multi-grid:has(img:nth-child(2):last-child) {
        justify-content: space-around;
    }
    
    /* Three or more images - allow horizontal scrolling */
    .lightbox-multi-grid:has(img:nth-child(3)) {
        justify-content: flex-start;
    }
    
    /* Add some spacing between images when scrolling is needed */
    .lightbox-multi-grid:not(:has(img:only-child)) img {
        margin-right: 20px;
    }
    
    .lightbox-multi-grid:not(:has(img:only-child)) img:last-child {
        margin-right: 0;
    }
    
    .lightbox-info {
        text-align: center;
        color: #868686;
        max-width: 600px;
    }
    
    .lightbox-info h3 {
        font-size: 24px;
        font-weight: normal;
        margin-top: 50px;
        margin-bottom: 10px;
        letter-spacing: 2px;
    }
    
    .lightbox-info p {
        font-size: 16px;
        line-height: 1.6;
        color: #ccc;
        letter-spacing: 1px;
    }
    
    .lightbox-close {
        position: absolute;
        bottom: 440px;
        left: 100%;
        color: #989898;
        font-size: 40px;
        cursor: pointer;
        font-weight: 300;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;
        z-index: 10001;
    }
    
    .lightbox-close:hover {
        transform: scale(1.1);
    }
    
    .lightbox-nav {
        position: absolute;
        top: 50%;
        width: calc(100% + 120px);
        left: -60px;
        display: flex;
        justify-content: space-between;
        transform: translateY(-50%);
        pointer-events: none;
    }
    
    .lightbox-nav button {
        background: rgba(122, 122, 122, 0.12);
        border: 2px solid rgba(91, 91, 91, 0.04);
        color: #989898;
        font-size: 30px;
        padding: 5px 10px;
        margin: -10px;
        cursor: pointer;
        transition: all 0.2s;
        border-radius: 5px;
        pointer-events: all;
        backdrop-filter: blur(10px);
    }
    
    .lightbox-nav button:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.5);
    }
    
    .lightbox-nav button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
    
    .lightbox-counter {
        position: absolute;
        top: 450px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-size: 14px;
        letter-spacing: 2px;
        background: rgba(0, 0, 0, 0.5);
        padding: 8px 16px;
        border-radius: 20px;
    }

`;

// Mobile navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileMenu = document.querySelector('.mobile-nav-menu');
    const mobileClose = document.querySelector('.mobile-nav-close');

    // Function to hide/show logo
    function toggleLogoVisibility() {
        const logo = document.querySelector('.logo');
        if (logo && mobileMenu) {
            if (mobileMenu.classList.contains('active')) {
                logo.style.display = 'none';
            } else {
                logo.style.display = 'block';
            }
        }
    }

    if (mobileToggle && mobileMenu) {
        // Toggle mobile menu
        mobileToggle.addEventListener('click', function() {
            mobileToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
            toggleLogoVisibility();
        });

        // Close button
        if (mobileClose) {
            mobileClose.addEventListener('click', function() {
                mobileToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
                toggleLogoVisibility();
            });
        }

        // Dropdown functionality for mobile navigation
        const dropdownArrows = document.querySelectorAll('.has-submenu > a .dropdown-arrow');
        const submenuLinks = document.querySelectorAll('.has-submenu > a');

        submenuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Only prevent default if it's a parent link with dropdown
                if (this.parentElement.classList.contains('has-submenu')) {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent event from bubbling up

                    const parent = this.parentElement;
                    const submenu = parent.querySelector(':scope > .submenu'); // Only direct child submenu
                    const isOpen = parent.classList.contains('open');

                    // Close all sibling dropdowns at the same level
                    const siblings = Array.from(parent.parentElement.children).filter(child =>
                        child !== parent && child.classList.contains('has-submenu')
                    );

                    siblings.forEach(sibling => {
                        sibling.classList.remove('open');
                        const siblingSubmenu = sibling.querySelector(':scope > .submenu');
                        if (siblingSubmenu) {
                            siblingSubmenu.classList.remove('open');
                        }
                    });

                    // Toggle current dropdown
                    if (!isOpen) {
                        parent.classList.add('open');
                        if (submenu) {
                            submenu.classList.add('open');
                        }
                    } else {
                        parent.classList.remove('open');
                        if (submenu) {
                            submenu.classList.remove('open');
                        }
                        // Also close all nested submenus
                        const nestedSubmenus = parent.querySelectorAll('.has-submenu');
                        nestedSubmenus.forEach(nested => {
                            nested.classList.remove('open');
                            const nestedSubmenu = nested.querySelector('.submenu');
                            if (nestedSubmenu) {
                                nestedSubmenu.classList.remove('open');
                            }
                        });
                    }
                }
            });
        });

        // Close menu when clicking on final submenu links (non-dropdown links)
        const finalLinks = document.querySelectorAll('.mobile-nav-menu a:not(.has-submenu > a)');
        finalLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Only close if it's not a dropdown trigger
                if (!this.parentElement.classList.contains('has-submenu') ||
                    !this.querySelector('.dropdown-arrow')) {
                    mobileToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                    toggleLogoVisibility();
                }
            });
        });

        // Close menu when pressing escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                mobileToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
                toggleLogoVisibility();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mobileMenu.classList.contains('active') &&
                !mobileMenu.contains(e.target) &&
                !mobileToggle.contains(e.target)) {
                mobileToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
                toggleLogoVisibility();
            }
        });
    }
});

// Update back button functionality to use browser history
document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.querySelector('.back-button a[href]');

    if (backButton && backButton.textContent.trim() === 'BACK') {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();

            // Use browser history to go back to previous page
            if (window.history.length > 1) {
                window.history.back();
            } else {
                // Fallback: go to index if no history
                window.location.href = '../index.html';
            }
        });
    }
});

// Update setActiveNav to show subnavigation on main pages
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a, .secondary-nav a, .tertiary-nav a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage ||
            link.getAttribute('href') === './' + currentPage) {
            link.classList.add('active');
        }
    });

    // Show secondary navigation on main category pages
    const mainCategoryPages = ['design.html', 'branding.html', 'film.html', 'illustration.html'];
    const secondaryNav = document.querySelector('.secondary-nav');

    if (mainCategoryPages.includes(currentPage) && secondaryNav) {
        secondaryNav.classList.add('active');
    }
}

// Handle clicks on main navigation links for desktop
document.addEventListener('DOMContentLoaded', function() {
    const mainNavLinks = document.querySelectorAll('nav ul li a');

    mainNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const targetPage = href.split('/').pop();

            // If clicking on a parent category with secondary nav, navigate to show it
            const mainCategoryPages = ['design.html', 'branding.html', 'film.html', 'illustration.html'];

            if (mainCategoryPages.includes(targetPage)) {
                // Let the link navigate normally - the page will show secondary nav
                return true;
            }
        });
    });
});

// Make logo clickable to redirect to index.html
document.addEventListener('DOMContentLoaded', function() {
    const logo = document.querySelector('.logo');

    if (logo) {
        // Make the logo clickable
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', function() {
            // Always go to root index.html
            window.location.href = '/index.html';
        });

        // Also make the logo image clickable
        const logoImg = logo.querySelector('img');
        if (logoImg) {
            logoImg.style.cursor = 'pointer';
        }
    }
});

// Inject lightbox styles
const styleSheet = document.createElement('style');
styleSheet.textContent = lightboxStyles;
document.head.appendChild(styleSheet);