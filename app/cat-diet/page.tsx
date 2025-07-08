"use client";

import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/context/i18nContext";
import html2canvas from "html2canvas";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";

import {
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
  MONTHLY_WET_FOOD_INCREASE,
  WEIGHT_STATUS,
  WEIGHT_PHASE,
  OVERWEIGHT_THRESHOLD,
  NEAR_IDEAL_THRESHOLD,
  calculateBaseCalories,
} from "../../constants/dietConstants";
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
  weightChangeGramsPerWeek: number; // 体重变化 g/周
}

export default function CatDietPlan() {
  const { t } = useI18n();
  const [cats, setCats] = useState<Cat[]>([]);
  const [newCat, setNewCat] = useState({
    name: "",
    currentWeight: "",
    dryFoodCalories: DEFAULT_DRY_FOOD_CALORIES,
    wetFoodCalories: DEFAULT_WET_FOOD_CALORIES,
  });
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [weightLossRate] = useState(1.5); // Default 1.5% per week
  const [isInitialView, setIsInitialView] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const addCat = () => {
    if (!newCat.currentWeight) return;

    const cat: Cat = {
      id: Date.now(),
      name: newCat.name || `Meow`, // Default name if not provided
      currentWeight: parseFloat(newCat.currentWeight),
      targetWeight: 5, // 理想体重都是5kg
      dryFoodCalories: parseFloat(
        (newCat.dryFoodCalories ?? DEFAULT_DRY_FOOD_CALORIES).toString(),
      ),
      wetFoodCalories: parseFloat(
        (newCat.wetFoodCalories ?? DEFAULT_WET_FOOD_CALORIES).toString(),
      ),
    };

    setCats([...cats, cat]);
    setNewCat({
      name: "",
      currentWeight: "",
      dryFoodCalories: DEFAULT_DRY_FOOD_CALORIES,
      wetFoodCalories: DEFAULT_WET_FOOD_CALORIES,
    });
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

    while (currentWeight > cat.targetWeight && week < MAX_PLAN_WEEKS) {
      // 最多52周
      // 使用用户设置的减重速度 (0.5-2%/周)
      const weeklyWeightLossPercentage = weightLossRate / 100;
      const weeklyWeightLoss = Math.min(
        currentWeight * weeklyWeightLossPercentage,
        totalWeightLoss,
      );
      const targetWeight = Math.max(
        currentWeight - weeklyWeightLoss * PHASE_DURATION_WEEKS,
        cat.targetWeight,
      ); // 2周为一个阶段

      // 计算每周体重变化（克/周）
      const weightChangeGramsPerWeek = Math.round(weeklyWeightLoss * 1000); // 负值表示减重
      const dailyCalories = baseCalories * currentRatio;

      // 计算干粮和湿粮分配（逐渐从纯干粮转为半干半湿）
      const monthsElapsed = week / 4;
      const wetFoodRatio = Math.min(
        monthsElapsed * MONTHLY_WET_FOOD_INCREASE,
        MAX_WET_FOOD_RATIO,
      ); // 4个月内逐渐增加到50%湿粮
      const dryFoodRatio = 1 - wetFoodRatio;

      const dryFoodCaloriesPlan = dailyCalories * dryFoodRatio;
      const wetFoodCaloriesPlan = dailyCalories * wetFoodRatio;

      // 直接计算湿粮克数，而不是罐数
      let wetFoodGrams = wetFoodCaloriesPlan / cat.wetFoodCalories;

      // 将湿粮克数调整为标准包装规格的整数倍
      wetFoodGrams =
        Math.floor(wetFoodGrams / WET_FOOD_PACKAGE_SIZE) *
        WET_FOOD_PACKAGE_SIZE;
      // 如果有剩余热量，分配给干粮
      const remainingWetCalories =
        wetFoodCaloriesPlan - wetFoodGrams * cat.wetFoodCalories;
      const dryFoodGrams =
        (dryFoodCaloriesPlan + remainingWetCalories) / cat.dryFoodCalories;

      let phase = WEIGHT_PHASE.INITIAL;

      if (currentRatio <= MIDDLE_PHASE_RATIO) phase = WEIGHT_PHASE.MIDDLE;
      if (currentRatio <= FINAL_PHASE_RATIO) phase = WEIGHT_PHASE.FINAL;

      let status = WEIGHT_STATUS.OBESE;

      if (currentWeight <= cat.currentWeight * OVERWEIGHT_THRESHOLD)
        status = WEIGHT_STATUS.OVERWEIGHT;
      if (currentWeight <= cat.targetWeight * NEAR_IDEAL_THRESHOLD)
        status = WEIGHT_STATUS.NEAR_IDEAL;
      if (currentWeight <= cat.targetWeight) status = WEIGHT_STATUS.IDEAL;

      // 计算当前阶段的结束日期
      const endDate = new Date(currentDate);

      endDate.setDate(endDate.getDate() + PHASE_DURATION_WEEKS * 7); // 两周后的日期

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
        weightChangeGramsPerWeek: weightChangeGramsPerWeek,
      });

      currentWeight = targetWeight;
      currentRatio = Math.max(
        currentRatio - PHASE_RATIO_DECREASE,
        FINAL_PHASE_RATIO,
      ); // 每2周减少0.05，最低0.7
      week += PHASE_DURATION_WEEKS;
      currentDate = new Date(endDate); // 更新当前日期为上一阶段的结束日期

      if (currentWeight <= cat.targetWeight) break;
    }

    return plan;
  };

  const selectedCat = cats.find((cat) => cat.id === selectedCatId);
  const [weightPlan, setWeightPlan] = useState<WeightPlan[]>([]);

  // 当选中的猫咪变化或者体重减轻率变化时，重新计算减肥计划
  useEffect(() => {
    if (selectedCat) {
      setWeightPlan(calculateWeightPlan(selectedCat));
    }
  }, [selectedCat, weightLossRate]);

  // 处理干粮热量密度变化
  const handleDryFoodCaloriesChange = (newValue: number) => {
    if (selectedCat) {
      // 更新选中猫咪的干粮热量密度
      const updatedCats = cats.map((cat) =>
        cat.id === selectedCat.id ? { ...cat, dryFoodCalories: newValue } : cat,
      );

      setCats(updatedCats);

      // 使用更新后的猫咪信息重新计算减肥计划
      const updatedCat = { ...selectedCat, dryFoodCalories: newValue };

      setWeightPlan(calculateWeightPlan(updatedCat));
    }
  };

  // 分享功能 - 生成页面截图
  const handleShare = async () => {
    if (!contentRef.current) return;

    try {
      setIsGeneratingImage(true);
      setShareMessage(t("catDiet.generatingImage"));

      // 使用 html2canvas 将页面内容转换为 canvas
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // 提高图片质量
        useCORS: true, // 允许跨域图片
        logging: false,
        backgroundColor: "#ffffff",
      });

      // 将 canvas 转换为图片数据 URL
      const imageData = canvas.toDataURL("image/png");

      // 创建下载链接
      const link = document.createElement("a");

      link.href = imageData;
      link.download = `Cat_Weight_Loss_Plan_${new Date().toLocaleDateString()}.png`;

      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShareMessage(t("catDiet.imageGenerated"));

      // 3秒后清除消息
      setTimeout(() => {
        setShareMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Image generation failed:", error);
      setShareMessage(t("catDiet.imageGenerationFailed"));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div ref={contentRef} className="container max-w-6xl px-4 mx-auto">
      {isInitialView && (
        <div className="my-8 text-center">
          <h1 className={title({ color: "violet" })}>{t("catDiet.title")}</h1>
          <p className="mt-4 text-lg text-gray-600">
            {t("catDiet.subtitle")}
          </p>
        </div>
      )}

      {/* 初始视图 - 只显示体重输入 */}
      {isInitialView ? (
        <div className="max-w-md p-6 mx-auto mb-8 text-center rounded-lg shadow-lg">
          <h2 className="mb-6 text-xl font-bold">{t("catDiet.inputWeight")}</h2>
          <div className="mb-6">
            <Input
              autoFocus
              className="text-center"
              label={t("catDiet.catWeight")}
              placeholder={t("catDiet.weightExample")}
              size="lg"
              step="0.1"
              type="number"
              value={newCat.currentWeight}
              onChange={(e) =>
                setNewCat({ ...newCat, currentWeight: e.target.value })
              }
            />
          </div>
          <Button className="w-full" color="primary" size="lg" onClick={addCat}>
            {t("catDiet.start")}
          </Button>
        </div>
      ) : (
        <></>
      )}

      {shareMessage && (
        <div className="p-2 mb-4 text-center text-blue-700 rounded bg-blue-50">
          {shareMessage}
        </div>
      )}

      {/* 减肥计划详情 - 表格布局 */}
      {selectedCat && weightPlan.length > 0 && (
        <div className="p-6 overflow-x-auto rounded-lg shadow-lg">
          <div className="flex flex-col justify-between mb-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">
                {selectedCat.name}{t("catDiet.planTitle")}
              </h2>
              <Button
                className="flex items-center gap-1"
                data-html2canvas-ignore="true"
                disabled={isGeneratingImage}
                size="sm"
                onPress={handleShare}
              >
                {isGeneratingImage ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-current rounded-full animate-spin border-t-transparent" />
                    {t("catDiet.generating")}
                  </>
                ) : (
                  <>
                    <svg
                      fill="none"
                      height="16"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" x2="12" y1="2" y2="15" />
                    </svg>
                    {t("catDiet.saveAsImage")}
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm sm:mt-0">
              <Chip color="primary" variant="flat">
                {t("catDiet.target")}：{selectedCat.targetWeight}kg
              </Chip>
              <Chip color="success" variant="flat">
                {t("catDiet.period")}：{Math.ceil((weightPlan.length * 2) / 4)} {t("catDiet.months")}
              </Chip>
            </div>
          </div>

          {/* 减肥计划可视化图表 */}
          <CatWeightChart
            currentWeight={selectedCat.currentWeight}
            targetWeight={selectedCat.targetWeight}
            weightPlans={weightPlan}
          />
        </div>
      )}
      {selectedCat && (
        <WeightLossGuide
          currentWeight={selectedCat.currentWeight}
          weightPlans={weightPlan}
          onDryFoodCaloriesChange={handleDryFoodCaloriesChange}
        />
      )}

      {cats.length === 0 && !isInitialView && (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">🐱</div>
          <p className="text-lg text-gray-500">
            {t("catDiet.addCatInfo")}
          </p>
        </div>
      )}
      <footer className="flex items-center justify-center w-full py-3">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://scar.site/"
          title="heroui.com homepage"
        >
          <span className="text-default-600">{t("footer.poweredBy")}</span>
          <p className="text-primary">ScarChin</p>
        </Link>
      </footer>
    </div>
  );
}
