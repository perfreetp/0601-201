import type { CanvasElement, CanvasState, Project } from '../types';

export const generateId = (): string => {
  return `el_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

export const cloneDeep = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const generateShareToken = (): string => {
  return Math.random().toString(36).slice(2, 15);
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const cropImageToCircle = (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
};

export const resizeImage = (dataUrl: string, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      const width = img.width * ratio;
      const height = img.height * ratio;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
};

export const getElementBoxStyle = (element: CanvasElement): React.CSSProperties => {
  return {
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    transform: `rotate(${element.rotation}deg)`,
    opacity: element.opacity,
    zIndex: element.zIndex,
  };
};

const STORAGE_KEY = 'podcast_design_projects';
const BRAND_KEY = 'podcast_design_brand_colors';
const HISTORY_KEY = 'podcast_design_history';

export const saveProjects = (projects: Project[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const loadProjects = (): Project[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveBrandColors = (colors: { id: string; name: string; color: string }[]): void => {
  localStorage.setItem(BRAND_KEY, JSON.stringify(colors));
};

export const loadBrandColors = (): { id: string; name: string; color: string }[] => {
  try {
    const data = localStorage.getItem(BRAND_KEY);
    return data ? JSON.parse(data) : [
      { id: 'bc1', name: '主色', color: '#8b5cf6' },
      { id: 'bc2', name: '强调色', color: '#ec4899' },
      { id: 'bc3', name: '文字色', color: '#ffffff' },
    ];
  } catch {
    return [];
  }
};

export const saveHistoryState = (state: CanvasState): void => {
  const history = loadHistoryStates();
  history.push({ ...state, timestamp: Date.now() } as any);
  if (history.length > 50) history.shift();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const loadHistoryStates = (): any[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};
