// Scholarphile - edX Style Interface
document.addEventListener('DOMContentLoaded', function() {
    
    const learnTab = document.getElementById('learn-tab');
    const discoverTab = document.getElementById('discover-tab');
    const profileTab = document.getElementById('profile-tab');
    
    const learnSection = document.getElementById('learn-section');
    const discoverSection = document.getElementById('discover-section');
    const profileSection = document.getElementById('profile-section');

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

    discoverTab.addEventListener('click', () => {
        showSection(discoverTab, discoverSection);
    });

    profileTab.addEventListener('click', () => {
        showSection(profileTab, profileSection);
    });

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
});
