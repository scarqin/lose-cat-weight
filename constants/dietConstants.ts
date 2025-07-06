// 猫咪减肥计划常量

// 基础代谢计算常量
export const WEIGHT_MULTIPLIER = 30; // 体重乘数
export const BASE_CALORIE_CONSTANT = 70; // 基础热量常数

// 减肥阶段热量比例
export const INITIAL_PHASE_RATIO = 0.9; // 初期热量比例
export const MIDDLE_PHASE_RATIO = 0.8; // 中期热量比例
export const FINAL_PHASE_RATIO = 0.7; // 后期热量比例

// 食物热量默认值 (卡路里/克)
export const DEFAULT_DRY_FOOD_CALORIES = 3.8; // 干粮默认热量
export const DEFAULT_WET_FOOD_CALORIES = 1.1; // 湿粮默认热量

// 减重速度范围 (每周体重百分比)
export const MIN_WEEKLY_WEIGHT_LOSS_PERCENTAGE = 0.5; // 最小每周减重百分比
export const MAX_WEEKLY_WEIGHT_LOSS_PERCENTAGE = 2.0; // 最大每周减重百分比

// 湿粮包装规格 (克)
export const WET_FOOD_PACKAGE_SIZE = 85; // 湿粮标准包装规格

// 湿粮比例过渡
export const MAX_WET_FOOD_RATIO = 0.5; // 最大湿粮比例
export const MONTHS_TO_TRANSITION = 4; // 过渡到最大湿粮比例的月数
export const MONTHLY_WET_FOOD_INCREASE =
  MAX_WET_FOOD_RATIO / MONTHS_TO_TRANSITION; // 每月湿粮比例增加量

// 减肥计划常量
export const MAX_PLAN_WEEKS = 52; // 最大计划周数
export const PHASE_DURATION_WEEKS = 2; // 每个阶段的周数
export const PHASE_RATIO_DECREASE = 0.05; // 每个阶段热量比例减少量

// 体重状态阈值
export const OVERWEIGHT_THRESHOLD = 0.9; // 超重阈值（当前体重的90%）
export const NEAR_IDEAL_THRESHOLD = 1.1; // 接近理想体重阈值（目标体重的110%）

// 体重状态描述
export const WEIGHT_STATUS = {
  OBESE: "肥胖",
  OVERWEIGHT: "超重",
  NEAR_IDEAL: "接近理想",
  IDEAL: "理想体重",
};

// 减肥阶段描述
export const WEIGHT_PHASE = {
  INITIAL: "初期",
  MIDDLE: "中期",
  FINAL: "后期",
};

/**
 * 计算基础代谢热量
 * @param weight 体重(kg)
 * @returns 基础代谢热量(kcal)
 */
export const calculateBaseCalories = (weight: number): number => {
  return weight * WEIGHT_MULTIPLIER + BASE_CALORIE_CONSTANT;
};

/**
 * 计算减肥阶段热量
 * @param baseCalories 基础代谢热量
 * @param phase 减肥阶段
 * @returns 减肥阶段热量(kcal)
 */
export const calculatePhaseCalories = (
  baseCalories: number,
  phase: string,
): number => {
  switch (phase) {
    case WEIGHT_PHASE.INITIAL:
      return baseCalories * INITIAL_PHASE_RATIO;
    case WEIGHT_PHASE.MIDDLE:
      return baseCalories * MIDDLE_PHASE_RATIO;
    case WEIGHT_PHASE.FINAL:
      return baseCalories * FINAL_PHASE_RATIO;
    default:
      return baseCalories * INITIAL_PHASE_RATIO;
  }
};

/**
 * 计算每周最小减重量(g)
 * @param weight 体重(kg)
 * @returns 每周最小减重量(g)
 */
export const calculateMinWeeklyLoss = (weight: number): number => {
  return Math.round((weight * 1000 * MIN_WEEKLY_WEIGHT_LOSS_PERCENTAGE) / 100);
};

/**
 * 计算每周最大减重量(g)
 * @param weight 体重(kg)
 * @returns 每周最大减重量(g)
 */
export const calculateMaxWeeklyLoss = (weight: number): number => {
  return Math.round((weight * 1000 * MAX_WEEKLY_WEIGHT_LOSS_PERCENTAGE) / 100);
};
