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
  Filler
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
    const labels = weightPlans.map((plan, index) => `第${(index + 1) * 2}周`);
    
    // 添加起始体重
    const weights = [currentWeight, ...weightPlans.map(plan => plan.weightTarget)];
    labels.unshift('开始');
    
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
        },
        {
          label: '目标体重',
          data: Array(labels.length).fill(targetWeight),
          borderColor: chartColors.target,
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        }
      ]
    };
  };
  
  // 准备食物分配图表数据
  const prepareFoodChartData = () => {
    const labels = weightPlans.map((plan, index) => `第${(index + 1) * 2}周`);
    
    return {
      labels,
      datasets: [
        {
          label: '干粮 (g)',
          data: weightPlans.map(plan => plan.dryFoodGrams),
          backgroundColor: chartColors.dryFood,
          stack: 'Stack 0',
        },
        {
          label: '湿粮 (罐)',
          // 将罐数转换为克数以便于在同一图表上显示
          // 假设每罐85g
          data: weightPlans.map(plan => plan.wetFoodCans * 85),
          backgroundColor: chartColors.wetFood,
          stack: 'Stack 0',
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
        callbacks: {
          label: function(context: any) {
            const index = context.dataIndex;
            const datasetIndex = context.datasetIndex;
            
            if (datasetIndex === 0 && index > 0) {
              const plan = weightPlans[index - 1]; // 减1是因为我们添加了起始点
              return [
                `体重: ${context.raw} kg`,
                `阶段: ${plan.phase}`,
                `热量比例: ${plan.calorieRatio * 100}%`,
                `每日热量: ${plan.dailyCalories} 卡`
              ];
            }
            return `${context.dataset.label}: ${context.raw} kg`;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: '体重 (kg)'
        },
        min: Math.floor(Math.min(targetWeight * 0.95, ...weightPlans.map(p => p.weightTarget))),
        max: Math.ceil(currentWeight * 1.05)
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
        text: '每日食物分配',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const index = context.dataIndex;
            const datasetIndex = context.datasetIndex;
            const plan = weightPlans[index];
            
            if (datasetIndex === 0) {
              return [
                `干粮: ${plan.dryFoodGrams} g`,
                `阶段: ${plan.phase}`,
                `热量: ${Math.round(plan.dryFoodGrams * plan.calorieRatio)} 卡`
              ];
            } else {
              return [
                `湿粮: ${plan.wetFoodCans} 罐 (约 ${Math.round(plan.wetFoodCans * 85)} g)`,
                `阶段: ${plan.phase}`,
                `热量: ${Math.round(plan.wetFoodCans * 85 * plan.calorieRatio)} 卡`
              ];
            }
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: '食物量'
        },
        stacked: true
      },
      x: {
        stacked: true
      }
    }
  };
  
  
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-4 bg-white rounded-lg shadow">
          <Line data={prepareWeightChartData()} options={weightChartOptions} />
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <Bar data={prepareFoodChartData()} options={foodChartOptions} />
        </div>
      </div>
      
      <div className="p-4 mt-6 bg-gray-50 rounded-lg">
        <h3 className="mb-2 text-lg font-semibold">图表说明</h3>
        <ul className="pl-5 space-y-1 text-sm list-disc">
          <li><span className="inline-block mr-2 w-3 h-3 bg-pink-400 rounded-full"></span> 初期: 热量摄入为基础代谢的90%</li>
          <li><span className="inline-block mr-2 w-3 h-3 bg-blue-400 rounded-full"></span> 中期: 热量摄入为基础代谢的80%</li>
          <li><span className="inline-block mr-2 w-3 h-3 bg-teal-400 rounded-full"></span> 后期: 热量摄入为基础代谢的70%</li>
          <li><span className="inline-block mr-2 w-3 h-3 bg-orange-400 rounded-full"></span> 干粮: 每克约 {weightPlans[0]?.calorieRatio || 3.7} 卡路里</li>
          <li><span className="inline-block mr-2 w-3 h-3 bg-gray-400 rounded-full"></span> 湿粮: 每克约 {weightPlans[0]?.wetFoodCans || 1.1} 卡路里，每罐约85克</li>
        </ul>
      </div>
    </div>
  );
};

export default CatWeightChart;
