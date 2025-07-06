import React from 'react';
import {
  WEIGHT_MULTIPLIER,
  BASE_CALORIE_CONSTANT,
  INITIAL_PHASE_RATIO,
  MIDDLE_PHASE_RATIO,
  FINAL_PHASE_RATIO,
  MIN_WEEKLY_WEIGHT_LOSS_PERCENTAGE,
  MAX_WEEKLY_WEIGHT_LOSS_PERCENTAGE,
  calculateBaseCalories
} from '../constants/dietConstants';

interface WeightLossGuideProps {
  currentWeight: number;
  initialWeightChange?: number;
  middleWeightChange?: number;
  finalWeightChange?: number;
  targetWeight?: number;
}

const WeightLossGuide: React.FC<WeightLossGuideProps> = ({ 
  currentWeight,
  initialWeightChange,
  middleWeightChange,
  finalWeightChange,
  targetWeight
}) => {
  // 计算猫咪所需热量和减肥阶段热量
  const baseCalories = Math.round(calculateBaseCalories(currentWeight));
  const initialPhaseCalories = Math.round(baseCalories * INITIAL_PHASE_RATIO);
  const middlePhaseCalories = Math.round(baseCalories * MIDDLE_PHASE_RATIO);
  const finalPhaseCalories = Math.round(baseCalories * FINAL_PHASE_RATIO);
  
  // 计算理想减重范围（每周0.5-2%）
  const minWeeklyLoss = Math.round(currentWeight * 1000 * MIN_WEEKLY_WEIGHT_LOSS_PERCENTAGE / 100);
  const maxWeeklyLoss = Math.round(currentWeight * 1000 * MAX_WEEKLY_WEIGHT_LOSS_PERCENTAGE / 100);
  
  // 如果没有提供体重变化数据，则计算理想的体重变化值
  const calculatedInitialWeightChange = initialWeightChange !== undefined ? initialWeightChange : Math.round((minWeeklyLoss + maxWeeklyLoss) / 2);
  const calculatedMiddleWeightChange = middleWeightChange !== undefined ? middleWeightChange : Math.round((minWeeklyLoss + maxWeeklyLoss) / 2);
  const calculatedFinalWeightChange = finalWeightChange !== undefined ? finalWeightChange : Math.round((minWeeklyLoss + maxWeeklyLoss) / 2);
  
  return (
    <div className="p-6 mt-8 bg-gray-50 rounded-xl shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-700">科学减肥指南</h2>
      
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {/* 第一部分: 科学能量计算 */}
        <div className="flex flex-col p-6 h-full bg-white rounded-lg border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center mb-4">
            <div className="p-3 mr-4 bg-blue-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">科学能量计算</h3>
          </div>
          
          <div className="flex-grow">
            <div className="p-4 mb-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="mb-2 font-medium text-blue-800">基础代谢需求</h4>
              <p className="text-sm text-gray-700">基础代谢公式：<span className="font-medium">体重(kg) × {WEIGHT_MULTIPLIER} + {BASE_CALORIE_CONSTANT}</span></p>
              <p className="mt-2 text-sm">你的猪咪 <span className="font-medium text-blue-700">{currentWeight}</span> kg，需 <span className="font-medium text-blue-700">{baseCalories}</span> Kcal/天</p>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">减肥初期摄入量</span>
                  <span className="font-medium text-blue-700">{initialPhaseCalories} Kcal</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">基础代谢的 {INITIAL_PHASE_RATIO * 100}%</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">减肥中期摄入量</span>
                  <span className="font-medium text-blue-700">{middlePhaseCalories} Kcal</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">基础代谢的 {MIDDLE_PHASE_RATIO * 100}%</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">减肥后期摄入量</span>
                  <span className="font-medium text-blue-700">{finalPhaseCalories} Kcal</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">基础代谢的 {FINAL_PHASE_RATIO * 100}%</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 第二部分: 减重进度监控 */}
        <div className="flex flex-col p-6 h-full bg-white rounded-lg border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center mb-4">
            <div className="p-3 mr-4 bg-green-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">减重进度监控</h3>
          </div>
          
          <div className="flex-grow">
            <div className="p-4 mb-4 bg-green-50 rounded-lg border border-green-100">
              <h4 className="mb-2 font-medium text-green-800">科学减重速率</h4>
              <p className="text-sm text-gray-700">每周减少当前体重的<span className="font-medium"> {MIN_WEEKLY_WEIGHT_LOSS_PERCENTAGE}-{MAX_WEEKLY_WEIGHT_LOSS_PERCENTAGE}%</span></p>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">初期体重变化</span>
                  <span className="font-medium text-green-700">{calculatedInitialWeightChange} g</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.max(0, (calculatedInitialWeightChange / maxWeeklyLoss) * 100))}%` }}></div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">中期体重变化</span>
                  <span className="font-medium text-green-700">{calculatedMiddleWeightChange} g</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.max(0, (calculatedMiddleWeightChange / maxWeeklyLoss) * 100))}%` }}></div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">后期体重变化</span>
                  <span className="font-medium text-green-700">{calculatedFinalWeightChange} g</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.max(0, (calculatedFinalWeightChange / maxWeeklyLoss) * 100))}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 第三部分: 营养与活动指南 */}
        <div className="flex flex-col p-6 h-full bg-white rounded-lg border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center mb-4">
            <div className="p-3 mr-4 bg-amber-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">营养与活动指南</h3>
          </div>
          
          <div className="flex-grow">
            <div className="p-4 mb-4 bg-amber-50 rounded-lg border border-amber-100">
              <h4 className="mb-2 font-medium text-amber-800">食物能量密度</h4>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">干粮能量密度</span>
                <span className="font-medium text-amber-700">3.5-4 Kcal/g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">湿粮能量密度</span>
                <span className="font-medium text-amber-700">约 1.1 Kcal/g</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">建议逐步从纯干粮过渡到干湿混合喂养</p>
            </div>
            
            <div className="mb-4">
              <h4 className="mb-2 font-medium text-gray-800">活动建议</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <svg className="w-4 h-4 mt-0.5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>每日定时互动游戏，每次 10-15 分钟，每天 2-3 次</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 mt-0.5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>使用智能喂食器或拼图喂食器延长进食时间</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 mt-0.5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>增加垂直空间，鼓励猫咪攀爬活动</span>
                </li>
              </ul>
            </div>
            
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <h4 className="flex items-center text-sm font-medium text-red-800">
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                注意事项
              </h4>
              <p className="mt-1 text-xs text-gray-700">如猫咪出现食欲不振、活力下降或体重减轻过快，请立即咨询兽医</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightLossGuide;
