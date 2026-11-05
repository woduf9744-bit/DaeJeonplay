# GitHub 저장소 업로드 방법 (Windows / VS Code)

## 1. 새 저장소 생성

1. `https://github.com/new` 에서 새 저장소 만들기.
2. Repository name: `DaejeonPlay` (원하는 이름 사용 가능).
3. Description: `대전 로컬 장소를 탐험하며 분야별 경험치를 쌓는 관광 RPG | AI·RAG 추천 개발 중`
4. 공개 포트폴리오라면 `Public` 선택.
5. **Add a README / .gitignore / License는 모두 해제**: 제공된 폴더에 이미 README와 .gitignore가 있음.

## 2. 로컬 폴더를 GitHub에 업로드

ZIP 압축을 풀고 VS Code 터미널에서 (폴더 안에 README.md가 보여야 함):

```powershell
cd "C:\Users\YOUR_NAME\Downloads\DaejeonPlay_GitHub_Portfolio"
git init -b main
git add .
git commit -m "chore: bootstrap DaejeonPlay portfolio repository"
git remote add origin https://github.com/YOUR_GITHUB_ID/DaejeonPlay.git
git push -u origin main
```

**이미 `git init`을 했으면** 다시 할 필요 없이 `git status`부터 확인하세요.

## 3. 사이트 공개

GitHub 저장소의 `Settings → Pages`에서:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/docs`

사이트 주소는 일반적으로 `https://YOUR_GITHUB_ID.github.io/DaejeonPlay/` 입니다.

## 4. README에서 개인화할 항목

- README의 데모 링크를 실제 GitHub Pages 링크로 변경
- 자신의 실제 작업/기여/진행 단계 명시
- 완료된 GitHub Issues 및 PR/커밋 링크 추가
- 실제로 얻은 성능·사용자 평가 수치만 작성

## 5. 다음 개발 커밋 예시

```powershell
git checkout -b feat/place-api-integration
# 장소 API를 웹에 연결한 뒤

git add .
git commit -m "feat: connect place catalog to API"
git push -u origin feat/place-api-integration
```

이후 GitHub에서 Pull Request를 열어 변경 내용과 테스트 결과를 기록하면 좋습니다.
