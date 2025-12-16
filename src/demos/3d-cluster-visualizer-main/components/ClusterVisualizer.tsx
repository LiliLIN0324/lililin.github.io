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
      const isDimmed = selectedClusterId !== null && !isSelected;

      // Style logic
      let opacity = 0.8;
      let lineWidth = 3;
      
      if (isSelected) {
        opacity = 1;
        lineWidth = 6; // Bold line for selection
      } else if (isDimmed) {
        opacity = 0.6; // Faint background for others
        lineWidth = 1;
      }

      plotTraces.push({
        type: 'scatter3d',
        mode: 'lines',
        name: cluster.name,
        x: cluster.data.map((d) => d.date),
        y: cluster.data.map((d) => d.meanDay),
        z: cluster.data.map((d) => d.meanNight),
        line: {
          color: cluster.color,
          width: lineWidth,
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
      x: 1,         // 右侧
      y: 1,         // 顶部
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
            title: 'Date', 
            backgroundcolor: '#000000', 
            gridcolor: '#ffffffff', 
            showbackground: false,
            titlefont: { color: '#ffffff' },
            tickfont: { color: '#ffffff' },
            zerolinecolor: '#ffffff' // <-- 添加此行，设置零线颜色为白色
        },
        yaxis: { 
            title: 'Mean_Day', 
            backgroundcolor: '#000000', 
            gridcolor: '#ffffffff', 
            showbackground: false,
            titlefont: { color: '#ffffff' },
            tickfont: { color: '#ffffff' },
            zerolinecolor: '#ffffff' // <-- 添加此行
        },
        zaxis: { 
            title: 'Mean_Night', 
            backgroundcolor: '#000000', 
            gridcolor: '#ffffffff', 
            showbackground: false,
            titlefont: { color: '#ffffff' },
            tickfont: { color: '#ffffff' },
            zerolinecolor: '#ffffff' // <-- 添加此行
        },
        dragmode: 'turntable',
        aspectmode: 'cube'
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

  return (

    <div className="absolute inset-0">
      
      {/* Reset Button floating top right */}
      {selectedClusterId !== null && (

        <div className="absolute left-1 top-2 z-50 ">
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

