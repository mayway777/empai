"use client";
import { Modal, Progress, Tabs, Tooltip, Spin } from "antd";
import {
  BarChartOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  SoundOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  UserOutlined,
  TrophyOutlined,
  RiseOutlined
} from "@ant-design/icons";
import type { Analysis, VideoAnalysis } from "@/app/types/interview";
import  VideoPlayer from '@/app/components/interview/videoplayer';
import React, { useState, useEffect, useMemo } from "react";
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Legend } from 'chart.js';
import { motion } from 'framer-motion';
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Legend);


const emotionLabels: { [key: string]: string } = {
  Angry: "화남",
  Disgust: "혐오",
  Fear: "두려움",
  Happy: "행복",
  Sad: "슬픔",
  Surprise: "놀람",
  Neutral: "무감정",
};

const emotionColors: { [key: string]: string } = {
  Angry: "#FF4D4F",
  Disgust: "#722ED1",
  Fear: "#FFA39E",
  Happy: "#52C41A",
  Sad: "#1890FF",
  Surprise: "#FAAD14",
  Neutral: "#8C8C8C",
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};



const EvaluationCard = ({
  title,
  icon,
  content,
  bgColor,
  iconColor,
  isAnswerCard = false
 }: {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode | string | {
    strengths: string;
    improvements: string;
    overall: string;
    positiveKeywords?: string;
    negativeKeywords?: string;
  };
  bgColor: string;
  iconColor: string;
  isAnswerCard?: boolean;
 }) => (
  <div className={`${bgColor} p-6 rounded-2xl shadow-lg border border-gray-100 
    flex-1 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
    <div className="flex items-center mb-4">
      <div className={`${iconColor} rounded-xl p-3 mr-4 shadow-md transform transition-all duration-300 
        hover:scale-105 hover:rotate-3`}>
        {icon}
      </div>
      <h4 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 
        bg-clip-text text-transparent">{title}</h4>
    </div>
    
    {isAnswerCard ? (
      <div className="space-y-4">
        {/* 나의 강점 - 좌측 로고 확대 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 
            rounded-xl blur-md transition-all duration-300 group-hover:blur-lg" />
          <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl 
            shadow-md transform transition-all duration-300 group-hover:-translate-y-1 flex gap-4">
            <div className="flex flex-col items-center w-1/5"> {/* 로고 컨테이너 확대 */}
              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-4 rounded-xl  {/* 패딩 증가 */}
                shadow-lg transform transition-all duration-300 group-hover:rotate-12 mb-3"> {/* 회전 효과 강화 */}
                <FileTextOutlined className="text-white text-2xl" /> {/* 아이콘 크기 증가 */}
              </div>
              <div className="text-center">
                <h5 className="text-lg font-bold text-blue-800">나의 강점</h5>
                <p className="text-xs text-blue-600 font-medium">Strengths</p>
              </div>
            </div>
            <div className="bg-white/90 p-4 rounded-lg shadow-inner flex-1">
              <p className="text-gray-700 leading-relaxed text-base">
                {(content as {strengths: string}).strengths}
              </p>
            </div>
          </div>
        </div>

        {/* 개선사항 - 동일한 구조 적용 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-purple-400/20 
            rounded-xl blur-md transition-all duration-300 group-hover:blur-lg" />
          <div className="relative bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-xl 
            shadow-md transform transition-all duration-300 group-hover:-translate-y-1 flex gap-4">
            <div className="flex flex-col items-center w-1/5">
              <div className="bg-gradient-to-br from-violet-400 to-purple-500 p-4 rounded-xl 
                shadow-lg transform transition-all duration-300 group-hover:rotate-12 mb-3">
                <FileTextOutlined className="text-white text-2xl" />
              </div>
              <div className="text-center">
                <h5 className="text-lg font-bold text-violet-800">개선사항</h5>
                <p className="text-xs text-violet-600 font-medium">Improvements</p>
              </div>
            </div>
            <div className="bg-white/90 p-4 rounded-lg shadow-inner flex-1">
              <p className="text-gray-700 leading-relaxed text-base">
                {(content as {improvements: string}).improvements}
              </p>
            </div>
          </div>
        </div>

        {/* 종합평가 - 동일한 구조 적용 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-green-400/20 
            rounded-xl blur-md transition-all duration-300 group-hover:blur-lg" />
          <div className="relative bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl 
            shadow-md transform transition-all duration-300 group-hover:-translate-y-1 flex gap-4">
            <div className="flex flex-col items-center w-1/5">
              <div className="bg-gradient-to-br from-emerald-400 to-green-500 p-4 rounded-xl 
                shadow-lg transform transition-all duration-300 group-hover:rotate-12 mb-3">
                <FileTextOutlined className="text-white text-2xl" />
              </div>
              <div className="text-center">
                <h5 className="text-lg font-bold text-emerald-800">종합평가</h5>
                <p className="text-xs text-emerald-600 font-medium">Overall</p>
              </div>
            </div>
            <div className="bg-white/90 p-4 rounded-lg shadow-inner flex-1">
              <p className="text-gray-700 leading-relaxed text-base">
                {(content as {overall: string}).overall}
              </p>
            </div>
          </div>
        </div>

        {/* 키워드 섹션 */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* 긍정 키워드 */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-green-400/20 
              rounded-xl blur-md transition-all duration-300 group-hover:blur-lg" />
            <div className="relative p-4 rounded-xl bg-white shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 
                  shadow-md transform transition-all duration-300 group-hover:rotate-6">
                  <span className="text-lg block text-white">✨</span>
                </div>
                <div>
                  <h5 className="text-lg font-bold text-emerald-800">긍정 키워드</h5>
                  <p className="text-xs text-emerald-600 font-medium">Positive</p>
                </div>
              </div>

              <div className="space-y-2">
                {(content as any).positiveKeywords ? (
                  (content as any).positiveKeywords.split(',').slice(0,3).map((keyword: string, index: number) => (
                    <div key={index} className="relative group/item">
                      <div className="relative flex items-center p-2 rounded-lg bg-gradient-to-r 
                        from-emerald-50 to-green-50 shadow-sm transform transition-all duration-300 
                        hover:-translate-y-0.5 hover:shadow-md">
                        <span className="text-base mr-2">🌟</span>
                        <span className="font-medium text-base text-gray-800">{keyword.trim()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-16 rounded-lg border-2 
                    border-dashed border-emerald-200 bg-emerald-50">
                    <p className="text-emerald-600 text-sm font-medium">키워드가 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 개선 키워드 */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-violet-400/20 
              rounded-xl blur-md transition-all duration-300 group-hover:blur-lg" />
            <div className="relative p-4 rounded-xl bg-white shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 
                  shadow-md transform transition-all duration-300 group-hover:rotate-6">
                  <span className="text-lg block text-white">💡</span>
                </div>
                <div>
                  <h5 className="text-lg font-bold text-indigo-800">개선 키워드</h5>
                  <p className="text-xs text-indigo-600 font-medium">Growth</p>
                </div>
              </div>

              <div className="space-y-2">
                {(content as any).negativeKeywords ? (
                  (content as any).negativeKeywords.split(',').slice(0,3).map((keyword: string, index: number) => (
                    <div key={index} className="relative group/item">
                      <div className="relative flex items-center p-2 rounded-lg bg-gradient-to-r 
                        from-indigo-50 to-violet-50 shadow-sm transform transition-all duration-300 
                        hover:-translate-y-0.5 hover:shadow-md">
                        <span className="text-base mr-2">💪</span>
                        <span className="font-medium text-base text-gray-800">{keyword.trim()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-16 rounded-lg border-2 
                    border-dashed border-indigo-200 bg-indigo-50">
                    <p className="text-indigo-600 text-sm font-medium">키워드가 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 프로그레스 바 섹션 */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 
              rounded-xl blur-lg" />
            <div className="relative p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 
              backdrop-blur-lg border border-white/20 shadow-md">
              <div className="grid grid-cols-3 gap-4">
                {/* 답변 품질 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-purple-900">답변 품질</span>
                    <span className="text-purple-700 font-bold text-sm">95%</span>
                  </div>
                  <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                    <div className="h-full w-[95%] bg-gradient-to-r from-purple-500 to-pink-500 
                      rounded-full transform transition-all duration-1000" />
                  </div>
                </div>

                {/* 전달력 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-purple-900">전달력</span>
                    <span className="text-purple-700 font-bold text-sm">88%</span>
                  </div>
                  <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                    <div className="h-full w-[88%] bg-gradient-to-r from-purple-500 to-pink-500 
                      rounded-full transform transition-all duration-1000" />
                  </div>
                </div>

                {/* 논리성 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-purple-900">논리성</span>
                    <span className="text-purple-700 font-bold text-sm">92%</span>
                  </div>
                  <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-gradient-to-r from-purple-500 to-pink-500 
                      rounded-full transform transition-all duration-1000" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="bg-white p-4 rounded-xl shadow-md">
        <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">{content as string}</p>
      </div>
    )}
  </div>
); 

const generateAttitudeEvaluation = (
  scores: {
    말하기속도: number;
    "추임새/침묵": number;
    목소리변동성: number;
    표정분석: number;
    머리기울기: number;
    시선분석: number;
  }, 
  videoAnalysis: VideoAnalysis
) => {
  if (typeof window !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes floatAnimation {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes glowPulse {
        0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
        50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
      }
      @keyframes scoreCount {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes gradientFlow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .gradient-border {
        position: relative;
        background: linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82);
        background-size: 200% 200%;
        animation: gradientFlow 3s ease infinite;
        z-index: 1;
      }
      .gradient-border:before {
        content: '';
        position: absolute;
        top: 2px;
        right: 2px;
        bottom: 2px;
        left: 2px;
        background: white;
        border-radius: inherit;
        z-index: -1;
      }
    `;
    document.head.appendChild(styleSheet);
  }

  const performanceCategories = [
    {
      key: 'emotion',
      icon: '😊',
      title: '감정 안정성',
      score: scores.표정분석,
      color: scores.표정분석 >= 8 ? 'green' : scores.표정분석 >= 5 ? 'yellow' : 'red',
      statusText: scores.표정분석 >= 8 ? "매우 안정적" : scores.표정분석 >= 5 ? "보통" : "개선 필요",
      description: scores.표정분석 >= 8
        ? "자신감 있고 안정적인 표정으로 면접에 임하고 있습니다. 표정이 자연스럽고 긍정적인 인상을 주고 있어요."
        : scores.표정분석 >= 5
        ? "표정이 다소 단조롭습니다. 적절한 표정 변화로 더 친근하고 적극적인 모습을 보여주세요."
        : "긴장이 다소 있어 보입니다. 심호흡과 함께 편안한 마음가짐으로 임해보세요.",
      details: Object.entries(videoAnalysis["감정_%"] || {})
        .filter(([_, value]) => value > 0)
        .sort(([_, a], [__, b]) => b - a)
        .slice(0, 3),
      tip: "면접 중에는 적절한 미소와 진지함의 균형이 중요합니다. 너무 경직되지 않도록 주의하세요.",
      improvement: scores.표정분석 >= 8 ? [] : [
        "거울을 보며 자연스러운 표정 연습하기",
        "긴장을 풀기 위한 심호흡 하기",
        "적절한 미소 유지하기"
      ]
    },
    {
      key: 'eyeTracking',
      icon: '👁️',
      title: '시선 처리',
      score: scores.시선분석,
      color: scores.시선분석 >= 4 ? 'green' : scores.시선분석 >= 2 ? 'yellow' : 'red',
      statusText: scores.시선분석 >= 4 ? "안정적" : scores.시선분석 >= 2 ? "보통" : "불안정",
      description: scores.시선분석 >= 4
        ? "면접관과 자연스러운 아이컨택이 이루어지고 있습니다. 안정적인 시선 처리로 신뢰감을 주고 있어요."
        : scores.시선분석 >= 2
        ? "시선이 다소 불안정합니다. 면접관의 눈을 자연스럽게 바라보며 대화를 이어가보세요."
        : "시선이 자주 흔들립니다. 면접관과의 아이컨택을 더 자주 시도해보세요.",
      details: [
        ["우측 시선", videoAnalysis["아이트래킹_%"]?.right ?? 0],
        ["중앙 응시", videoAnalysis["아이트래킹_%"]?.center ?? 0],
        ["좌측 시선", videoAnalysis["아이트래킹_%"]?.left ?? 0]
      ],
      tip: "면접관의 눈과 코 사이를 부드럽게 응시하면 자연스러운 아이컨택이 가능합니다.",
      improvement: scores.시선분석 >= 4 ? [] : [
        "면접관의 눈과 코 사이 응시하기",
        "시선을 천천히 움직이기",
        "불필요한 시선 이동 줄이기"
      ]
    },
    {
      key: 'voiceAnalysis',
      icon: '🎤',
      title: '음성 분석',
      score: scores.말하기속도,
      color: scores.말하기속도 >= 8 ? 'green' : scores.말하기속도 >= 5 ? 'yellow' : 'red',
      statusText: `${videoAnalysis.말하기속도} WPM`,
      description: scores.말하기속도 >= 8
        ? "말하기 속도와 톤이 매우 적절합니다. 청자가 이해하기 좋은 속도로 잘 전달하고 있어요."
        : scores.말하기속도 >= 5
        ? "말하기 속도를 조금 더 조절해보세요. 강조하고 싶은 부분에서는 속도를 늦추는 것이 좋습니다."
        : "말하기 속도가 다소 빠르거나 느립니다. 보통 속도(120-150 WPM)를 유지해보세요.",
        details: [
          ["말하기 속도", videoAnalysis.말하기속도, "WPM"],
          ["음성 변화", videoAnalysis.목소리변동성, "%"],
          ["추임새/침묵", 
           `추임새: ${videoAnalysis.추임새갯수}회 \n 침묵: ${videoAnalysis.침묵갯수}회`]
        ],
      tip: "적절한 말하기 속도는 분당 120-150단어입니다. 중요한 내용은 조금 더 천천히 말하세요.",
      improvement: scores.말하기속도 >= 8 ? [] : [
        "중요 문장은 천천히 말하기",
        "문장 끝에서 살짝 쉬어가기",
        "감정을 담아 말하기"
      ]
    },
    {
      key: 'posture',
      icon: '👤',
      title: '자세 안정성',
      score: scores.머리기울기,
      color: scores.머리기울기 >= 4 ? 'green' : scores.머리기울기 >= 2 ? 'yellow' : 'red',
      statusText: scores.머리기울기 >= 4 ? "안정적" : scores.머리기울기 >= 2 ? "보통" : "불안정",
      description: scores.머리기울기 >= 4
        ? "안정적이고 바른 자세를 잘 유지하고 있습니다. 전문적이고 신뢰감 있는 모습이에요."
        : scores.머리기울기 >= 2
        ? "자세가 가끔 흐트러집니다. 등받이에 등을 살짝 기대어 안정감 있게 앉아보세요."
        : "자세가 자주 흐트러집니다. 양쪽 어깨의 높이를 같게 하고 고개를 똑바로 유지해보세요.",
      details: [
        ["왼쪽 기울임", videoAnalysis["머리기울기_%"]?.left ?? 0],
        ["중앙", videoAnalysis["머리기울기_%"]?.center ?? 0],
        ["오른쪽 기울임", videoAnalysis["머리기울기_%"]?.right ?? 0]
      ],
      tip: "바른 자세는 자신감과 전문성을 보여줍니다. 등받이에 등을 살짝 기대어 편안하게 앉으세요.",
      improvement: scores.머리기울기 >= 4 ? [] : [
        "어깨 높이 같게 유지하기",
        "고개 똑바로 하기",
        "등받이 활용하기"
      ]
    }
  ];

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'from-emerald-400 to-green-500';
    if (percentage >= 70) return 'from-blue-400 to-indigo-500';
    if (percentage >= 50) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-rose-500';
  };

  const getGradeText = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return '탁월';
    if (percentage >= 70) return '우수';
    if (percentage >= 50) return '양호';
    return '개선 필요';
  };

  const evaluations = performanceCategories.map(category => {
    return (
      <div key={category.key} 
           className="gradient-border p-[1px] rounded-xl hover:scale-[1.02] transition-transform duration-300">
        <div className="bg-white rounded-3xl p-6 h-full">
          {/* 헤더 섹션 */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 
                           flex items-center justify-center shadow-lg animate-[floatAnimation_3s_ease-in-out_infinite]">
                <span className="text-4xl">{category.icon}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 
                            bg-clip-text text-transparent">{category.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold
                    ${category.color === 'green' ? 'bg-green-100 text-green-700' :
                    category.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'}`}>
                    {category.statusText}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {getGradeText(category.score, 10)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 점수 표시 */}
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-8 border-gray-100"></div>
              <div className={`absolute inset-0 rounded-full border-8 border-t-transparent
                           border-l-transparent transition-all duration-1000 animate-[scoreCount_1s_ease-out]`}
                   style={{
                     transform: `rotate(${(category.score / 10) * 360}deg)`,
                     borderRightColor: category.color === 'green' ? '#22c55e' :
                                     category.color === 'yellow' ? '#eab308' : '#ef4444',
                     borderBottomColor: category.color === 'green' ? '#22c55e' :
                                      category.color === 'yellow' ? '#eab308' : '#ef4444'
                   }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{(category.score * 10).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* 상세 데이터 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {category.details.map(([label, value, unit]) => (
              <div key={label} 
                   className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl
                            hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">{label}</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {typeof value === 'number' ? 
                      `${value.toFixed(1)}${unit ? unit : '%'}` : value}
                  </div>
                  {typeof value === 'number' && (
                    <div className="mt-2">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${getGradeColor(value, 100)}
                                    transition-all duration-500 animate-[scoreCount_1s_ease-out]`}
                             style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 설명 및 피드백 섹션 */}           
          <div className="space-y-4">             
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">               
              <div className="flex items-start gap-3">                 
                <span className="text-3xl">💡</span>                 
                <p className="text-gray-700 leading-relaxed text-lg">                   
                  {category.description}                 
                </p>               
              </div>             
            </div>              

            {/* 팁 섹션 */}             
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl">               
              <div className="flex items-start gap-3">                 
                <span className="text-3xl">✨</span>                 
                <div>                   
                  <h4 className="font-semibold text-amber-700 mb-2 text-xl">전문가 팁</h4>                   
                  <p className="text-gray-700 text-lg">{category.tip}</p>                 
                </div>               
              </div>             
            </div>              

            {/* 개선사항 섹션 */}             
            {category.improvement && category.improvement.length > 0 && (               
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">                 
                <div className="flex items-start gap-3">                   
                  <span className="text-3xl">🎯</span>                   
                  <div>                     
                    <h4 className="font-semibold text-purple-700 mb-2 text-xl">개선 포인트</h4>                     
                    <ul className="space-y-2">                       
                      {category.improvement.map((item, index) => (                         
                        <li key={index} className="flex items-center gap-2 text-gray-700 text-lg">                           
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />                           
                          {item}                         
                        </li>                       
                      ))}                     
                    </ul>                     
                  </div>                 
                </div>               
              </div>             
            )}
      </div>
        </div>
      </div>
    );
  });

  return (
    <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center', width: '125%', marginLeft: '-12.5%', marginBottom: '-300px' }}>
      <div className="space-y-4">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                       bg-clip-text text-transparent inline-block animate-[floatAnimation_3s_ease-in-out_infinite]">
            면접 퍼포먼스 상세 분석
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI가 분석한 면접 중 표정, 시선, 음성, 자세 등의 데이터를 기반으로 
            상세한 피드백을 제공합니다. 각 항목별 점수와 개선사항을 확인해보세요.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {evaluations}
        </div>
      </div>
    </div>
  );
};

const OverallEvaluation = ({
  attitudeEvaluation,
  answerEvaluation,
}: {
  attitudeEvaluation: React.ReactNode;
  answerEvaluation: {
    strengths: string;
    improvements: string;
    overall: string;
    positiveKeywords?: string;
    negativeKeywords?: string;
  };
}) => (
  <div className="space-y-6 transform scale-80 origin-top-left">
  <div className="flex gap-6 transform scale-90 origin-top-left">
    <EvaluationCard
      title="태도 평가"
      icon={<UserOutlined className="text-purple-500 text-xl" />}
      content={attitudeEvaluation}
      bgColor="bg-purple-50"
      iconColor="bg-purple-100"
      isAnswerCard={false}
      
    />
    <EvaluationCard
      title="답변 평가"
      icon={<FileTextOutlined className="text-blue-500 text-xl" />}
      content={answerEvaluation}
      bgColor="bg-blue-50"
      iconColor="bg-blue-100"
      isAnswerCard={true}
      
    />
  </div>
</div>
);

interface ResultModalProps {
  visible: boolean;
  onClose: () => void;
  analysis: Analysis | null;
  averageScores: {
    말하기속도: number;
    "추임새/침묵": number;
    목소리변동성: number;
    표정분석: number;
    머리기울기: number;
    시선분석: number;
    답변평가: number;
  } | null;
  className?: string;
  style?: React.CSSProperties;
}

const ScoreAnalysis = ({
  scores,
  averageScores
}: {
  scores: {
    말하기속도: number;
    "추임새/침묵": number;
    목소리변동성: number;
    표정분석: number;
    머리기울기: number;
    시선분석: number;
    답변평가: number;
  };
  averageScores: ResultModalProps['averageScores'];
}) => {
  if (!scores || !averageScores) return null;

  // 기존 helper 함수들 유지
  const getCircleColor = (score: number) => {
    if (score >= 90) return {
      '0%': '#52C41A',
      '50%': '#73D13D',
      '100%': '#95DE64'
    };
    if (score >= 80) return {
      '0%': '#1890FF',
      '50%': '#40A9FF',
      '100%': '#69C0FF'
    };
    if (score >= 70) return {
      '0%': '#FAAD14',
      '50%': '#FFC53D',
      '100%': '#FFD666'
    };
    return {
      '0%': '#FF4D4F',
      '50%': '#FF7875',
      '100%': '#FFA39E'
    };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return { text: '탁월', color: '#52C41A' };
    if (score >= 80) return { text: '우수', color: '#1890FF' };
    if (score >= 70) return { text: '양호', color: '#FAAD14' };
    return { text: '개선 필요', color: '#FF4D4F' };
  };

  const totalScore = Object.values(scores).reduce((acc, curr) => acc + curr, 0);
  const scorePercentage = (totalScore / 100) * 100;
  const scoreLabel = getScoreLabel(scorePercentage);
  const circleColor = getCircleColor(scorePercentage);

  const scoreItems = [
    { label: "답변 평가", value: scores.답변평가, average: averageScores.답변평가, total: 50 },
    { label: "표정 분석", value: scores.표정분석, average: averageScores.표정분석, total: 10 },
    { label: "말하기 속도", value: scores.말하기속도, average: averageScores.말하기속도, total: 10 },
    { label: "추임새/침묵", value: scores["추임새/침묵"], average: averageScores["추임새/침묵"], total: 10 },
    { label: "목소리 변동성", value: scores.목소리변동성, average: averageScores.목소리변동성, total: 10 },
    { label: "머리 기울기", value: scores.머리기울기, average: averageScores.머리기울기, total: 5 },
    { label: "시선 분석", value: scores.시선분석, average: averageScores.시선분석, total: 5 }
  ];

  const maxScores = {
    답변평가: 50,
    표정분석: 10,
    말하기속도: 10,
    "추임새/침묵": 10,
    목소리변동성: 10,
    머리기울기: 5,
    시선분석: 5,
  };

  const calculatePercentage = (value: number, maxScore: number) => (value / maxScore) * 100;

  const data = {
  labels: [
    "답변평가", "표정분석", "말하기속도", "추임새/침묵",
    "목소리변동성", "머리기울기", "시선분석",
  ],
  datasets: [
    {
      label: '현재 면접 영상',
      data: [
        calculatePercentage(scores.답변평가, maxScores.답변평가),
        calculatePercentage(scores.표정분석, maxScores.표정분석),
        calculatePercentage(scores.말하기속도, maxScores.말하기속도),
        calculatePercentage(scores["추임새/침묵"], maxScores["추임새/침묵"]),
        calculatePercentage(scores.목소리변동성, maxScores.목소리변동성),
        calculatePercentage(scores.머리기울기, maxScores.머리기울기),
        calculatePercentage(scores.시선분석, maxScores.시선분석),
      ],
      originalScores: [
        scores.답변평가,
        scores.표정분석,
        scores.말하기속도,
        scores["추임새/침묵"],
        scores.목소리변동성,
        scores.머리기울기,
        scores.시선분석,
      ],
      backgroundColor: 'rgba(64, 169, 255, 0.4)',
      borderColor: '#40A9FF',
      borderWidth: 2,
    },
    {
      label: '내 평균',
      data: [
        calculatePercentage(averageScores.답변평가, maxScores.답변평가),
        calculatePercentage(averageScores.표정분석, maxScores.표정분석),
        calculatePercentage(averageScores.말하기속도, maxScores.말하기속도),
        calculatePercentage(averageScores["추임새/침묵"], maxScores["추임새/침묵"]),
        calculatePercentage(averageScores.목소리변동성, maxScores.목소리변동성),
        calculatePercentage(averageScores.머리기울기, maxScores.머리기울기),
        calculatePercentage(averageScores.시선분석, maxScores.시선분석),
      ],
      originalScores: [
        averageScores.답변평가,
        averageScores.표정분석,
        averageScores.말하기속도,
        averageScores["추임새/침묵"],
        averageScores.목소리변동성,
        averageScores.머리기울기,
        averageScores.시선분석,
      ],
      backgroundColor: 'rgba(255, 165, 0, 0.4)',
      borderColor: '#FFA500',
      borderWidth: 2,
    }
  ]
};
  const options = {
    scales: {
      r: {
        min: 0,
        max: 100,
        beginAtZero: true,
        ticks: {
          stepSize: 20,
          display: true,
          backdropColor: 'transparent'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          color: '#333',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
      },
    },
    maintainAspectRatio: true,
    responsive: true
  } as const;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex gap-6">
        <motion.div 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="flex-1 relative bg-gradient-to-br from-white via-blue-50 to-indigo-50 p-6 
                     rounded-3xl shadow-lg border border-blue-100"
        >
          {/* 상단 장식 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 
               via-purple-400 to-pink-400" />
          
          {/* 헤더 */}
          <motion.div 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center mb-6"
          >
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-3 mr-4 
                 shadow-md transform hover:scale-105 transition-transform duration-300">
              <BarChartOutlined className="text-yellow-500 text-xl" />
            </div>
            <div>
              <h4 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 
                  bg-clip-text text-transparent">면접 종합 분석</h4>
              <p className="text-xs text-gray-500 mt-0.5">Interview Analysis Report</p>
            </div>
            <Tooltip title="면접 전체 분석 및 평가 리포트">
              <InfoCircleOutlined className="ml-3 text-gray-400 hover:text-blue-500 
                   transition-colors" />
            </Tooltip>
          </motion.div>

          <div className="flex gap-6">
            {/* 좌측: 점수와 평가 */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-[30%] space-y-4"
            >
              {/* 점수 카드 */}
              <div className="relative bg-white p-4 rounded-xl shadow-md border border-blue-100 
                   transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-2 
                       shadow-md">
                    <TrophyOutlined className="text-white text-lg" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold bg-gradient-to-br from-blue-600 
                         to-purple-600 bg-clip-text text-transparent">
                      {scorePercentage.toFixed(0)}
                    </div>
                    <div className="text-sm font-semibold" style={{ color: scoreLabel.color }}>
                      {scoreLabel.text}
                    </div>
                  </div>
                </div>
              </div>

              {/* 종합 평가 */}
              <div className="bg-white p-4 rounded-xl shadow-md border border-blue-100">
                <h4 className="text-lg font-bold text-gray-800 mb-2">종합 평가</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  우수한 면접 실력을 보여주셨습니다. 대부분의 영역에서 좋은 평가를 받았으며, 
                  일부 개선점을 보완하면 더욱 좋은 결과를 얻을 수 있습니다.
                </p>
              </div>
            </motion.div>

            {/* 중앙: 레이더 차트 */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-[35%]"
            >
              <div className="bg-white p-4 rounded-xl shadow-md border border-blue-100">
                <div className="aspect-square">
                  <Radar data={data} options={options} />
                </div>
              </div>
            </motion.div>

            {/* 우측: 세부 점수 */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-[35%] space-y-2"
            >
              {scoreItems.map(({ label, value, average, total }, index) => (
                <motion.div 
                  key={label}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-50 
                       hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700 font-medium">{label}</span>
                      <span className="text-sm font-bold text-gray-900">{value}/{total}</span>
                    </div>
                    <div className="relative h-1.5">
                      <div className="absolute w-full h-full bg-gray-100 rounded-full" />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(value / total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 
                                 to-blue-500"
                      />
                      {average !== undefined && (
                        <div 
                          className="absolute h-3 w-0.5 bg-orange-400 rounded-full transform 
                                   -translate-y-1/4" 
                          style={{ left: `${(average / total) * 100}%` }} 
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

interface VideoPlayerProps {
  uid: string;
  filename: string;
  onLoad?: () => void;
  className?: string;  // onLoad를 선택적 prop으로 추가
}


const ResultModal: React.FC<ResultModalProps> = ({ visible, onClose, analysis, averageScores }) => {
  const [activeTab, setActiveTab] = useState('tab-1');
  const [activeEvalTab, setActiveEvalTab] = useState('attitude'); // 새로 추가된 상태
  const [modalKey, setModalKey] = useState(0);

  useEffect(() => {
    if (visible) {
      setModalKey(prev => prev + 1);
      setActiveTab('tab-1');
      setActiveEvalTab('attitude'); // 초기값 설정
    }

    // 커스텀 탭 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
      .custom-eval-tabs .ant-tabs-nav {
        margin: 0 !important;
      }
      .custom-eval-tabs .ant-tabs-nav::before {
        border: none !important;
      }
      .custom-eval-tabs .ant-tabs-tab {
        margin: 0 !important;
        width: 50%;
        padding: 0 !important;
        transition: all 0.3s ease;
      }
      .custom-eval-tabs .ant-tabs-tab-active {
        background: #f0f7ff !important;
      }
      .custom-eval-tabs .ant-tabs-tab:hover {
        background: #f5f5f5;
      }
      .custom-eval-tabs .ant-tabs-tab-btn {
        width: 100%;
      }
      .custom-eval-tabs .ant-tabs-nav-list {
        width: 100%;
      }
      .custom-eval-tabs .ant-tabs-content-holder {
        background: #f8fafc;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [visible]);

  const tabItems = useMemo(() => {
    if (!analysis || !analysis.uid) return [];
  
    return [1, 2, 3, 4].map((num) => {
      const tabKey = `tab-${num}`;
      const videoAnalysis = analysis[analysis.uid][num.toString()];
      return {
        key: tabKey,
        label: (
          <span className="px-4">
            면접 {num}
            {videoAnalysis && (
              <span className="ml-2 text-green-500">●</span>
            )}
          </span>
        ),
        children: (
          <div className="p-4">
            {videoAnalysis ? (
              <div className="space-y-8">
                {/* 면접 질문과 영상 섹션 */}
                <div className="flex gap-6">
                  {/* 면접 질문 섹션 */}
                  <div className="flex-[5.5] relative overflow-hidden rounded-3xl shadow-2xl border border-gray-100">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 opacity-80"></div>
                    <div className="p-8 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
                      <div className="flex items-center mb-6">
                        <div className="bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl p-3 mr-5 shadow-lg transform transition-transform hover:scale-110">
                          <FileTextOutlined className="text-white text-2xl" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                            면접 질문
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 tracking-wide">
                            AI Interview Question
                          </p>
                        </div>
                        <Tooltip title="AI의 면접 질문">
                          <InfoCircleOutlined className="ml-3 text-gray-400 hover:text-blue-500 transition-colors" />
                        </Tooltip>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-inner border border-gray-100/50 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-50/30 to-indigo-50/30 -z-10 rounded-2xl blur-sm"></div>
                        <p className="text-lg text-gray-800 leading-relaxed font-medium tracking-tight">
                          {videoAnalysis.question}
                        </p>
                      </div>
                      
                      <div className="mt-6 border-t border-gray-200/50 pt-6">
                        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                          <div className="flex items-center mb-4">
                            <h5 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-sky-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                              내 답변
                            </h5>
                            <Tooltip title="잡음에 따라 인식률이 상이할 수 있음">
                              <InfoCircleOutlined className="ml-3 text-gray-400 hover:text-blue-500 transition-colors" />
                            </Tooltip>
                          </div>
                          <p className="text-base text-gray-700 leading-relaxed">
                            {videoAnalysis.답변 || "답변 데이터가 없습니다."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
  
                  {/* 면접 영상 섹션 */}
                  <div className="flex-[4.5] relative overflow-hidden rounded-3xl shadow-2xl border border-gray-100">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 via-red-500 to-pink-600 opacity-80"></div>
                    <div className="p-8 bg-gradient-to-br from-white via-rose-50 to-pink-50 h-full">
                      <div className="flex items-center mb-6">
                        <div className="bg-gradient-to-br from-rose-400 to-red-600 rounded-xl p-3 mr-5 shadow-lg transform transition-transform hover:scale-110">
                          <PlayCircleOutlined className="text-white text-2xl" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-700 bg-clip-text text-transparent tracking-tight">
                            면접 영상
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 tracking-wide">
                            Interview Video Recording
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100/50">
                        <div className="relative pt-[0.25%]"> {/* 16:9 Aspect Ratio */}
                          {activeTab === tabKey && (
                            <VideoPlayer
                              key={`video-${analysis.uid}-${num}-${modalKey}`}
                              uid={analysis.uid}
                              filename={videoAnalysis.video_filename}
                              className="absolute top-0 left-0 w-full h-full rounded-2xl"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
  
                {/* 평가 탭 섹션 */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Tabs
                    activeKey={activeEvalTab}
                    onChange={setActiveEvalTab}
                    type="card"
                    className="evaluation-tabs custom-eval-tabs"
                    tabBarGutter={0}
                    items={[
                      {
                        key: 'attitude',
                        label: (
                          <div className="w-[700px] h-full flex items-center justify-center py-4 gap-2 text-lg font-semibold transition-all duration-300">
                            <UserOutlined className="text-xl" />
                            태도 평가
                          </div>
                        ),
                        children: (
                          <div className="p-6">
                            <EvaluationCard
                              title="태도 평가"
                              icon={<UserOutlined className="text-purple-500 text-2xl" />}
                              content={generateAttitudeEvaluation(videoAnalysis.Score, videoAnalysis)}
                              bgColor="bg-purple-50"
                              iconColor="bg-purple-100"
                              isAnswerCard={false}
                            />
                          </div>
                        ),
                      },
                      {
                        key: 'answer',
                        label: (
                          <div className="w-[700px] h-full flex items-center justify-center py-4 gap-2 text-lg font-semibold transition-all duration-300">
                            <FileTextOutlined className="text-xl" />
                            답변 평가
                          </div>
                        ),
                        children: (
                          <div className="p-6">
                            <EvaluationCard
                              title="답변 평가"
                              icon={<FileTextOutlined className="text-blue-500 text-2xl" />}
                              content={{
                                strengths: videoAnalysis.Evaluation?.답변강점 || "답변 강점 데이터가 없습니다.",
                                improvements: videoAnalysis.Evaluation?.답변개선사항 || "개선사항 데이터가 없습니다.",
                                overall: videoAnalysis.Evaluation?.답변종합평가 || "종합 평가 데이터가 없습니다.",
                                positiveKeywords: videoAnalysis.Evaluation?.긍정키워드 || "없음",
                                negativeKeywords: videoAnalysis.Evaluation?.부정키워드 || "없음"
                              }}
                              bgColor="bg-blue-50"
                              iconColor="bg-blue-100"
                              isAnswerCard={true}
                            />
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
                
                {/* 종합 분석 */}
                <ScoreAnalysis scores={videoAnalysis.Score} averageScores={averageScores} />
              </div>
            ) : (
              <div className="text-center py-16">
                <Spin size="large" />
                <p className="mt-4 text-gray-500">분석 중입니다...</p>
              </div>
            )}
          </div>
        ),
      };
    });
  }, [analysis, modalKey, activeTab, activeEvalTab, averageScores]);

  return (
    <Modal
      key={modalKey}
      title={
        <div className="flex justify-between items-center pr-10">
          <h3 className="text-2xl font-bold">{analysis?.title}</h3>
          <p className="text-sm text-gray-500 ml-4">
            {analysis ? formatDate(analysis.time) : ""}
          </p>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1400}
      footer={null}
    >
      {analysis && analysis.uid && (
        <Tabs
          defaultActiveKey="1"
          type="card"
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={tabItems}
        />
      )}
    </Modal>
  );
};

export default ResultModal;