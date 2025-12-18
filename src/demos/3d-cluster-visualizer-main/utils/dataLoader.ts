import { Cluster } from '../types';
import { getClusterColor } from '../constants';
import { parseCSVContent } from './csvHelper';

/**
 * Fetches CSV files from the /public/data/K_{k}/ directory.
 * Expects file naming convention: K_{k}_Cluster{i}_3D_Data.csv
 */
export const fetchLocalClusterData = async (k: number, includeExtra = false): 
  Promise<Cluster[]> => {
  const clusters: Cluster[] = [];
  const promises: Promise<void>[] = [];

  // We loop from 0 to K-1 to try and fetch each cluster file
  for (let i = 0; i < k; i++) {
    const filename = `K_${k}_Cluster${i}_3D_Data.csv`;
    // In Vite, files in 'public' are served at root path. 
    // We assume user put files in public/data/K=...
    const url = `/data/K_${k}/${filename}`;

    const p = fetch(url)
      .then(res => {
        if (!res.ok) {
          // If a specific cluster file is missing, we just ignore it or log it
          console.warn(`File not found or unreachable: ${url}`);
          return null;
        }
        return res.text();
      })
      .then(text => {
        if (!text) return;
        
        const data = parseCSVContent(text, includeExtra);
        if (data.length > 0) {
          clusters.push({
            id: i,
            name: filename.replace('.csv', ''),
            data,
            color: getClusterColor(i)
          });
        }
      })
      .catch(err => {
        console.warn(`Error loading cluster ${i}:`, err);
      });

    promises.push(p);
  }

  await Promise.all(promises);

  // Sort by ID to ensure consistent order (Promise.all doesn't guarantee push order)
  return clusters.sort((a, b) => a.id - b.id);
};