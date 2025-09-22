'use client';

import { useRouter } from 'next/navigation';
import { getAllWorks } from '@story-doctor/core';
import { useAssessmentStore } from '@/stores/assessment';
import { BookOpen, Sparkles } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const setCurrentWork = useAssessmentStore((state) => state.setCurrentWork);
  const works = getAllWorks();

  const handleWorkSelect = (work: any) => {
    setCurrentWork(work);
    router.push('/consult');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <div className="flex justify-center items-center mb-4">
          <div className="bg-white p-4 rounded-full shadow-lg">
            <BookOpen className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          스토리 상담실
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Dr. 스토리가 당신의 취향을 진단해드립니다
        </p>
        <p className="text-gray-500">
          작품을 선택하고 간단한 질문에 답해보세요
        </p>
      </div>

      <div className="grid gap-6">
        <h2 className="text-2xl font-semibold text-gray-700 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          작품 선택
        </h2>
        
        {works.map((work) => (
          <div
            key={work.id}
            onClick={() => handleWorkSelect(work)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer p-6 border-2 border-transparent hover:border-blue-400"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {work.title}
                </h3>
                <p className="text-gray-600">
                  {work.author && `작가: ${work.author}`}
                  {work.genre && ` | ${work.genre}`}
                </p>
              </div>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                클래식
              </span>
            </div>
            
            <p className="text-gray-600 line-clamp-3 mb-4">
              {work.summary?.split('\n')[0]}
            </p>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {work.metadata?.themes?.slice(0, 3).map((theme: string) => (
                  <span
                    key={theme}
                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                  >
                    #{theme}
                  </span>
                ))}
              </div>
              <button className="text-blue-600 font-medium hover:text-blue-700">
                적합도 검사 시작 →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>MVP 버전 | 현재는 홍길동전만 지원됩니다</p>
      </div>
    </div>
  );
}