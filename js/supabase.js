// Supabase 설정 및 인증 관리
// 이 파일을 사용하기 전에 Supabase CDN을 HTML에 추가해야 합니다:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// 환경변수 (실제 프로젝트에서는 .env 파일이나 환경변수로 관리)
// TODO: Supabase 프로젝트를 생성한 후 아래 값을 실제 값으로 변경하세요
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // 예: https://xxxxxxxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Supabase 클라이언트 초기화
let supabase = null;

// Supabase 초기화 함수
function initializeSupabase() {
    try {
        // Supabase 라이브러리가 로드되었는지 확인
        if (typeof window.supabase === 'undefined') {
            console.warn('Supabase 라이브러리가 로드되지 않았습니다. HTML에 Supabase CDN을 추가하세요.');
            return null;
        }

        // 실제 URL과 Key가 설정되었는지 확인
        if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
            console.warn('Supabase 설정이 완료되지 않았습니다. SUPABASE_URL과 SUPABASE_ANON_KEY를 설정하세요.');
            return null;
        }

        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase 클라이언트가 초기화되었습니다.');
        return supabase;
    } catch (error) {
        console.error('Supabase 초기화 오류:', error);
        return null;
    }
}

// 페이지 로드 시 Supabase 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeSupabase();
});

// 회원가입 처리
async function handleSignup(email, password) {
    if (!supabase) {
        showNotification('Supabase가 초기화되지 않았습니다.', 'error');
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) throw error;

        showNotification('회원가입이 완료되었습니다! 이메일을 확인해주세요.', 'success');
        return { success: true, data };
    } catch (error) {
        console.error('회원가입 오류:', error);
        showNotification(error.message || '회원가입에 실패했습니다.', 'error');
        return { success: false, error };
    }
}

// 로그인 처리
async function handleLogin(email, password) {
    if (!supabase) {
        showNotification('Supabase가 초기화되지 않았습니다.', 'error');
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        showNotification('로그인되었습니다!', 'success');
        updateUserUI(data.user);

        // 커뮤니티 페이지라면 게시판 표시
        if (window.location.pathname.includes('community.html')) {
            showCommunityBoard();
        }

        return { success: true, data };
    } catch (error) {
        console.error('로그인 오류:', error);
        showNotification(error.message || '로그인에 실패했습니다.', 'error');
        return { success: false, error };
    }
}

// 로그아웃 처리
async function handleLogout() {
    if (!supabase) {
        showNotification('Supabase가 초기화되지 않았습니다.', 'error');
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        showNotification('로그아웃되었습니다.', 'success');
        updateUserUI(null);

        // 커뮤니티 페이지라면 로그인 화면 표시
        if (window.location.pathname.includes('community.html')) {
            showLoginRequired();
        }

        return { success: true };
    } catch (error) {
        console.error('로그아웃 오류:', error);
        showNotification(error.message || '로그아웃에 실패했습니다.', 'error');
        return { success: false, error };
    }
}

// 현재 인증 상태 확인
async function checkAuthState() {
    if (!supabase) {
        console.log('Supabase가 초기화되지 않았습니다.');
        return null;
    }

    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session && session.user) {
            updateUserUI(session.user);

            // 커뮤니티 페이지라면 게시판 표시
            if (window.location.pathname.includes('community.html')) {
                showCommunityBoard();
            }

            return session.user;
        } else {
            updateUserUI(null);

            // 커뮤니티 페이지라면 로그인 화면 표시
            if (window.location.pathname.includes('community.html')) {
                showLoginRequired();
            }

            return null;
        }
    } catch (error) {
        console.error('인증 상태 확인 오류:', error);
        return null;
    }
}

// 인증 상태 변경 감지
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        if (supabase) {
            supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event);

                if (session && session.user) {
                    updateUserUI(session.user);
                } else {
                    updateUserUI(null);
                }
            });
        }
    });
}

// 로그인 폼 제출 이벤트
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const result = await handleLogin(email, password);

        if (result.success) {
            closeModal(document.getElementById('loginModal'));
            loginForm.reset();
        }
    });
}

// 회원가입 폼 제출 이벤트
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

        // 비밀번호 확인
        if (password !== passwordConfirm) {
            showNotification('비밀번호가 일치하지 않습니다.', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('비밀번호는 최소 6자 이상이어야 합니다.', 'error');
            return;
        }

        const result = await handleSignup(email, password);

        if (result.success) {
            closeModal(document.getElementById('signupModal'));
            signupForm.reset();
        }
    });
}

// 커뮤니티 페이지 UI 제어 함수
function showLoginRequired() {
    const loginRequired = document.getElementById('loginRequired');
    const communityBoard = document.getElementById('communityBoard');

    if (loginRequired) loginRequired.style.display = 'block';
    if (communityBoard) communityBoard.style.display = 'none';
}

function showCommunityBoard() {
    const loginRequired = document.getElementById('loginRequired');
    const communityBoard = document.getElementById('communityBoard');

    if (loginRequired) loginRequired.style.display = 'none';
    if (communityBoard) communityBoard.style.display = 'block';

    // 게시글 목록 로드
    if (typeof loadPosts === 'function') {
        loadPosts();
    }
}

// Export functions for use in other scripts
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.checkAuthState = checkAuthState;
window.supabaseClient = supabase;
window.showLoginRequired = showLoginRequired;
window.showCommunityBoard = showCommunityBoard;
