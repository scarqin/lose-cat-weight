"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { title } from "@/components/primitives";
import { Switch } from "@heroui/switch";

interface Cat {
  id: number;
  name: string;
  currentWeight: number;
  targetWeight: number;
  dryFoodCalories: number;
  wetFoodCalories: number;
}

interface WeightPlan {
  phase: string;
  weeks: number;
  weightTarget: number;
  dailyCalories: number;
  calorieRatio: number;
  dryFoodGrams: number;
  wetFoodCans: number;
  status: string;
  weightLossPercentage: number;
  exerciseRecommendations: string[];
}

export default function CatDietPlan() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [newCat, setNewCat] = useState({
    name: "",
    currentWeight: "",
    dryFoodCalories: "3.7",
    wetFoodCalories: "1.1"
  });
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [weightLossRate, setWeightLossRate] = useState(1.5); // Default 1.5% per week
  const [isInitialView, setIsInitialView] = useState(true);

  const addCat = () => {
    if (!newCat.currentWeight) return;
    
    const cat: Cat = {
      id: Date.now(),
      name: newCat.name || `猫咪${cats.length + 1}`, // Default name if not provided
      currentWeight: parseFloat(newCat.currentWeight),
      targetWeight: 5, // 理想体重都是5kg
      dryFoodCalories: parseFloat(newCat.dryFoodCalories || "3.7"),
      wetFoodCalories: parseFloat(newCat.wetFoodCalories || "1.1")
    };
    
    setCats([...cats, cat]);
    setNewCat({ name: "", currentWeight: "", dryFoodCalories: "3.7", wetFoodCalories: "1.1" });
    setIsInitialView(false);
    setSelectedCatId(cat.id);
  };

  const calculateWeightPlan = (cat: Cat): WeightPlan[] => {
    const baseCalories = cat.currentWeight * 30 + 80;
    const totalWeightLoss = cat.currentWeight - cat.targetWeight;
    const plan: WeightPlan[] = [];
    
    let currentWeight = cat.currentWeight;
    let currentRatio = 0.9;
    let week = 0;
    
    while (currentWeight > cat.targetWeight && week < 52) { // 最多52周
      // 使用用户设置的减重速度 (0.5-2%/周)
      const weeklyWeightLossPercentage = weightLossRate / 100;
      const weeklyWeightLoss = Math.min(currentWeight * weeklyWeightLossPercentage, totalWeightLoss);
      const targetWeight = Math.max(currentWeight - weeklyWeightLoss * 2, cat.targetWeight); // 2周为一个阶段
      const dailyCalories = baseCalories * currentRatio;
      
      // 计算干粮和湿粮分配（逐渐从纯干粮转为半干半湿）
      const monthsElapsed = week / 4;
      const wetFoodRatio = Math.min(monthsElapsed * 0.25, 0.5); // 4个月内逐渐增加到50%湿粮
      const dryFoodRatio = 1 - wetFoodRatio;
      
      const dryFoodCalories = dailyCalories * dryFoodRatio;
      const wetFoodCalories = dailyCalories * wetFoodRatio;
      
      const dryFoodGrams = dryFoodCalories / cat.dryFoodCalories;
      const wetFoodCans = wetFoodCalories / (cat.wetFoodCalories * 85); // 85g一罐
      
      let phase = "初期";
      if (currentRatio <= 0.8) phase = "中期";
      if (currentRatio <= 0.7) phase = "后期";
      
      let status = "肥胖";
      if (currentWeight <= cat.currentWeight * 0.9) status = "超重";
      if (currentWeight <= cat.targetWeight * 1.1) status = "接近理想";
      if (currentWeight <= cat.targetWeight) status = "理想体重";
      
      // 根据阶段和状态生成运动建议
      const exerciseRecommendations = generateExerciseRecommendations(phase, status, wetFoodRatio > 0);
      
      plan.push({
        phase,
        weeks: 2,
        weightTarget: Math.round(targetWeight * 10) / 10,
        dailyCalories: Math.round(dailyCalories),
        calorieRatio: currentRatio,
        dryFoodGrams: Math.round(dryFoodGrams),
        wetFoodCans: Math.round(wetFoodCans * 10) / 10,
        status,
        weightLossPercentage: weightLossRate,
        exerciseRecommendations
      });
      
      currentWeight = targetWeight;
      currentRatio = Math.max(currentRatio - 0.05, 0.7); // 每2周减少0.05，最低0.7
      week += 2;
      
      if (currentWeight <= cat.targetWeight) break;
    }
    
    return plan;
  };
  
  const generateExerciseRecommendations = (phase: string, status: string, hasWetFood: boolean): string[] => {
    const recommendations: string[] = [
      "每天定时定量喂食，分2-3次给予",
      "使用慢食碗或益智玩具增加进食时间",
      "每周称重记录，确保减重速度在安全范围内"
    ];
    
    // 基于阶段的建议
    if (phase === "初期") {
      recommendations.push(
        "开始时每天进行5-10分钟的轻度互动游戏",
        "使用逗猫棒引导猫咪进行短时间活动",
        "在猫咪活动区域放置猫爬架，鼓励垂直活动"
      );
    } else if (phase === "中期") {
      recommendations.push(
        "每天增加到15-20分钟的互动游戏时间",
        "尝试使用自动逗猫玩具增加活动量",
        "在不同房间放置食物，让猫咪需要走动觅食"
      );
    } else if (phase === "后期") {
      recommendations.push(
        "每天保持20-30分钟的分段互动游戏",
        "可以尝试使用猫咪跳台或障碍训练",
        "建立规律的游戏时间表，形成良好习惯"
      );
    }
    
    // 基于状态的建议
    if (status === "肥胖") {
      recommendations.push(
        "避免高强度运动，以防关节受伤",
        "使用漂浮玩具或激光笔进行低强度活动"
      );
    } else if (status === "超重") {
      recommendations.push(
        "可以尝试简单的追逐游戏",
        "使用猫草或猫薄荷增加活动兴趣"
      );
    } else {
      recommendations.push(
        "可以增加互动游戏的强度和频率",
        "尝试新的玩具和游戏方式保持兴趣"
      );
    }
    
    // 基于食物类型的建议
    if (hasWetFood) {
      recommendations.push("逐步增加湿粮比例，有助于增加饱腹感和水分摄入");
    }
    
    return recommendations;
  };

  const getWeightStatus = (currentWeight: number, targetWeight: number) => {
    const ratio = currentWeight / targetWeight;
    if (ratio >= 1.3) return { status: "肥胖", color: "bg-red-100 text-red-800", description: "腰部不明显，背部极度宽阔，肋骨被厚厚的脂肪覆盖，难以触摸到" };
    if (ratio >= 1.1) return { status: "超重", color: "bg-yellow-100 text-yellow-800", description: "腰部不明显，背部略微宽阔，肋骨被适度脂肪覆盖，不易触摸" };
    if (ratio >= 0.9) return { status: "理想体重", color: "bg-green-100 text-green-800", description: "腰部明显但不突出，肋骨被薄薄脂肪覆盖，容易触摸" };
    return { status: "体重不足", color: "bg-blue-100 text-blue-800", description: "腰部突出，肋骨几乎无脂肪覆盖，非常容易触摸" };
  };

  const selectedCat = cats.find(cat => cat.id === selectedCatId);
  const weightPlan = selectedCat ? calculateWeightPlan(selectedCat) : [];

  // 当有猫咪添加后，自动更新计划
  useEffect(() => {
    if (selectedCatId && cats.length > 0) {
      // 自动计算所选猫咪的减肥计划
      const selectedCat = cats.find(cat => cat.id === selectedCatId);
      if (selectedCat) {
        calculateWeightPlan(selectedCat);
      }
    }
  }, [selectedCatId, weightLossRate]);

  return (
    <div className="container px-4 py-8 mx-auto max-w-6xl">
      {isInitialView && (
        <div className="mb-8 text-center">
          <h1 className={title({ color: "violet" })}>🐱 老猫无痛减肥计划</h1>
          <p className="mt-4 text-lg text-gray-600">科学制定猫咪减肥计划，让爱猫健康瘦身</p>
        </div>
      )}

      {/* 初始视图 - 只显示体重输入 */}
      {isInitialView ? (
        <div className="p-6 mx-auto mb-8 max-w-md text-center rounded-lg shadow-lg">
          <h2 className="mb-6 text-xl font-bold">输入猫咪体重开始制定减肥计划</h2>
          <div className="mb-6">
            <Input
              label="猫咪体重 (kg)"
              placeholder="例如：7.5"
              type="number"
              step="0.1"
              size="lg"
              value={newCat.currentWeight}
              onChange={(e) => setNewCat({...newCat, currentWeight: e.target.value})}
              className="text-center"
            />
          </div>
          <Button color="primary" size="lg" onClick={addCat} className="w-full">
            开始制定减肥计划
          </Button>
        </div>
      ) : (
        <>
          {/* 添加猫咪表单 */}
          <div className="p-6 mb-8 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">添加猫咪信息</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">高级选项</span>
                <Switch 
                  isSelected={showAdvancedOptions}
                  onValueChange={setShowAdvancedOptions}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 lg:grid-cols-4">
              <Input
                label="猫咪名字"
                placeholder="输入猫咪名字"
                value={newCat.name}
                onChange={(e) => setNewCat({...newCat, name: e.target.value})}
              />
              <Input
                label="当前体重 (kg)"
                placeholder="例如：7.5"
                type="number"
                step="0.1"
                value={newCat.currentWeight}
                onChange={(e) => setNewCat({...newCat, currentWeight: e.target.value})}
              />
              {showAdvancedOptions && (
                <>
                  <Input
                    label="干粮热量 (卡/g)"
                    placeholder="默认3.7"
                    type="number"
                    step="0.1"
                    value={newCat.dryFoodCalories}
                    onChange={(e) => setNewCat({...newCat, dryFoodCalories: e.target.value})}
                  />
                  <Input
                    label="罐头热量 (卡/g)"
                    placeholder="默认1.1"
                    type="number"
                    step="0.1"
                    value={newCat.wetFoodCalories}
                    onChange={(e) => setNewCat({...newCat, wetFoodCalories: e.target.value})}
                  />
                </>
              )}
            </div>
            
            {showAdvancedOptions && (
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">每周减重速度 ({weightLossRate}%)</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  value={weightLossRate}
                  onChange={(e) => setWeightLossRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>0.5% (安全)</span>
                  <span>1.5% (推荐)</span>
                  <span>2% (最大)</span>
                </div>
              </div>
            )}
            
            <Button color="primary" onClick={addCat} className="w-full md:w-auto">
              添加猫咪
            </Button>
          </div>
        </>
      )}

      {/* 猫咪列表 */}
      {cats.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-3">
          {cats.map((cat) => {
            const weightStatus = getWeightStatus(cat.currentWeight, cat.targetWeight);
            return (
              <div 
                key={cat.id} 
                className={` rounded-lg shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl ${
                  selectedCatId === cat.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedCatId(cat.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold">{cat.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${weightStatus.color}`}>
                    {weightStatus.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  当前体重: {cat.currentWeight}kg → 目标体重: {cat.targetWeight}kg
                </p>
                <p className="text-sm text-gray-600">
                  需减重: {(cat.currentWeight - cat.targetWeight).toFixed(1)}kg
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* 猫咪体重状态表格 */}
      {selectedCat && (
        <div className="overflow-x-auto p-6 mb-8 rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl font-bold">猫咪体重状态参考表</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left border">体重不足</th>
                <th className="p-3 text-left border">理想体重</th>
                <th className="p-3 text-left border">超重</th>
                <th className="p-3 text-left border">肥胖</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 align-top border">
                  <div className="flex flex-col items-center mb-2">
                    <svg width="80" height="50" viewBox="0 0 100 60" className="mb-2">
                      <path d="M20,30 Q25,20 35,25 Q45,15 55,25 Q65,15 75,25 Q85,20 90,30 Q95,40 90,45 L85,50 Q80,55 75,50 L70,45 Q65,40 60,45 L55,50 Q50,55 45,50 L40,45 Q35,40 30,45 L25,50 Q20,55 15,50 L10,45 Q5,40 10,30 Z" fill="#FFD580" stroke="#000" strokeWidth="1" />
                      <ellipse cx="35" cy="30" rx="3" ry="5" fill="#000" />
                      <ellipse cx="65" cy="30" rx="3" ry="5" fill="#000" />
                      <path d="M45,35 Q50,40 55,35" stroke="#000" strokeWidth="1" fill="none" />
                      <path d="M10,30 L5,15" stroke="#000" strokeWidth="1" fill="none" />
                      <path d="M90,30 L95,15" stroke="#000" strokeWidth="1" fill="none" />
                    </svg>
                    <span className="text-sm font-medium">体重不足</span>
                  </div>
                </td>
                <td className="p-3 align-top border">
                  <div className="flex flex-col items-center mb-2">
                    <svg width="80" height="50" viewBox="0 0 100 60" className="mb-2">
                      <path d="M20,30 Q25,20 35,25 Q45,15 55,25 Q65,15 75,25 Q85,20 90,30 Q95,40 90,45 L85,50 Q80,55 75,50 L70,45 Q65,40 60,45 L55,50 Q50,55 45,50 L40,45 Q35,40 30,45 L25,50 Q20,55 15,50 L10,45 Q5,40 10,30 Z" fill="#FFD580" stroke="#000" strokeWidth="1" />
                      <ellipse cx="35" cy="30" rx="3" ry="5" fill="#000" />
                      <ellipse cx="65" cy="30" rx="3" ry="5" fill="#000" />
                      <path d="M45,35 Q50,40 55,35" stroke="#000" strokeWidth="1" fill="none" />
                      <path d="M10,30 L5,15" stroke="#000" strokeWidth="1" fill="none" />
                      <path d="M90,30 L95,15" stroke="#000" strokeWidth="1" fill="none" />
                    </svg>
                    <span className="text-sm font-medium">理想体重</span>
                  </div>
                </td>
                <td className="p-3 align-top border">
                  <div className="flex flex-col items-center mb-2">
                    <svg width="80" height="50" viewBox="0 0 100 60" className="mb-2">
                      <path d="M15,30 Q20,15 35,20 Q45,10 55,20 Q65,10 75,20 Q90,15 95,30 Q100,45 95,50 L90,55 Q85,60 80,55 L75,50 Q70,45 65,50 L60,55 Q55,60 50,55 L45,50 Q40,45 35,50 L30,55 Q25,60 20,55 L15,50 Q10,45 15,30 Z" fill="#FFD580" stroke="#000" strokeWidth="1" />
                      <ellipse cx="35" cy="30" rx="3" ry="5" fill="#000" />
                      <ellipse cx="65" cy="30" rx="3" ry="5" fill="#000" />
                      <path d="M45,38 Q50,43 55,38" stroke="#000" strokeWidth="1" fill="none" />
                      <path d="M15,30 L10,15" stroke="#000" strokeWidth="1" fill="none" />
                      <path d="M95,30 L100,15" stroke="#000" strokeWidth="1" fill="none" />
                    </svg>
                    <span className="text-sm font-medium">超重</span>
                  </div>
                </td>
                <td className="p-3 align-top border">
                  <div className="flex flex-col items-center mb-2">
                    <svg width="80" height="50" viewBox="0 0 100 60" className="mb-2">
                      <path d="M10,30 Q15,10 35,15 Q45,5 55,15 Q65,5 75,15 Q95,10 100,30 Q105,50 100,55 L95,60 Q90,65 85,60 L80,55 Q75,50 70,55 L65,60 Q60,65 55,60 L50,55 Q45,50 40,55 L35,60 Q30,65 25,60 L20,55 Q15,50 10,30 Z" fill="#FFD580" stroke="#000" strokeWidth="1" />
                      <ellipse cx="35" cy="30" rx="3" ry="5" fill="#000" />
                      <ellipse cx="65" cy="30" rx="3" ry="5" fill="#000" />
                      <path d="M45,40 Q50,45 55,40" stroke="#000" strokeWidth="1" fill="none" />
                      <path d="M10,30 L5,15" stroke="#000" strokeWidth="1" fill="none" />
                      <path d="M100,30 L105,15" stroke="#000" strokeWidth="1" fill="none" />
                    </svg>
                    <span className="text-sm font-medium">肥胖</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-3 border">
                  <p className="mb-1 font-medium">肋骨</p>
                  <p className="text-sm">肋骨清晰可见，几乎无脂肪覆盖</p>
                </td>
                <td className="p-3 border">
                  <p className="mb-1 font-medium">肋骨</p>
                  <p className="text-sm">肋骨被薄薄脂肪覆盖，容易触摸</p>
                </td>
                <td className="p-3 border">
                  <p className="mb-1 font-medium">肋骨</p>
                  <p className="text-sm">肋骨被适度脂肪覆盖，不易触摸</p>
                </td>
                <td className="p-3 border">
                  <p className="mb-1 font-medium">肋骨</p>
                  <p className="text-sm">肋骨被厚厚的脂肪覆盖，难以触摸到</p>
                </td>
              </tr>
              <tr>
                <td className="p-3 border">
                  <p className="mb-1 font-medium">从上方观察</p>
                  <p className="text-sm">腰部突出明显</p>
                </td>
                <td className="p-3 border">
                  <p className="mb-1 font-medium">从上方观察</p>
                  <p className="text-sm">腰部明显但不突出</p>
                </td>
                <td className="p-3 border">
                  <p className="mb-1 font-medium">从上方观察</p>
                  <p className="text-sm">腰部不明显，背部略微宽阔</p>
                </td>
                <td className="p-3 border">
                  <p className="mb-1 font-medium">从上方观察</p>
                  <p className="text-sm">腰部不明显，背部极度宽阔</p>
                </td>
              </tr>
              <tr>
                <td className="p-3 border">
                  <p className="mb-1 font-medium">从侧面观察</p>
                  <p className="text-sm">腹部凹陷明显，几乎无腹部脂肪</p>
                </td>
                <td className="p-3 border">
                  <p className="mb-1 font-medium">从侧面观察</p>
                  <p className="text-sm">腹部轮廓明显，有轻微腹部脂肪</p>
                </td>
                <td className="p-3 border">
                  <p className="mb-1 font-medium">从侧面观察</p>
                  <p className="text-sm">腹部轮廓不明显，脂肪可能覆盖尾巴根部</p>
                </td>
                <td className="p-3 border">
                  <p className="mb-1 font-medium">从侧面观察</p>
                  <p className="text-sm">腹部圆润突出，厚脂肪覆盖尾巴根部</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 减肥计划详情 - 表格布局 */}
      {selectedCat && weightPlan.length > 0 && (
        <div className="overflow-x-auto p-6 rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl font-bold">{selectedCat.name} 的减肥计划</h2>
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border">阶段</th>
                <th className="p-3 border">周数</th>
                <th className="p-3 border">目标体重</th>
                <th className="p-3 border">每日热量</th>
                <th className="p-3 border">干粮 (g)</th>
                <th className="p-3 border">罐头 (罐)</th>
                <th className="p-3 border">体重状态</th>
                <th className="p-3 border">建议</th>
              </tr>
            </thead>
            <tbody>
              {weightPlan.map((phase, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-3 font-medium border">{phase.phase}</td>
                  <td className="p-3 text-center border">{index * 2 + 1}-{index * 2 + 2}</td>
                  <td className="p-3 font-medium text-center text-blue-600 border">{phase.weightTarget} kg</td>
                  <td className="p-3 border">
                    <div className="text-center">
                      <div className="font-medium text-green-600">{phase.dailyCalories} 卡</div>
                      <div className="text-xs text-gray-500">({(phase.calorieRatio * 100).toFixed(0)}% 基础热量)</div>
                    </div>
                  </td>
                  <td className="p-3 font-medium text-center text-orange-600 border">{phase.dryFoodGrams}</td>
                  <td className="p-3 border">
                    <div className="text-center">
                      <div className="font-medium text-purple-600">{phase.wetFoodCans}</div>
                      <div className="text-xs text-gray-500">(85g/罐)</div>
                    </div>
                  </td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      phase.status === '肥胖' ? 'bg-red-100 text-red-800' :
                      phase.status === '超重' ? 'bg-yellow-100 text-yellow-800' :
                      phase.status === '接近理想' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {phase.status}
                    </span>
                  </td>
                  <td className="p-3 border">
                    <details className="text-sm">
                      <summary className="text-blue-600 cursor-pointer hover:text-blue-800">查看建议</summary>
                      <ul className="pl-4 mt-2 space-y-1 text-gray-700">
                        {phase.exerciseRecommendations.slice(0, 3).map((recommendation, idx) => (
                          <li key={idx}>• {recommendation}</li>
                        ))}
                      </ul>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-4 mt-6 bg-green-50 rounded-lg">
            <h3 className="mb-2 font-bold text-green-800">🎯 减肥成功指标</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ul className="space-y-1 text-sm text-green-700">
                <li>• 当前减重速度：每周{weightLossRate}%体重</li>
                <li>• 总计划时长：约 {weightPlan.length * 2} 周</li>
              </ul>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• 最终目标：达到 {selectedCat.targetWeight}kg 理想体重</li>
                <li>• 重要提醒：如减重过快或猫咪出现异常，请及时咨询兽医</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {cats.length === 0 && !isInitialView && (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">🐱</div>
          <p className="text-lg text-gray-500">请先添加猫咪信息开始制定减肥计划</p>
        </div>
      )}
    </div>
  );
}
