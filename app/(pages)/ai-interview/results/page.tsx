"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Spin,
  Alert,
  Button,
  Tooltip,
  Pagination
} from "antd";
import {
  ClockCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  RightOutlined,
  PieChartOutlined,
  StarOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import ResultModal from "@/app/components/interview/result";




const calculateOverallAverages = (allResults: Analysis[]) => {
  const allScores = allResults.flatMap(analysis => {
    const interviewData = analysis[analysis.uid];
    return Object.values(interviewData)
      .filter((round: any) => round?.Score && Object.values(round.Score).every(score => score !== null))
      .map((round: any) => round.Score);
  });

  if (allScores.length === 0) return null;

  const average = (arr: number[]) => 
    Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1));

  return {
    말하기속도: average(allScores.map(s => s.말하기속도)),
    "추임새/침묵": average(allScores.map(s => s["추임새/침묵"])),
    목소리변동성: average(allScores.map(s => s.목소리변동성)),
    표정분석: average(allScores.map(s => s.표정분석)),
    머리기울기: average(allScores.map(s => s.머리기울기)),
    시선분석: average(allScores.map(s => s.시선분석)),
    답변평가: average(allScores.map(s => s.답변평가))
  };
};



interface ScoreLabelInfo {
  label: string;
  colors: {
    base: string;
    light: string;
    dark: string;
    text: string;
    border: string;
    glow: string;
    shine: string;
    accent: string;
  };
}

const getScoreLabelInfo = (score: number | null): ScoreLabelInfo => {
  if (score === null) {
    return {
      label: "분석 대기",
      colors: {
        base: "#94A3B8",    // 청회색 (대기 상태 느낌)
        light: "#F1F5F9",   // 연한 청회색 
        dark: "#64748B",    // 어두운 청회색
        text: "#475569",    // 고대비 텍스트
        border: "#CBD5E1",  // 부드러운 보더
        glow: "rgba(100, 116, 139, 0.3)", // 청회색 글로우
        shine: "#FFFFFF",   
        accent: "rgba(148, 163, 184, 0.4)"
      }
    };
  }
  
  if (score >= 80) {
    return {
      label: "매우 우수",
      colors: {
        base: "#FFD700",
        light: "#FFF7D6",
        dark: "#B8860B",
        text: "#B8860B",
        border: "#FFE55C",
        glow: "rgba(251, 191, 36, 0.5)",
        shine: "#FFFBEB",
        accent: "rgba(251, 191, 36, 0.5)"
      }
    };
  } else if (score >= 60) {
    return {
      label: "우수",
      colors: {
        base: "#C0C0C0",
        light: "#F8FAFC",
        dark: "#94A3B8",
        text: "#64748B",
        border: "#E2E8F0",
        glow: "rgba(203, 213, 225, 0.4)",
        shine: "#FFFFFF",
        accent: "rgba(148, 163, 184, 0.5)"
      }
    };
  } else if (score >= 40) {
    return {
      label: "개선 필요",
      colors: {
        base: "#CD7F32",
        light: "#E3B88F",
        dark: "#8B4513",
        text: "#8B4513",
        border: "#DBA878",
        glow: "rgba(205, 127, 50, 0.4)",
        shine: "#F7E2D0",
        accent: "rgba(180, 83, 9, 0.5)"
      }
    };
  } else {
    return {
      label: "매우 미흡",
      colors: {
        base: "#F87171",    // 연한 코랄레드
        light: "#FEE2E2",   // 분홍빛 연한색
        dark: "#DC2626",    // 어두운 레드
        text: "#B91C1C",    // 진한 레드 텍스트
        border: "#FCA5A5",  // 부드러운 보더
        glow: "rgba(220, 38, 38, 0.2)", // 레드 글로우
        shine: "#FFEDED",   // 연한 분홍빛
        accent: "rgba(220, 38, 38, 0.3)"
      }
    };
  }
};

const MedalDisplay = ({ score }: { score: number | null }) => {
  const info = getScoreLabelInfo(score);
  
  return (
    <div className="group relative w-full aspect-square p-2">
      {/* 외부 글로우 효과 */}
      <div
        className="absolute inset-0 rounded-full blur-2xl transition-all duration-700 opacity-50 group-hover:opacity-75"
        style={{
          background: `radial-gradient(circle at center, ${info.colors.glow}, transparent 70%)`
        }}
      />

      {/* 메달 본체 컨테이너 */}
      <div className="absolute inset-0 transform transition-all duration-500 group-hover:scale-105">
        {/* 3D 효과를 위한 메달 테두리 */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(40deg, ${info.colors.dark}, ${info.colors.border}, ${info.colors.light})`,
            transform: 'perspective(1000px) rotateX(10deg)',
            boxShadow: `
              0 0 20px ${info.colors.glow},
              inset 0 0 20px ${info.colors.glow},
              0 5px 15px rgba(0, 0, 0, 0.3)
            `
          }}
        >
          {/* 메달 내부 */}
          <div
            className="absolute inset-1 rounded-full overflow-hidden"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${info.colors.light}, ${info.colors.base}, ${info.colors.dark})`,
              border: `2px solid ${info.colors.border}`,
            }}
          >
            {/* 복합적인 광택 효과 */}
            <div className="absolute inset-0">
              {/* 상단 하이라이트 */}
              <div
                className="absolute -top-1/2 left-1/2 w-full h-full -translate-x-1/2 transform rotate-[-20deg]"
                style={{
                  background: `linear-gradient(to bottom, ${info.colors.shine}80, transparent)`,
                }}
              />
              
              {/* 동적 반짝임 효과 */}
              <div className="absolute inset-0">
                <div
                  className="absolute top-0 left-0 w-full h-full transform medal-shine"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${info.colors.shine}40, transparent)`,
                  }}
                />
                <div
                  className="absolute top-1/4 right-1/4 w-1/2 h-1/2 rounded-full medal-pulse"
                  style={{
                    background: `radial-gradient(circle, ${info.colors.shine}60, transparent)`,
                  }}
                />
              </div>

              {/* 장식적 패턴 */}
              <div
                className="absolute inset-4 rounded-full border opacity-30 medal-rotate"
                style={{ 
                  borderColor: info.colors.shine,
                  boxShadow: `inset 0 0 10px ${info.colors.accent}`
                }}
              />
              <div
                className="absolute inset-6 rounded-full border opacity-20 medal-rotate"
                style={{ 
                  borderColor: info.colors.shine,
                  transform: 'rotate(180deg)'
                }}
              />
            </div>

           {/* 점수 표시 */}
{/* 점수 표시 */}
<div className="absolute inset-0 flex flex-col items-center justify-center z-10">
 {/* 점수 */}
 <div className="flex flex-col items-center justify-center h-full mb-1">
   <span
     className="text-2xl font-bold transform transition-all duration-300 group-hover:scale-105"
     style={{
       color: '#FFFFFF',
       textShadow: `
         1px 1px 2px ${info.colors.dark},
         0 0 15px ${info.colors.glow}`,
       letterSpacing: '0.5px'
     }}
   >
     {score !== null ? `${score}점` : '-'}
   </span>
   {/* 라벨 */}
   <div
     className="px-3 py-0.5 rounded-full bg-white/95 backdrop-blur-none transform
       transition-all duration-300 shadow-sm group-hover:scale-105"
     style={{
       color: info.colors.text,
       boxShadow: `0 2px 4px ${info.colors.glow}`,
       transform: 'scale(0.7)'  // 크기를 약간 키움
     }}
   >
     <span className="font-bold text-base  whitespace-nowrap tracking-wide">
       {info.label}
     </span>
   </div>
 </div>
</div>
          </div>
        </div>
      </div>
    </div>
  );
};
interface AnalysisCardProps {
  title: string;
  time: string;
  videoAnalysis: {
    [key: string]: {
      video_number: number;
      video_filename: string;
      question: string;
      Score?: {
        말하기속도: number;
        "추임새/침묵": number;
        목소리변동성: number;
        표정분석: number;
        머리기울기: number;
        시선분석: number;
        답변평가: number;
      };
      [key: string]: any;
    } | undefined;
  };
  onCardClick: () => void;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({
  title,
  time,
  videoAnalysis,
  onCardClick,
}) => {
  const calculateTotalScore = (roundData: any) => {
    if (!roundData?.Score) return null;
    
    const scores = [
      roundData.Score.말하기속도,
      roundData.Score["추임새/침묵"],
      roundData.Score.목소리변동성,
      roundData.Score.표정분석,
      roundData.Score.머리기울기,
      roundData.Score.시선분석,
      roundData.Score.답변평가
    ];
    
    const validScores = scores.filter(score => score !== null && !isNaN(score));
    if (validScores.length === 0) return null;
    
    return Math.round(validScores.reduce((a, b) => a + b, 0));
  };

  return (
    <Card
      className="rounded-xl overflow-hidden transition-all duration-500 shadow-lg backdrop-blur-sm"
      style={{
        background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="space-y-3">
        {/* 헤더 섹션 */}
<div className="relative px-4 pt-4 pb-2">
  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 opacity-80"></div>
  <div className="flex flex-col space-y-1">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-extrabold text-gray-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
        {title}
      </h3>
      <div className="flex items-center space-x-1.5 text-gray-500">
        <ClockCircleOutlined className="text-sm opacity-70" />
        <p className="text-xs font-medium tracking-tight">
          {time}
        </p>
      </div>
    </div>
    <div className="h-[1px] w-full bg-gradient-to-r from-sky-200/50 to-indigo-200/50 opacity-50 mt-1"></div>
  </div>
</div>

        {/* 분석 상태 표시 */}
        <div className="grid grid-cols-4 gap-1.5">
          {Object.keys(videoAnalysis).map((key) => {
            const roundData = videoAnalysis[key];
            const isAnalyzed = roundData?.Score !== undefined;
            
            return (
              <div 
                key={`status-${key}`} 
                className={`
                  flex flex-col items-center p-2 rounded-lg
                  transition-all duration-300 hover:scale-[1.02]
                  ${isAnalyzed 
                    ? 'bg-gradient-to-br from-sky-50 to-indigo-50 text-sky-600 border border-sky-100' 
                    : 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 border border-amber-100'
                  }
                `}
              >
                <span className="text-xs font-semibold mb-1">질문 {key}</span>
                <div className="flex items-center text-[10px] font-medium">
                  {isAnalyzed ? (
                    <>
                      <CheckCircleOutlined className="mr-0.5 animate-fadeIn" />
                      <span>분석완료</span>
                    </>
                  ) : (
                    <>
                      <SyncOutlined spin className="mr-0.5" />
                      <span>분석중</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 메달 표시 섹션 */}
        <div className="grid grid-cols-4 gap-1.5">
          {Object.keys(videoAnalysis).map((key) => {
            const roundData = videoAnalysis[key];
            const totalScore = roundData ? calculateTotalScore(roundData) : null;
            
            return (
              <div key={`round-${key}`}>
                <MedalDisplay score={totalScore} />
              </div>
            );
          })}
        </div>

        {/* 상세보기 버튼 */}
        <button 
          className="
            w-full px-3 py-2 mt-2
            bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500
            text-white rounded-lg
            transition-all duration-300
            flex items-center justify-center
            space-x-2 text-sm font-medium
            group
            relative overflow-hidden
          "
          onClick={(e) => {
            e.stopPropagation();
            onCardClick();
          }}
        >
          <span className="relative z-10">결과 상세보기</span>
          <RightOutlined className="relative z-10 group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    </Card>
  );
};

interface Analysis {
  _id: { $oid: string };
  uid: string;
  self_id: string;
  title: string;
  job_code: string;
  time: string;
  [key: string]: any;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};


const calculateTotalScores = (analysis: Analysis | null) => {
  if (!analysis) return null;

  const interviewData = analysis[analysis.uid];
  const allScores = Object.values(interviewData)
    .filter((round: any) => round?.Score)
    .map((round: any) => {
      const scores = [
        round.Score.말하기속도,
        round.Score["추임새/침묵"],
        round.Score.목소리변동성,
        round.Score.표정분석,
        round.Score.머리기울기,
        round.Score.시선분석,
        round.Score.답변평가
      ];
      
      return {
        말하기속도: round.Score.말하기속도,
        "추임새/침묵": round.Score["추임새/침묵"],
        목소리변동성: round.Score.목소리변동성,
        표정분석: round.Score.표정분석,
        머리기울기: round.Score.머리기울기,
        시선분석: round.Score.시선분석,
        답변평가: round.Score.답변평가
      };
    });

  if (allScores.length === 0) return null;

  // 첫 번째 라운드의 점수를 반환 (모달에서 사용)
  return allScores[0];
};

export default function AnalysisResultsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [globalAverages, setGlobalAverages] = useState<{
    태도평가: number;
    답변평가: number;
    총점수: number;
  } | null>(null);
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
  
        if (currentUser) {
          const token = await currentUser.getIdToken();
          
          // 두 요청을 병렬로 실행
          const [userResponse, globalResponse] = await Promise.all([
            // 사용자의 분석 결과 가져오기
            fetch(`/api/interview/result_request?uid=${currentUser.uid}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }),
            // 전체 사용자의 평균 가져오기
            fetch(`/api/interview/global_averages`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
          ]);
  
          if (!userResponse.ok || !globalResponse.ok) {
            throw new Error('분석 결과를 불러오는데 실패했습니다');
          }
  
          const userData = await userResponse.json();
          const globalData = await globalResponse.json();
  
          const sortedData = userData.sort((a: Analysis, b: Analysis) => 
            new Date(b.time).getTime() - new Date(a.time).getTime()
          );
  
          setAnalysisResults(sortedData);
          setGlobalAverages(globalData);
        }
      } catch (err) {
        setError("분석 결과를 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // 페이지네이션 로직
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedResults = analysisResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(analysisResults.length / itemsPerPage);

  const handleLoginRedirect = () => {
    router.push("/mypage");
  };

  // 성과 통계 계산
  const calculatePerformanceStats = () => {
    if (analysisResults.length === 0 || !globalAverages) return null;
  
    // 내 평균 계산
    const myAverages = analysisResults.flatMap(analysis => {
      const interviewData = analysis[analysis.uid];
      return Object.values(interviewData)
        .filter((round: any) => round?.Score)
        .map((round: any) => {
          const attitudeScore = [
            round.Score.말하기속도,
            round.Score["추임새/침묵"],
            round.Score.목소리변동성,
            round.Score.표정분석,
            round.Score.머리기울기,
            round.Score.시선분석
          ].reduce((a, b) => a + b, 0);
  
          return {
            attitudeScore,
            answerScore: round.Score.답변평가
          };
        });
    });
  
    const average = (scores: number[]) => 
      Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));
  
    const myAvg = {
      attitudeScore: average(myAverages.map(s => s.attitudeScore)),
      answerScore: average(myAverages.map(s => s.answerScore))
    };
  
    // globalAverages는 이미 평균값이 계산된 객체
    const performanceCategories = [
      { 
        icon: <StarOutlined />, 
        label: '태도 평가', 
        value: myAvg.attitudeScore,
        globalValue: globalAverages.태도평가 || 0
      },
      { 
        icon: <TrophyOutlined />, 
        label: '답변 평가', 
        value: myAvg.answerScore,
        globalValue: globalAverages.답변평가 || 0
      }
    ];
  
    return performanceCategories;
  };

  const performanceStats = calculatePerformanceStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Spin 
          size="large" 
          className="custom-spin"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full transform transition-all hover:scale-105">
          <ClockCircleOutlined className="text-6xl text-blue-500 mb-6 animate-pulse" />
          <p className="text-xl text-gray-700 mb-6">
            면접 분석 결과는 로그인 후 확인할 수 있습니다.
          </p>
          <Button
            type="primary"
            size="large"
            onClick={handleLoginRedirect}
            className="px-10 py-3 text-base hover:scale-105 transition-transform"
          >
            로그인 하러 가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 ">
      <div className="max-w-[1420px] mx-auto px-8 space-y-4">
        {/* 메인 대시보드 카드 */}
        <div className="relative bg-white/80 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl border border-white/50">
          {/* 배경 효과 */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-32 
                           bg-gradient-to-r from-blue-300/10 via-indigo-300/10 to-purple-300/10 rotate-12 scale-150" />
          </div>
  
          <div className="relative p-5 space-y-4">
            {/* 상단 헤더 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 
                              rounded-2xl backdrop-blur-sm border border-white/50 shadow-inner">
                  <ClockCircleOutlined className="text-blue-600 text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent 
                               bg-gradient-to-r from-gray-800 to-gray-600">
                    면접 분석 대시보드
                  </h1>
                  <p className="text-gray-500 mt-1 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    최근 30일 분석 결과
                  </p>
                </div>
              </div>
  
              <Button
                onClick={() => router.push("/ai-interview/evaluation")}
                className="group bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none
                           px-6 py-5 text-base font-medium hover:shadow-lg hover:opacity-90 
                           transition-all duration-300 rounded-xl flex items-center gap-1"
              >
                새 면접 시작
                <RightOutlined className="group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
  
            {/* 메인 통계 섹션 */}
            <div className="grid grid-cols-12 gap-4">
              {/* 면접 횟수 카드 */}
              <div className="col-span-12 md:col-span-4">
                <div className="bg-gradient-to-br from-white/80 to-blue-50/80 rounded-2xl p-4 
                              shadow-sm backdrop-blur-sm border border-white/50 
                              hover:shadow-md transition-all duration-300
                              group">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">총 면접 횟수</h3>
                      <p className="text-sm text-gray-500">나의 성장 기록</p>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 
                                  rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <FileTextOutlined className="text-blue-500 text-xl" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold bg-clip-text text-transparent 
                                  bg-gradient-to-r from-blue-600 to-indigo-600">
                      {analysisResults.length}
                    </span>
                    <span className="text-gray-600">회</span>
                  </div>
                </div>
              </div>
  
              {/* 통합 평가 점수 카드 */}
              <div className="col-span-12 md:col-span-8">
                <div className="bg-gradient-to-br from-white/80 to-blue-50/80 rounded-2xl p-4 
                              shadow-sm backdrop-blur-sm border border-white/50 
                              hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">평가 점수 분석</h3>
                      <p className="text-sm text-gray-500">나의 평균 vs 전체 평균</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                        <span className="text-sm text-gray-600">나의 점수</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <span className="text-sm text-gray-600">전체 평균</span>
                      </div>
                    </div>
                  </div>
  
                  <div className="space-y-２">
                    {performanceStats && performanceStats.map((stat, index) => (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-１">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              {stat.icon}
                            </div>
                            <span className="text-base font-medium text-gray-700">{stat.label}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-lg font-bold text-blue-600">{stat.value}</span>
                                <span className="text-sm text-gray-400 ml-1">/50</span>
                              </div>
                              <div className="h-8 w-px bg-gray-200" />
                              <div className="text-right">
                                <span className="text-base text-gray-600">{stat.globalValue}</span>
                                <span className="text-sm text-gray-400 ml-1">/50</span>
                              </div>
                            </div>
                            <span className={`min-w-[3rem] text-right text-sm font-medium ${
                              stat.value > stat.globalValue 
                                ? 'text-green-500' 
                                : stat.value < stat.globalValue 
                                ? 'text-red-500' 
                                : 'text-gray-500'
                            }`}>
                              {stat.value > stat.globalValue && '+'}
                              {(stat.value - stat.globalValue).toFixed(1)}
                            </span>
                          </div>
                        </div>
  
                        {/* 향상된 프로그레스 바 */}
                        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                          {/* 배경 애니메이션 */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 animate-pulse" />
                          
                          {/* 메인 프로그레스 바 */}
                          <div 
                            className="absolute top-0 left-0 h-full rounded-full
                                     transition-all duration-1000 ease-out group-hover:opacity-90
                                     bg-gradient-to-r from-blue-500 to-indigo-500"
                            style={{ width: `${(stat.value / 50) * 100}%` }}
                          >
                            {/* 반짝이는 효과 */}
                            <div className="absolute inset-0 opacity-50 bg-gradient-to-r from-transparent 
                                          via-white to-transparent shimmer-animation" />
                          </div>
  
                          {/* 전체 평균 마커 */}
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 h-full w-0.8 bg-blue-500 transition-all duration-1000"
                          style={{ left: `${(stat.globalValue / 50) * 100}%` }}
                        >
                          {/* 펄스 이펙트 */}
                          <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-4 bg-gray-500 rounded-full animate-ping" />
                          {/* 마커 점 */}
                          <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-4 bg-gray-500 rounded-full shadow-lg" />
                        </div>
                        </div>
                      </div>
                    ))}
  
                    {/* 총점 섹션 */}
                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-800">총점</span>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-2xl font-bold bg-clip-text text-transparent 
                                           bg-gradient-to-r from-blue-600 to-indigo-600">
                                {performanceStats?.reduce((acc, stat) => acc + stat.value, 0)}
                              </span>
                              <span className="text-sm text-gray-400 ml-1">/100</span>
                            </div>
                            <div className="h-8 w-px bg-gray-200" />
                            <div className="text-right">
                              <span className="text-xl text-gray-600">
                                {performanceStats?.reduce((acc, stat) => acc + stat.globalValue, 0)}
                              </span>
                              <span className="text-sm text-gray-400 ml-1">/100</span>
                            </div>
                          </div>
                          <span className={`min-w-[3rem] text-right text-sm font-medium ${
                          performanceStats ? (
                            performanceStats.reduce((acc, stat) => acc + stat.value, 0) > 
                            performanceStats.reduce((acc, stat) => acc + stat.globalValue, 0)
                              ? 'text-green-500' 
                              : 'text-red-500'
                          ) : 'text-gray-500'
                        }`}>
                          {performanceStats && (
                            <>
                              {performanceStats.reduce((acc, stat) => acc + stat.value, 0) > 
                              performanceStats.reduce((acc, stat) => acc + stat.globalValue, 0) && '+'}
                              {(
                                (performanceStats.reduce((acc, stat) => acc + stat.value, 0)) -
                                (performanceStats.reduce((acc, stat) => acc + stat.globalValue, 0))
                              ).toFixed(1)}
                            </>
                          )}
                        </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {error && (
          <Alert 
            message="오류 발생" 
            description={error} 
            type="error" 
            showIcon 
            className="mb-6" 
          />
        )}
  
        {/* 분석 결과 리스트 섹션 */}
        <div className="bg-white/80 rounded-3xl overflow-hidden backdrop-blur-md shadow-lg border border-white/50 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">상세 분석 결과</h2>
          
          {analysisResults.length === 0 ? (
            <div className="text-center py-12">
              <FileTextOutlined className="text-6xl text-gray-400 mb-6" />
              <p className="text-xl text-gray-600 mb-6">
                아직 분석된 면접 결과가 없습니다.
              </p>
              <Button
                type="primary"
                size="large"
                onClick={() => router.push("/ai-interview")}
                className="px-10 py-3"
              >
                첫 번째 면접 시작하기
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedResults.map((analysis) => {
                  const uniqueKey = analysis._id?.$oid || `${analysis.uid}-${analysis.time}`;
                  return (
                    <AnalysisCard
                      key={uniqueKey}
                      title={analysis.title}
                      time={formatDate(analysis.time)}
                      videoAnalysis={analysis[analysis.uid]}
                      onCardClick={() => {
                        setSelectedAnalysis(analysis);
                        setModalVisible(true);
                      }}
                    />
                  );
                })}
              </div>
  
              <div className="flex justify-center mt-8">
                <Pagination
                  current={currentPage}
                  total={analysisResults.length}
                  pageSize={itemsPerPage}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  className="custom-pagination"
                />
              </div>
            </>
          )}
        </div>
  
        <style jsx global>{`
      @keyframes shine {
        from { transform: translateX(-100%) rotate(45deg); }
        to { transform: translateX(200%) rotate(45deg); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .medal-shine {
        animation: shine 3s infinite linear;
      }
      .medal-pulse {
        animation: pulse 2s infinite ease-in-out;
      }
      .medal-rotate {
        animation: rotate 20s infinite linear;
      }
    `}</style>
  
        <ResultModal 
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          analysis={selectedAnalysis}
          averageScores={calculateOverallAverages(analysisResults)}
        />
      </div>
    </div>
  );
}