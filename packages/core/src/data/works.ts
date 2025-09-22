/**
 * Predefined literary works data
 * 
 * @description Hardcoded work information including 홍길동전
 * Used in: API endpoints for retrieving work information
 * 
 * @tags data, works, honggildongjeon, literature
 */

import type { Work } from '../schemas';

/**
 * 홍길동전 work data
 * 
 * @description Classic Korean novel about Hong Gil-dong
 * Used in: MVP demo for story suitability assessment
 * 
 * @tags honggildongjeon, classic, korean-literature
 */
export const HONG_GIL_DONG: Work = {
  id: 'hong-gil-dong',
  title: '홍길동전',
  author: '허균',
  genre: '고전소설',
  summary: `조선시대를 배경으로 한 영웅 서사. 서자로 태어나 차별받던 홍길동이 가출 후 도적 괴수가 되어 '활빈당'을 조직, 탐관오리의 재물을 빼앗아 가난한 백성들에게 나누어 준다. 
  
주요 특징:
- 신분제도의 모순과 서자 차별 문제를 다룸
- 주인공이 초인적 능력(도술)을 지닌 영웅
- 권선징악과 사회 정의 실현이 주제
- 로맨스보다는 모험과 사회 비판이 중심
- 가족 갈등(아버지를 아버지라 부르지 못함)과 형제간 갈등
- 최종적으로 병조판서 벼슬을 받고 조선을 떠남

문체와 분위기:
- 고전 한글체 서술 (현대 번역본도 다소 고어체 잔존)
- 통쾌한 복수와 응징 장면들
- 비극적 정서와 희극적 요소가 공존
- 민중 영웅으로서의 홍길동 캐릭터`,
  metadata: {
    period: '조선시대',
    originalLanguage: '한글',
    themes: ['신분제도', '사회정의', '영웅서사', '가족갈등'],
    targetAudience: '전연령',
  },
};

/**
 * Get work by ID
 * 
 * @description Retrieves work information by ID
 * Used in: API endpoints for work lookup
 * 
 * @tags data-access, work, lookup
 */
export function getWorkById(id: string): Work | null {
  // In production, this would query a database
  // For MVP, we only have Hong Gil-dong
  if (id === 'hong-gil-dong') {
    return HONG_GIL_DONG;
  }
  return null;
}

/**
 * Get all available works
 * 
 * @description Returns list of all available works
 * Used in: Frontend work selection screen
 * 
 * @tags data-access, works, list
 */
export function getAllWorks(): Work[] {
  return [HONG_GIL_DONG];
}