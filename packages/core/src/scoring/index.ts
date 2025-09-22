/**
 * Scoring and evaluation utilities for story suitability assessment
 * 
 * @description Functions for normalizing responses, calculating weighted scores, and interpreting results
 * Used in: API evaluation endpoints for calculating suitability scores
 * 
 * @tags scoring, evaluation, normalization, weighted-score
 */

import type { Question, Answer, EvaluationResult } from '../schemas';

/**
 * Normalizes binary response (true/false) to 0-1 scale
 * 
 * @description Converts boolean answers to numerical scores
 * Used in: Score calculation for binary type questions
 * 
 * @tags normalization, binary, score
 */
export function normalizeBinary(value: boolean): number {
  return value ? 1.0 : 0.0;
}

/**
 * Normalizes Likert 5-point scale response to 0-1 scale
 * 
 * @description Converts 1-5 scale to 0-1 normalized score
 * Used in: Score calculation for likert5 type questions
 * 
 * @tags normalization, likert, score
 */
export function normalizeLikert5(value: number): number {
  if (value < 1 || value > 5) {
    throw new Error(`Invalid Likert value: ${value}. Must be between 1 and 5.`);
  }
  return (value - 1) / 4; // Maps 1->0, 2->0.25, 3->0.5, 4->0.75, 5->1
}

/**
 * Normalizes answer value based on question type
 * 
 * @description Unified normalization function that handles both binary and likert5 responses
 * Used in: Main score calculation pipeline
 * 
 * @tags normalization, answer, score
 */
export function normalize(question: Question, answer: Answer): number {
  if (question.type === 'binary') {
    if (typeof answer.value !== 'boolean') {
      throw new Error(`Expected boolean answer for binary question ${question.id}`);
    }
    return normalizeBinary(answer.value);
  } else if (question.type === 'likert5') {
    if (typeof answer.value !== 'number') {
      throw new Error(`Expected number answer for likert5 question ${question.id}`);
    }
    return normalizeLikert5(answer.value);
  }
  
  throw new Error(`Unknown question type: ${question.type}`);
}

/**
 * Calculates weighted score from normalized values
 * 
 * @description Computes final score using weighted average of normalized responses
 * Used in: Final suitability score calculation
 * 
 * @tags scoring, weighted-average, calculation
 */
export function calculateWeightedScore(
  questions: Question[],
  answers: Answer[]
): number {
  const answerMap = new Map(answers.map(a => [a.questionId, a]));
  
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  for (const question of questions) {
    const answer = answerMap.get(question.id);
    if (!answer) {
      throw new Error(`Missing answer for question ${question.id}`);
    }
    
    const normalizedValue = normalize(question, answer);
    const weight = question.weight || 1.0;
    
    totalWeightedScore += normalizedValue * weight;
    totalWeight += weight;
  }
  
  if (totalWeight === 0) {
    return 0;
  }
  
  // Convert to percentage (0-100)
  return Math.round((totalWeightedScore / totalWeight) * 100);
}

/**
 * Converts numerical score to suitability label
 * 
 * @description Maps percentage score to categorical suitability level
 * Used in: Final result interpretation for user display
 * 
 * @tags label, interpretation, score-to-label
 */
export function labelOf(score: number): EvaluationResult['label'] {
  if (score >= 80) return 'highly_suitable';
  if (score >= 60) return 'suitable';
  if (score >= 40) return 'moderate';
  return 'unsuitable';
}

/**
 * Identifies top contributing factors to the suitability score
 * 
 * @description Extracts the most impactful questions (positive or negative) for result interpretation
 * Used in: Generating explanation for suitability assessment results
 * 
 * @tags interpretation, reasons, top-factors
 */
export function extractTopReasons(
  questions: Question[],
  answers: Answer[],
  limit: number = 2
): EvaluationResult['topReasons'] {
  const answerMap = new Map(answers.map(a => [a.questionId, a]));
  
  const scoredQuestions = questions.map(question => {
    const answer = answerMap.get(question.id);
    if (!answer) return null;
    
    const normalizedScore = normalize(question, answer);
    const weight = question.weight || 1.0;
    const weightedScore = normalizedScore * weight;
    
    return {
      questionId: question.id,
      content: question.content,
      impact: normalizedScore >= 0.5 ? 'positive' as const : 'negative' as const,
      weight: weightedScore,
      absoluteImpact: Math.abs(weightedScore - 0.5 * weight), // Distance from neutral
    };
  }).filter((q): q is NonNullable<typeof q> => q !== null);
  
  // Sort by absolute impact (most significant factors first)
  scoredQuestions.sort((a, b) => b.absoluteImpact - a.absoluteImpact);
  
  return scoredQuestions.slice(0, limit).map(({ absoluteImpact, ...rest }) => rest);
}

/**
 * Generates tips based on suitability score
 * 
 * @description Provides reading tips based on assessment results
 * Used in: Final result display to guide user's reading experience
 * 
 * @tags tips, recommendations, user-guidance
 */
export function generateTips(label: EvaluationResult['label']): string[] {
  switch (label) {
    case 'highly_suitable':
      return [
        '이 작품은 당신의 취향에 매우 잘 맞습니다!',
        '처음부터 끝까지 몰입해서 읽으실 수 있을 거예요.',
        '비슷한 장르의 다른 작품들도 찾아보시는 것을 추천드립니다.',
      ];
    case 'suitable':
      return [
        '전반적으로 즐겁게 읽으실 수 있는 작품입니다.',
        '일부 구간에서는 취향과 다를 수 있지만, 충분히 재미있게 읽으실 거예요.',
      ];
    case 'moderate':
      return [
        '호불호가 갈릴 수 있는 작품입니다.',
        '첫 몇 장을 읽어보고 계속 읽을지 결정하시는 것을 추천드립니다.',
        '열린 마음으로 접근하시면 의외의 재미를 발견할 수도 있습니다.',
      ];
    case 'unsuitable':
      return [
        '취향과 맞지 않을 가능성이 높은 작품입니다.',
        '다른 장르나 스타일의 작품을 찾아보시는 것이 좋겠습니다.',
      ];
  }
}

/**
 * Generates warnings based on suitability score
 * 
 * @description Provides cautions or warnings for lower suitability scores
 * Used in: Final result display to set proper expectations
 * 
 * @tags warnings, cautions, expectations
 */
export function generateWarnings(label: EvaluationResult['label']): string[] {
  switch (label) {
    case 'highly_suitable':
    case 'suitable':
      return [];
    case 'moderate':
      return [
        '작품의 특정 요소가 기대와 다를 수 있습니다.',
        '완독하기 어려울 수 있으니 부담 없이 접근하세요.',
      ];
    case 'unsuitable':
      return [
        '취향과 크게 다른 요소들이 많이 포함되어 있습니다.',
        '시간 투자 대비 만족도가 낮을 수 있습니다.',
      ];
  }
}