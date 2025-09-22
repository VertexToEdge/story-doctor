'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/stores/assessment';
import { generateQuestions, evaluateAnswers } from '@/lib/api';
import { QuestionCard } from '@/components/question-card';
import { ProgressBar } from '@/components/progress-bar';
import { ChevronLeft, ChevronRight, Loader2, Stethoscope } from 'lucide-react';
import type { Answer } from '@story-doctor/core';

export default function ConsultPage() {
  const router = useRouter();
  const {
    currentWork,
    sessionId,
    setSessionId,
    questionSet,
    setQuestionSet,
    answers,
    setAnswer,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    setEvaluationResult,
    isLoadingQuestions,
    setIsLoadingQuestions,
    isEvaluating,
    setIsEvaluating,
    error,
    setError,
  } = useAssessmentStore();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!currentWork) {
      router.push('/');
      return;
    }

    if (!isInitialized && !questionSet) {
      initializeQuestions();
    }
  }, [currentWork, isInitialized, questionSet]);

  const initializeQuestions = async () => {
    if (!currentWork) return;

    setIsLoadingQuestions(true);
    setError(null);

    try {
      const response = await generateQuestions({
        workId: currentWork.id,
        lang: 'ko',
      });

      setQuestionSet(response.questionSet);
      setSessionId(response.sessionId);
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '질문 생성 실패');
      console.error('Failed to generate questions:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleAnswer = (answer: Answer) => {
    setAnswer(answer);
  };

  const handleNext = () => {
    if (!questionSet) return;
    
    if (currentQuestionIndex < questionSet.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId || !questionSet) return;

    setIsEvaluating(true);
    setError(null);

    try {
      const result = await evaluateAnswers({
        sessionId,
        questionSetId: questionSet.id,
        answers,
      });

      setEvaluationResult(result);
      router.push('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '평가 실패');
      console.error('Failed to evaluate:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoadingQuestions) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Dr. 스토리가 질문을 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold mb-2">오류 발생</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!questionSet) {
    return null;
  }

  const currentQuestion = questionSet.questions[currentQuestionIndex];
  const currentQuestionAnswer = answers.find(a => a.questionId === currentQuestion.id);
  const isLastQuestion = currentQuestionIndex === questionSet.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const allQuestionsAnswered = answers.length === questionSet.questions.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="bg-white p-3 rounded-full shadow-lg">
            <Stethoscope className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Dr. 스토리의 취향 진단
        </h1>
        <p className="text-gray-600">
          {currentWork?.title} 적합도 검사 중
        </p>
      </div>

      {/* Progress */}
      <ProgressBar
        current={answers.length}
        total={questionSet.questions.length}
        className="mb-8"
      />

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion}
        currentAnswer={currentQuestionAnswer}
        onAnswer={handleAnswer}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questionSet.questions.length}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          이전
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered || isEvaluating}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                평가 중...
              </>
            ) : (
              '결과 보기'
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!currentQuestionAnswer}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}