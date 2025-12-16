export const SOFT20_COLORS = [
  'rgba(141, 211, 199, 1)', 'rgba(196, 196, 111, 1)', 'rgba(190, 186, 218, 1)',
  'rgba(251, 128, 114, 1)', 'rgba(128, 177, 211, 1)', 'rgba(253, 180, 98, 1)',
  'rgba(179, 222, 105, 1)', 'rgba(252, 205, 229, 1)', 'rgba(217, 217, 217, 1)',
  'rgba(188, 128, 189, 1)', 'rgba(204, 235, 197, 1)', 'rgba(255, 237, 111, 1)',
  'rgba(255, 174, 185, 1)', 'rgba(174, 199, 232, 1)', 'rgba(152, 223, 138, 1)',
  'rgba(255, 127, 14, 1)', 'rgba(255, 187, 120, 1)', 'rgba(44, 160, 44, 1)',
  'rgba(214, 39, 40, 1)', 'rgba(255, 152, 150, 1)'
];


export const getClusterColor = (index: number): string => {
  return SOFT20_COLORS[index % SOFT20_COLORS.length];
};
export const AVAILABLE_KS = [5, 12, 20, 26];