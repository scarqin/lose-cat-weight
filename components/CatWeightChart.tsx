import React from 'react';
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
  Filler
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import datalabelsPlugin from 'chartjs-plugin-datalabels';
import { Line, Bar } from 'react-chartjs-2';
import { WeightPlan } from '../app/cat-diet/page';

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
  datalabelsPlugin
);

// 定义图表颜色
const chartColors = {
  initial: 'rgba(255, 99, 132, 0.6)',  // 初期 - 粉红色
  middle: 'rgba(54, 162, 235, 0.6)',   // 中期 - 蓝色
  final: 'rgba(75, 192, 192, 0.6)',    // 后期 - 青绿色
  target: 'rgba(153, 102, 255, 0.4)',  // 目标体重 - 紫色
  dryFood: 'rgba(255, 159, 64, 0.8)',  // 干粮 - 橙色
  wetFood: 'rgba(201, 203, 207, 0.8)', // 湿粮 - 灰色
};

interface CatWeightChartProps {
  weightPlans: WeightPlan[];
  currentWeight: number;
  targetWeight: number;
}

const CatWeightChart: React.FC<CatWeightChartProps> = ({ 
  weightPlans, 
  currentWeight, 
  targetWeight 
}) => {
  // 准备体重变化图表数据
  const prepareWeightChartData = () => {
    // 创建今天的日期对象
    const today = new Date();
    
    // 使用日期而不是周数
    const labels = weightPlans.map((plan) => {
      const date = plan.date;
      // 如果日期是今天，显示为"今天"
      if (date.getDate() === today.getDate() && 
          date.getMonth() === today.getMonth() && 
          date.getFullYear() === today.getFullYear()) {
        return '今天';
      }
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    // 添加起始体重
    const weights = [currentWeight, ...weightPlans.map(plan => plan.weightTarget)];
    
    // 确定每个点的阶段颜色
    const backgroundColors = weightPlans.map(plan => {
      switch(plan.phase) {
        case '初期': return chartColors.initial;
        case '中期': return chartColors.middle;
        case '后期': return chartColors.final;
        default: return chartColors.initial;
      }
    });
    // 添加起始点颜色
    backgroundColors.unshift(chartColors.initial);
    
    // 准备阶段图标和热量信息
    const phaseIcons = [ ...weightPlans.map(plan => {
      switch(plan.phase) {
        case '初期': return ''; // 初期
        case '中期': return ''; // 中期
        case '后期': return ''; // 后期
        default: return '';
      }
    })];
    
    const calorieInfo = ['-', ...weightPlans.map(plan => `${Math.round(plan.dailyCalories)}卡`)];
    const statusInfo = ['开始', ...weightPlans.map(plan => plan.status)];
    
    return {
      labels,
      datasets: [
        {
          label: '体重 (kg)',
          data: weights,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: backgroundColors,
          pointBackgroundColor: backgroundColors,
          pointBorderColor: '#fff',
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
              const plan = weightPlans[index - 1]; // 减1是因为我们添加了起始点
              return `${phaseIcons[index]} ${value}`;
            },
            font: {
              size: 10,
              weight: 'bold'
            },
            color: 'rgba(0, 0, 0, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 4,
            padding: 3
          }
        },
      ]
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
      if (date.getDate() === today.getDate() && 
          date.getMonth() === today.getMonth() && 
          date.getFullYear() === today.getFullYear()) {
        return '今天';
      }
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    return {
      labels,
      datasets: [
        {
          label: '干粮 (g)',
          data: weightPlans.map(plan => plan.dryFoodGrams),
          backgroundColor: chartColors.dryFood,
          stack: 'Stack 0',
          datalabels: {
            align: "start" as const,
            anchor: "end" as const,
            formatter: (value: number, context: any) => {
              return `${value}g`;
            },
            font: {
              size: 10,
              weight: 'bold'
            },
            color: 'rgba(0, 0, 0, 0.8)',
            rotation: 0
          }
        },
        {
          label: '湿粮 (g)',
          // 直接使用克数
          data: weightPlans.map(plan => plan.wetFoodGrams),
          backgroundColor: chartColors.wetFood,
          stack: 'Stack 0',
          datalabels: {
            align: "center" as const,
            anchor: "start" as const,
            formatter: (value: number, context: any) => {
              // 直接显示克数
              return value > 0 ? `${value}g` : '';
            },
            font: {
              size: 10,
              weight: "bold" as const
            },
            color: 'rgba(0, 0, 0, 0.8)',
            rotation: 0
          }
        }
      ]
    };
  };
  
  // 图表配置
  const weightChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '体重变化趋势',
        font: {
          size: 16
        }
      },
      tooltip: {
        enabled: true, // 保留tooltip但添加直接显示的标签
        callbacks: {
          label: function(context: any) {
            const index = context.dataIndex;
            const datasetIndex = context.datasetIndex;
            
            if (datasetIndex === 0 && index > 0) {
              const plan = weightPlans[index - 1]; // 减1是因为我们添加了起始点
              return [
                `体重: ${context.raw} kg`,
                `阶段: ${plan.phase}`,
                `每日热量: ${plan.dailyCalories}`
              ];
            }
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      },
      datalabels: {
        display: function(context) {
          // 只显示第一个数据集的标签
          return context.datasetIndex === 0;
        },
        color: 'black',
        align: "end" as const,
        offset: 10,
        clamp: true
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: '体重 (kg)',
          padding: {top: 0, bottom: 10}
        },
        min: Math.floor(Math.min(targetWeight * 0.95, ...weightPlans.map(p => p.weightTarget))),
        max: Math.ceil(currentWeight * 1.05),
        ticks: {
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      x: {
        ticks: {
          padding: 10,
          font: {
            size: 11
          }
        }
      }
    }
  };
  
  const foodChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '食物分配',
        font: {
          size: 16
        }
      },
      tooltip: {
        enabled: true, // 保留tooltip但添加直接显示的标签
        callbacks: {
          label: function(context: any) {
            const index = context.dataIndex;
            const datasetIndex = context.datasetIndex;
            const plan = weightPlans[index];
            
            if (datasetIndex === 0) {
              return [
                `干粮: ${plan.dryFoodGrams}g`,
                `阶段: ${plan.phase}`,
                `热量: ${Math.round(plan.dryFoodGrams * plan.calorieRatio)}`
              ];
            } else {
              return [
                `湿粮: ${plan.wetFoodGrams}g`,
                `阶段: ${plan.phase}`,
                `热量: ${Math.round(plan.wetFoodGrams * 1.1)}`
              ];
            }
          }
        }
      },
      datalabels: {
        display: true,
        color: 'black',
        clamp: true,
        // 交错显示标签位置，避免重叠
        align: function(context) {
          const index = context.dataIndex;
          return index % 2 === 0 ? 'end' : 'start';
        },
        anchor: function(context) {
          const index = context.dataIndex;
          return index % 2 === 0 ? 'end' : 'start';
        },
        offset: 8
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: '食物分配',
          padding: {top: 0, bottom: 10}
        },
        stacked: true,
        ticks: {
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      x: {
        stacked: true,
        ticks: {
          padding: 10,
          font: {
            size: 11
          }
        }
      }
    }
  };
  
  
  // 移除计算热量的代码，已移至 WeightLossGuide 组件

  return (
    <div className="mt-8 space-y-10">
      {/* 图表区块 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <Line data={prepareWeightChartData()} options={weightChartOptions} />
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow-md">
          <Bar data={prepareFoodChartData()} options={foodChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default CatWeightChart;
