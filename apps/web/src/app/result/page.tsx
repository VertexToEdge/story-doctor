'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/stores/assessment';
import { CircularGauge } from '@/components/circular-gauge';
import { 
  Home, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ResultPage() {
  const router = useRouter();
  const { evaluationResult, currentWork, reset } = useAssessmentStore();

  useEffect(() => {
    if (!evaluationResult) {
      router.push('/');
    }
  }, [evaluationResult, router]);

  if (!evaluationResult || !currentWork) {
    return null;
  }

  const handleRetry = () => {
    reset();
    router.push('/');
  };

  const getLabelInfo = () => {
    switch (evaluationResult.label) {
      case 'highly_suitable':
        return {
          text: '매우 잘 맞음',
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: CheckCircle,
          iconColor: 'text-green-600',
        };
      case 'suitable':
        return {
          text: '잘 맞음',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: CheckCircle,
          iconColor: 'text-blue-600',
        };
      case 'moderate':
        return {
          text: '보통',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: AlertCircle,
          iconColor: 'text-yellow-600',
        };
      case 'unsuitable':
        return {
          text: '맞지 않음',
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: XCircle,
          iconColor: 'text-red-600',
        };
    }
  };

  const labelInfo = getLabelInfo();
  const LabelIcon = labelInfo.icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          적합도 검사 결과
        </h1>
        <p className="text-gray-600">
          {currentWork.title}과 당신의 취향 분석
        </p>
      </div>

      {/* Score Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="flex flex-col items-center">
          <CircularGauge score={evaluationResult.score} />
          
          <div className="mt-6 flex items-center gap-2">
            <LabelIcon className={cn('w-6 h-6', labelInfo.iconColor)} />
            <span className={cn(
              'px-4 py-2 rounded-full font-semibold border',
              labelInfo.color
            )}>
              {labelInfo.text}
            </span>
          </div>
        </div>
      </div>

      {/* Top Reasons */}
      {evaluationResult.topReasons && evaluationResult.topReasons.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            주요 영향 요인
          </h2>
          <div className="space-y-3">
            {evaluationResult.topReasons.map((reason, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-lg',
                  reason.impact === 'positive'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                )}
              >
                {reason.impact === 'positive' ? (
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p className="text-gray-700">{reason.content}</p>
                  <span className="text-xs text-gray-500 mt-1">
                    가중치: {reason.weight.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips & Warnings */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {evaluationResult.tips && evaluationResult.tips.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              읽기 팁
            </h3>
            <ul className="space-y-2">
              {evaluationResult.tips.map((tip, index) => (
                <li key={index} className="text-blue-800 text-sm">
                  • {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {evaluationResult.warnings && evaluationResult.warnings.length > 0 && (
          <div className="bg-orange-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              주의사항
            </h3>
            <ul className="space-y-2">
              {evaluationResult.warnings.map((warning, index) => (
                <li key={index} className="text-orange-800 text-sm">
                  • {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          <Home className="w-5 h-5" />
          처음으로
        </button>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          다시 검사하기
        </button>
      </div>
    </div>
  );
}