import React from 'react';

interface WeightLossGuideProps {
  currentWeight: number;
  initialWeightChange?: number;
  middleWeightChange?: number;
  finalWeightChange?: number;
}

const WeightLossGuide: React.FC<WeightLossGuideProps> = ({ 
  currentWeight,
  initialWeightChange = 0,
  middleWeightChange = 0,
  finalWeightChange = 0
}) => {
  // 计算猫咪所需热量和减肥阶段热量
  const baseCalories = Math.round(currentWeight * 30 + 80);
  const initialPhaseCalories = Math.round(baseCalories * 0.9);
  const middlePhaseCalories = Math.round(baseCalories * 0.8);
  const finalPhaseCalories = Math.round(baseCalories * 0.7);
  
  return (
    <div className="p-6 mt-8 bg-gray-50 rounded-xl shadow-md">
      <h2 className="mb-6 text-xl font-bold text-center text-gray-700">减肥指南</h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* 卡片1: 猫咪所需热量 */}
        <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center mb-3">
            <div className="p-2 mr-3 bg-red-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800">猫咪所需热量</h3>
          </div>
          <p className="mb-3 text-sm text-gray-600">猫咪所需热量（Kcal）是体重 kg*30+80</p>
          <div className="p-3 mt-2 bg-gray-50 rounded-lg">
            <p className="text-sm">您的猫咪是 <span className="font-medium text-red-600">{Math.round(currentWeight * 1000)}</span> g，所以所需热量是 <span className="font-medium text-red-600">{baseCalories}</span> Kcal。</p>
            <div className="mt-2 space-y-1 text-sm">
              <p>减肥初期摄入是每日热量 <span className="font-medium">{baseCalories}*0.9={initialPhaseCalories}</span> Kcal</p>
              <p>中期是 <span className="font-medium">{baseCalories}*0.8={middlePhaseCalories}</span> Kcal</p>
              <p>后期是每日 <span className="font-medium">{baseCalories}*0.7={finalPhaseCalories}</span> Kcal</p>
            </div>
          </div>
        </div>
        
        {/* 卡片2: 理想的减肥速度 */}
        <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center mb-3">
            <div className="p-2 mr-3 bg-blue-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800">理想的减肥速度</h3>
          </div>
          <p className="mb-3 text-sm text-gray-600">理想的减肥速度是 0.5-2%/周</p>
          <div className="p-3 mt-2 bg-gray-50 rounded-lg">
            <div className="space-y-1 text-sm">
              <p>初期体重变化 <span className="font-medium text-blue-600">{initialWeightChange}</span> g</p>
              <p>中期体重变化 <span className="font-medium text-blue-600">{middleWeightChange}</span> g</p>
              <p>后期体重变化 <span className="font-medium text-blue-600">{finalWeightChange}</span> g</p>
            </div>
          </div>
        </div>
        
        {/* 卡片3: 食物热量 */}
        <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center mb-3">
            <div className="p-2 mr-3 bg-yellow-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800">食物热量</h3>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              干粮约 <span className="font-medium">3.5-4</span> Kcal/g
            </p>
            <p className="mt-1 text-sm text-gray-600">
              罐头约 <span className="font-medium">1.1</span> Kcal/g
            </p>
            <p className="mt-3 text-xs text-gray-500">
              具体数据可查看干粮包装袋，罐头罐身
            </p>
          </div>
        </div>
        
        {/* 卡片4: 引导运动 */}
        <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center mb-3">
            <div className="p-2 mr-3 bg-green-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800">引导运动</h3>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <ol className="pl-5 space-y-2 text-sm list-decimal text-gray-600">
              <li>每晚遛弯10-15分钟（她是自愿出门的）</li>
              <li>增加陪玩次数，用逗猫棒或其他玩具引导猫咪运动</li>
              <li>增加梳毛次数，加速新陈代谢</li>
            </ol>
            <p className="mt-3 text-xs text-gray-500">（ps：关节炎猫咪不可以爬楼梯）</p>
          </div>
        </div>
        
        {/* 卡片5: 注意事项 */}
        <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center mb-3">
            <div className="p-2 mr-3 bg-purple-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800">注意事项</h3>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              如减重过快或猫咪出现异常，请及时咨询兽医
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightLossGuide;
