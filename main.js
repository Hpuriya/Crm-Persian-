// Persian CRM Main Application Logic
// Royal Theme with Jalali Calendar Support

// Persian Date Utilities
class PersianDateUtils {
    constructor() {
        this.iranTimezone = 'Asia/Tehran';
        this.initializePersianNumbers();
    }

    // Initialize Persian number mapping
    initializePersianNumbers() {
        this.persianNumbers = {
            '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
            '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
        };
        this.englishNumbers = {
            '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
            '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
        };
    }

    // Convert English numbers to Persian
    toPersianNumbers(str) {
        return str.replace(/[0-9]/g, (digit) => this.persianNumbers[digit] || digit);
    }

    // Convert Persian numbers to English
    toEnglishNumbers(str) {
        return str.replace(/[۰-۹]/g, (digit) => this.englishNumbers[digit] || digit);
    }

    // Get current Jalali date
    getCurrentJalaliDate() {
        const now = new Date();
        const gregorianDate = {
            gy: now.getFullYear(),
            gm: now.getMonth() + 1,
            gd: now.getDate()
        };
        
        // Using basic conversion (would use jalaali-js in production)
        return this.convertToJalali(gregorianDate.gy, gregorianDate.gm, gregorianDate.gd);
    }

    // Convert Gregorian to Jalali (simplified version)
    convertToJalali(gy, gm, gd) {
        // This is a simplified conversion - in production, use jalaali-js library
        const jalaliYear = gy - 621;
        const jalaliMonth = gm + 9 > 12 ? gm - 3 : gm + 9;
        const jalaliDay = gd;
        
        return {
            jy: jalaliYear,
            jm: jalaliMonth,
            jd: jalaliDay,
            toString: () => `${jalaliYear}/${jalaliMonth.toString().padStart(2, '0')}/${jalaliDay.toString().padStart(2, '0')}`
        };
    }

    // Get Iran timezone time
    getIranTime() {
        const now = new Date();
        const iranTime = new Date(now.toLocaleString("en-US", {timeZone: this.iranTimezone}));
        return iranTime;
    }

    // Format time in Persian
    formatPersianTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        
        return this.toPersianNumbers(`${hours}:${minutes}:${seconds}`);
    }

    // Get Persian day name
    getPersianDayName(date) {
        const dayNames = [
            'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 
            'چهارشنبه', 'پنج‌شنبه', 'جمعه'
        ];
        return dayNames[date.getDay()];
    }

    // Get Persian month name
    getPersianMonthName(jalaliMonth) {
        const monthNames = [
            'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
            'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ];
        return monthNames[jalaliMonth - 1] || monthNames[0];
    }
}

// Storage Management
class StorageManager {
    constructor() {
        this.dbName = 'PersianCRM';
        this.dbVersion = 1;
        this.initializeDB();
    }

    async initializeDB() {
        // In production, this would use Dexie.js for IndexedDB
        // For now, using localStorage as fallback
        this.initializeLocalStorage();
    }

    initializeLocalStorage() {
        if (!localStorage.getItem('crm_customers')) {
            localStorage.setItem('crm_customers', JSON.stringify([]));
        }
        if (!localStorage.getItem('crm_sales')) {
            localStorage.setItem('crm_sales', JSON.stringify([]));
        }
        if (!localStorage.getItem('crm_transactions')) {
            localStorage.setItem('crm_transactions', JSON.stringify([]));
        }
        if (!localStorage.getItem('crm_reminders')) {
            localStorage.setItem('crm_reminders', JSON.stringify([]));
        }
    }

    // Customer operations
    async getCustomers() {
        return JSON.parse(localStorage.getItem('crm_customers') || '[]');
    }

    async addCustomer(customer) {
        const customers = await this.getCustomers();
        customer.id = 'c_' + Date.now();
        customer.createdAt = new PersianDateUtils().getCurrentJalaliDate().toString();
        customers.push(customer);
        localStorage.setItem('crm_customers', JSON.stringify(customers));
        return customer;
    }

    // Sales operations
    async getSales() {
        return JSON.parse(localStorage.getItem('crm_sales') || '[]');
    }

    async addSale(sale) {
        const sales = await this.getSales();
        sale.id = 's_' + Date.now();
        sale.date = new PersianDateUtils().getCurrentJalaliDate().toString();
        sales.push(sale);
        localStorage.setItem('crm_sales', JSON.stringify(sales));
        return sale;
    }

    // Transaction operations
    async getTransactions() {
        return JSON.parse(localStorage.getItem('crm_transactions') || '[]');
    }

    async addTransaction(transaction) {
        const transactions = await this.getTransactions();
        transaction.id = 't_' + Date.now();
        transaction.date = new PersianDateUtils().getCurrentJalaliDate().toString();
        transactions.push(transaction);
        localStorage.setItem('crm_transactions', JSON.stringify(transactions));
        return transaction;
    }

    // Reminder operations
    async getReminders() {
        return JSON.parse(localStorage.getItem('crm_reminders') || '[]');
    }

    async addReminder(reminder) {
        const reminders = await this.getReminders();
        reminder.id = 'r_' + Date.now();
        reminders.push(reminder);
        localStorage.setItem('crm_reminders', JSON.stringify(reminders));
        return reminder;
    }
}

// Market Data Service
class MarketDataService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async getGoldPrice() {
        // In production, this would fetch from real API
        // For demo, using mock data
        const cached = this.cache.get('gold');
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        const mockData = {
            price: 2100000 + Math.random() * 100000, // Iranian Toman
            change: (Math.random() - 0.5) * 5, // Percentage
            timestamp: new Date().toISOString()
        };

        this.cache.set('gold', { data: mockData, timestamp: Date.now() });
        return mockData;
    }

    async getUSDPrice() {
        const cached = this.cache.get('usd');
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        const mockData = {
            price: 45000 + Math.random() * 2000, // Iranian Toman
            change: (Math.random() - 0.5) * 3, // Percentage
            timestamp: new Date().toISOString()
        };

        this.cache.set('usd', { data: mockData, timestamp: Date.now() });
        return mockData;
    }

    async getStockData() {
        const cached = this.cache.get('stock');
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        const mockData = {
            price: 1500000 + Math.random() * 100000, // Iranian Toman
            change: (Math.random() - 0.5) * 4, // Percentage
            timestamp: new Date().toISOString()
        };

        this.cache.set('stock', { data: mockData, timestamp: Date.now() });
        return mockData;
    }
}

// UI Component Manager
class UIComponentManager {
    constructor() {
        this.persianUtils = new PersianDateUtils();
        this.storage = new StorageManager();
        this.marketData = new MarketDataService();
        this.initializeUI();
    }

    initializeUI() {
        this.initializeDateTime();
        this.initializeAnimations();
        this.initializeEventListeners();
    }

    // Initialize real-time date/time display
    initializeDateTime() {
        const updateDateTime = () => {
            const now = this.persianUtils.getIranTime();
            const jalaliDate = this.persianUtils.getCurrentJalaliDate();
            const dayName = this.persianUtils.getPersianDayName(now);
            const monthName = this.persianUtils.getPersianMonthName(jalaliDate.jm);
            
            const dateElements = document.querySelectorAll('[data-persian-date]');
            const timeElements = document.querySelectorAll('[data-persian-time]');
            
            dateElements.forEach(el => {
                el.textContent = this.persianUtils.toPersianNumbers(
                    `${dayName}، ${jalaliDate.jd} ${monthName} ${jalaliDate.jy}`
                );
            });
            
            timeElements.forEach(el => {
                el.textContent = this.persianUtils.formatPersianTime(now);
            });
        };

        updateDateTime();
        setInterval(updateDateTime, 1000);
    }

    // Initialize animations
    initializeAnimations() {
        // Initialize Anime.js animations
        if (typeof anime !== 'undefined') {
            this.initializePageAnimations();
            this.initializeButtonAnimations();
            this.initializeCardAnimations();
        }

        // Initialize Typed.js for hero text
        if (typeof Typed !== 'undefined') {
            this.initializeTypedText();
        }

        // Initialize background effects
        this.initializeBackgroundEffects();
    }

    initializePageAnimations() {
        // Fade in page content
        anime({
            targets: '.animate-fade-in',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            delay: anime.stagger(100),
            easing: 'easeOutQuart'
        });
    }

    initializeButtonAnimations() {
        const buttons = document.querySelectorAll('.btn-animated');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                anime({
                    targets: button,
                    scale: 1.05,
                    duration: 200,
                    easing: 'easeOutQuart'
                });
            });

            button.addEventListener('mouseleave', () => {
                anime({
                    targets: button,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuart'
                });
            });
        });
    }

    initializeCardAnimations() {
        const cards = document.querySelectorAll('.card-animated');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                anime({
                    targets: card,
                    translateY: -8,
                    boxShadow: '0 20px 40px rgba(212, 175, 55, 0.2)',
                    duration: 300,
                    easing: 'easeOutQuart'
                });
            });

            card.addEventListener('mouseleave', () => {
                anime({
                    targets: card,
                    translateY: 0,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    duration: 300,
                    easing: 'easeOutQuart'
                });
            });
        });
    }

    initializeTypedText() {
        const typedElement = document.getElementById('typed-text');
        if (typedElement) {
            new Typed('#typed-text', {
                strings: [
                    'مدیریت ارتباط با مشتری',
                    'CRM فارسی حرفه‌ای',
                    'با پشتیبانی از تقویم جلالی'
                ],
                typeSpeed: 50,
                backSpeed: 30,
                backDelay: 2000,
                loop: true,
                showCursor: true,
                cursorChar: '|'
            });
        }
    }

    initializeBackgroundEffects() {
        // Initialize particle system if p5.js is available
        if (typeof p5 !== 'undefined') {
            this.initializeParticles();
        }
    }

    initializeParticles() {
        const sketch = (p) => {
            let particles = [];

            p.setup = () => {
                const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
                canvas.parent('background-canvas');
                canvas.style('position', 'fixed');
                canvas.style('top', '0');
                canvas.style('left', '0');
                canvas.style('z-index', '-1');
                canvas.style('pointer-events', 'none');

                // Create particles
                for (let i = 0; i < 50; i++) {
                    particles.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        vx: p.random(-0.5, 0.5),
                        vy: p.random(-0.5, 0.5),
                        size: p.random(2, 6),
                        opacity: p.random(0.1, 0.3)
                    });
                }
            };

            p.draw = () => {
                p.clear();
                
                particles.forEach(particle => {
                    // Update position
                    particle.x += particle.vx;
                    particle.y += particle.vy;

                    // Wrap around edges
                    if (particle.x < 0) particle.x = p.width;
                    if (particle.x > p.width) particle.x = 0;
                    if (particle.y < 0) particle.y = p.height;
                    if (particle.y > p.height) particle.y = 0;

                    // Draw particle
                    p.fill(212, 175, 55, particle.opacity * 255);
                    p.noStroke();
                    p.ellipse(particle.x, particle.y, particle.size);
                });
            };

            p.windowResized = () => {
                p.resizeCanvas(window.innerWidth, window.innerHeight);
            };
        };

        new p5(sketch);
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Navigation menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        const sideMenu = document.getElementById('side-menu');
        
        if (menuToggle && sideMenu) {
            menuToggle.addEventListener('click', () => {
                sideMenu.classList.toggle('translate-x-full');
            });
        }

        // Search functionality
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }

        // Modal management
        this.initializeModals();
    }

    initializeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.add('hidden');
                });
            }
        });
    }

    // Handle global search
    async handleGlobalSearch(query) {
        if (query.length < 2) return;

        const customers = await this.storage.getCustomers();
        const sales = await this.storage.getSales();
        const reminders = await this.storage.getReminders();

        const results = {
            customers: customers.filter(c => 
                c.firstName.includes(query) || 
                c.lastName.includes(query) ||
                c.phone.includes(query)
            ),
            sales: sales.filter(s => 
                s.items.some(item => item.productName?.includes(query))
            ),
            reminders: reminders.filter(r => 
                r.title.includes(query) || r.notes?.includes(query)
            )
        };

        this.displaySearchResults(results);
    }

    displaySearchResults(results) {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        let html = '';
        
        if (results.customers.length > 0) {
            html += '<div class="search-section"><h4 class="text-gold-400">مشتریان</h4>';
            results.customers.forEach(customer => {
                html += `<div class="search-item" data-customer-id="${customer.id}">
                    ${customer.firstName} ${customer.lastName} - ${customer.phone}
                </div>`;
            });
            html += '</div>';
        }

        if (results.sales.length > 0) {
            html += '<div class="search-section"><h4 class="text-gold-400">فروش‌ها</h4>';
            results.sales.forEach(sale => {
                html += `<div class="search-item" data-sale-id="${sale.id}">
                    فروش #${sale.id} - ${sale.total?.toLocaleString()} تومان
                </div>`;
            });
            html += '</div>';
        }

        searchResults.innerHTML = html;
        searchResults.classList.remove('hidden');
    }

    // Market data updates
    async updateMarketData() {
        try {
            const [goldData, usdData, stockData] = await Promise.all([
                this.marketData.getGoldPrice(),
                this.marketData.getUSDPrice(),
                this.marketData.getStockData()
            ]);

            this.displayMarketData('gold-price', goldData);
            this.displayMarketData('usd-price', usdData);
            this.displayMarketData('stock-price', stockData);
        } catch (error) {
            console.error('Error updating market data:', error);
        }
    }

    displayMarketData(elementId, data) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const changeClass = data.change >= 0 ? 'text-green-400' : 'text-red-400';
        const changeIcon = data.change >= 0 ? '↑' : '↓';
        
        element.innerHTML = `
            <div class="text-2xl font-bold text-white">
                ${this.persianUtils.toPersianNumbers(Math.round(data.price).toLocaleString())}
            </div>
            <div class="text-sm ${changeClass}">
                ${changeIcon} ${this.persianUtils.toPersianNumbers(Math.abs(data.change).toFixed(2))}%
            </div>
        `;
    }

    // Show modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            anime({
                targets: modal.querySelector('.modal-content'),
                scale: [0.8, 1],
                opacity: [0, 1],
                duration: 300,
                easing: 'easeOutQuart'
            });
        }
    }

    // Hide modal
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            anime({
                targets: modal.querySelector('.modal-content'),
                scale: [1, 0.8],
                opacity: [1, 0],
                duration: 200,
                easing: 'easeInQuart',
                complete: () => {
                    modal.classList.add('hidden');
                }
            });
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.crmApp = new UIComponentManager();
    
    // Update market data every 30 seconds
    setInterval(() => {
        window.crmApp.updateMarketData();
    }, 30000);
    
    // Initial market data load
    window.crmApp.updateMarketData();
});

// Utility functions for global use
window.PersianCRM = {
    utils: new PersianDateUtils(),
    storage: new StorageManager(),
    marketData: new MarketDataService(),
    
    // Form validation helpers
    validatePhone: (phone) => {
        const phoneRegex = /^(\+98|0)?9\d{9}$/;
        return phoneRegex.test(phone);
    },
    
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Number formatting
    formatCurrency: (amount) => {
        return window.crmApp.persianUtils.toPersianNumbers(
            Math.round(amount).toLocaleString()
        ) + ' تومان';
    },
    
    // Show toast notification
    showToast: (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-600' :
            type === 'error' ? 'bg-red-600' :
            type === 'warning' ? 'bg-yellow-600' :
            'bg-blue-600'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        anime({
            targets: toast,
            translateX: [300, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
        
        setTimeout(() => {
            anime({
                targets: toast,
                translateX: [0, 300],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuart',
                complete: () => {
                    document.body.removeChild(toast);
                }
            });
        }, 3000);
    }
};