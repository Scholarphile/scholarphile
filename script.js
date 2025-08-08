// Scholarphile - Functional Academic Platform
document.addEventListener('DOMContentLoaded', function() {
    
    // Sign-in modal functionality
    const signInModal = document.getElementById('sign-in-modal');
    const signInBtns = document.querySelectorAll('#sign-in-btn, #hero-sign-in');
    const modalClose = document.querySelector('.modal-close');
    const signInForm = document.getElementById('sign-in-form');

    // Open modal
    signInBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
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
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simulate authentication
        showNotification('🎓 Welcome back! Sign-in successful.');
        closeModal();
        
        // Reset form
        signInForm.reset();
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

    console.log('🎓 Scholarphile loaded successfully! Ready for academic excellence.');
});
