import React, { useMemo,useState, useEffect, useRef  } from 'react';
import Plot from 'react-plotly.js';
import { Cluster } from '../types';
import { Maximize2 } from 'lucide-react';

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
  const requestRef = useRef<number>();

  useEffect(() => {
    // 关键：如果不允许旋转，直接清除动画并返回
    if (!isAutoRotating) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const animate = () => {
      setRotationAngle((prev) => prev + 0.005);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isAutoRotating, selectedClusterId]); // 监听旋转开关

    // // --- 新增：动画循环 ---
    // useEffect(() => {
    //   // 只有在没有选中特定簇时才旋转，或者根据需求一直旋转
    //   // 如果你想在选中后停止旋转，可以加上：if (selectedClusterId !== null) return;
      
    //   const animate = () => {
    //     setRotationAngle((prev) => (prev + 0.005)); // 调整这个数值改变旋转速度
    //     requestRef.current = requestAnimationFrame(animate);
    //   };

    //   requestRef.current = requestAnimationFrame(animate);
    //   return () => {
    //     if (requestRef.current) cancelAnimationFrame(requestRef.current);
    //   };
    // }, [selectedClusterId]);

    // --- 计算相机位置 ---
    // 使用极坐标转换：x = r * cos(θ), y = r * sin(θ)
    // 计算相机位置
    const radius = 2.12;
    const cameraEye = isAutoRotating 
    ? {
        x: radius * Math.cos(rotationAngle),
        y: radius * Math.sin(rotationAngle),
        z: 1.5
      }
    : undefined; // 停止旋转时传 undefined，配合 uirevision 使用户可以自由缩放旋转
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
    // visible: isVisible ? true : 'legendonly',
    // visible: Visible,
    opacity: isSelected ? 1 : (selectedClusterId === null ? 0.6 : 0.05), // 用极低透明度代替隐藏
    x: xValues,
    y: yValues,
    z: zValues,
    line: { color: cluster.color, width: isSelected ? 6 : 3 },
    customdata: cluster.data.map((_, idx) => ({ clusterId: cluster.id, pointIndex: idx })),
    hovertemplate: `<b>${cluster.name}</b><br>Mean_Day: %{y:.2f}<br>Mean_Night: %{z:.2f}<br>Date: %{x}<extra></extra>`,
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
          x: xValues,
          y: yExtra,
          z: zExtra,
          line: { 
            color: cluster.color, 
            width: 2, 
          },
          opacity: isSelected ? 0.8 : 0.3, // 选中时虚线亮一点
          showlegend: true, 
          // hoverinfo: 'skip' // 虚线不触发 hover，避免干扰主线
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

  const layout: any = {
    autosize: true,
    showlegend: true,
    legend: {
      x: 1.05,
      y: 0.9,            // 放在靠近顶部的地方（比如 90% 高度处）
      xanchor: 'right',
      yanchor: 'top',    // 关键：改为顶部锚点，图例多时会向下延伸

      bgcolor: '#00000000',
      bordercolor: '#000000ff',
      font: { size: 14, color: '#ffffff' },  // 文本颜色改成白色
      orientation: 'v',  // 垂直排列
      traceorder: 'normal',
      tracegroupgap: 0
    },
    uirevision: 'true', // 极其重要：防止 React 刷新导致用户视角被强行重置
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
        // camera: { eye: { x: 1.5, y: -1.5, z: 1.5 } }, // 固定视角
        camera: { 
        eye: cameraEye, // 使用动态计算的相机位置
        projection: { type: 'perspective' }
      },
    },
    margin: { l: 20, r: 20, b: 20, t: 20 },
    paper_bgcolor: '#222121ff',
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
  // return (

  //   <div className="absolute inset-0">

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
          <>Stop ⏸ </> // 或者使用图标 <Pause size={16} />
        ) : (
          <>Play ▶ </> // 或者使用图标 <Play size={16} />
        )}
      </button>

    </div>

    <Plot
      data={traces}
      layout={layout}
      // 注意：这里删掉了之前的 setIsAutoRotating(false)，
      // 这样用户在拖拽时，图表不会自动强行关掉旋转开关。
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