import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const DashboardChart = ({ type, data, options = {} }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: type === 'doughnut' ? 'right' : 'top',
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 12
          },
          bodyFont: {
            size: 11
          },
          padding: 10,
          cornerRadius: 4,
          displayColors: true
        }
      }
    };
    
    // Add specific options for different chart types
    if (type === 'bar') {
      defaultOptions.scales = {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: function(value) {
              return '$' + (value / 1000) + 'k';
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      };
    }
    
    if (type === 'doughnut') {
      defaultOptions.cutout = '70%';
      defaultOptions.plugins.tooltip = {
        ...defaultOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      };
    }

    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };

    chartInstance.current = new Chart(ctx, {
      type,
      data,
      options: mergedOptions
    });

    return () => {
      // Clean up chart when component unmounts
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);

  return (
    <div className="h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default DashboardChart;