// Scholarphile - edX Style Interface
document.addEventListener('DOMContentLoaded', function() {
    
    const learnTab = document.getElementById('learn-tab');
    const discoverLink = document.getElementById('discover-link');
    
    const learnSection = document.getElementById('learn-section');
    const discoverSection = document.getElementById('discover-section');
    const profileSection = document.getElementById('profile-section');
    const userSlot = document.getElementById('user-slot');
    const signInBtn = document.getElementById('sign-in-btn');
    const signInModal = document.getElementById('sign-in-modal');
    const signInForm = document.getElementById('sign-in-form');
    const modalClose = document.querySelector('.modal-close');

    function showSection(activeTab, activeSection) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        activeTab.classList.add('active');
        activeSection.classList.add('active');
    }

    learnTab.addEventListener('click', () => {
        showSection(learnTab, learnSection);
    });

    // Discover opens local page if present, else section
    if (discoverLink) {
        discoverLink.addEventListener('click', (e) => {
            // allow navigation to discover.html; no-op here
        });
    }

    const upgradeB = document.querySelector('.upgrade-banner');
    const resumeCourse = document.querySelector('.resume-course');
    const courseCards = document.querySelectorAll('.course-card');

    if (upgradeB) {
        upgradeB.addEventListener('click', () => {
            showNotification('🚀 Upgrade feature coming soon!');
        });
    }

    if (resumeCourse) {
        resumeCourse.addEventListener('click', () => {
            showNotification('📚 Resuming course...');
        });
    }

    courseCards.forEach((card) => {
        card.addEventListener('click', () => {
            const title = card.querySelector('.course-card-title').textContent;
            showNotification(`🎓 Opening: ${title}`);
        });
    });

    function showNotification(message) {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    showSection(learnTab, learnSection);

    // --- Auth/UI wiring ---
    function renderUser() {
        const token = localStorage.getItem('sp_auth_token');
        const user = token ? JSON.parse(localStorage.getItem('sp_auth_user') || '{}') : null;
        if (token && user && user.displayName) {
            // Show circular avatar on the right
            userSlot.innerHTML = `<a href="profile.html" class="avatar" title="${user.displayName}">${user.displayName[0].toUpperCase()}</a>`;
        } else {
            userSlot.innerHTML = '<button class="nav-tab btn-primary" id="sign-in-btn">Sign In</button>';
            const btn = document.getElementById('sign-in-btn');
            if (btn) btn.addEventListener('click', openModal);
        }
    }

    function openModal(e){
        if (e) e.preventDefault();
        if (signInModal) signInModal.setAttribute('aria-hidden','false');
    }
    function closeModal(){ if (signInModal) signInModal.setAttribute('aria-hidden','true'); }
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (signInBtn) signInBtn.addEventListener('click', openModal);

    if (signInForm) {
        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember-me').checked;
            try {
                const res = await fetch('/api/signin', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, password, remember}) });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Sign-in failed');
                localStorage.setItem('sp_auth_token', data.token);
                localStorage.setItem('sp_auth_user', JSON.stringify(data.user));
                closeModal();
                renderUser();
            } catch(err){
                alert(err.message || 'Sign-in failed');
            }
        });
    }

    renderUser();
});
