import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { Cluster } from '../types';
import { Maximize2, Pause, Play, Layers, MousePointer2 } from 'lucide-react';

interface ClusterVisualizerProps {
  clusters: Cluster[];
  selectedClusterId: number | null;
  selectedPointIndex: number | null;
  onClusterSelect: (clusterId: number, pointIndex: number) => void;
  onReset: () => void;
  showAllAttributes: boolean;
}

const ClusterVisualizer: React.FC<ClusterVisualizerProps> = ({
  clusters,
  selectedClusterId,
  selectedPointIndex,
  onClusterSelect,
  onReset,
  showAllAttributes,
}) => {
  // --- 状态管理 ---
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  
  // 新增：多选相关的状态
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [activeClusterIds, setActiveClusterIds] = useState<number[]>([]);

  const lastCameraRef = useRef<{ x: number; y: number; z: number }>({
    x: 2.12, y: 2.12, z: 1.5
  });
  const requestRef = useRef<number>();

  // 自动旋转逻辑（保持不变）
  useEffect(() => {
    if (!isAutoRotating) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }
    const radius = 2.12;
    const animate = () => {
      setRotationAngle((prev) => {
        const next = prev + 0.005;
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

  // --- 核心 logic：计算 traces ---
  const traces = useMemo(() => {
    const plotTraces: any[] = [];

    clusters.forEach((cluster) => {
      // 判定逻辑：兼容单选和多选
      const isSelected = isMultiSelectMode 
        ? activeClusterIds.includes(cluster.id)
        : selectedClusterId === cluster.id;
      
      const isVisible = isMultiSelectMode
        ? (activeClusterIds.length === 0 || activeClusterIds.includes(cluster.id))
        : (selectedClusterId === null || selectedClusterId === cluster.id);

      const xValues = cluster.data.map(d => d.date);
      const yValues = cluster.data.map(d => d.meanDay);
      const zValues = cluster.data.map(d => d.meanNight);

      // 主线
      plotTraces.push({
        type: 'scatter3d',
        mode: 'lines',
        name: cluster.name,
        meta: { clusterId: cluster.id },
        // 视觉：选中则全亮，未选中但在模式内则稍淡，完全没选则极淡
        opacity: isVisible ? (isSelected ? 1 : 0.6) : 0.1,
        x: xValues,
        y: yValues,
        z: zValues,
        line: { color: cluster.color, width: isSelected ? 6 : 3 },
        customdata: cluster.data.map((_, idx) => ({ clusterId: cluster.id, pointIndex: idx })),
        hovertemplate: `<b>${cluster.name}</b><br>Mean_Day: %{y:.2f}<br>Mean_Night: %{z:.2f}<br>Date: %{x}<extra></extra>`,
        showlegend: true,
      });

      // 额外指标
      if (showAllAttributes) {
        const extraKeys = [
          { yKey: 'P10Day', zKey: 'P10Night', name: 'P10' },
          { yKey: 'P25Day', zKey: 'P25Night', name: 'P25' },
          { yKey: 'P75Day', zKey: 'P75Night', name: 'P75' },
          { yKey: 'P90Day', zKey: 'P90Night', name: 'P90' }
        ];
        extraKeys.forEach(config => {
          const yExtra = cluster.data.map(d => (d as any)[config.yKey] ?? d.meanDay);
          const zExtra = cluster.data.map(d => (d as any)[config.zKey] ?? d.meanNight);

          plotTraces.push({
            type: 'scatter3d',
            mode: 'lines',
            name: `${cluster.name} - ${config.name}`,
            meta: { clusterId: cluster.id },
            visible: isVisible, // 只有在可见范围内才渲染
            x: xValues,
            y: yExtra,
            z: zExtra,
            line: { color: cluster.color, width: 1.5 },
            opacity: isSelected ? 0.8 : 0.2,
            showlegend: true,
            clickinfo: 'skip'
          });
        });
      }
    });

    // 选中点 Dot
    if (!isMultiSelectMode && selectedClusterId !== null && selectedPointIndex !== null) {
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
            size: 6,
            color: 'white',
            line: { color: cluster.color, width: 10 },
            symbol: 'circle'
          },
          showlegend: true
        });
      }
    }

    return plotTraces;
    // 【修复 Bug 的关键】在这里补充依赖项
  }, [clusters, selectedClusterId, selectedPointIndex, showAllAttributes, isMultiSelectMode, activeClusterIds]);

   // Layout 逻辑保持不变
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
        : {x: lastCameraRef.current.x, y: lastCameraRef.current.y, z: lastCameraRef.current.z},

      projection: { type: 'perspective' as const }
      },
    }), [isAutoRotating, rotationAngle]);

  const layout: any = useMemo(() => ({
    autosize: true,
    showlegend: true,
    paper_bgcolor: '#000000',
    plot_bgcolor: '#000000',
    margin: { l: 0, r: 0, b: 0, t: 0, pad: 0 },
    legend: {
      x: 1.05, y: 0.9, xanchor: 'right', yanchor: 'top',
      bgcolor: 'rgba(15, 15, 15, 0)',
      font: { size: 14, color: '#ffffff' },
      orientation: 'v'
    },
    uirevision: 'true',
    scene: sceneLayout
  }), [sceneLayout]);

  const handlePlotClick = useCallback((event: any) => {
    if (!event.points || event.points.length === 0) return;
    setIsAutoRotating(false); 
    const point = event.points[0];
    const meta = point.customdata;
    if (meta) {
      // --- 修改开始 ---
      if (isMultiSelectMode) {
        // 多选模式：点击线条将其加入或移出 activeClusterIds
        setActiveClusterIds(prev => 
          prev.includes(meta.clusterId) 
            ? prev.filter(id => id !== meta.clusterId) 
            : [...prev, meta.clusterId]
        );
      } else {
        // 单选模式：维持原样
        onClusterSelect(meta.clusterId, meta.pointIndex);
      }
    }
  }, [onClusterSelect, isMultiSelectMode]); // 注意这里要加上 isMultiSelectMode 依赖

  const handleLegendClick = (event: any) => {
    const clickedTrace = traces[event.curveNumber];
    if (clickedTrace && clickedTrace.meta && clickedTrace.meta.clusterId !== undefined) {
      const targetId = clickedTrace.meta.clusterId;
      
      if (isMultiSelectMode) {
        setActiveClusterIds(prev => 
          prev.includes(targetId) ? prev.filter(id => id !== targetId) : [...prev, targetId]
        );
      } else {
        onClusterSelect(targetId, 0);
      }
    }
    return false;
  };

  return (
    <div className="absolute inset-0">
      <div className="absolute left-4 bottom-8 z-50 flex flex-col gap-2">
        {/* 多选模式切换按钮 */}
        <button
          onClick={() => {
            setIsMultiSelectMode(!isMultiSelectMode);
            setActiveClusterIds([]); 
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-all text-sm font-medium border border-white/10 ${
            isMultiSelectMode ? 'bg-blue-600 text-white' : 'bg-white text-black'
          }`}
        >
          {isMultiSelectMode ? <><Layers size={16} /> Mode: Multi</> : <><MousePointer2 size={16} /> Mode: Single</>}
        </button>

        {selectedClusterId !== null && (
          <button onClick={onReset} className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg text-sm">
            <Maximize2 size={20} /> Reset View
          </button> 
        )}
        
        <button onClick={() => setIsAutoRotating(!isAutoRotating)} className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm">
          {isAutoRotating ? <>Stop <Pause size={16} /></> : <>Play <Play size={16} /></>}
        </button>
      </div>

      <Plot
        data={traces}
        layout={layout}
        // useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        onClick={handlePlotClick}
        onLegendClick={handleLegendClick} 
        config={{ displayModeBar: true, displaylogo: false }}
      />
    </div>
  );
};

export default ClusterVisualizer;