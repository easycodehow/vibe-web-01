// 메인 JavaScript 파일

// DOM 요소
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const userEmailDisplay = document.getElementById('userEmail');

// 모달 관련 함수
function openModal(modal) {
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// 로그인 버튼 클릭
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        openModal(loginModal);
    });
}

// 회원가입 버튼 클릭
if (signupBtn) {
    signupBtn.addEventListener('click', () => {
        openModal(signupModal);
    });
}

// 로그아웃 버튼 클릭
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        if (typeof handleLogout === 'function') {
            await handleLogout();
        }
    });
}

// 모달 닫기 버튼
const closeButtons = document.querySelectorAll('.close');
closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        closeModal(modal);
    });
});

// 모달 외부 클릭 시 닫기
if (loginModal) {
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            closeModal(loginModal);
        }
    });
}

if (signupModal) {
    signupModal.addEventListener('click', (e) => {
        if (e.target === signupModal) {
            closeModal(signupModal);
        }
    });
}

// 모달 간 전환
const showSignupModalLink = document.getElementById('showSignupModal');
const showLoginModalLink = document.getElementById('showLoginModal');

if (showSignupModalLink) {
    showSignupModalLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        openModal(signupModal);
    });
}

if (showLoginModalLink) {
    showLoginModalLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(signupModal);
        openModal(loginModal);
    });
}

// 스크롤 시 헤더 스타일 변경
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.15)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(124, 58, 237, 0.1)';
    }

    lastScroll = currentScroll;
});

// 스무스 스크롤 (네비게이션 링크)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // 빈 해시나 모달 링크는 제외
        if (href === '#' || this.id === 'showSignupModal' || this.id === 'showLoginModal') {
            return;
        }

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// 사용자 UI 업데이트 함수
function updateUserUI(user) {
    if (user && user.email) {
        // 로그인 상태
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (userEmailDisplay) {
            userEmailDisplay.textContent = user.email;
            userEmailDisplay.style.display = 'inline-block';
        }
    } else {
        // 로그아웃 상태
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userEmailDisplay) {
            userEmailDisplay.textContent = '';
            userEmailDisplay.style.display = 'none';
        }
    }
}

// 페이지 로드 시 사용자 상태 확인
document.addEventListener('DOMContentLoaded', async () => {
    // Supabase가 로드되어 있다면 현재 세션 확인
    if (typeof checkAuthState === 'function') {
        await checkAuthState();
    }
});

// 알림 메시지 표시 함수
function showNotification(message, type = 'info') {
    // 기존 알림이 있다면 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#14B8A6' : type === 'error' ? '#DC2626' : '#7C3AED'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // 3초 후 자동 제거
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Export functions for use in other scripts
window.updateUserUI = updateUserUI;
window.showNotification = showNotification;
window.openModal = openModal;
window.closeModal = closeModal;
