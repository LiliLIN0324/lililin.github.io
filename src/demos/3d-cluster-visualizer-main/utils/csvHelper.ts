import { Cluster, DataPoint } from '../types';
import { getClusterColor } from '../constants';

export const parseCSVFiles = async (files: File[]): Promise<Cluster[]> => {
  const clusters: Cluster[] = [];

  // Sort files by name to ensure Cluster 0 gets the first color, etc.
  // Assumes filenames like "...Cluster0...", "...Cluster1..."
  const sortedFiles = files.sort((a, b) => {
    const numA = extractClusterNumber(a.name);
    const numB = extractClusterNumber(b.name);
    return numA - numB;
  });

  for (let i = 0; i < sortedFiles.length; i++) {
    const file = sortedFiles[i];
    const text = await file.text();
    const data = parseCSVContent(text);

    // Try to determine cluster ID from filename, otherwise use index
    const clusterId = extractClusterNumber(file.name) ?? i;
    
    clusters.push({
      id: clusterId,
      name: file.name.replace('.csv', ''),
      data: data,
      color: getClusterColor(i), // Assign color based on sorted order
    });
  }

  return clusters;
};

const extractClusterNumber = (filename: string): number => {
  // Matches "Cluster1", "Cluster 1", etc.
  const match = filename.match(/Cluster\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : 999;
};

// export const parseCSVContent = (content: string): DataPoint[] => {
//   const lines = content.split('\n');
//   const data: DataPoint[] = [];

//   // Skip header if it exists (check if first char is number)
//   // If line starts with a letter, assume header
//   const startIndex = /^[a-zA-Z]/.test(lines[0]) ? 1 : 0;

//   for (let i = startIndex; i < lines.length; i++) {
//     const line = lines[i].trim();
//     if (!line) continue;

//     const parts = line.split(',');
//     // CSV Format: Date, Mean_Day, Mean_Night
//     // Ensure we have at least 3 columns
//     if (parts.length >= 3) {
//       const date = parseFloat(parts[0]);
//       const meanDay = parseFloat(parts[1]);
//       const meanNight = parseFloat(parts[2]);

//       if (!isNaN(date) && !isNaN(meanDay) && !isNaN(meanNight)) {
//         data.push({ date, meanDay, meanNight });
//       }
//     }
//   }
//   return data;
// };

export const parseCSVContent = (content: string): DataPoint[] => {
  const lines = content.trim().split("\n");
  const header = lines[0].split(",");

  const dateIdx = header.indexOf("Date");
  const meanDayIdx = header.indexOf("Mean_Day");
  const meanNightIdx = header.indexOf("Mean_Night");

  if (dateIdx === -1 || meanDayIdx === -1 || meanNightIdx === -1) {
    console.error("CSV is missing required columns: Date / Mean_Day / Mean_Night");
    return [];
  }

  const data: DataPoint[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",");

    data.push({
      date: Number(row[dateIdx]),
      meanDay: Number(row[meanDayIdx]),
      meanNight: Number(row[meanNightIdx]),
    });
  }

  return data;
};
