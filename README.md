# 바이브웹코드 (Vibe Web Code)

현대적인 웹 개발 기술을 체계적으로 학습할 수 있는 플랫폼입니다.

## 프로젝트 소개

바이브웹코드는 HTML5, CSS3, JavaScript부터 Supabase를 활용한 백엔드 개발까지 실무에 필요한 모든 것을 단계별로 배울 수 있는 학습 플랫폼입니다.

### 주요 기능

- **원페이지 구조**: 상단 고정 네비게이션으로 섹션 간 부드러운 이동
- **소개 섹션**: 바이브웹코드 플랫폼 소개
- **커리큘럼**: 단계별 학습 과정 안내
- **기술스택**: 사용되는 기술 소개
- **기대효과**: 학습 후 얻을 수 있는 것들
- **커뮤니티**: 로그인 후 이용 가능한 자유게시판

## 기술 스택

- **Frontend**
  - HTML5
  - CSS3 (Flexbox, Grid)
  - JavaScript (ES6+)

- **Backend**
  - Supabase (인증, 데이터베이스)

- **Deployment**
  - Vercel
  - GitHub

## 프로젝트 구조

```
vibe-web-01/
├── index.html              # 메인 페이지 (원페이지 구조)
├── community.html          # 커뮤니티 게시판 페이지
├── css/
│   └── style.css          # 전체 스타일시트
├── js/
│   ├── main.js            # 메인 JavaScript
│   ├── supabase.js        # Supabase 연동 코드
│   └── community.js       # 커뮤니티 게시판 기능
├── assets/
│   └── images/            # 이미지 파일
├── .env.example           # 환경변수 템플릿
├── .gitignore             # Git 제외 파일
└── README.md              # 프로젝트 설명
```

## 시작하기

### 1. 프로젝트 클론

```bash
git clone [your-repository-url]
cd vibe-web-01
```

### 2. Supabase 설정

#### 2.1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속 및 회원가입
2. "New Project" 클릭하여 새 프로젝트 생성
3. 프로젝트 이름, 비밀번호, 지역 설정

#### 2.2. 환경변수 설정

1. `.env.example` 파일을 참고하여 실제 값 확인
2. Supabase 대시보드에서 Settings > API로 이동
3. `Project URL`과 `anon public` 키를 복사
4. `js/supabase.js` 파일에서 해당 값들을 업데이트:

```javascript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

#### 2.3. 데이터베이스 테이블 생성

Supabase SQL Editor에서 다음 쿼리 실행:

```sql
-- posts 테이블 생성
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Row Level Security (RLS) 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 모든 사용자가 게시글 읽기 가능
CREATE POLICY "게시글은 누구나 읽을 수 있습니다"
ON posts FOR SELECT
USING (true);

-- 정책 생성: 인증된 사용자만 게시글 작성 가능
CREATE POLICY "인증된 사용자만 게시글을 작성할 수 있습니다"
ON posts FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 정책 생성: 작성자만 자신의 게시글 수정 가능
CREATE POLICY "작성자만 게시글을 수정할 수 있습니다"
ON posts FOR UPDATE
USING (auth.uid() = author_id);

-- 정책 생성: 작성자만 자신의 게시글 삭제 가능
CREATE POLICY "작성자만 게시글을 삭제할 수 있습니다"
ON posts FOR DELETE
USING (auth.uid() = author_id);
```

#### 2.4. Supabase CDN 추가

HTML 파일의 `<head>` 섹션에 Supabase CDN 추가:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 3. 로컬에서 실행

간단한 로컬 서버로 프로젝트를 실행할 수 있습니다:

```bash
# Python이 설치되어 있다면
python -m http.server 8000

# 또는 Node.js의 http-server
npx http-server
```

브라우저에서 `http://localhost:8000` 접속

### 4. GitHub에 푸시

```bash
# Git 저장소 초기화 (아직 안했다면)
git init

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit: 바이브웹코드 프로젝트 생성"

# 원격 저장소 연결
git remote add origin [your-github-repository-url]

# 푸시
git push -u origin main
```

### 5. Vercel 배포

#### 5.1. Vercel 계정 생성 및 프로젝트 연동

1. [Vercel](https://vercel.com) 접속 및 GitHub 계정으로 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택 및 Import
4. 프로젝트 설정 확인 (기본값 사용)
5. "Deploy" 클릭

#### 5.2. 환경변수 설정

1. Vercel 프로젝트 대시보드 > Settings > Environment Variables
2. 다음 변수들 추가:
   - `SUPABASE_URL`: Supabase 프로젝트 URL
   - `SUPABASE_ANON_KEY`: Supabase anon key

#### 5.3. 자동 배포 확인

- GitHub에 push할 때마다 자동으로 Vercel에 배포됩니다
- Vercel 대시보드에서 배포 상태 확인 가능

## 디자인 가이드

### 색상 팔레트

- **Primary**: #7C3AED (톤다운된 바이올렛)
- **Secondary**: #14B8A6 (틸/청록색)
- **Accent**: #DDD6FE (연한 라벤더)
- **Text Dark**: #2C3E50
- **Background**: #FFFFFF, #FAF5FF

### 레이아웃

- **최대 너비**: 1600px (가운데 정렬)
- **네비게이션**: 상단 고정
- **반응형**: 모바일, 태블릿, 데스크톱 지원

## 학습 커리큘럼

1. **기초 단계**: HTML5 & CSS3
2. **중급 단계**: JavaScript & DOM 조작
3. **백엔드 연동**: Supabase 인증 및 데이터베이스
4. **배포 및 운영**: GitHub & Vercel

## 기여하기

프로젝트에 기여하고 싶으시다면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 교육 목적으로 만들어졌습니다.

## 문의

- GitHub: [github.com/vibe-webcode](https://github.com/vibe-webcode)
- Email: info@vibewebcode.com

---

**바이브웹코드와 함께 웹 개발자로의 여정을 시작하세요!** 🚀
