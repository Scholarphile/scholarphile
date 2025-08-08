// Scholarphile - Functional Academic Platform
document.addEventListener('DOMContentLoaded', function() {
    
    // Sign-in modal functionality
    const signInModal = document.getElementById('sign-in-modal');
    const signInBtns = document.querySelectorAll('#sign-in-btn, #hero-sign-in');
    const modalClose = document.querySelector('.modal-close');
    const signInForm = document.getElementById('sign-in-form');

    // Lightweight client-side auth and user data cache
    const Auth = (() => {
        const AUTH_STORAGE_KEY = 'sp_auth';
        const USER_DATA_STORAGE_KEY = 'sp_user_data';
        const USER_DATA_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

        let inMemoryAuth = null;
        let inMemoryUserData = null;

        function now() { return Date.now(); }

        function readStoredAuth() {
            try {
                const fromLocal = localStorage.getItem(AUTH_STORAGE_KEY);
                const fromSession = sessionStorage.getItem(AUTH_STORAGE_KEY);
                const parseOrNull = (v) => { try { return v ? JSON.parse(v) : null; } catch { return null; } };
                const a = parseOrNull(fromLocal);
                const b = parseOrNull(fromSession);
                // Prefer the most recent
                const chosen = [a, b].filter(Boolean).sort((x, y) => (y.ts || 0) - (x.ts || 0))[0] || null;
                return chosen;
            } catch {
                return null;
            }
        }

        function writeStoredAuth(auth, remember) {
            const payload = JSON.stringify({ ...auth, ts: now() });
            if (remember) {
                localStorage.setItem(AUTH_STORAGE_KEY, payload);
                sessionStorage.removeItem(AUTH_STORAGE_KEY);
            } else {
                sessionStorage.setItem(AUTH_STORAGE_KEY, payload);
                localStorage.removeItem(AUTH_STORAGE_KEY);
            }
            inMemoryAuth = auth;
        }

        function clearStoredAuth() {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem(USER_DATA_STORAGE_KEY);
            inMemoryAuth = null;
            inMemoryUserData = null;
        }

        function makeToken() {
            return 'sp_' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        }

        async function safeFetchJSON(url, options = {}, timeoutMs = 3500) {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const res = await fetch(url, { ...options, signal: controller.signal });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                return data;
            } finally {
                clearTimeout(id);
            }
        }

        function basicUserFromEmail(email) {
            const displayName = email.split('@')[0];
            return {
                id: btoa(email).replace(/=+$/g, ''),
                email,
                displayName
            };
        }

        async function signInWithEmailPassword(email, password, remember) {
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                throw new Error('Enter a valid email address');
            }
            if (!password || password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            // Prefer backend if available; graceful fallback to simulated auth
            try {
                const payload = await safeFetchJSON('/api/signin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, remember: Boolean(remember) })
                });
                const user = payload.user;
                const token = payload.token;
                if (!user || !token) throw new Error('Malformed response');
                const auth = { user, token, remember: Boolean(remember) };
                writeStoredAuth(auth, Boolean(remember));
                window.dispatchEvent(new CustomEvent('user:change', { detail: user }));
                return user;
            } catch (e) {
                // Fallback: local simulation
                await new Promise(r => setTimeout(r, 300));
                const user = basicUserFromEmail(email);
                const auth = { user, token: makeToken(), remember: Boolean(remember) };
                writeStoredAuth(auth, Boolean(remember));
                window.dispatchEvent(new CustomEvent('user:change', { detail: user }));
                return user;
            }
        }

        function signOut() {
            clearStoredAuth();
            window.dispatchEvent(new CustomEvent('user:change', { detail: null }));
        }

        function getCurrentUser() {
            if (inMemoryAuth && inMemoryAuth.user) return inMemoryAuth.user;
            const stored = readStoredAuth();
            if (stored && stored.user) {
                inMemoryAuth = stored;
                return stored.user;
            }
            return null;
        }

        function readCachedUserData() {
            try {
                const raw = localStorage.getItem(USER_DATA_STORAGE_KEY);
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                return parsed;
            } catch {
                return null;
            }
        }

        function cacheUserData(data) {
            inMemoryUserData = data;
            localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify({ ts: now(), data }));
        }

        async function fetchUserDataFromServerLike(user) {
            // If we have a real JWT (not local 'sp_' token), call backend; otherwise simulate
            const stored = inMemoryAuth || readStoredAuth();
            const token = stored && stored.token;
            if (token && !String(token).startsWith('sp_')) {
                try {
                    const data = await safeFetchJSON('/api/user-data', {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    return data;
                } catch (e) {
                    // fall through to simulation
                }
            }
            await new Promise(r => setTimeout(r, 200));
            return {
                userId: user.id,
                email: user.email,
                displayName: user.displayName,
                plan: 'free',
                lastLoginAt: now()
            };
        }

        async function getUserData(options = {}) {
            const { forceRefresh = false } = options;
            const user = getCurrentUser();
            if (!user) return null;

            if (inMemoryUserData && !forceRefresh) {
                // Revalidate in background
                if ('requestIdleCallback' in window) {
                    window.requestIdleCallback(() => getUserData({ forceRefresh: true }));
                } else {
                    setTimeout(() => getUserData({ forceRefresh: true }), 1000);
                }
                return inMemoryUserData;
            }

            const cached = readCachedUserData();
            if (cached && cached.data) {
                const isFresh = now() - cached.ts < USER_DATA_TTL_MS;
                inMemoryUserData = cached.data;
                if (!isFresh || forceRefresh) {
                    // SWR: return cached immediately, refresh in background if not already forcing
                    if (!forceRefresh) {
                        if ('requestIdleCallback' in window) {
                            window.requestIdleCallback(async () => {
                                const fresh = await fetchUserDataFromServerLike(user);
                                cacheUserData(fresh);
                                window.dispatchEvent(new CustomEvent('user:data', { detail: fresh }));
                            });
                        } else {
                            setTimeout(async () => {
                                const fresh = await fetchUserDataFromServerLike(user);
                                cacheUserData(fresh);
                                window.dispatchEvent(new CustomEvent('user:data', { detail: fresh }));
                            }, 0);
                        }
                    }
                }
                return inMemoryUserData;
            }

            const fetched = await fetchUserDataFromServerLike(user);
            cacheUserData(fetched);
            return fetched;
        }

        return {
            signInWithEmailPassword,
            signOut,
            getCurrentUser,
            getUserData
        };
    })();

    // Open modal (unless already signed-in state is active on a given button)
    signInBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.dataset.state === 'signed-in') {
                e.preventDefault();
                return;
            }
            e.preventDefault();
            signInModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal
    modalClose.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === signInModal) {
            closeModal();
        }
    });

    function closeModal() {
        signInModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Handle sign-in form
    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember-me').checked;

        const submitBtn = signInForm.querySelector('button[type="submit"]');
        const prevText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';

        try {
            await Auth.signInWithEmailPassword(email, password, remember);
            showNotification('🎓 Welcome back! Sign-in successful.');
            closeModal();
            updateAuthUI();
            // Preload user data optimized with cache/SWR
            Auth.getUserData();
            // Reset form (keep email if remember is off for UX) but clear password
            if (remember) {
                signInForm.reset();
            } else {
                document.getElementById('password').value = '';
            }
        } catch (err) {
            showNotification(`❌ Sign-in failed: ${err.message || 'Unknown error'}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = prevText;
        }
    });

    // Update nav/UI based on auth state
    function updateAuthUI() {
        const user = Auth.getCurrentUser();
        const navSignInBtn = document.getElementById('sign-in-btn');
        if (!navSignInBtn) return;

        let userChip = document.getElementById('user-chip');
        if (user) {
            navSignInBtn.textContent = 'Sign Out';
            navSignInBtn.dataset.state = 'signed-in';
            // Attach one-time sign-out handler
            navSignInBtn.onclick = (e) => {
                e.preventDefault();
                Auth.signOut();
                showNotification('👋 Signed out');
                updateAuthUI();
            };

            if (!userChip) {
                userChip = document.createElement('span');
                userChip.id = 'user-chip';
                userChip.style.cssText = 'margin-right:12px;padding:6px 10px;border-radius:999px;background:#eef2ff;color:#3730a3;font-weight:500;font-size:0.9rem;';
                const navLinks = document.querySelector('.nav-links');
                if (navLinks) navLinks.insertBefore(userChip, navSignInBtn);
            }
            if (userChip) userChip.textContent = user.displayName || user.email;
        } else {
            navSignInBtn.textContent = 'Sign In';
            navSignInBtn.dataset.state = '';
            navSignInBtn.onclick = null; // default modal opener will handle
            if (userChip) userChip.remove();
        }
    }

    // React to auth/data changes from anywhere
    window.addEventListener('user:change', () => {
        updateAuthUI();
    });
    window.addEventListener('user:data', () => {
        // Hook for future: update personalized UI without extra fetches
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header background on scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });

    // Animate stats on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statsSection = document.querySelector('.community-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach((stat, index) => {
            const finalValue = stat.textContent;
            const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
            const suffix = finalValue.replace(/[\d]/g, '');
            
            let current = 0;
            const increment = numericValue / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= numericValue) {
                    current = numericValue;
                    clearInterval(timer);
                }
                
                if (suffix.includes('K')) {
                    stat.textContent = Math.floor(current) + 'K+';
                } else if (suffix.includes('M')) {
                    stat.textContent = Math.floor(current) + 'M+';
                } else if (suffix.includes('%')) {
                    stat.textContent = Math.floor(current) + '%';
                } else {
                    stat.textContent = Math.floor(current) + suffix;
                }
            }, 50);
        });
    }

    // Feature cards hover effect
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Document download functionality
    window.downloadDocument = function(filename, title) {
        // Generate realistic academic content
        const documentContent = generateDocumentContent(filename, title);
        
        // Create and trigger download
        const blob = new Blob([documentContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show success notification
        showNotification(`📥 Downloaded: ${title}`);
        
        // Track download (simulate analytics)
        console.log(`Download tracked: ${filename}`);
    };

    function generateDocumentContent(filename, title) {
        const templates = {
            'academic-writing-guide.pdf': `
ACADEMIC WRITING EXCELLENCE
A Comprehensive Guide to Scholarly Communication

Table of Contents:
1. Introduction to Academic Writing
2. Research and Documentation
3. Citation Styles and Formats
4. Structure and Organization
5. Language and Style
6. Revision and Editing

Chapter 1: Introduction to Academic Writing

Academic writing is a formal style of writing used in scholarly and professional contexts. It is characterized by:
- Clear, precise language
- Logical organization
- Evidence-based arguments
- Proper citation of sources
- Objective tone

Key Principles:
1. Clarity and Precision
2. Critical Analysis
3. Evidence-Based Reasoning
4. Proper Documentation
5. Ethical Scholarship

This guide provides essential strategies for developing strong academic writing skills across disciplines.

[Content continues with detailed chapters on methodology, citation formats, and best practices...]
            `,
            'research-proposal-template.docx': `
RESEARCH PROPOSAL TEMPLATE

Title: [Your Research Title Here]

1. INTRODUCTION
   - Background and Context
   - Problem Statement
   - Research Questions
   - Significance of the Study

2. LITERATURE REVIEW
   - Current State of Knowledge
   - Theoretical Framework
   - Gaps in Research

3. METHODOLOGY
   - Research Design
   - Data Collection Methods
   - Analysis Plan
   - Timeline

4. EXPECTED OUTCOMES
   - Anticipated Results
   - Potential Impact
   - Limitations

5. REFERENCES
   [APA Format Citations]

Guidelines:
- Keep proposals focused and concise
- Clearly articulate the research problem
- Demonstrate knowledge of existing literature
- Provide realistic timeline and budget
            `,
            'citation-styles-reference.pdf': `
CITATION STYLE QUICK REFERENCE
APA • MLA • Chicago • Harvard

APA STYLE (7th Edition)
In-text: (Author, Year)
Reference: Author, A. A. (Year). Title of work. Publisher.

MLA STYLE (9th Edition)
In-text: (Author Page#)
Works Cited: Author. "Title." Publication, Date, URL.

CHICAGO STYLE (17th Edition)
Footnote: Author, Title (Place: Publisher, Year), page.
Bibliography: Author. Title. Place: Publisher, Year.

HARVARD STYLE
In-text: (Author Year)
Reference: Author, A. Year, Title, Publisher, Place.

Quick Tips:
- Always check your institution's preferred style
- Use citation management tools
- Be consistent throughout your work
- Include all necessary bibliographic information
            `
        };
        
        return templates[filename] || `
${title}

This is a sample academic document generated for demonstration purposes.

Content includes:
- Academic writing principles
- Research methodologies
- Best practices and guidelines
- Template structures
- Reference materials

For the complete document, please visit our full resource library.

© 2024 Scholarphile Academic Resources
        `;
    }

    // Scroll to documents function
    window.scrollToDocuments = function() {
        document.getElementById('documents').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    // CTA button interactions
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!this.href || this.href.includes('#')) {
                e.preventDefault();
                if (this.textContent.includes('Get Started') || this.textContent.includes('Start Researching')) {
                    showNotification('Welcome to Scholarphile! Sign-up feature coming soon.');
                } else if (this.textContent.includes('Explore Papers')) {
                    showNotification('Paper discovery feature in development.');
                }
            }
        });
    });

    // Notification system
    function showNotification(message) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #2563eb;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Slide out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Easter egg: Konami code
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];

    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.code);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            showNotification('🎉 Konami Code activated! You are a true scholar!');
            document.body.style.filter = 'hue-rotate(90deg)';
            setTimeout(() => {
                document.body.style.filter = 'none';
            }, 3000);
        }
    });

    // Performance: Lazy load images when implemented
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Initialize auth-aware UI
    updateAuthUI();
    if (Auth.getCurrentUser()) {
        // Warm user data cache
        Auth.getUserData();
    }

    console.log('🎓 Scholarphile loaded successfully! Ready for academic excellence.');
});
