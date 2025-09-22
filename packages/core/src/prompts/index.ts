/**
 * LLM prompt templates for question generation
 * 
 * @description Prompts for Gemini API to generate assessment questions
 * Used in: API LLM integration for dynamic question generation
 * 
 * @tags llm, prompts, gemini, question-generation
 */

import type { Work, Question } from '../schemas';

/**
 * Generates prompt for creating assessment questions
 * 
 * @description Creates a detailed prompt for LLM to generate relevant questions
 * Used in: API question generation endpoint with Gemini
 * 
 * @tags prompt, question-generation, llm
 */
export function createQuestionGenerationPrompt(work: Work, language: 'ko' | 'en' = 'ko'): string {
  if (language === 'ko') {
    return `당신은 웹소설 독자의 취향을 분석하는 전문가입니다.

다음 작품에 대한 독자 적합도를 평가할 수 있는 질문 6개를 생성해주세요.

작품 정보:
- 제목: ${work.title}
- 작가: ${work.author || '미상'}
- 장르: ${work.genre || '미지정'}
- 줄거리:
${work.summary}

요구사항:
1. 질문은 독자의 취향과 작품의 특성이 얼마나 잘 맞는지 평가해야 합니다
2. 각 질문은 binary(예/아니오) 또는 likert5(1-5점 척도) 형식이어야 합니다
3. 질문은 구체적이고 명확해야 합니다
4. 작품의 핵심 특징을 다루어야 합니다 (장르, 분위기, 주제, 문체 등)
5. 가중치(weight)는 질문의 중요도에 따라 0.5~2.0 사이로 설정하세요

다음 JSON 형식으로 응답해주세요:
{
  "questions": [
    {
      "content": "질문 내용",
      "type": "binary" 또는 "likert5",
      "weight": 1.0~2.0 사이의 숫자,
      "category": "theme/style/character/plot/romance 중 하나"
    }
  ]
}

예시:
- binary: "액션 장면이 많은 작품을 좋아하시나요?"
- likert5: "복잡한 인물 관계를 얼마나 선호하시나요?" (1: 매우 싫어함 ~ 5: 매우 좋아함)`;
  }
  
  // English version (for future expansion)
  return `You are an expert in analyzing reader preferences for web novels.

Generate 6 questions to assess reader suitability for the following work:

Work Information:
- Title: ${work.title}
- Author: ${work.author || 'Unknown'}
- Genre: ${work.genre || 'Unspecified'}
- Summary:
${work.summary}

Requirements:
1. Questions should assess how well reader preferences match the work's characteristics
2. Each question must be either binary (yes/no) or likert5 (1-5 scale) format
3. Questions should be specific and clear
4. Cover core features of the work (genre, atmosphere, themes, writing style, etc.)
5. Set weight between 0.5-2.0 based on question importance

Respond in the following JSON format:
{
  "questions": [
    {
      "content": "Question text",
      "type": "binary" or "likert5",
      "weight": number between 1.0-2.0,
      "category": "one of theme/style/character/plot/romance"
    }
  ]
}`;
}

/**
 * Generates prompt for interpreting assessment results
 * 
 * @description Creates prompt for LLM to provide detailed interpretation
 * Used in: API result interpretation for enhanced user feedback
 * 
 * @tags prompt, interpretation, results
 */
export function createResultInterpretationPrompt(
  work: Work,
  score: number,
  topFactors: Array<{ content: string; impact: 'positive' | 'negative' }>,
  language: 'ko' | 'en' = 'ko'
): string {
  if (language === 'ko') {
    const factorsList = topFactors
      .map(f => `- ${f.content}: ${f.impact === 'positive' ? '긍정적' : '부정적'} 영향`)
      .join('\n');
    
    return `작품 "${work.title}"에 대한 독자 적합도 평가 결과를 해석해주세요.

적합도 점수: ${score}점 (100점 만점)

주요 영향 요인:
${factorsList}

다음 내용을 포함하여 간단명료하게 작성해주세요:
1. 이 점수가 의미하는 바 (한 문장)
2. 독서 시 예상되는 경험 (2-3문장)
3. 추천 또는 주의사항 (1-2문장)

친근하고 격려하는 톤으로 작성해주세요.`;
  }
  
  // English version
  const factorsList = topFactors
    .map(f => `- ${f.content}: ${f.impact} impact`)
    .join('\n');
  
  return `Interpret the reader suitability assessment result for "${work.title}".

Suitability Score: ${score}/100

Key Factors:
${factorsList}

Please provide a concise interpretation including:
1. What this score means (one sentence)
2. Expected reading experience (2-3 sentences)
3. Recommendations or cautions (1-2 sentences)

Use a friendly and encouraging tone.`;
}

/**
 * Parses LLM response for question generation
 * 
 * @description Extracts questions from LLM JSON response
 * Used in: API question generation response processing
 * 
 * @tags parsing, llm-response, questions
 */
export function parseQuestionGenerationResponse(response: string): Omit<Question, 'id'>[] {
  try {
    // Remove markdown code blocks if present
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(cleaned);
    
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response format: missing questions array');
    }
    
    return parsed.questions.map((q: any) => ({
      content: q.content,
      type: q.type,
      weight: q.weight || 1.0,
      category: q.category,
    }));
  } catch (error) {
    throw new Error(`Failed to parse LLM response: ${error}`);
  }
}