import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import connectToDatabase from "@/lib/mongodb/mongodb";
import { verifyAuth } from "@/lib/firebase/auth_middleware";

export async function GET(request: Request) {
  await connectToDatabase();
  let client;

  try {
    await verifyAuth();
    client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();

    const db = client.db('EmpAI');
    const collection = db.collection('video_analysis');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 100);

    const analyses = await collection
      .find({
        time: {
          $gte: thirtyDaysAgo.toISOString()
        }
      })
      .toArray();

    // 모든 사용자의 유효한 Score 수집
    const allValidScores = {
      태도평가: [] as number[],  // 6개 항목의 합
      답변평가: [] as number[]   // 답변평가 점수
    };

    // 모든 분석 데이터를 순회하며 Score 수집
    analyses.forEach(analysis => {
      const interviewData = analysis[analysis.uid];
      Object.values(interviewData).forEach((round: any) => {
        if (round?.Score) {
          // 태도평가 항목들이 모두 유효한지 확인
          const attitudeScores = [
            round.Score.말하기속도,
            round.Score["추임새/침묵"],
            round.Score.목소리변동성,
            round.Score.표정분석,
            round.Score.머리기울기,
            round.Score.시선분석
          ];

          // 태도평가 항목들이 모두 유효할 경우에만 합계를 추가
          if (attitudeScores.every(score => score !== null && score !== undefined)) {
            const attitudeSum = attitudeScores.reduce((a, b) => a + b, 0);
            allValidScores.태도평가.push(attitudeSum);
          }

          // 답변평가가 유효할 경우 추가
          if (round.Score.답변평가 !== null && round.Score.답변평가 !== undefined) {
            allValidScores.답변평가.push(round.Score.답변평가);
          }
        }
      });
    });

    // 평균 계산
    const calculateAverage = (scores: number[]) => {
      if (scores.length === 0) return 0;
      return Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));
    };

    const averages = {
      태도평가: calculateAverage(allValidScores.태도평가),
      답변평가: calculateAverage(allValidScores.답변평가),
      총점수: calculateAverage([
        ...allValidScores.태도평가,
        ...allValidScores.답변평가
      ]) / 2  // 태도평가와 답변평가의 전체 평균
    };

    return NextResponse.json(averages, { status: 200 });

  } catch (error) {
    console.error('Error fetching global averages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global average data' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}