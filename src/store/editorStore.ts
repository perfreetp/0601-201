import { create } from 'zustand';
import type { Asset, CanvasElement, CanvasState, CanvasSize, Project, BrandColor } from '../types';
import { CANVAS_SIZES, TEMPLATES } from '../data/templates';
import { generateId, cloneDeep, saveProjects, loadProjects, saveBrandColors, loadBrandColors, encodeShareData, decodeShareData, saveAssets, loadAssets } from '../utils';

interface EditorState extends CanvasState {
  projects: Project[];
  brandColors: BrandColor[];
  assets: Asset[];
  activePanel: 'templates' | 'elements' | 'text' | 'colors' | 'images' | 'library' | 'assets';
  batchTitles: string[];
  history: CanvasState[];
  historyIndex: number;
  showPreviewModal: boolean;
  showLibraryModal: boolean;
  showBatchModal: boolean;
  showAssetsModal: boolean;
  currentProject: Project | null;
  readonly: boolean;
  librarySearch: string;
  librarySort: 'updatedAt' | 'createdAt' | 'name';
  libraryFilterTag: string | null;
  libraryFilterCategory: string | null;
  categories: string[];
  saveDraft: { name: string; category: string; tags: string[] };
  sharedProjectMeta: { name: string; description?: string; author?: string; updatedAt?: number } | null;
  assetsFilter: 'all' | Asset['type'];
  assetsSearch: string;

  setActivePanel: (panel: EditorState['activePanel']) => void;
  selectElement: (id: string | null) => void;
  addElement: (element: Partial<CanvasElement> & { type: CanvasElement['type']; styles: any }) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  updateElementStyles: (id: string, styleUpdates: Record<string, any>) => void;
  deleteElement: (id: string) => void;
  restoreDeletedElement: () => void;
  duplicateElement: (id: string) => void;
  toggleLock: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  setBackground: (bg: string) => void;
  setCanvasSize: (size: CanvasSize) => void;
  setZoom: (zoom: number) => void;
  applyTemplate: (templateId: string) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  addBrandColor: (color: Omit<BrandColor, 'id'>) => void;
  removeBrandColor: (id: string) => void;
  saveToLibrary: (name: string, thumbnail: string, category?: string, tags?: string[], mode?: 'overwrite' | 'newVersion' | 'new') => void;
  saveProjectAsNewVersion: (thumbnail?: string) => void;
  loadProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  createVersion: (thumbnail?: string) => void;
  restoreVersion: (versionIndex: number) => void;
  generateShareLink: () => string;
  loadSharedProject: (token: string) => Project | null;
  setBatchTitles: (titles: string[]) => void;
  setShowPreviewModal: (show: boolean) => void;
  setShowLibraryModal: (show: boolean) => void;
  setShowBatchModal: (show: boolean) => void;
  setLibrarySearch: (s: string) => void;
  setLibrarySort: (s: EditorState['librarySort']) => void;
  setLibraryFilterTag: (t: string | null) => void;
  setLibraryFilterCategory: (c: string | null) => void;
  setSaveDraft: (draft: Partial<EditorState['saveDraft']>) => void;
  setShowAssetsModal: (show: boolean) => void;
  setAssetsFilter: (f: EditorState['assetsFilter']) => void;
  setAssetsSearch: (s: string) => void;
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => void;
  renameAsset: (id: string, name: string) => void;
  deleteAsset: (id: string) => void;
  findProjectsUsingAsset: (assetId: string) => Project[];
}

interface SavedCanvasState {
  elements: CanvasElement[];
  background: string;
  canvasSize: CanvasSize;
  zoom: number;
  deletedElements: CanvasElement[];
}

const initialElements: CanvasElement[] = [
  {
    id: generateId(),
    type: 'text',
    x: 150, y: 1200, width: 2700, height: 500,
    rotation: 0, locked: false, opacity: 1, zIndex: 2,
    styles: {
      content: '你的专辑标题',
      fontFamily: 'Space Grotesk',
      fontSize: 220,
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: -2,
      color: '#ffffff',
      textAlign: 'center',
    },
  },
  {
    id: generateId(),
    type: 'text',
    x: 150, y: 2500, width: 2700, height: 120,
    rotation: 0, locked: false, opacity: 0.9, zIndex: 3,
    styles: {
      content: '艺术家 / 播客名称',
      fontFamily: 'Inter',
      fontSize: 56,
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: 6,
      color: '#ec4899',
      textAlign: 'center',
    },
  },
  {
    id: generateId(),
    type: 'shape',
    x: 1000, y: 200, width: 1000, height: 1000,
    rotation: 0, locked: false, opacity: 1, zIndex: 1,
    styles: {
      fill: '#8b5cf6',
      shape: 'circle',
      borderRadius: 500,
      gradient: { type: 'radial', colors: ['#8b5cf6', '#ec4899'], angle: 0 },
    },
  },
];

const initialState: CanvasState = {
  elements: initialElements,
  selectedId: null,
  background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
  canvasSize: CANVAS_SIZES[0],
  zoom: 0.22,
  deletedElements: [],
};

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,
  projects: loadProjects(),
  brandColors: loadBrandColors(),
  assets: loadAssets(),
  activePanel: 'templates',
  batchTitles: ['EP. 001', 'EP. 002', 'EP. 003'],
  history: [cloneDeep(initialState)],
  historyIndex: 0,
  showPreviewModal: false,
  showLibraryModal: false,
  showBatchModal: false,
  showAssetsModal: false,
  currentProject: null,
  readonly: false,
  librarySearch: '',
  librarySort: 'updatedAt',
  libraryFilterTag: null,
  libraryFilterCategory: null,
  categories: ['专辑封面', '节目卡片', '播客封面', '音乐单曲', '社交媒体', '其他'],
  saveDraft: { name: '未命名作品', category: '其他', tags: [] },
  sharedProjectMeta: null,
  assetsFilter: 'all',
  assetsSearch: '',

  setActivePanel: (panel) => set({ activePanel: panel }),
  setLibrarySearch: (s) => set({ librarySearch: s }),
  setLibrarySort: (s) => set({ librarySort: s }),
  setLibraryFilterTag: (t) => set({ libraryFilterTag: t }),
  setLibraryFilterCategory: (c) => set({ libraryFilterCategory: c }),
  setSaveDraft: (draft) => set({ saveDraft: { ...get().saveDraft, ...draft } }),
  setShowAssetsModal: (show) => set({ showAssetsModal: show }),
  setAssetsFilter: (f) => set({ assetsFilter: f }),
  setAssetsSearch: (s) => set({ assetsSearch: s }),

  selectElement: (id) => set({ selectedId: id }),

  addElement: (element) => {
    if (get().readonly) return;
    const { elements } = get();
    const newElement: CanvasElement = {
      id: generateId(),
      x: 100, y: 100,
      width: 200, height: 200,
      rotation: 0, locked: false, opacity: 1,
      zIndex: Math.max(...elements.map(e => e.zIndex), 0) + 1,
      ...element,
    } as CanvasElement;
    set({ elements: [...elements, newElement], selectedId: newElement.id });
    get().pushHistory();
  },

  updateElement: (id, updates) => {
    if (get().readonly) return;
    const { elements } = get();
    const el = elements.find(e => e.id === id);
    if (el?.locked) return;
    set({
      elements: elements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      ),
    });
  },

  updateElementStyles: (id, styleUpdates) => {
    if (get().readonly) return;
    const { elements } = get();
    const el = elements.find(e => e.id === id);
    if (el?.locked) return;
    set({
      elements: elements.map(el =>
        el.id === id ? { ...el, styles: { ...el.styles, ...styleUpdates } } : el
      ),
    });
  },

  deleteElement: (id) => {
    if (get().readonly) return;
    const { elements, deletedElements } = get();
    const element = elements.find(e => e.id === id);
    if (!element || element.locked) return;
    set({
      elements: elements.filter(e => e.id !== id),
      deletedElements: [...deletedElements, { ...element, deleted: true }],
      selectedId: null,
    });
    get().pushHistory();
  },

  restoreDeletedElement: () => {
    if (get().readonly) return;
    const { elements, deletedElements } = get();
    if (deletedElements.length === 0) return;
    const last = deletedElements[deletedElements.length - 1];
    set({
      elements: [...elements, { ...last, deleted: false }],
      deletedElements: deletedElements.slice(0, -1),
      selectedId: last.id,
    });
  },

  duplicateElement: (id) => {
    if (get().readonly) return;
    const { elements } = get();
    const element = elements.find(e => e.id === id);
    if (!element || element.locked) return;
    const maxZ = Math.max(...elements.map(e => e.zIndex), 0);
    const newEl: CanvasElement = {
      ...cloneDeep(element),
      id: generateId(),
      x: element.x + 30,
      y: element.y + 30,
      zIndex: maxZ + 1,
      locked: false,
    };
    set({ elements: [...elements, newEl], selectedId: newEl.id });
    get().pushHistory();
  },

  toggleLock: (id) => {
    if (get().readonly) return;
    const { elements } = get();
    set({
      elements: elements.map(el =>
        el.id === id ? { ...el, locked: !el.locked } : el
      ),
    });
  },

  bringForward: (id) => {
    if (get().readonly) return;
    const { elements } = get();
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex(e => e.id === id);
    if (idx < sorted.length - 1) {
      const next = sorted[idx + 1];
      const tmp = sorted[idx].zIndex;
      sorted[idx].zIndex = next.zIndex;
      next.zIndex = tmp;
      set({ elements: [...sorted] });
    }
  },

  sendBackward: (id) => {
    if (get().readonly) return;
    const { elements } = get();
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex(e => e.id === id);
    if (idx > 0) {
      const prev = sorted[idx - 1];
      const tmp = sorted[idx].zIndex;
      sorted[idx].zIndex = prev.zIndex;
      prev.zIndex = tmp;
      set({ elements: [...sorted] });
    }
  },

  setBackground: (bg) => { if (!get().readonly) set({ background: bg }); },

  setCanvasSize: (size) => { if (!get().readonly) set({ canvasSize: size }); },

  setZoom: (zoom) => set({ zoom: Math.max(0.05, Math.min(2, zoom)) }),

  applyTemplate: (templateId) => {
    if (get().readonly) return;
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    const elements = template.elements.map(e => ({
      ...cloneDeep(e),
      id: generateId(),
    }));
    set({
      elements,
      background: template.background,
      canvasSize: template.canvasSize,
      selectedId: null,
    });
    get().pushHistory();
  },

  undo: () => {
    if (get().readonly) return;
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      const state = cloneDeep(history[newIdx]);
      set({ ...state, historyIndex: newIdx });
    }
  },

  redo: () => {
    if (get().readonly) return;
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      const state = cloneDeep(history[newIdx]);
      set({ ...state, historyIndex: newIdx });
    }
  },

  pushHistory: () => {
    if (get().readonly) return;
    const { history, historyIndex, elements, background, canvasSize, zoom, deletedElements } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(cloneDeep({ elements, background, canvasSize, zoom, deletedElements, selectedId: null }));
    if (newHistory.length > 100) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  addBrandColor: (color) => {
    if (get().readonly) return;
    const newColor: BrandColor = { ...color, id: generateId() };
    const colors = [...get().brandColors, newColor];
    set({ brandColors: colors });
    saveBrandColors(colors);
  },

  removeBrandColor: (id) => {
    if (get().readonly) return;
    const colors = get().brandColors.filter(c => c.id !== id);
    set({ brandColors: colors });
    saveBrandColors(colors);
  },

  saveToLibrary: (name, thumbnail, category, tags, mode) => {
    if (get().readonly) return;
    const { elements, background, canvasSize, zoom, deletedElements, projects, currentProject, assets } = get();
    const state = cloneDeep({ elements, background, canvasSize, zoom, deletedElements, selectedId: null });
    const now = Date.now();

    const usedAssetIds: string[] = [];
    elements.forEach(el => {
      if (el.type === 'image') {
        const s = el.styles as any;
        const matched = assets.find(a => a.type === 'image' && a.data === s.src);
        if (matched) usedAssetIds.push(matched.id);
      } else if (el.type === 'qr') {
        const s = el.styles as any;
        const matched = assets.find(a => a.type === 'qr' && a.meta?.value === s.value);
        if (matched) usedAssetIds.push(matched.id);
      } else if (el.type === 'icon') {
        const s = el.styles as any;
        const matched = assets.find(a => a.type === 'icon' && a.meta?.name === s.name);
        if (matched) usedAssetIds.push(matched.id);
      }
    });

    let newProjects: Project[];
    const finalCategory = category || (currentProject?.category ?? '其他');
    const finalTags = tags || (currentProject?.tags ?? []);

    if (currentProject && mode !== 'new') {
      if (mode === 'newVersion') {
        const updatedProject: Project = {
          ...currentProject,
          name,
          thumbnail,
          category: finalCategory,
          tags: finalTags,
          updatedAt: now,
          canvasState: state,
          usedAssetIds,
          versions: [...currentProject.versions, { timestamp: now, state, thumbnail }].slice(-20),
        };
        newProjects = projects.map(p => p.id === currentProject.id ? updatedProject : p);
        set({ currentProject: updatedProject, saveDraft: { name, category: finalCategory, tags: finalTags } });
      } else {
        newProjects = projects.map(p => p.id === currentProject.id ? {
          ...p,
          name,
          thumbnail,
          category: finalCategory,
          tags: finalTags,
          updatedAt: now,
          canvasState: state,
          usedAssetIds,
          versions: [...p.versions, { timestamp: now, state, thumbnail }].slice(-20),
        } : p);
        const updated = newProjects.find(p => p.id === currentProject.id)!;
        set({ currentProject: updated, saveDraft: { name, category: finalCategory, tags: finalTags } });
      }
    } else {
      const project: Project = {
        id: generateId(),
        name,
        thumbnail,
        category: finalCategory,
        tags: finalTags,
        createdAt: now,
        updatedAt: now,
        canvasState: state,
        versions: [{ timestamp: now, state, thumbnail }],
        shareToken: null,
        usedAssetIds,
      };
      newProjects = [project, ...projects];
      set({ currentProject: project, saveDraft: { name, category: finalCategory, tags: finalTags } });
    }

    set({ projects: newProjects });
    saveProjects(newProjects);
  },

  saveProjectAsNewVersion: (thumbnail) => {
    if (get().readonly) return;
    const { elements, background, canvasSize, zoom, deletedElements, projects, currentProject } = get();
    if (!currentProject) return;
    const state = cloneDeep({ elements, background, canvasSize, zoom, deletedElements, selectedId: null });
    const now = Date.now();
    const updatedProject: Project = {
      ...currentProject,
      thumbnail: thumbnail || currentProject.thumbnail,
      updatedAt: now,
      canvasState: state,
      versions: [...currentProject.versions, { timestamp: now, state, thumbnail: thumbnail || currentProject.thumbnail }].slice(-20),
    };
    const newProjects = projects.map(p => p.id === currentProject.id ? updatedProject : p);
    set({ projects: newProjects, currentProject: updatedProject });
    saveProjects(newProjects);
  },

  loadProject: (projectId) => {
    const project = get().projects.find(p => p.id === projectId);
    if (!project) return;
    const state = cloneDeep(project.canvasState);
    set({
      ...state,
      currentProject: project,
      selectedId: null,
      saveDraft: { name: project.name, category: project.category || '其他', tags: project.tags || [] },
    });
    set({ showLibraryModal: false });
  },

  deleteProject: (projectId) => {
    const newProjects = get().projects.filter(p => p.id !== projectId);
    set({ projects: newProjects, currentProject: get().currentProject?.id === projectId ? null : get().currentProject });
    saveProjects(newProjects);
  },

  createVersion: (thumbnail) => {
    const { elements, background, canvasSize, zoom, deletedElements, currentProject, projects } = get();
    if (!currentProject) return;
    const state = cloneDeep({ elements, background, canvasSize, zoom, deletedElements, selectedId: null });
    const now = Date.now();
    const updatedProject: Project = {
      ...currentProject,
      updatedAt: now,
      versions: [...currentProject.versions, { timestamp: now, state, thumbnail }].slice(-20),
    };
    const newProjects = projects.map(p => p.id === currentProject.id ? updatedProject : p);
    set({ currentProject: updatedProject, projects: newProjects });
    saveProjects(newProjects);
  },

  restoreVersion: (versionIndex) => {
    const { currentProject } = get();
    if (!currentProject || !currentProject.versions[versionIndex]) return;
    const state = cloneDeep(currentProject.versions[versionIndex].state);
    set({ ...state, selectedId: null });
  },

  generateShareLink: () => {
    if (get().readonly) return '';
    const { elements, background, canvasSize, currentProject, projects } = get();
    const token = encodeShareData({
      elements,
      background,
      canvasSize,
      projectName: currentProject?.name || '未命名作品',
      projectDescription: currentProject?.description,
      author: currentProject?.author,
      updatedAt: currentProject?.updatedAt || Date.now(),
    });
    if (!token) return '';

    if (currentProject) {
      const updated: Project = { ...currentProject, shareToken: token };
      const newProjects = projects.map(p => p.id === currentProject.id ? updated : p);
      set({ currentProject: updated, projects: newProjects });
      saveProjects(newProjects);
    }
    return `${window.location.origin}/share/${token}`;
  },

  loadSharedProject: (token) => {
    const decoded = decodeShareData(token);
    if (decoded && decoded.elements && decoded.background && decoded.canvasSize) {
      const { elements, background, canvasSize, projectName, projectDescription, author, updatedAt } = decoded;
      set({
        elements: cloneDeep(elements),
        background,
        canvasSize,
        selectedId: null,
        readonly: true,
        deletedElements: [],
        sharedProjectMeta: { name: projectName || '分享作品', description: projectDescription, author, updatedAt },
      });
      return { id: 'shared', name: projectName || '分享作品', description: projectDescription, author, updatedAt } as any;
    }
    const { projects } = get();
    const project = projects.find(p => p.shareToken === token);
    if (project) {
      const state = cloneDeep(project.canvasState);
      set({
        ...state,
        currentProject: project,
        selectedId: null,
        readonly: true,
        sharedProjectMeta: { name: project.name, description: project.description, author: project.author, updatedAt: project.updatedAt },
      });
      return project;
    }
    return null;
  },

  setBatchTitles: (titles) => set({ batchTitles: titles }),
  setShowPreviewModal: (show) => set({ showPreviewModal: show }),
  setShowLibraryModal: (show) => set({ showLibraryModal: show }),
  setShowBatchModal: (show) => set({ showBatchModal: show }),

  addAsset: (asset) => {
    const newAsset: Asset = {
      id: generateId(),
      createdAt: Date.now(),
      ...asset,
    };
    const newAssets = [newAsset, ...get().assets];
    set({ assets: newAssets });
    saveAssets(newAssets);
  },
  renameAsset: (id, name) => {
    const newAssets = get().assets.map(a => a.id === id ? { ...a, name } : a);
    set({ assets: newAssets });
    saveAssets(newAssets);
  },
  deleteAsset: (id) => {
    const newAssets = get().assets.filter(a => a.id !== id);
    set({ assets: newAssets });
    saveAssets(newAssets);
  },
  findProjectsUsingAsset: (assetId) => {
    return get().projects.filter(p => p.usedAssetIds?.includes(assetId));
  },
}));
