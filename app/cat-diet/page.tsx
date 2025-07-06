"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { title } from "@/components/primitives";

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

  const addCat = () => {
    if (!newCat.name || !newCat.currentWeight) return;
    
    const cat: Cat = {
      id: Date.now(),
      name: newCat.name,
      currentWeight: parseFloat(newCat.currentWeight),
      targetWeight: 5, // 理想体重都是5kg
      dryFoodCalories: parseFloat(newCat.dryFoodCalories),
      wetFoodCalories: parseFloat(newCat.wetFoodCalories)
    };
    
    setCats([...cats, cat]);
    setNewCat({ name: "", currentWeight: "", dryFoodCalories: "3.7", wetFoodCalories: "1.1" });
  };

  const calculateWeightPlan = (cat: Cat): WeightPlan[] => {
    const baseCalories = cat.currentWeight * 30 + 80;
    const totalWeightLoss = cat.currentWeight - cat.targetWeight;
    const plan: WeightPlan[] = [];
    
    let currentWeight = cat.currentWeight;
    let currentRatio = 0.9;
    let week = 0;
    
    while (currentWeight > cat.targetWeight && week < 52) { // 最多52周
      const weeklyWeightLoss = Math.min(currentWeight * 0.015, totalWeightLoss); // 1.5%/周的安全减重速度
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
      
      plan.push({
        phase,
        weeks: 2,
        weightTarget: Math.round(targetWeight * 10) / 10,
        dailyCalories: Math.round(dailyCalories),
        calorieRatio: currentRatio,
        dryFoodGrams: Math.round(dryFoodGrams),
        wetFoodCans: Math.round(wetFoodCans * 10) / 10,
        status
      });
      
      currentWeight = targetWeight;
      currentRatio = Math.max(currentRatio - 0.05, 0.7); // 每2周减少0.05，最低0.7
      week += 2;
      
      if (currentWeight <= cat.targetWeight) break;
    }
    
    return plan;
  };

  const getWeightStatus = (currentWeight: number, targetWeight: number) => {
    const ratio = currentWeight / targetWeight;
    if (ratio >= 1.3) return { status: "肥胖", color: "bg-red-100 text-red-800" };
    if (ratio >= 1.1) return { status: "超重", color: "bg-yellow-100 text-yellow-800" };
    return { status: "理想体重", color: "bg-green-100 text-green-800" };
  };

  const selectedCat = cats.find(cat => cat.id === selectedCatId);
  const weightPlan = selectedCat ? calculateWeightPlan(selectedCat) : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className={title({ color: "violet" })}>🐱 老猫无痛减肥计划</h1>
        <p className="text-lg text-gray-600 mt-4">科学制定猫咪减肥计划，让爱猫健康瘦身</p>
      </div>

      {/* 添加猫咪表单 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">添加猫咪信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
        </div>
        <Button color="primary" onClick={addCat} className="w-full md:w-auto">
          添加猫咪
        </Button>
      </div>

      {/* 猫咪列表 */}
      {cats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {cats.map((cat) => {
            const weightStatus = getWeightStatus(cat.currentWeight, cat.targetWeight);
            return (
              <div 
                key={cat.id} 
                className={`bg-white rounded-lg shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl ${
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
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">{selectedCat.name} 的减肥计划</h2>
          <div className="space-y-6">
            {weightPlan.map((phase, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="bg-gray-50 p-4 rounded-lg">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded">
                      <p className="text-sm text-gray-600">目标体重</p>
                      <p className="text-xl font-bold text-blue-600">{phase.weightTarget} kg</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded">
                      <p className="text-sm text-gray-600">每日热量</p>
                      <p className="text-xl font-bold text-green-600">{phase.dailyCalories} 卡</p>
                      <p className="text-xs text-gray-500">({(phase.calorieRatio * 100).toFixed(0)}% 基础热量)</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded">
                      <p className="text-sm text-gray-600">干粮</p>
                      <p className="text-xl font-bold text-orange-600">{phase.dryFoodGrams} g</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded">
                      <p className="text-sm text-gray-600">罐头</p>
                      <p className="text-xl font-bold text-purple-600">{phase.wetFoodCans} 罐</p>
                      <p className="text-xs text-gray-500">(85g/罐)</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 本阶段建议</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 每天定时定量喂食，分2-3次给予</li>
                      <li>• 增加互动游戏时间，每天至少15-20分钟</li>
                      <li>• 使用慢食碗或益智玩具增加进食时间</li>
                      <li>• 每周称重记录，确保减重速度在安全范围内</li>
                      {phase.wetFoodCans > 0 && (
                        <li>• 逐步增加湿粮比例，有助于增加饱腹感和水分摄入</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-bold text-green-800 mb-2">🎯 减肥成功指标</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 理想减重速度：每周0.5-2%体重</li>
                <li>• 总计划时长：约 {weightPlan.length * 2} 周</li>
              </ul>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 最终目标：达到 {selectedCat.targetWeight}kg 理想体重</li>
                <li>• 重要提醒：如减重过快或猫咪出现异常，请及时咨询兽医</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {cats.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🐱</div>
          <p className="text-gray-500 text-lg">请先添加猫咪信息开始制定减肥计划</p>
        </div>
      )}
    </div>
  );
}
