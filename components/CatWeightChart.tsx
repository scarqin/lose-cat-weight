"use client";

import React from "react";
import { useI18n } from "@/context/i18nContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import datalabelsPlugin from "chartjs-plugin-datalabels";
import { Line, Bar } from "react-chartjs-2";

import { WeightPlan } from "../app/cat-diet/page";

// 注册 ChartJS 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin,
  datalabelsPlugin,
);

// Define chart colors
const chartColors = {
  initial: "rgba(255, 99, 132, 0.6)", // Initial phase - pink
  middle: "rgba(54, 162, 235, 0.6)", // Middle phase - blue
  final: "rgba(75, 192, 192, 0.6)", // Final phase - teal
  target: "rgba(153, 102, 255, 0.4)", // Target weight - purple
  dryFood: "rgba(255, 206, 86, 0.6)", // Dry food - yellow (with transparency)
  wetFood: "rgba(54, 162, 235, 0.4)", // Wet food - light blue (lighter transparency)
  appropriate: "rgba(54, 162, 235, 0.6)", // Appropriate - blue (consistent with line chart)
};

interface CatWeightChartProps {
  weightPlans: WeightPlan[];
  currentWeight: number;
  targetWeight: number;
}

const CatWeightChart: React.FC<CatWeightChartProps> = ({
  weightPlans,
  currentWeight,
  targetWeight,
}) => {
  const { t } = useI18n();
  // 准备体重变化图表数据
  const prepareWeightChartData = () => {
    // 创建今天的日期对象
    const today = new Date();

    // 使用日期而不是周数
    const labels = weightPlans.map((plan) => {
      const date = plan.date;

      // 如果日期是今天，显示为"今天"
      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        return t("catWeightChart.today");
      }

      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    // 添加起始体重
    const weights = [
      currentWeight,
      ...weightPlans.map((plan) => plan.weightTarget),
    ];

    // 确定每个点的阶段颜色
    const backgroundColors = weightPlans.map((plan) => {
      switch (plan.phase) {
        case "weightPhase.initial":
          return chartColors.initial;
        case "weightPhase.middle":
          return chartColors.middle;
        case "weightPhase.final":
          return chartColors.final;
        default:
          return chartColors.initial;
      }
    });

    // 添加起始点颜色
    backgroundColors.unshift(chartColors.initial);

    // 准备阶段图标和热量信息
    const phaseIcons = [
      ...weightPlans.map((plan) => {
        switch (plan.phase) {
          case "weightPhase.initial":
            return ""; // Initial phase
          case "weightPhase.middle":
            return ""; // Middle phase
          case "weightPhase.final":
            return ""; // Final phase
          default:
            return "";
        }
      }),
    ];

    return {
      labels,
      datasets: [
        {
          label: t("catWeightChart.weight"),
          data: weights,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: backgroundColors,
          pointBackgroundColor: backgroundColors,
          pointBorderColor: "#fff",
          pointRadius: 6,
          tension: 0.1,
          fill: false,
          // 添加数据标签配置
          datalabels: {
            align: "top" as const,
            anchor: "end" as const,
            offset: 10,
            formatter: (value: number, context: any) => {
              const index = context.dataIndex;

              if (index === 0) return `${value}`; // 起始点只显示体重

              return `${phaseIcons[index]} ${value}`;
            },
            font: {
              size: 10,
              weight: "bold" as const,
            },
            color: "rgba(0, 0, 0, 0.8)",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            borderRadius: 4,
            padding: 3,
          },
        },
      ],
    };
  };

  // 准备食物分配图表数据
  const prepareFoodChartData = () => {
    // 创建今天的日期对象
    const today = new Date();

    // 使用日期而不是周数
    const labels = weightPlans.map((plan) => {
      const date = plan.date;

      // 如果日期是今天，显示为"今天"
      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        return t("catWeightChart.today");
      }

      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    return {
      labels,
      datasets: [
        {
          label: t("catWeightChart.dryFood"),
          data: weightPlans.map((plan) => plan.dryFoodGrams),
          backgroundColor: chartColors.dryFood,
          stack: "Stack 0",
          // Custom datalabels configuration for Chart.js
          datalabels: {
            align: "start",
            anchor: "end",
            formatter: (value: number) => {
              return `${value}`;
            },
            font: {
              size: 10,
              weight: "bold" as const,
            },
            color: "rgba(0, 0, 0, 0.8)",
            rotation: 0,
          } as any,
        },
        {
          label: t("catWeightChart.wetFood"),
          // 直接使用克数
          data: weightPlans.map((plan) => plan.wetFoodGrams),
          backgroundColor: chartColors.wetFood,
          stack: "Stack 0",
          // Custom datalabels configuration for Chart.js
          datalabels: {
            align: "top",
            anchor: "center",
            formatter: (value: number) => {
              // 直接显示克数
              return value > 0 ? `${value}` : "";
            },
            font: {
              size: 10,
              weight: "bold" as const,
            },
            color: "rgba(0, 0, 0, 0.8)",
            rotation: 0,
            offset: 10,
          } as any,
        },
      ],
    };
  };

  // 图表配置
  const weightChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // 允许图表自适应容器高度
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: t("catWeightChart.weightTrend"),
        font: {
          size: window.innerWidth < 768 ? 14 : 16,
        },
        padding: {
          top: 10,
          bottom: 10,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context: any) {
            const index = context.dataIndex;
            const datasetIndex = context.datasetIndex;

            if (datasetIndex === 0 && index > 0) {
              const plan = weightPlans[index - 1]; // 减1是因为我们添加了起始点

              return [
                `${t("catWeightChart.weight").split(" ")[0]}: ${context.raw} kg`,
                `${t("catWeightChart.phase")}: ${t(plan.phase)}`,
                `${t("catWeightChart.calories")}: ${plan.dailyCalories}`,
                `${t("catWeightChart.reduction")}: ${plan.weightChangeGramsPerWeek || 0}g/${t("catWeightChart.perWeek")}`,
                
              ];
            }

            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
      datalabels: {
        display: function (context: any) {
          // 在移动设备上隐藏部分标签以避免拥挤
          if (window.innerWidth < 768) {
            // Only show labels for key points on mobile devices
            const index = context.dataIndex;

            return (
              context.datasetIndex === 0 &&
              (index === 0 || index === weightPlans.length || index % 3 === 0)
            );
          }

          // Show all labels on desktop devices
          return context.datasetIndex === 0;
        },
        color: "black",
        align: "end" as const,
        offset: 10,
        clamp: true,
        font: {
          size: window.innerWidth < 768 ? 9 : 10,
          weight: 700, // Changed from 'bold' to 700
        },
      },
    },
    scales: {
      y: {
        title: {
          display: window.innerWidth >= 768, // 在移动设备上隐藏轴标题
          text: t("catWeightChart.weight"),
          padding: { top: 0, bottom: 10 },
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
        min: Math.floor(
          Math.min(
            targetWeight * 0.95,
            ...weightPlans.map((p) => p.weightTarget),
          ),
        ),
        max: Math.ceil(currentWeight * 1.05),
        ticks: {
          padding: 5,
          font: {
            size: window.innerWidth < 768 ? 9 : 11,
          },
          maxTicksLimit: window.innerWidth < 768 ? 5 : 8, // 在移动设备上减少刻度数量
        },
      },
      x: {
        ticks: {
          padding: 5,
          font: {
            size: window.innerWidth < 768 ? 9 : 11,
          },
          maxRotation: window.innerWidth < 768 ? 45 : 0, // 在移动设备上旋转标签
          autoSkip: true,
          maxTicksLimit: window.innerWidth < 768 ? 6 : 10, // 在移动设备上减少显示的标签数量
        },
      },
    },
  };

  const foodChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // 允许图表自适应容器高度
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
          padding: 8,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: t("catWeightChart.foodDistribution"),
        font: {
          size: window.innerWidth < 768 ? 14 : 16,
        },
        padding: {
          top: 10,
          bottom: 10,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context: any) {
            const index = context.dataIndex;
            const plan = weightPlans[index];

            return [
              `${t("catWeightChart.phase")}: ${t(plan.phase)}`,
              ...(plan.dryFoodGrams > 0 ? [`${t("catWeightChart.dryFood").split(" ")[0]}: ${plan.dryFoodGrams}g`] : []),
              ...(plan.wetFoodGrams > 0 ? [`${t("catWeightChart.wetFood").split(" ")[0]}: ${plan.wetFoodGrams}g`] : []),
              `${t("catWeightChart.calories")}: ${Math.round(plan.dryFoodGrams * 3.7) + Math.round(plan.wetFoodGrams * 1.1)}g`,
            ];
          },
        },
      },
      datalabels: {
        display: function (context: any) {
          // 在移动设备上隐藏部分标签以避免拥挤
          if (window.innerWidth < 768) {
            const index = context.dataIndex;

            return index % 3 === 0; // Only show every third data point label on mobile devices
          }

          return true; // Show all labels on desktop devices
        },
        color: "black",
        clamp: true,
        // Alternate label positions to avoid overlap
        align: function (context: any) {
          const index = context.dataIndex;

          return index % 2 === 0 ? "end" : "start";
        },
        anchor: function (context: any) {
          const index = context.dataIndex;

          return index % 2 === 0 ? "end" : "start";
        },
        offset: 8,
        font: {
          size: window.innerWidth < 768 ? 9 : 10,
          weight: 700, // Changed from 'bold' to 700
        },
      },
    },
    scales: {
      y: {
        title: {
          display: window.innerWidth >= 768, // 在移动设备上隐藏轴标题
          text: t("catWeightChart.foodRatio"),
          padding: { top: 0, bottom: 10 },
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
        stacked: true,
        ticks: {
          padding: 5,
          font: {
            size: window.innerWidth < 768 ? 9 : 11,
          },
          maxTicksLimit: window.innerWidth < 768 ? 5 : 8, // 在移动设备上减少刻度数量
        },
      },
      x: {
        stacked: true,
        ticks: {
          padding: 5,
          font: {
            size: window.innerWidth < 768 ? 9 : 11,
          },
          maxRotation: window.innerWidth < 768 ? 45 : 0, // Rotate labels on mobile devices
          autoSkip: true,
          maxTicksLimit: window.innerWidth < 768 ? 6 : 10, // Reduce number of visible labels on mobile devices
        },
      },
    },
  };

  // Removed calorie calculation code, moved to WeightLossGuide component

  // Add window resize listener to re-render charts when device is rotated or resized
  React.useEffect(() => {
    const handleResize = () => {
      // Here we're just setting a state to trigger re-rendering
      // We don't actually need to do anything because we use window.innerWidth in chart options
      const chart = ChartJS.getChart("weight-chart");

      if (chart) {
        chart.update();
      }
      const foodChart = ChartJS.getChart("food-chart");

      if (foodChart) {
        foodChart.update();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="mt-8 space-y-10">
      {/* Chart section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div style={{ height: window.innerWidth < 768 ? "250px" : "300px" }}>
            <Line
              data={prepareWeightChartData()}
              id="weight-chart"
              options={weightChartOptions}
            />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md">
          <div style={{ height: window.innerWidth < 768 ? "250px" : "300px" }}>
            <Bar
              data={prepareFoodChartData()}
              id="food-chart"
              options={foodChartOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatWeightChart;
