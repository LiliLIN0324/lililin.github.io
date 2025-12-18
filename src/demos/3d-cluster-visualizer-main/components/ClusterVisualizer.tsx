import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Cluster } from '../types';
import { Maximize2 } from 'lucide-react';

interface ClusterVisualizerProps {
  clusters: Cluster[];
  selectedClusterId: number | null;
  selectedPointIndex: number | null;
  onClusterSelect: (clusterId: number, pointIndex: number) => void;
  onReset: () => void;
}

const ClusterVisualizer: React.FC<ClusterVisualizerProps> = ({
  clusters,
  selectedClusterId,
  selectedPointIndex,
  onClusterSelect,
  onReset,
}) => {

  const traces = useMemo(() => {
    const plotTraces: any[] = [];

    clusters.forEach((cluster) => {
      const isSelected = selectedClusterId === cluster.id;
      // 修改点 1: 确定可见性逻辑
      // 如果没有选中任何内容，全部显示。如果有选中，只显示选中的那条。
      const isVisible = selectedClusterId === null || isSelected;

      let opacity = 0.8;
      let lineWidth = 3;
      
      if (isSelected) {
        opacity = 1;
        lineWidth = 6;
      } else {
        opacity = 0.6;
        lineWidth = 3;
      }

      plotTraces.push({
        type: 'scatter3d',
        mode: 'lines',
        name: cluster.name,
        visible: isVisible ? true : 'legendonly', 
        x: cluster.data.map((d) => d.date),
        y: cluster.data.map((d) => d.meanDay),
        z: cluster.data.map((d) => d.meanNight),
        line: {
          color: cluster.color,
          width: lineWidth,
        },
        // 添加以下光照控制
        lighting: {
          ambient: 1,      // 极大提高环境光，让颜色 100% 还原，不产生阴影
          diffuse: 1,      // 让光线均匀分布
          specular: 0.1,   // 减少反光点
        },
        opacity: opacity,
        customdata: cluster.data.map((_, idx) => ({ clusterId: cluster.id, pointIndex: idx })),
        hovertemplate: 
          `<b>${cluster.name}</b><br>` +
          `Date: %{x}<br>` +
          `Mean_Day: %{y:.2f}<br>` +
          `Mean_Night: %{z:.2f}<extra></extra>`,
      });
    });

    // Highlight Dot Logic (The "Circle Visual")
    if (selectedClusterId !== null && selectedPointIndex !== null) {
      const cluster = clusters.find(c => c.id === selectedClusterId);
      if (cluster && cluster.data[selectedPointIndex]) {
        const point = cluster.data[selectedPointIndex];
        
        plotTraces.push({
          type: 'scatter3d',
          mode: 'markers',
          name: 'Selected Point',
          x: [point.date],
          y: [point.meanDay],
          z: [point.meanNight],
          marker: {
            size: 6, // Big visible dot
            color: 'white', // White center
            line: {
              color: cluster.color, // Colored ring border
              width: 3
            },
            symbol: 'circle'
          },
          hoverinfo: 'none', // Don't interfere with hover
          showlegend: true
        });
      }
    }

    return plotTraces;
  }, [clusters, selectedClusterId, selectedPointIndex]);

  const layout: any = {
    autosize: true,
    showlegend: true,
    legend: {
      x: 0.14,         // 右侧
      y: 0.9,         // 顶部
      xanchor: 'right',  // 锚点对齐方式
      yanchor: 'top',
      bgcolor: '#000000ff',
      bordercolor: '#000000ff',
      borderwidth: 4,
      font: { size: 14, color: '#ffffff' },  // 文本颜色改成白色
      orientation: 'v',  // 垂直排列
      traceorder: 'normal'
    },
    scene: {
        xaxis: { 
            title: { text: 'Date', font: { color: '#ffffff', size: 16 } },
            backgroundcolor: '#000000', 
            gridcolor: '#ffffffff', 
            showbackground: false,
            color: '#ffffff',
            titlefont: { color: '#ffffff' },
            tickfont: { color: '#ffffff' },
            zerolinecolor: '#ffffff', // <-- 添加此行，设置零线颜色为白色
            dtick: 90,         // 每 90 个单位一个刻度
        },
        yaxis: { 
            title: { text: 'Mean_Day', font: { color: '#ffffff', size: 16 } },
            backgroundcolor: '#000000', 
            gridcolor: '#ffffffff', 
            showbackground: false,
            color: '#ffffff',
            titlefont: { color: '#ffffff' },
            tickfont: { color: '#ffffff' },
            zerolinecolor: '#ffffff', 
            range: [-7, 8],
        },
        zaxis: { 
            title: { text: 'Mean_Night', font: { color: '#ffffff', size: 16 } },
            backgroundcolor: '#000000', 
            gridcolor: '#ffffffff', 
            showbackground: false,
            color: '#ffffff',
            titlefont: { color: '#ffffff' },
            tickfont: { color: '#ffffff' },
            zerolinecolor: '#ffffff', 
            range: [-9, 3],
        },
        dragmode: 'turntable',
        aspectmode: 'cube',
        camera: { eye: { x: 1.5, y: -1.5, z: 1.5 } }, // 固定视角
    },
    margin: { l: 20, r: 20, b: 20, t: 20 },
    paper_bgcolor: '#000000',
    plot_bgcolor: '#000000',
  };

  const handlePlotClick = (event: any) => {
    if (!event.points || event.points.length === 0) return;

    const point = event.points[0];
    // @ts-ignore
    const meta = point.customdata;
    
    if (meta) {
      onClusterSelect(meta.clusterId, meta.pointIndex);
    }
  };
  const handleLegendClick = (event: any) => {
      // 阻止 Plotly 默认的切换隐藏行为
      const clickedTraceIndex = event.curveNumber;
      const clickedCluster = clusters[clickedTraceIndex];

      if (clickedCluster) {
        // 触发选择逻辑，默认选中该线段的起始点
        onClusterSelect(clickedCluster.id, 0);
      }
      
      // 返回 false 告诉 Plotly 不要执行默认的显示/隐藏切换
      return false;
    };
  return (

    <div className="absolute inset-0">
      
      {/* Reset Button floating top right */}
      {selectedClusterId !== null && (

        <div className="absolute right-4 top-16 z-50 ">
          <button
            onClick={onReset}
            className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg shadow-md hover:bg-gray-800 text-sm font-medium transition-colors"
          >
            <Maximize2 size={20} />
            Reset View
          </button>
        </div>

      )}

      <Plot
        data={traces}
        layout={layout}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        onClick={handlePlotClick}
        // 修改点 4: 绑定图例点击
        onLegendClick={handleLegendClick} 
        config={{
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['resetCameraLastSave3d']
        }}
      />
    </div>
  );
};

export default ClusterVisualizer;

