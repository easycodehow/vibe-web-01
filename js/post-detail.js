// 게시글 상세보기 페이지

// URL에서 게시글 ID 가져오기
function getPostIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// 게시글 로드 및 표시
async function loadPostDetail() {
    const postId = getPostIdFromURL();

    if (!postId) {
        showPostNotFound();
        return;
    }

    const container = document.getElementById('postDetailContainer');
    const notFound = document.getElementById('postNotFound');

    try {
        const supabase = window.supabaseClient;

        if (!supabase) {
            console.error('Supabase가 초기화되지 않았습니다.');
            showPostNotFound();
            return;
        }

        // Supabase에서 게시글 가져오기
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error) {
            console.error('게시글 로드 오류:', error);
            showPostNotFound();
            return;
        }

        if (!data) {
            showPostNotFound();
            return;
        }

        // 게시글 표시
        displayPost(data);

    } catch (error) {
        console.error('오류 발생:', error);
        showPostNotFound();
    }
}

// 게시글 표시
function displayPost(post) {
    const container = document.getElementById('postDetailContainer');
    const notFound = document.getElementById('postNotFound');

    container.style.display = 'block';
    notFound.style.display = 'none';

    container.innerHTML = `
        <article class="post-detail-article">
            <header class="post-detail-header">
                <h1 class="post-detail-title">${escapeHtml(post.title)}</h1>
                <div class="post-detail-meta">
                    <span class="post-author">작성자: ${escapeHtml(post.author_email || '익명')}</span>
                    <span class="post-date">${formatDate(post.created_at)}</span>
                </div>
            </header>
            <div class="post-detail-divider"></div>
            <div class="post-detail-content">
                ${escapeHtml(post.content).replace(/\n/g, '<br>')}
            </div>
        </article>
    `;
}

// 게시글을 찾을 수 없을 때
function showPostNotFound() {
    const container = document.getElementById('postDetailContainer');
    const notFound = document.getElementById('postNotFound');

    container.style.display = 'none';
    notFound.style.display = 'block';
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 날짜 포맷팅
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
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // Supabase가 초기화될 때까지 대기
    const checkSupabase = setInterval(() => {
        if (window.supabaseClient) {
            clearInterval(checkSupabase);
            loadPostDetail();
        }
    }, 100);

    // 5초 후에도 초기화되지 않으면 포기
    setTimeout(() => {
        clearInterval(checkSupabase);
        if (!window.supabaseClient) {
            showPostNotFound();
        }
    }, 5000);
});
