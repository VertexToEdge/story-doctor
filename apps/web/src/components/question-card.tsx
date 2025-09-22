'use client';

import { useState, useEffect } from 'react';
import type { Question, Answer } from '@story-doctor/core';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  currentAnswer?: Answer;
  onAnswer: (answer: Answer) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({
  question,
  currentAnswer,
  onAnswer,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const [selectedValue, setSelectedValue] = useState<boolean | number | null>(
    currentAnswer?.value ?? null
  );

  useEffect(() => {
    setSelectedValue(currentAnswer?.value ?? null);
  }, [currentAnswer]);

  const handleBinaryAnswer = (value: boolean) => {
    setSelectedValue(value);
    onAnswer({
      questionId: question.id,
      value,
      answeredAt: new Date(),
    });
  };

  const handleLikertAnswer = (value: number) => {
    setSelectedValue(value);
    onAnswer({
      questionId: question.id,
      value,
      answeredAt: new Date(),
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-500">
            질문 {questionNumber} / {totalQuestions}
          </span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            가중치: {question.weight}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800">
          {question.content}
        </h3>
      </div>

      {question.type === 'binary' ? (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleBinaryAnswer(true)}
            className={cn(
              'py-4 px-6 rounded-lg border-2 transition-all font-medium',
              selectedValue === true
                ? 'bg-blue-50 border-blue-400 text-blue-700'
                : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
            )}
          >
            예
          </button>
          <button
            onClick={() => handleBinaryAnswer(false)}
            className={cn(
              'py-4 px-6 rounded-lg border-2 transition-all font-medium',
              selectedValue === false
                ? 'bg-blue-50 border-blue-400 text-blue-700'
                : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
            )}
          >
            아니오
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>매우 싫어함</span>
            <span>매우 좋아함</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleLikertAnswer(value)}
                className={cn(
                  'py-3 px-4 rounded-lg border-2 transition-all font-medium',
                  selectedValue === value
                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}