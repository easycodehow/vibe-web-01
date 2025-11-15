// 커뮤니티 게시판 기능

let currentPage = 1;
const postsPerPage = 10;
let allPosts = [];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // 로그인 프롬프트 버튼
    const loginPromptBtn = document.getElementById('loginPromptBtn');
    if (loginPromptBtn) {
        loginPromptBtn.addEventListener('click', () => {
            openModal(document.getElementById('loginModal'));
        });
    }

    // 새 글 작성 버튼
    const newPostBtn = document.getElementById('newPostBtn');
    if (newPostBtn) {
        newPostBtn.addEventListener('click', () => {
            document.getElementById('postForm').style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 글 작성 취소 버튼
    const cancelPostBtn = document.getElementById('cancelPostBtn');
    if (cancelPostBtn) {
        cancelPostBtn.addEventListener('click', () => {
            document.getElementById('postForm').style.display = 'none';
            document.getElementById('createPostForm').reset();
        });
    }

    // 글 작성 폼 제출
    const createPostForm = document.getElementById('createPostForm');
    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await createPost();
        });
    }

    // 정렬 선택
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', () => {
            displayPosts();
        });
    }
});

// 게시글 생성
async function createPost() {
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();

    if (!title || !content) {
        showNotification('제목과 내용을 모두 입력해주세요.', 'error');
        return;
    }

    const supabase = window.supabaseClient;
    if (!supabase) {
        showNotification('Supabase가 초기화되지 않았습니다.', 'error');
        return;
    }

    try {
        // 현재 사용자 가져오기
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            showNotification('로그인이 필요합니다.', 'error');
            return;
        }

        // 게시글 저장
        const { data, error } = await supabase
            .from('posts')
            .insert([
                {
                    title: title,
                    content: content,
                    author_email: user.email,
                    author_id: user.id,
                }
            ])
            .select();

        if (error) throw error;

        showNotification('게시글이 작성되었습니다!', 'success');

        // 폼 초기화 및 숨기기
        document.getElementById('createPostForm').reset();
        document.getElementById('postForm').style.display = 'none';

        // 게시글 목록 다시 로드
        await loadPosts();

    } catch (error) {
        console.error('게시글 작성 오류:', error);
        showNotification(error.message || '게시글 작성에 실패했습니다.', 'error');
    }
}

// 게시글 목록 로드
async function loadPosts() {
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.log('Supabase가 초기화되지 않았습니다. 샘플 데이터를 표시합니다.');
        loadSamplePosts();
        return;
    }

    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allPosts = data || [];
        displayPosts();

    } catch (error) {
        console.error('게시글 로드 오류:', error);
        showNotification('게시글을 불러오는데 실패했습니다. 샘플 데이터를 표시합니다.', 'error');
        loadSamplePosts();
    }
}

// 샘플 게시글 데이터 로드 (Supabase 설정 전 테스트용)
function loadSamplePosts() {
    allPosts = [
        {
            id: 1,
            title: '바이브웹코드에 오신 것을 환영합니다!',
            content: '안녕하세요! 바이브웹코드 커뮤니티에 오신 것을 환영합니다. 이곳에서 자유롭게 소통하고 정보를 공유해주세요.',
            author_email: 'admin@vibewebcode.com',
            created_at: new Date().toISOString(),
        },
        {
            id: 2,
            title: 'HTML5 시맨틱 태그 질문입니다',
            content: 'article과 section의 차이가 궁금합니다. 언제 어떤 것을 사용해야 할까요?',
            author_email: 'student1@example.com',
            created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
            id: 3,
            title: 'CSS Grid vs Flexbox',
            content: 'Grid와 Flexbox를 각각 어떤 상황에서 사용하는 것이 좋을까요? 실무 경험을 공유해주세요!',
            author_email: 'student2@example.com',
            created_at: new Date(Date.now() - 172800000).toISOString(),
        },
        {
            id: 4,
            title: 'JavaScript 비동기 처리 공부 방법',
            content: 'async/await와 Promise를 공부하고 있는데, 좋은 학습 자료가 있을까요?',
            author_email: 'student3@example.com',
            created_at: new Date(Date.now() - 259200000).toISOString(),
        },
        {
            id: 5,
            title: 'Supabase 연동 성공!',
            content: '드디어 Supabase 연동에 성공했습니다! 처음에는 어려웠지만 차근차근 따라하니 할 수 있었어요.',
            author_email: 'student4@example.com',
            created_at: new Date(Date.now() - 345600000).toISOString(),
        },
    ];

    displayPosts();
}

// 게시글 표시
function displayPosts() {
    const postsList = document.getElementById('postsList');
    const postsCount = document.getElementById('postsCount');
    const sortBy = document.getElementById('sortBy');

    if (!postsList) return;

    // 정렬
    let sortedPosts = [...allPosts];
    if (sortBy && sortBy.value === 'oldest') {
        sortedPosts.reverse();
    }

    // 게시글 수 표시
    if (postsCount) {
        postsCount.textContent = sortedPosts.length;
    }

    // 페이지네이션
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

    // 게시글이 없는 경우
    if (paginatedPosts.length === 0) {
        postsList.innerHTML = '<div class="loading">아직 게시글이 없습니다. 첫 번째 글을 작성해보세요!</div>';
        return;
    }

    // 게시글 HTML 생성
    postsList.innerHTML = paginatedPosts.map(post => `
        <div class="post-item">
            <div class="post-header">
                <h3 class="post-title">${escapeHtml(post.title)}</h3>
            </div>
            <div class="post-meta">
                <span>${post.author_email || '익명'}</span>
                <span>${formatDate(post.created_at)}</span>
            </div>
            <div class="post-content-preview">
                ${escapeHtml(truncateText(post.content, 150))}
            </div>
        </div>
    `).join('');

    // 페이지네이션 생성
    createPagination(sortedPosts.length);
}

// 페이지네이션 생성
function createPagination(totalPosts) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(totalPosts / postsPerPage);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // 이전 버튼
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage - 1})">이전</button>`;
    }

    // 페이지 번호
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="page-btn active">${i}</button>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `<button class="page-btn" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span>...</span>`;
        }
    }

    // 다음 버튼
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage + 1})">다음</button>`;
    }

    pagination.innerHTML = paginationHTML;
}

// 페이지 변경
function changePage(page) {
    currentPage = page;
    displayPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 유틸리티 함수: HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 유틸리티 함수: 텍스트 자르기
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// 유틸리티 함수: 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return `${diffMinutes}분 전`;
        }
        return `${diffHours}시간 전`;
    } else if (diffDays === 1) {
        return '어제';
    } else if (diffDays < 7) {
        return `${diffDays}일 전`;
    } else {
        return date.toLocaleDateString('ko-KR');
    }
}

// Export functions
window.loadPosts = loadPosts;
window.createPost = createPost;
window.changePage = changePage;
