import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { Cluster } from '../types';
import { Maximize2, Pause, Play } from 'lucide-react';

interface ClusterVisualizerProps {
  clusters: Cluster[];
  selectedClusterId: number | null;
  selectedPointIndex: number | null;
  onClusterSelect: (clusterId: number, pointIndex: number) => void;
  onReset: () => void;
  showAllAttributes: boolean; // 新增
}

const ClusterVisualizer: React.FC<ClusterVisualizerProps> = ({
  clusters,
  selectedClusterId,
  selectedPointIndex,
  onClusterSelect,
  onReset,
  showAllAttributes, // 新增
}) => {
  // --- 新增：旋转状态 ---
  // --- 修改：状态管理 ---
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true); // 新增：控制是否自动旋转
  // 1. 新增：用 Ref 记录最后的相机位置，防止点击重置
  const lastCameraRef = useRef<{ x: number; y: number; z: number }>({
    x: 1.5, y: 1.5, z: 1.5
  });
  const requestRef = useRef<number>();

  // 2. 自动旋转逻辑：同步更新 Ref
  useEffect(() => {
    if (!isAutoRotating) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const radius = 2.12;
    const animate = () => {
      setRotationAngle((prev) => {
        const next = prev + 0.005;
        // 实时更新 Ref，这样点击暂停瞬间，Ref 停在当前位置
        lastCameraRef.current = {
          x: radius * Math.cos(next),
          y: radius * Math.sin(next),
          z: 1.5
        };
        return next;
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isAutoRotating]);
// 3. 计算相机位置时，优先使用 Ref 的值
const traces = useMemo(() => {
  const plotTraces: any[] = [];

clusters.forEach((cluster) => {
  const isSelected = selectedClusterId === cluster.id;
  const isVisible = selectedClusterId === null || isSelected;

  // 默认只显示 meanDay / meanNight
  const xValues = cluster.data.map(d => d.date);
  const yValues = cluster.data.map(d => d.meanDay);
  const zValues = cluster.data.map(d => d.meanNight);

  plotTraces.push({
    type: 'scatter3d',
    mode: 'lines',
    name: cluster.name, // legend 只出现一次
    // 关键：给整个 trace 增加一个标识，方便 legendClick 获取
    meta: { clusterId: cluster.id },
    // 只有在 active 时才真正显示在画布上
    opacity: isSelected ? 1 : (selectedClusterId === null ? 0.6 : 0.1), // 用极低透明度代替隐藏
    x: xValues,
    y: yValues,
    z: zValues,
    line: { color: cluster.color, width: isSelected ? 6 : 3 },
    customdata: cluster.data.map((_, idx) => ({ clusterId: cluster.id, pointIndex: idx })),
    hovertemplate: `<b>${cluster.name}</b><br>Mean_Day: %{y:.2f}<br>Mean_Night: %{z:.2f}<br>Date: %{x}<extra></extra>`,
    hoverinfo: (selectedClusterId === null || isSelected) ? 'all' : 'skip',
    showlegend: true,
    
    clickinfo: 'skip' // 虚线不触发点击
  });

  // 如果 showAllAttributes = true，再画其他指标，但 legend 可以隐藏
  if (showAllAttributes) {
    const extraKeys = [
      { yKey: 'P10Day', zKey: 'P10Night', name: 'P10' },
      { yKey: 'P25Day', zKey: 'P25Night', name: 'P25' },
      { yKey: 'P75Day', zKey: 'P75Night', name: 'P75' },
      { yKey: 'P90Day', zKey: 'P90Night', name: 'P90' }
    ];
  extraKeys.forEach(config => {
      // 2. 确保从 d[config.yKey] 能拿到数据
      const yExtra = cluster.data.map(d => (d as any)[config.yKey] ?? d.meanDay);
      const zExtra = cluster.data.map(d => (d as any)[config.zKey] ?? d.meanNight);

    // 关键修正：只有当该簇处于“可见”状态时（未选中任何簇，或当前簇是被选中的那个），才显示它的虚线
      const shouldShowExtra = isVisible; 

      if (yExtra[0] !== undefined) { // 简单检查确保数据存在
        plotTraces.push({
          type: 'scatter3d',
          mode: 'lines',
          name: `${cluster.name} - ${config.name}`,
          meta: { clusterId: cluster.id }, // 同样带上所属的 clusterId
          // 只有在 active 时才真正显示在画布上
          visible: shouldShowExtra ? true : false, 
          hoverinfo: isSelected ? 'all' : 'skip',
          customdata: cluster.data.map((_, idx) => ({ clusterId: cluster.id, pointIndex: idx })),
          x: xValues,
          y: yExtra,
          z: zExtra,
          line: { 
            color: cluster.color, 
            width: 1.5, 
          },
          hovertemplate: `<b>${cluster.name} - ${config.name}</b><br>${config.name}_Day: %{y:.2f}<br>${config.name}_Night: %{z:.2f}<br>Date: %{x}<extra></extra>`,
          opacity: isSelected ? 0.8 : 0.2, // 选中时虚线亮一点
          showlegend: true, 

          clickinfo: 'skip' // 虚线不触发点击
        });
      }
    });
  }
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
              width: 10
            },
            symbol: 'circle'
          },
          hoverinfo: 'none', // Don't interfere with hover
          showlegend: true
        });
      }
    }

    return plotTraces;
  }, [clusters, selectedClusterId, selectedPointIndex, showAllAttributes]);
  const sceneLayout = useMemo(() => ({
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
            range: [-7, 9],
            dtick: 2
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
            range: [-9, 6],
            dtick: 2
        },
        dragmode: 'turntable',
        aspectmode: 'cube',
        // 动态相机位置
        camera: { 
        eye: isAutoRotating 
        ? { 
            x: 2.12 * Math.cos(rotationAngle), 
            y: 2.12 * Math.sin(rotationAngle), 
            z: 1.5 
          } 
        : lastCameraRef.current,
      projection: { type: 'perspective' as const }
      },
    }), [isAutoRotating, rotationAngle]);

    // 修改 layout，调整 legend 位置和样式
  const layout: any = useMemo(() => ({
    autosize: true,
    showlegend: true,
    paper_bgcolor: '#000000',   // ← 整个画布
    plot_bgcolor: '#000000',    // ← 绘图区

    legend: {
      x: 1.05,
      y: 0.9,            // 放在靠近顶部的地方（比如 90% 高度处）
      xanchor: 'right',
      yanchor: 'top',    // 关键：改为顶部锚点，图例多时会向下延伸

      bgcolor: 'rgba(15, 15, 15, 0)',
      bordercolor: '#000000ff',
      font: { size: 14, color: '#ffffff' },  // 文本颜色改成白色
      orientation: 'v',  // 垂直排列
      traceorder: 'normal',
      tracegroupgap: 0
    },
    uirevision: 'true',
    scene: sceneLayout
  }), [sceneLayout]);

  // 修改 handlePlotClick
  const handlePlotClick = useCallback((event: any) => {
    if (!event.points || event.points.length === 0) return;

    // 点击时停止自动旋转，防止相机位置冲突
    setIsAutoRotating(false); 

    const point = event.points[0];
    const meta = point.customdata;
    
    if (meta) {
      onClusterSelect(meta.clusterId, meta.pointIndex);
    }
  }, [onClusterSelect]); // 只有当回调改变时才更新

  const handleLegendClick = (event: any) => {
    // 1. 获取当前点击的轨迹对象
    // 注意：这里的 traces 是来自你 useMemo 定义的那个数组
    const clickedTrace = traces[event.curveNumber];

    // 2. 检查我们埋下的 meta 信息
    if (clickedTrace && clickedTrace.meta && clickedTrace.meta.clusterId !== undefined) {
      const targetId = clickedTrace.meta.clusterId;

      // 3. 执行选择逻辑
      // 我们可以直接调用父组件传入的选中函数
      onClusterSelect(targetId, 0);
    }
    
    // 返回 false 告诉 Plotly 不要切换显示/隐藏状态
    return false;
  };

return (
  <div className="absolute inset-0">
    {/* 按钮容器 */}
    <div className="absolute left-4 bottom-8 z-50 flex flex-col gap-2">
      
      {/* 原有的 Reset 按钮 */}
      {selectedClusterId !== null && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg shadow-md hover:bg-gray-800 text-sm font-medium transition-colors"
        >
          <Maximize2 size={20} />
          Reset View
        </button> 
      )}
        
      {/* 核心：新增的播放/暂停按钮 */}
      <button
        onClick={() => setIsAutoRotating(!isAutoRotating)}
        className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-lg shadow-md hover:bg-gray-300 text-sm font-medium transition-all backdrop-blur-sm border border-white/10"
      >
        {isAutoRotating ? (
          <>Stop <Pause size={16} /> </> // 或者使用图标 <Pause size={16} />
        ) : (
          <>Play <Play size={16} /> </> // 或者使用图标 <Play size={16} />
        )}
      </button>

    </div>

    <Plot
      // --- 关键部分 ---
      data={traces}
      layout={layout}
      // uirevision={true}
      useResizeHandler={true}
      style={{ width: '100%', height: '100%' }}
      onClick={handlePlotClick}
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
