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
    if (ratio >= 1.3) return { status: "肥胖", color: "bg-red-100 text-red-800" };
    if (ratio >= 1.1) return { status: "超重", color: "bg-yellow-100 text-yellow-800" };
    return { status: "理想体重", color: "bg-green-100 text-green-800" };
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
      <div className="mb-8 text-center">
        <h1 className={title({ color: "violet" })}>🐱 老猫无痛减肥计划</h1>
        <p className="mt-4 text-lg text-gray-600">科学制定猫咪减肥计划，让爱猫健康瘦身</p>
      </div>

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

      {/* 减肥计划详情 */}
      {selectedCat && weightPlan.length > 0 && (
        <div className="p-6 rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl font-bold">{selectedCat.name} 的减肥计划</h2>
          <div className="space-y-6">
            {weightPlan.map((phase, index) => (
              <div key={index} className="pl-4 border-l-4 border-blue-500">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">
                      第 {index * 2 + 1}-{index * 2 + 2} 周 ({phase.phase})
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      phase.status === '肥胖' ? 'bg-red-100 text-red-800' :
                      phase.status === '超重' ? 'bg-yellow-100 text-yellow-800' :
                      phase.status === '接近理想' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {phase.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-3 text-center rounded">
                      <p className="text-sm text-gray-600">目标体重</p>
                      <p className="text-xl font-bold text-blue-600">{phase.weightTarget} kg</p>
                    </div>
                    <div className="p-3 text-center rounded">
                      <p className="text-sm text-gray-600">每日热量</p>
                      <p className="text-xl font-bold text-green-600">{phase.dailyCalories} 卡</p>
                      <p className="text-xs text-gray-500">({(phase.calorieRatio * 100).toFixed(0)}% 基础热量)</p>
                    </div>
                    <div className="p-3 text-center rounded">
                      <p className="text-sm text-gray-600">干粮</p>
                      <p className="text-xl font-bold text-orange-600">{phase.dryFoodGrams} g</p>
                    </div>
                    <div className="p-3 text-center rounded">
                      <p className="text-sm text-gray-600">罐头</p>
                      <p className="text-xl font-bold text-purple-600">{phase.wetFoodCans} 罐</p>
                      <p className="text-xs text-gray-500">(85g/罐)</p>
                    </div>
                  </div>
                  
                  <div className="p-3 mt-4 bg-blue-50 rounded">
                    <h4 className="mb-2 font-semibold text-blue-800">💡 本阶段建议</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      {phase.exerciseRecommendations.map((recommendation, idx) => (
                        <li key={idx}>• {recommendation}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
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
