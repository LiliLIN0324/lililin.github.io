import React, { useState, useEffect, useRef } from 'react';
import { AVAILABLE_KS } from './demos/3d-cluster-visualizer-main/constants';
import { fetchLocalClusterData } from './demos/3d-cluster-visualizer-main/utils/dataLoader';
import ClusterVisualizer from './demos/3d-cluster-visualizer-main/components/ClusterVisualizer';
import { Cluster } from './demos/3d-cluster-visualizer-main/types';
import { Loader2, AlertCircle } from 'lucide-react';
import './index.css';

export type AppProps = {
  initialK?: number;
  providedClusters?: Cluster[];
  isEmbedded?: boolean;
};

const ClusterVisualizer3D: React.FC<AppProps> = ({ initialK = 5, providedClusters, isEmbedded = false }) => {
  const [k, setK] = useState<number>(initialK);
  const [isCustomData, setIsCustomData] = useState<boolean>(!!(providedClusters && providedClusters.length));
  const [loadedClusters, setLoadedClusters] = useState<Cluster[]>([]);
  const [customClusters, setCustomClusters] = useState<Cluster[]>(providedClusters ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [showAllAttributes, setShowAllAttributes] = useState<boolean>(false);

  const activeClusters = isCustomData ? customClusters : loadedClusters;

  // 加载本地聚类数据
  useEffect(() => {
    if (providedClusters && providedClusters.length) {
      setCustomClusters(providedClusters);
      setIsCustomData(true);
      return;
    }

    if (isCustomData) return;

    const loadData = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      setLoadedClusters([]);
      handleReset();
      try {
        const data = await fetchLocalClusterData(k, showAllAttributes); // 根据 showAllAttributes 决定是否加载 extra keys
        if (data.length === 0) {
          setErrorMsg(`No data found for K=${k}.`);
        } else {
          setLoadedClusters(data);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load data files.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [k, isCustomData, providedClusters, showAllAttributes]);

  // 保持 providedClusters 同步
  useEffect(() => {
    if (providedClusters && providedClusters.length) {
      setCustomClusters(providedClusters);
      setIsCustomData(true);
    } else {
      setCustomClusters([]);
      setIsCustomData(false);
    }
  }, [providedClusters]);

  const handleClusterSelect = (clusterId: number, pointIndex: number) => {
    setSelectedClusterId(clusterId);
    setSelectedPointIndex(pointIndex);
  };

  const handleReset = () => {
    setSelectedClusterId(null);
    setSelectedPointIndex(null);
  };

  const switchToLocal = (val: number) => {
    setK(val);
    setIsCustomData(false);
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden ">
      {/* Top Control Bar */}
      {!isEmbedded && (
        <div className="absolute top-8 left-8 z-30 flex items-center gap-8 bg-gray-1000 text-white px-4 py-2 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Select K:</span>
            {AVAILABLE_KS.map((val) => (
              <button
                key={val}
                onClick={() => switchToLocal(val)}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  !isCustomData && k === val
                    ? 'bg-white text-black shadow'
                    : 'bg-gray-1000 text-white hover:bg-gray-800'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading & Error */}
      {isLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
        </div>
      )}
      {errorMsg && !isLoading && (
        <div className="absolute top-20 left-10 z-50 bg-red-50 text-red-700 px-4 py-3 rounded-md border border-red-200 shadow-sm flex items-center gap-2">
          <AlertCircle size={20} />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {/* 左下角按钮 */}
      <div className="absolute bottom-8 right-8 z-30">
        <button
          onClick={() => setShowAllAttributes(prev => !prev)}
          className="px-4 py-2 bg-white text-black rounded-lg shadow hover:bg-gray-300 transition-colors"
        >
          {showAllAttributes ? "Show Mean Attributes" : "Show All Attributes"}
        </button>
      </div>
      {/* Main Visualization */}
      <div className="absolute inset-0 bg-red-500">
        <ClusterVisualizer
          clusters={activeClusters}
          showAllAttributes={showAllAttributes}
          selectedClusterId={selectedClusterId}
          selectedPointIndex={selectedPointIndex}
          onClusterSelect={handleClusterSelect}
          onReset={handleReset}
        />
      </div>

    </div>
  );
};

export default ClusterVisualizer3D;
