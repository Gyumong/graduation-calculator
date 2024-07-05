import chromedriver_autoinstaller
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests as rq
import json
import sys

def scrape_suwon_portal(username, password):
    # ChromeDriver 자동 설치 및 설정
    chromedriver_autoinstaller.install()

    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    driver = webdriver.Chrome(options=options)

    try:
        # 포털 사이트 로그인 페이지로 이동
        driver.get('https://portal.suwon.ac.kr/enview/index.html')

        # 프레임 전환 대기
        WebDriverWait(driver, 3).until(
            EC.frame_to_be_available_and_switch_to_it((By.NAME, 'mainFrame'))
        )

        # 페이지 로드 대기
        WebDriverWait(driver, 2).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'input[name="userId"]'))
        )

        # 사용자명과 비밀번호 입력 필드 찾기
        username_input = driver.find_element(By.CSS_SELECTOR, 'input[name="userId"]')
        password_input = driver.find_element(By.CSS_SELECTOR, 'input[name="pwd"]')

        # 사용자명과 비밀번호 입력
        username_input.send_keys(username)
        password_input.send_keys(password)

        # 로그인 버튼 클릭
        login_button = driver.find_element(By.CSS_SELECTOR, 'button.mainbtn_login')
        login_button.click()

        # 종합정보시스템 페이지로 이동
        driver.get('https://info.suwon.ac.kr/sso_security_check')

        # 모든 쿠키 가져오기
        cookies = driver.get_cookies()

        # 세션 만들기
        with rq.Session() as session:
            # JSESSIONID를 포함한 모든 쿠키 설정
            for cookie in cookies:
                session.cookies.set(cookie['name'], cookie['value'])

            # API 콜 - 1차 요청
            api_url_1 = 'https://info.suwon.ac.kr/atlecApplDtai/listAtlecApplDtaiTabYearSmr.do'
            headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                'Referer': 'https://info.suwon.ac.kr/websquare/websquare_mobile.html?w2xPath=/views/usw/sa/hj/SA_HJ_1230.xml&menuSeq=3818&progSeq=1117'
            }
            payload_1 = {
                "sno": username
            }
            response_1 = session.post(api_url_1, headers=headers, json=payload_1)
            data_1 = response_1.json()

            # 각 과목에 대해 상세 정보 요청 - 2차 요청
            api_url_2 = 'https://info.suwon.ac.kr/atlecApplDtai/listAtlecApplDtaiTabSubjt.do'
            detailed_data = []
            for course in data_1.get('listAtlecApplDtaiTabYearSmr', []):
                payload_2 = {
                    "sno": username,
                    "subjtEstbYear": course["subjtEstbYear"],
                    "subjtEstbSmrCd": course["subjtEstbSmrCd"]
                }
                response_2 = session.post(api_url_2, headers=headers, json=payload_2)
                data_2 = response_2.json()
                detailed_data.extend(data_2.get('listAtlecApplDtaiTabSubjt', []))

            # 결과를 stdout에 출력
            print(json.dumps(detailed_data))

    finally:
        driver.quit()

if __name__ == '__main__':
    username = sys.argv[1]
    password = sys.argv[2]
    scrape_suwon_portal(username, password)