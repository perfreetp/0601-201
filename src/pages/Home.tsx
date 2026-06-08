import React, { useEffect, useState } from 'react';
import { TopToolbar } from '../components/toolbar/TopToolbar';
import { LeftPanel } from '../components/panels/LeftPanel';
import { RightPanel } from '../components/panels/RightPanel';
import { Canvas } from '../components/canvas/Canvas';
import { PreviewModal } from '../components/modals/PreviewModal';
import { LibraryModal } from '../components/modals/LibraryModal';
import { BatchModal } from '../components/modals/BatchModal';
import { useEditorStore } from '../store/editorStore';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Download, AlertTriangle, Home as HomeIcon } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { downloadBlob } from '../utils';

export default function Home() {
  const { undo, redo, readonly, loadSharedProject, background, canvasSize } = useEditorStore();
  const { token } = useParams();
  const [shareError, setShareError] = useState(false);
  const [shareLoaded, setShareLoaded] = useState(false);

  useEffect(() => {
    if (token) {
      const project = loadSharedProject(token);
      if (!project) {
        setShareError(true);
      }
      setShareLoaded(true);
    } else {
      setShareLoaded(true);
    }
  }, [token, loadSharedProject]);

  useEffect(() => {
    if (readonly || shareError) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedId, deleteElement } = useEditorStore.getState();
        const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
        if (selectedId && !isInput) {
          deleteElement(selectedId);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo, readonly, shareError]);

  const handleShareExport = async () => {
    const node = document.getElementById('export-canvas');
    if (!node) return;
    try {
      const dataUrl = await htmlToImage.toPng(node, { pixelRatio: 3, quality: 1, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      downloadBlob(blob, `shared_design_${Date.now()}.png`);
    } catch (e) {
      alert('导出失败');
    }
  };

  if (!shareLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-ink-950">
        <div className="text-white/60 text-sm">加载中...</div>
      </div>
    );
  }

  if (shareError) {
    return (
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-ink-950">
        <div className="h-14 flex items-center justify-between px-4 bg-ink-900/90 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center shadow-glow-purple">
                <AlertTriangle size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-sm text-white tracking-wide">PodcastDesigner</span>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <HomeIcon size={14} /> 返回首页
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-neon-purple/20 border border-white/10 flex items-center justify-center">
              <AlertTriangle size={40} className="text-neon-amber" />
            </div>
            <h1 className="text-2xl font-bold text-white font-display mb-3">分享链接无效</h1>
            <p className="text-sm text-white/60 mb-8 leading-relaxed">
              该分享链接已失效、格式错误，或作品数据无法读取。<br />
              请向分享者索要新的链接。
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary text-sm inline-flex items-center gap-2"
            >
              <ArrowLeft size={14} /> 返回编辑器首页
            </button>
          </div>
        </div>
        <div className="grain-overlay" />
      </div>
    );
  }

  if (readonly) {
    return (
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-ink-950">
        <div className="h-14 flex items-center justify-between px-4 bg-ink-900/90 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/'}
              className="btn-ghost text-xs flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> 返回编辑器
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center shadow-glow-purple">
                <Eye size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-sm text-white tracking-wide">只读预览</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-white/50 font-mono mr-2">
              {canvasSize.width} × {canvasSize.height}
            </div>
            <button onClick={handleShareExport} className="btn-primary text-xs flex items-center gap-1.5">
              <Download size={14} /> 导出高清图
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <Canvas />
        </div>
        <div className="grain-overlay" />
        <PreviewModal />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-ink-950">
      <TopToolbar />
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <div className="flex-1 relative">
          <Canvas />
        </div>
        <RightPanel />
      </div>
      <div className="grain-overlay" />
      <PreviewModal />
      <LibraryModal />
      <BatchModal />
    </div>
  );
}
