/**
 * Assessment store for managing consultation flow state
 * 
 * @description Global state management using Zustand
 * Used in: Consultation flow and result display
 * 
 * @tags store, zustand, state, assessment
 */

import { create } from 'zustand';
import type { QuestionSet, Session, Answer, EvaluationResult, Work } from '@story-doctor/core';

interface AssessmentState {
  // Current work being assessed
  currentWork: Work | null;
  setCurrentWork: (work: Work | null) => void;

  // Session management
  sessionId: string | null;
  setSessionId: (id: string | null) => void;

  // Question set
  questionSet: QuestionSet | null;
  setQuestionSet: (questions: QuestionSet | null) => void;

  // User answers
  answers: Answer[];
  setAnswer: (answer: Answer) => void;
  clearAnswers: () => void;

  // Current question index
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;

  // Evaluation result
  evaluationResult: EvaluationResult | null;
  setEvaluationResult: (result: EvaluationResult | null) => void;

  // Loading states
  isLoadingQuestions: boolean;
  setIsLoadingQuestions: (loading: boolean) => void;
  isEvaluating: boolean;
  setIsEvaluating: (evaluating: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Reset entire state
  reset: () => void;
}

/**
 * Create assessment store
 * 
 * @description Zustand store with all assessment state
 * Used in: Throughout the application for state management
 * 
 * @tags zustand, store, create
 */
export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  // Initial state
  currentWork: null,
  sessionId: null,
  questionSet: null,
  answers: [],
  currentQuestionIndex: 0,
  evaluationResult: null,
  isLoadingQuestions: false,
  isEvaluating: false,
  error: null,

  // Actions
  setCurrentWork: (work) => set({ currentWork: work }),
  
  setSessionId: (id) => set({ sessionId: id }),
  
  setQuestionSet: (questions) => set({ questionSet: questions }),
  
  setAnswer: (answer) => set((state) => {
    const existingIndex = state.answers.findIndex(a => a.questionId === answer.questionId);
    if (existingIndex >= 0) {
      const newAnswers = [...state.answers];
      newAnswers[existingIndex] = answer;
      return { answers: newAnswers };
    }
    return { answers: [...state.answers, answer] };
  }),
  
  clearAnswers: () => set({ answers: [] }),
  
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  
  nextQuestion: () => set((state) => {
    const maxIndex = state.questionSet ? state.questionSet.questions.length - 1 : 0;
    return {
      currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, maxIndex),
    };
  }),
  
  previousQuestion: () => set((state) => ({
    currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
  })),
  
  setEvaluationResult: (result) => set({ evaluationResult: result }),
  
  setIsLoadingQuestions: (loading) => set({ isLoadingQuestions: loading }),
  
  setIsEvaluating: (evaluating) => set({ isEvaluating: evaluating }),
  
  setError: (error) => set({ error }),
  
  reset: () => set({
    currentWork: null,
    sessionId: null,
    questionSet: null,
    answers: [],
    currentQuestionIndex: 0,
    evaluationResult: null,
    isLoadingQuestions: false,
    isEvaluating: false,
    error: null,
  }),
}));