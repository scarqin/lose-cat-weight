"use client";

import { useState, useEffect } from "react";
import {
  WEIGHT_MULTIPLIER,
  BASE_CALORIE_CONSTANT,
  INITIAL_PHASE_RATIO,
  MIDDLE_PHASE_RATIO,
  FINAL_PHASE_RATIO,
  DEFAULT_DRY_FOOD_CALORIES,
  DEFAULT_WET_FOOD_CALORIES,
  MAX_PLAN_WEEKS,
  PHASE_DURATION_WEEKS,
  PHASE_RATIO_DECREASE,
  WET_FOOD_PACKAGE_SIZE,
  MAX_WET_FOOD_RATIO,
  MONTHS_TO_TRANSITION,
  MONTHLY_WET_FOOD_INCREASE,
  WEIGHT_STATUS,
  WEIGHT_PHASE,
  OVERWEIGHT_THRESHOLD,
  NEAR_IDEAL_THRESHOLD,
  calculateBaseCalories
} from "../../constants/dietConstants";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import CatWeightChart from "../../components/CatWeightChart";
import { title } from "@/components/primitives";
import WeightLossGuide from "@/components/WeightLossGuide";

interface Cat {
  id: number;
  name: string;
  currentWeight: number;
  targetWeight: number;
  dryFoodCalories: number;
  wetFoodCalories: number;
}

export interface WeightPlan {
  phase: string;
  weeks: number;
  date: Date; // 阶段开始日期
  endDate: Date; // 阶段结束日期
  weightTarget: number;
  dailyCalories: number;
  calorieRatio: number;
  dryFoodGrams: number;
  wetFoodGrams: number; // 改为克数而不是罐数
  status: string;
  weightLossPercentage: number;
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
      name: newCat.name || `Meow`, // Default name if not provided
      currentWeight: parseFloat(newCat.currentWeight),
      targetWeight: 5, // 理想体重都是5kg
      dryFoodCalories: parseFloat(newCat.dryFoodCalories || DEFAULT_DRY_FOOD_CALORIES.toString()),
      wetFoodCalories: parseFloat(newCat.wetFoodCalories || DEFAULT_WET_FOOD_CALORIES.toString())
    };
    
    setCats([...cats, cat]);
    setNewCat({ name: "", currentWeight: "", dryFoodCalories: DEFAULT_DRY_FOOD_CALORIES.toString(), wetFoodCalories: DEFAULT_WET_FOOD_CALORIES.toString() });
    setIsInitialView(false);
    setSelectedCatId(cat.id);
  };

  const calculateWeightPlan = (cat: Cat): WeightPlan[] => {
    const baseCalories = calculateBaseCalories(cat.currentWeight);
    const totalWeightLoss = cat.currentWeight - cat.targetWeight;
    const plan: WeightPlan[] = [];
    
    let currentWeight = cat.currentWeight;
    let currentRatio = INITIAL_PHASE_RATIO;
    let week = 0;
    let currentDate = new Date(); // 从今天开始
    
    while (currentWeight > cat.targetWeight && week < MAX_PLAN_WEEKS) { // 最多52周
      // 使用用户设置的减重速度 (0.5-2%/周)
      const weeklyWeightLossPercentage = weightLossRate / 100;
      const weeklyWeightLoss = Math.min(currentWeight * weeklyWeightLossPercentage, totalWeightLoss);
      const targetWeight = Math.max(currentWeight - weeklyWeightLoss * PHASE_DURATION_WEEKS, cat.targetWeight); // 2周为一个阶段
      const dailyCalories = baseCalories * currentRatio;
      
      // 计算干粮和湿粮分配（逐渐从纯干粮转为半干半湿）
      const monthsElapsed = week / 4;
      const wetFoodRatio = Math.min(monthsElapsed * MONTHLY_WET_FOOD_INCREASE, MAX_WET_FOOD_RATIO); // 4个月内逐渐增加到50%湿粮
      const dryFoodRatio = 1 - wetFoodRatio;
      
      const dryFoodCaloriesPlan = dailyCalories * dryFoodRatio;
      const wetFoodCaloriesPlan = dailyCalories * wetFoodRatio;
      
      // 直接计算湿粮克数，而不是罐数
      let wetFoodGrams = wetFoodCaloriesPlan / cat.wetFoodCalories;
      // 将湿粮克数调整为标准包装规格的整数倍
      wetFoodGrams = Math.floor(wetFoodGrams / WET_FOOD_PACKAGE_SIZE) * WET_FOOD_PACKAGE_SIZE;
      // 如果有剩余热量，分配给干粮
      const remainingWetCalories = (wetFoodCaloriesPlan - wetFoodGrams * cat.wetFoodCalories);
      const dryFoodGrams = (dryFoodCaloriesPlan + remainingWetCalories) / cat.dryFoodCalories;
      
      let phase = WEIGHT_PHASE.INITIAL;
      if (currentRatio <= MIDDLE_PHASE_RATIO) phase = WEIGHT_PHASE.MIDDLE;
      if (currentRatio <= FINAL_PHASE_RATIO) phase = WEIGHT_PHASE.FINAL;
      
      let status = WEIGHT_STATUS.OBESE;
      if (currentWeight <= cat.currentWeight * OVERWEIGHT_THRESHOLD) status = WEIGHT_STATUS.OVERWEIGHT;
      if (currentWeight <= cat.targetWeight * NEAR_IDEAL_THRESHOLD) status = WEIGHT_STATUS.NEAR_IDEAL;
      if (currentWeight <= cat.targetWeight) status = WEIGHT_STATUS.IDEAL;
      
      
      // 计算当前阶段的结束日期
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + (PHASE_DURATION_WEEKS * 7)); // 两周后的日期
      
      plan.push({
        phase,
        weeks: PHASE_DURATION_WEEKS,
        date: new Date(currentDate), // 保存当前阶段的开始日期
        endDate: new Date(endDate), // 保存当前阶段的结束日期
        weightTarget: Math.round(targetWeight * 10) / 10,
        dailyCalories: Math.round(dailyCalories),
        calorieRatio: currentRatio,
        dryFoodGrams: Math.round(dryFoodGrams),
        wetFoodGrams: wetFoodGrams, // 使用整数克数，如85g, 170g等
        status,
        weightLossPercentage: weightLossRate,
      });
      
      currentWeight = targetWeight;
      currentRatio = Math.max(currentRatio - PHASE_RATIO_DECREASE, FINAL_PHASE_RATIO); // 每2周减少0.05，最低0.7
      week += PHASE_DURATION_WEEKS;
      currentDate = new Date(endDate); // 更新当前日期为上一阶段的结束日期
      
      if (currentWeight <= cat.targetWeight) break;
    }
    
    return plan;
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
    <div className="container px-4 mx-auto max-w-6xl">
      {isInitialView && (
        <div className="my-8 text-center">
          <h1 className={title({ color: "violet" })}>🐱 老猫无痛减肥</h1>
          <p className="mt-4 text-lg text-gray-600">科学制定减肥计划，一起守护老年猪咪</p>
        </div>
      )}

      {/* 初始视图 - 只显示体重输入 */}
      {isInitialView ? (
        <div className="p-6 mx-auto mb-8 max-w-md text-center rounded-lg shadow-lg">
          <h2 className="mb-6 text-xl font-bold">输入猫咪体重</h2>
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
            开始
          </Button>
        </div>
      ) : (
        <>
        </>
      )}

    

      {/* 减肥计划详情 - 表格布局 */}
      {selectedCat && weightPlan.length > 0 && (
        <div className="overflow-x-auto p-6 rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl font-bold">{selectedCat.name} 的减肥计划</h2>
          {/* 减肥计划可视化图表 */}
          <CatWeightChart 
            weightPlans={weightPlan} 
            currentWeight={selectedCat.currentWeight} 
            targetWeight={selectedCat.targetWeight} 
          />
        </div>
      )}
      {selectedCat && <WeightLossGuide currentWeight={selectedCat.currentWeight} />}

      {cats.length === 0 && !isInitialView && (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">🐱</div>
          <p className="text-lg text-gray-500">请先添加猫咪信息开始制定减肥计划</p>
        </div>
      )}
    </div>
  );
}
