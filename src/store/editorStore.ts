import { create } from 'zustand';
import type { CanvasElement, CanvasState, CanvasSize, Project, BrandColor } from '../types';
import { CANVAS_SIZES, TEMPLATES } from '../data/templates';
import { generateId, cloneDeep, saveProjects, loadProjects, saveBrandColors, loadBrandColors } from '../utils';

interface EditorState extends CanvasState {
  projects: Project[];
  brandColors: BrandColor[];
  activePanel: 'templates' | 'elements' | 'text' | 'colors' | 'images' | 'library';
  batchTitles: string[];
  history: CanvasState[];
  historyIndex: number;
  showPreviewModal: boolean;
  showLibraryModal: boolean;
  showBatchModal: boolean;
  currentProject: Project | null;

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
  saveToLibrary: (name: string, thumbnail: string) => void;
  loadProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  createVersion: () => void;
  restoreVersion: (versionIndex: number) => void;
  generateShareLink: () => string;
  setBatchTitles: (titles: string[]) => void;
  setShowPreviewModal: (show: boolean) => void;
  setShowLibraryModal: (show: boolean) => void;
  setShowBatchModal: (show: boolean) => void;
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
  activePanel: 'templates',
  batchTitles: ['EP. 001', 'EP. 002', 'EP. 003'],
  history: [cloneDeep(initialState)],
  historyIndex: 0,
  showPreviewModal: false,
  showLibraryModal: false,
  showBatchModal: false,
  currentProject: null,

  setActivePanel: (panel) => set({ activePanel: panel }),

  selectElement: (id) => set({ selectedId: id }),

  addElement: (element) => {
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
    const { elements } = get();
    set({
      elements: elements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      ),
    });
  },

  updateElementStyles: (id, styleUpdates) => {
    const { elements } = get();
    set({
      elements: elements.map(el =>
        el.id === id ? { ...el, styles: { ...el.styles, ...styleUpdates } } : el
      ),
    });
  },

  deleteElement: (id) => {
    const { elements, deletedElements } = get();
    const element = elements.find(e => e.id === id);
    if (!element) return;
    set({
      elements: elements.filter(e => e.id !== id),
      deletedElements: [...deletedElements, { ...element, deleted: true }],
      selectedId: null,
    });
    get().pushHistory();
  },

  restoreDeletedElement: () => {
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
    const { elements } = get();
    const element = elements.find(e => e.id === id);
    if (!element) return;
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
    const { elements } = get();
    set({
      elements: elements.map(el =>
        el.id === id ? { ...el, locked: !el.locked } : el
      ),
    });
  },

  bringForward: (id) => {
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

  setBackground: (bg) => set({ background: bg }),

  setCanvasSize: (size) => set({ canvasSize: size }),

  setZoom: (zoom) => set({ zoom: Math.max(0.05, Math.min(2, zoom)) }),

  applyTemplate: (templateId) => {
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
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      const state = cloneDeep(history[newIdx]);
      set({ ...state, historyIndex: newIdx });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      const state = cloneDeep(history[newIdx]);
      set({ ...state, historyIndex: newIdx });
    }
  },

  pushHistory: () => {
    const { history, historyIndex, elements, background, canvasSize, zoom, deletedElements } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(cloneDeep({ elements, background, canvasSize, zoom, deletedElements, selectedId: null }));
    if (newHistory.length > 100) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  addBrandColor: (color) => {
    const newColor: BrandColor = { ...color, id: generateId() };
    const colors = [...get().brandColors, newColor];
    set({ brandColors: colors });
    saveBrandColors(colors);
  },

  removeBrandColor: (id) => {
    const colors = get().brandColors.filter(c => c.id !== id);
    set({ brandColors: colors });
    saveBrandColors(colors);
  },

  saveToLibrary: (name, thumbnail) => {
    const { elements, background, canvasSize, zoom, deletedElements, projects, currentProject } = get();
    const state = cloneDeep({ elements, background, canvasSize, zoom, deletedElements, selectedId: null });
    const now = Date.now();
    let newProjects: Project[];

    if (currentProject) {
      newProjects = projects.map(p => p.id === currentProject.id ? {
        ...p,
        name,
        thumbnail,
        updatedAt: now,
        canvasState: state,
        versions: [...p.versions, { timestamp: now, state }].slice(-20),
      } : p);
    } else {
      const project: Project = {
        id: generateId(),
        name,
        thumbnail,
        createdAt: now,
        updatedAt: now,
        canvasState: state,
        versions: [{ timestamp: now, state }],
        shareToken: null,
      };
      newProjects = [project, ...projects];
      set({ currentProject: project });
    }

    set({ projects: newProjects });
    saveProjects(newProjects);
  },

  loadProject: (projectId) => {
    const project = get().projects.find(p => p.id === projectId);
    if (!project) return;
    const state = cloneDeep(project.canvasState);
    set({ ...state, currentProject: project, selectedId: null });
    set({ showLibraryModal: false });
  },

  deleteProject: (projectId) => {
    const newProjects = get().projects.filter(p => p.id !== projectId);
    set({ projects: newProjects, currentProject: get().currentProject?.id === projectId ? null : get().currentProject });
    saveProjects(newProjects);
  },

  createVersion: () => {
    const { elements, background, canvasSize, zoom, deletedElements, currentProject, projects } = get();
    if (!currentProject) return;
    const state = cloneDeep({ elements, background, canvasSize, zoom, deletedElements, selectedId: null });
    const now = Date.now();
    const updatedProject: Project = {
      ...currentProject,
      updatedAt: now,
      versions: [...currentProject.versions, { timestamp: now, state }].slice(-20),
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
    const { currentProject, projects } = get();
    if (!currentProject) return '';
    const token = Math.random().toString(36).slice(2, 15);
    const updated: Project = { ...currentProject, shareToken: token };
    const newProjects = projects.map(p => p.id === currentProject.id ? updated : p);
    set({ currentProject: updated, projects: newProjects });
    saveProjects(newProjects);
    return `${window.location.origin}/share/${token}`;
  },

  setBatchTitles: (titles) => set({ batchTitles: titles }),
  setShowPreviewModal: (show) => set({ showPreviewModal: show }),
  setShowLibraryModal: (show) => set({ showLibraryModal: show }),
  setShowBatchModal: (show) => set({ showBatchModal: show }),
}));
