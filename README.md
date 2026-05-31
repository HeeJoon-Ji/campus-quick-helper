# 🎓 캠퍼스 퀵-헬퍼 (Campus Quick-Helper)
# 작성자: 202314042 지희준
> **대학생 간 소소한 도움을 주고받는 신뢰 기반 심부름 매칭 서비스**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=Node.js&logoColor=white) 
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=Express&logoColor=white)
![REST API](https://img.shields.io/badge/REST_API-025E8C?style=flat-square)

---

## 1. 프로젝트 배경 (Background)
대학 생활 중 "수업 중이라 프린트물을 가져올 수 없을 때", "학생회관까지 가기엔 공강 시간이 너무 짧을 때"와 같이 소소하지만 절실한 도움이 필요한 순간들이 있습니다. 
**캠퍼스 퀵-헬퍼**는 외부인이 아닌 **인증된 같은 학교 학생들끼리** 서로 도움을 주고받으며, 시간을 절약하고 소정의 보상을 나눌 수 있는 따뜻한 캠퍼스 커뮤니티를 지향합니다.

---

## 2. 주요 기능 (Features)

### ✅ 신뢰할 수 있는 학교 인증
*   **학교 메일 인증:** `@university.ac.kr` 도메인 메일을 통한 회원가입으로 익명성 악용 방지.
*   **매너 온도 시스템:** 심부름 완료 후 상호 리뷰를 통해 신뢰도를 점수로 시각화.

### ✅ 실시간 심부름 마켓플레이스 (CRUD)
*   **요청하기:** 카테고리(배달/구매/단순노동 등), 장소, 보상, 마감 시간을 설정하여 요청서 작성.
*   **찾아보기:** 캠퍼스 내의 최신 심부름 목록을 실시간으로 확인하고 필터링.
*   **상태 관리:** '모집 중 -> 매칭 완료 -> 수행 완료'로 이어지는 직관적인 프로세스.

### ✅ 실시간 매칭 및 소통
*   **헬퍼 지원:** 도움을 줄 수 있는 학생이 즉시 지원하고 요청자에게 알림 발송.
*   **상세 조율:** 매칭된 인원 간의 원활한 소통을 위한 기반 마련.

---

## 3. API 명세서 (API Specification)

본 프로젝트는 리소스 중심의 **RESTful API** 설계 원칙을 준수합니다.

### [사용자 및 인증]
| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| `POST` | `/api/users` | 회원가입 (이메일 인증 포함) |
| `POST` | `/api/auth/login` | 로그인 및 인증 토큰 발급 |
| `GET` | `/api/users/:userId` | 특정 사용자 프로필 및 매너 점수 조회 |

### [심부름 게시글 (Main CRUD)]
| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| `GET` | `/api/errands` | 전체 심부름 목록 조회 (필터링 포함) |
| `POST` | `/api/errands` | 새로운 심부름 요청 등록 |
| `GET` | `/api/errands/:errandId` | 심부름 상세 내용 조회 |
| `PUT` | `/api/errands/:errandId` | 심부름 내용 수정 |
| `DELETE` | `/api/errands/:errandId` | 심부름 요청 삭제/취소 |

### [매칭 및 리뷰]
| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| `POST` | `/api/errands/:errandId/helper` | 해당 심부름에 헬퍼로 지원하기 |
| `PUT` | `/api/errands/:errandId/status` | 심부름 상태 변경 (진행 중/완료 등) |
| `POST` | `/api/errands/:errandId/reviews` | 심부름 완료 후 상대방 리뷰 작성 |

---

## 4. 데이터 스키마 (Data Schema)

### Errand Object
```json
{
  "errandId": "String",
  "requesterId": "String (User Reference)",
  "helperId": "String (User Reference)",
  "title": "String",
  "description": "String",
  "category": "String (Delivery/Shopping/Etc)",
  "reward": "Number",
  "status": "String (PENDING/MATCHED/COMPLETED)",
  "createdAt": "Date"
}
```

---

## 5. 시작하기 (Getting Started)

### Prerequisites
*   Node.js (v18.x 이상 권장)
*   npm or yarn

### Installation
```bash
# 저장소 복제
git clone https://github.com/your-username/campus-quick-helper.git

# 의존성 설치
npm install

# 서버 실행 (development)
npm run dev
```

---

## 🛠 Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose) / MySQL (Sequelize) 중 선택
- **Authentication:** JWT (JSON Web Token)

---

**© 2026 Campus Quick-Helper Project Team**
