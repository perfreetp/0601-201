import React, { useState } from 'react';
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Download, Save, Share2,
  Layers, Monitor, Smartphone, Square, Play, FolderOpen, Sparkles, RotateCcw,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import * as htmlToImage from 'html-to-image';
import { downloadBlob } from '../../utils';

export const TopToolbar: React.FC = () => {
  const {
    undo, redo, historyIndex, history, zoom, setZoom,
    canvasSize, background, elements, setShowPreviewModal,
    setShowLibraryModal, setShowBatchModal, saveToLibrary,
    generateShareLink, currentProject,
  } = useEditorStore();

  const [saving, setSaving] = useState(false);

  const handleExport = async (format: 'png' | 'jpeg', scale = 3) => {
    const node = document.getElementById('export-canvas');
    if (!node) return;
    try {
      const dataUrl = await htmlToImage.toPng(node, {
        pixelRatio: scale,
        backgroundColor: background.startsWith('#') ? background : undefined,
        quality: 1,
      });
      const blob = await (await fetch(dataUrl)).blob();
      downloadBlob(blob, `design_${Date.now()}.${format}`);
    } catch (e) {
      console.error(e);
      alert('导出失败，请重试');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const node = document.getElementById('export-canvas');
    let thumbnail = '';
    if (node) {
      try {
        thumbnail = await htmlToImage.toPng(node, { pixelRatio: 0.5, quality: 0.7 });
      } catch {}
    }
    const name = prompt('作品名称：', currentProject?.name || `我的设计 ${new Date().toLocaleDateString()}`);
    if (name) {
      saveToLibrary(name, thumbnail);
      alert('已保存到作品库！');
    }
    setSaving(false);
  };

  const handleShare = async () => {
    const link = generateShareLink();
    if (link) {
      navigator.clipboard?.writeText(link);
      alert(`分享链接已复制：\n${link}`);
    }
  };

  return (
    <div className="h-14 flex items-center justify-between px-4 bg-ink-900/90 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center shadow-glow-purple">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm text-white tracking-wide">PodcastDesigner</span>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={historyIndex <= 0} className="btn-icon p-2 disabled:opacity-30 disabled:cursor-not-allowed" title="撤销 (Ctrl+Z)">
            <Undo2 size={16} />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="btn-icon p-2 disabled:opacity-30 disabled:cursor-not-allowed" title="重做 (Ctrl+Y)">
            <Redo2 size={16} />
          </button>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <button onClick={() => setZoom(zoom - 0.05)} className="text-white/60 hover:text-white"><ZoomOut size={14} /></button>
          <span className="text-xs text-white/80 font-mono min-w-[48px] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(zoom + 0.05)} className="text-white/60 hover:text-white"><ZoomIn size={14} /></button>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-white/5 border border-white/10">
          <button onClick={() => {
            useEditorStore.getState().setCanvasSize({ ...canvasSize, width: 3000, height: 3000, name: '方形', aspect: '1:1' });
          }} className="p-1 rounded hover:bg-white/10" title="方形">
            <Square size={13} className="text-white/60" />
          </button>
          <button onClick={() => {
            useEditorStore.getState().setCanvasSize({ ...canvasSize, width: 1080, height: 1920, name: '竖版', aspect: '9:16' });
          }} className="p-1 rounded hover:bg-white/10" title="竖版">
            <Smartphone size={13} className="text-white/60" />
          </button>
          <button onClick={() => {
            useEditorStore.getState().setCanvasSize({ ...canvasSize, width: 1920, height: 1080, name: '横版', aspect: '16:9' });
          }} className="p-1 rounded hover:bg-white/10" title="横版">
            <Monitor size={13} className="text-white/60" />
          </button>
          <div className="w-px h-3 bg-white/20 mx-1" />
          <span className="text-[10px] text-white/50 font-mono mr-1">{canvasSize.width}×{canvasSize.height}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setShowBatchModal(true)} className="btn-ghost text-xs flex items-center gap-1.5">
          <Layers size={14} /> 批量出图
        </button>
        <button onClick={() => setShowPreviewModal(true)} className="btn-ghost text-xs flex items-center gap-1.5">
          <Play size={14} /> 预览裁切
        </button>
        <button onClick={() => setShowLibraryModal(true)} className="btn-ghost text-xs flex items-center gap-1.5">
          <FolderOpen size={14} /> 作品库
        </button>
        <div className="h-6 w-px bg-white/10 mx-1" />
        <button onClick={handleShare} className="btn-ghost text-xs flex items-center gap-1.5">
          <Share2 size={14} /> 分享
        </button>
        <button onClick={handleSave} disabled={saving} className="btn-ghost text-xs flex items-center gap-1.5">
          <Save size={14} /> {saving ? '保存中...' : '保存'}
        </button>
        <button onClick={() => handleExport('png', 3)} className="btn-primary text-xs flex items-center gap-1.5">
          <Download size={14} /> 导出高清图
        </button>
      </div>
    </div>
  );
};
