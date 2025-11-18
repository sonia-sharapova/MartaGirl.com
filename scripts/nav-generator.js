// Navigation Generator - Reads site-config.json and builds navigation
class NavigationGenerator {
    constructor() {
        this.config = null;
        // Get the current path relative to the domain root
        this.currentPath = this.getRelativePathFromRoot();
    }

    // Get the correct path to site-config.json based on current location
    getConfigPath() {
        const depth = this.currentPath.split('/').filter(p => p && p !== 'index.html').length - 1;
        const prefix = '../'.repeat(depth);
        return prefix + 'site-config.json';
    }

    // Get the relative path from the domain root
    getRelativePathFromRoot() {
        const fullPath = window.location.pathname;
        console.log('Full path:', fullPath);

        // Remove the base path if running from a subdirectory in local development
        // For http://localhost:63342/martaGirl/design/design.html
        // We want to extract /design/design.html
        if (fullPath.includes('/martaGirl/')) {
            const extracted = fullPath.split('/martaGirl/')[1] || '';
            console.log('Extracted path (martaGirl):', extracted);
            return extracted;
        }

        // For production or other environments, use the pathname as is
        console.log('Using pathname as is:', fullPath);
        return fullPath;
    }

    async init() {
        try {
            // Load configuration - adjust path based on current location
            const configPath = this.getConfigPath();
            console.log('Loading config from:', configPath);
            const response = await fetch(configPath);
            this.config = await response.json();

            // Generate navigations
            this.generateMobileNav();
            this.generateDesktopNav();
            this.generateSecondaryNav();
            this.generateTertiaryNav();
            this.generateMobileCategoryList();

        } catch (error) {
            console.error('Error loading site configuration:', error);
        }
    }

    // Get current category context
    getCurrentContext() {
        const pathParts = this.currentPath.split('/').filter(p => p);
        const currentFile = pathParts[pathParts.length - 1] || 'index.html';

        // Find which category we're in
        for (const category of this.config.categories) {
            if (this.currentPath.includes(category.name)) {
                return {
                    category: category,
                    file: currentFile,
                    depth: this.getPathDepth(category, this.currentPath)
                };
            }
        }
        return null;
    }

    getPathDepth(category, path) {
        // Count how deep we are in the category
        const categoryPath = category.path.split('/')[0];
        const pathAfterCategory = path.split(categoryPath)[1];
        return pathAfterCategory ? pathAfterCategory.split('/').length - 1 : 0;
    }

    // Check if a path is currently active
    isPathActive(itemPath) {
        const itemFile = itemPath.split('/').pop();
        const currentFile = this.currentPath.split('/').pop() || 'index.html';

        // Direct file match
        if (itemFile === currentFile) {
            return true;
        }

        // Check if the path is in the current path
        const normalizedPath = itemPath.replace(/^\.\.\//, '');
        return this.currentPath.includes(normalizedPath.replace('.html', ''));
    }

    // Check if an item is the parent of the current page (for secondary nav highlighting)
    isParentActive(item) {
        // If this item has children, check if any of them match the current path
        if (item.children) {
            for (const child of item.children) {
                if (this.isPathActive(child.path)) {
                    return true;
                }
                // Recursively check nested children
                if (this.isParentActive(child)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Generate mobile navigation menu
    generateMobileNav() {
        const mobileMenu = document.querySelector('.mobile-nav-menu ul');
        if (!mobileMenu) return;

        const context = this.getCurrentContext();
        let html = '';

        // Build category items
        this.config.categories.forEach(category => {
            const hasChildren = category.children && category.children.length > 0;
            const isCurrentCategory = context && context.category.name === category.name;
            const isActive = this.isPathActive(category.path) ? ' active' : '';

            if (hasChildren) {
                html += `<li class="has-submenu${isCurrentCategory ? ' open' : ''}">`;
                html += `<a href="${this.getRelativePath(category.path)}"${isActive ? ' class="active"' : ''}>${category.displayName} <span class="dropdown-arrow">▶</span></a>`;
                html += `<ul class="submenu${isCurrentCategory ? ' open' : ''}">`;
                html += this.generateMobileSubMenu(category.children, category.name);
                html += `</ul></li>`;
            } else {
                html += `<li><a href="${this.getRelativePath(category.path)}"${isActive ? ' class="active"' : ''}>${category.displayName}</a></li>`;
            }
        });

        // Add static pages
        this.config.staticPages.forEach(page => {
            const isActive = this.isPathActive(page.path) ? ' class="active"' : '';
            html += `<li><a href="${this.getRelativePath(page.path)}"${isActive}>${page.displayName}</a></li>`;
        });

        mobileMenu.innerHTML = html;
    }

    // Generate mobile submenu recursively
    generateMobileSubMenu(items, parentCategory) {
        let html = '';

        items.forEach(item => {
            const hasChildren = item.children && item.children.length > 0;
            const customStyle = item.customStyle ? ` style="${item.customStyle}"` : '';

            // Only open submenus if they are in the current path
            const shouldBeOpen = this.shouldSubmenuBeOpen(item);
            const isActive = this.isPathActive(item.path) ? ' active' : '';

            if (hasChildren) {
                html += `<li class="has-submenu${shouldBeOpen ? ' open' : ''}">`;
                html += `<a href="${this.getRelativePath(item.path)}"${customStyle}${isActive ? ' class="active"' : ''}>${item.displayName} <span class="dropdown-arrow">▶</span></a>`;
                html += `<ul class="submenu${shouldBeOpen ? ' open' : ''}">`;
                html += this.generateMobileSubMenu(item.children, parentCategory);
                html += `</ul></li>`;
            } else {
                html += `<li><a href="${this.getRelativePath(item.path)}"${customStyle}${isActive ? ' class="active"' : ''}>${item.displayName}</a></li>`;
            }
        });

        return html;
    }

    // Check if a submenu should be open based on current path
    shouldSubmenuBeOpen(item) {
        // Only open if current path exactly matches this item or its children
        if (this.currentPath.includes(item.name)) {
            return true;
        }

        // Check if any children are in current path
        if (item.children) {
            for (const child of item.children) {
                if (this.currentPath.includes(child.name) || this.shouldSubmenuBeOpen(child)) {
                    return true;
                }
            }
        }

        return false;
    }

    // Generate desktop main navigation
    generateDesktopNav() {
        const desktopNav = document.querySelector('nav ul');
        if (!desktopNav) return;

        let html = '';
        this.config.categories.forEach(category => {
            const isActive = this.currentPath.includes(category.name) ? ' class="active"' : '';
            html += `<li><a href="${this.getRelativePath(category.path)}"${isActive}>${category.displayName}</a></li>`;
        });

        this.config.staticPages.forEach(page => {
            const isActive = this.currentPath.includes(page.name) ? ' class="active"' : '';
            html += `<li><a href="${this.getRelativePath(page.path)}"${isActive}>${page.displayName}</a></li>`;
        });

        desktopNav.innerHTML = html;
    }

    // Generate desktop secondary navigation
    generateSecondaryNav() {
        const secondaryNav = document.querySelector('.secondary-nav ul');
        if (!secondaryNav) return;

        const context = this.getCurrentContext();
        if (!context || !context.category.children) return;

        let html = '';
        context.category.children.forEach(child => {
            // Check if this item is active OR if it's the parent of the current page
            const isActive = this.isPathActive(child.path) || this.isParentActive(child);
            const activeClass = isActive ? ' class="active"' : '';
            const customStyle = child.customStyle ? ` style="${child.customStyle}"` : '';
            html += `<li><a href="${this.getRelativePath(child.path)}"${activeClass}${customStyle}>${child.displayName}</a></li>`;
        });

        secondaryNav.innerHTML = html;
    }

    // Generate desktop tertiary navigation
    generateTertiaryNav() {
        const tertiaryNav = document.querySelector('.tertiary-nav');
        if (!tertiaryNav) {
            console.log('Tertiary nav element not found');
            return;
        }

        const context = this.getCurrentContext();
        console.log('Tertiary Nav Context:', context);

        if (!context || !context.category.children) {
            console.log('No context or no children - hiding tertiary nav');
            tertiaryNav.classList.remove('active');
            return;
        }

        let html = ''; // Declare html at the function scope
        let foundParent = null;

        // Check if the parent category has hasTertiaryNav flag
        const parentWithTertiary = context.category.children.find(child => {
            // Extract the folder path from the child's path (e.g., "branding/swann/" from "branding/swann/swann-galleries.html")
            const childFolder = child.path.substring(0, child.path.lastIndexOf('/') + 1);
            const isInPath = this.currentPath.includes(childFolder) || this.currentPath.includes(child.name);

            console.log('Checking child:', child.name, 'hasTertiaryNav:', child.hasTertiaryNav, 'folder:', childFolder, 'in path:', isInPath);
            return child.hasTertiaryNav && isInPath;
        });

        console.log('Parent with tertiary:', parentWithTertiary);

        // If we're on a page that's a direct child of a category with hasTertiaryNav,
        // show all the tertiary siblings (children of that parent)
        if (parentWithTertiary && parentWithTertiary.children) {
            console.log('Using parent with tertiary nav, children:', parentWithTertiary.children);
            foundParent = parentWithTertiary;
            parentWithTertiary.children.forEach(tertiary => {
                const isActive = this.isPathActive(tertiary.path) ? ' class="active"' : '';
                html += `<li><a href="${this.getRelativePath(tertiary.path)}"${isActive}>${tertiary.displayName}</a></li>`;
            });
        } else {
            // Otherwise, find the subcategory we're in that has tertiary children
            console.log('Looking for child with children in current path');
            for (const child of context.category.children) {
                // Extract the folder path from the child's path
                const childFolder = child.path.substring(0, child.path.lastIndexOf('/') + 1);
                const isInPath = this.currentPath.includes(childFolder) || this.currentPath.includes(child.name);

                console.log('Checking child:', child.name, 'has children:', !!child.children, 'folder:', childFolder, 'in path:', isInPath);
                if (child.children && isInPath) {
                    console.log('Found matching child with children:', child.name);
                    foundParent = child;
                    child.children.forEach(tertiary => {
                        const isActive = this.isPathActive(tertiary.path) ? ' class="active"' : '';
                        html += `<li><a href="${this.getRelativePath(tertiary.path)}"${isActive}>${tertiary.displayName}</a></li>`;
                    });
                    break; // Found the right child, no need to continue
                }
            }
        }

        console.log('Generated HTML length:', html.length);
        console.log('Found parent:', foundParent);

        // Show or hide based on whether we have content
        if (html) {
            const ul = tertiaryNav.querySelector('ul');
            if (ul) {
                ul.innerHTML = html;
                tertiaryNav.classList.add('active');
                console.log('Tertiary nav activated with content');
            } else {
                console.error('No <ul> found inside tertiary nav');
            }
        } else {
            tertiaryNav.classList.remove('active');
            console.log('No content - hiding tertiary nav');
        }
    }

    // Generate mobile category list
    generateMobileCategoryList() {
        const mobileCategoryList = document.querySelector('.mobile-category-list .mobile-subcategories');
        if (!mobileCategoryList) return;

        const context = this.getCurrentContext();

        // Special cases for main category pages
        const currentFile = this.currentPath.split('/').pop() || 'index.html';
        const mainCategoryPages = ['design.html', 'branding.html', 'film.html', 'illustration.html'];

        if (mainCategoryPages.includes(currentFile)) {
            // Find the current category
            const currentCategory = this.config.categories.find(cat =>
                currentFile.includes(cat.name)
            );

            if (currentCategory && currentCategory.children) {
                let html = '';
                currentCategory.children.forEach(child => {
                    const customStyle = child.customStyle ? ` style="${child.customStyle}"` : '';
                    html += `<li><a href="${this.getRelativePath(child.path)}"${customStyle}>${child.displayName}</a></li>`;
                });
                mobileCategoryList.innerHTML = html;
                return;
            }
        }

        if (!context) return;

        let items = [];

        // Determine which items to show based on page type
        if (context.category.hasSecondaryNav && context.depth === 0) {
            // Main category page - show secondary items
            items = context.category.children;
        } else if (context.category.hasTertiaryNav || context.depth >= 1) {
            // Subcategory page - find tertiary items
            for (const child of context.category.children) {
                if (child.children && this.currentPath.includes(child.name)) {
                    items = child.children;
                    break;
                }
            }
        }

        if (items.length === 0) return;

        let html = '';
        items.forEach(item => {
            const customStyle = item.customStyle ? ` style="${item.customStyle}"` : '';
            html += `<li><a href="${this.getRelativePath(item.path)}"${customStyle}>${item.displayName}</a></li>`;
        });

        mobileCategoryList.innerHTML = html;
    }

    // Calculate relative path from current location
    getRelativePath(targetPath) {
        const currentDepth = this.currentPath.split('/').filter(p => p).length - 1;
        const prefix = '../'.repeat(currentDepth);
        const relativePath = prefix + targetPath;
        console.log('Calculated path:', { targetPath, currentDepth, prefix, relativePath });
        return relativePath;
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    const navGen = new NavigationGenerator();
    await navGen.init();
});