/**
 * Fallback question sets for when LLM generation fails
 * 
 * @description Pre-defined question sets for reliable assessment
 * Used in: API fallback logic when LLM timeout or failure occurs
 * 
 * @tags fallback, questions, reliability, honggildongjeon
 */

import { v4 as uuidv4 } from 'uuid';
import type { QuestionSet } from '../schemas';

/**
 * Create fallback question set for 홍길동전
 * 
 * @description Returns pre-defined questions for Hong Gil-dong assessment
 * Used in: API question generation endpoint as fallback
 * 
 * @tags fallback, honggildongjeon, questions
 */
export function createHongGilDongFallbackQuestions(): QuestionSet {
  const now = new Date();
  
  return {
    id: uuidv4(),
    workId: 'hong-gil-dong',
    source: 'fallback',
    language: 'ko',
    createdAt: now,
    questions: [
      {
        id: uuidv4(),
        content: '권선징악의 통쾌한 전개를 좋아하시나요?',
        type: 'binary',
        weight: 1.6,
        category: 'theme',
      },
      {
        id: uuidv4(),
        content: '로맨스 비중이 낮아도 괜찮나요?',
        type: 'binary',
        weight: 1.2,
        category: 'romance',
      },
      {
        id: uuidv4(),
        content: '신분/가족 갈등 중심 서사를 선호하시나요?',
        type: 'likert5',
        weight: 1.4,
        category: 'conflict',
      },
      {
        id: uuidv4(),
        content: '복수·응징 요소가 있는 이야기를 즐기시나요?',
        type: 'likert5',
        weight: 1.6,
        category: 'theme',
      },
      {
        id: uuidv4(),
        content: '고전체 어투나 서술 톤에 거부감이 없으신가요?',
        type: 'likert5',
        weight: 1.3,
        category: 'style',
      },
      {
        id: uuidv4(),
        content: '느릿한 로맨스 대신 도덕·가치 중심을 선호하시나요?',
        type: 'binary',
        weight: 1.0,
        category: 'theme',
      },
    ],
  };
}

/**
 * Get fallback questions by work ID
 * 
 * @description Returns appropriate fallback question set for given work
 * Used in: API fallback logic router
 * 
 * @tags fallback, questions, work-specific
 */
export function getFallbackQuestions(workId: string): QuestionSet | null {
  switch (workId) {
    case 'hong-gil-dong':
      return createHongGilDongFallbackQuestions();
    default:
      return null;
  }
}

/**
 * UUID utility re-export for convenience
 * 
 * @description Re-exports uuid v4 function
 * Used in: Creating unique IDs throughout the application
 * 
 * @tags utility, uuid, id-generation
 */
export { v4 as generateId } from 'uuid';