

## 졸업요건 계산기 MVP 

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


### 졸업 요건 계산 프로젝트를 시작 전 팀원 모집, 아이디어 검증을 위해 만든 MVP 
교내 포털을 크롤링하여 제공 이후 추가 개발 예정

## 테스트 환경 설정

테스트 환경을 설정하려면 다음 단계를 따르세요:

1. `.env.test.example` 파일을 `.env.test`로 복사합니다.

    ```sh
    cp .env.test.example .env.test
    ```

2. `.env.test` 파일을 열고 환경 변수를 설정합니다.

    ```env
    # .env.test
    USERID=수원대학교포털아이디
    USERPASSWORD=수원대학교포털비밀번호
    ```

3. Vitest를 사용하여 테스트를 실행합니다.

    ```sh
    yarn test
    ```

## 테스트 실행

테스트를 실행하려면 다음 명령어를 사용하세요:

```sh
yarn test

### Demo
https://github.com/Gyumong/graduation-calculator/assets/60845910/1ab22d1a-3d0c-46dc-883c-43fcaa94b6b8

<img src="https://github.com/Gyumong/graduation-calculator/assets/60845910/0fd2709c-d89a-476f-b8e0-812e5cfd29e1" width="300" alt="KakaoTalk_Photo_2024-07-05-22-13-03">
