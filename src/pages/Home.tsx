import React, { useEffect, useState } from 'react';
import { TopToolbar } from '../components/toolbar/TopToolbar';
import { LeftPanel } from '../components/panels/LeftPanel';
import { RightPanel } from '../components/panels/RightPanel';
import { Canvas } from '../components/canvas/Canvas';
import { PreviewModal } from '../components/modals/PreviewModal';
import { LibraryModal } from '../components/modals/LibraryModal';
import { BatchModal } from '../components/modals/BatchModal';
import { AssetsModal } from '../components/modals/AssetsModal';
import { useEditorStore } from '../store/editorStore';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Download, AlertTriangle, Home as HomeIcon, Copy, Calendar, Ruler, Sparkles, User, FileText } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { downloadBlob, formatDate } from '../utils';

export default function Home() {
  const { undo, redo, readonly, loadSharedProject, canvasSize, currentProject, sharedProjectMeta } = useEditorStore();
  const { token } = useParams();
  const [shareError, setShareError] = useState(false);
  const [shareLoaded, setShareLoaded] = useState(false);

  const shareTitle = sharedProjectMeta?.name || currentProject?.name || '分享作品';
  const shareUpdatedAt = sharedProjectMeta?.updatedAt || currentProject?.updatedAt;
  const shareAuthor = sharedProjectMeta?.author || currentProject?.author;
  const shareDescription = sharedProjectMeta?.description || currentProject?.description;

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
      downloadBlob(blob, `${shareTitle.replace(/[^\w\u4e00-\u9fa5]/g, '_')}_${Date.now()}.png`);
    } catch (e) {
      alert('导出失败');
    }
  };

  const handleCopyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    alert('链接已复制到剪贴板');
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
      <div className="min-h-screen w-screen flex flex-col bg-ink-950 overflow-x-hidden">
        <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 bg-ink-900/85 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center shadow-glow-purple">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] text-white/40 font-mono tracking-wider">PODCASTDESIGNER</p>
              <p className="text-xs text-white/60">作品发布页</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              className="btn-ghost text-xs flex items-center gap-1.5"
              title="复制分享链接"
            >
              <Copy size={14} /> 复制链接
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-ghost text-xs flex items-center gap-1.5"
            >
              <HomeIcon size={14} /> 返回首页
            </button>
            <button onClick={handleShareExport} className="btn-primary text-xs flex items-center gap-1.5">
              <Download size={14} /> 下载 PNG
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center py-10 px-4 overflow-y-auto">
          <div className="w-full max-w-4xl">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl mx-auto" style={{ maxWidth: 720 }}>
              <div className="relative bg-ink-900" style={{ padding: '8%' }}>
                <div className="absolute top-3 left-3 text-[9px] text-white/30 font-mono tracking-widest">
                  {canvasSize.width} × {canvasSize.height} · {canvasSize.aspect}
                </div>
                <Canvas />
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white font-display mb-2 leading-tight">
                  {shareTitle}
                </h1>
                {shareDescription && (
                  <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line max-w-2xl">
                    {shareDescription}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-wider mb-1.5">
                    <Ruler size={11} /> 尺寸
                  </div>
                  <p className="text-sm font-semibold text-white font-mono">
                    {canvasSize.width} × {canvasSize.height}
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5">{canvasSize.aspect} · {canvasSize.name}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-wider mb-1.5">
                    <Calendar size={11} /> 发布时间
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {shareUpdatedAt ? formatDate(shareUpdatedAt) : '—'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-wider mb-1.5">
                    <User size={11} /> 作者
                  </div>
                  <p className="text-sm font-semibold text-white truncate">
                    {shareAuthor || 'PodcastDesigner 用户'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-wider mb-1.5">
                    <FileText size={11} /> 图层
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {useEditorStore.getState().elements.length} 个
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-white/5 py-4 text-center text-[10px] text-white/30 flex items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Eye size={10} /> 只读预览
          </span>
          <span>·</span>
          <span>使用 PodcastDesigner 制作</span>
          <span>·</span>
          <button
            onClick={() => window.location.href = '/'}
            className="text-neon-teal hover:text-neon-teal/80 hover:underline"
          >
            立即创建
          </button>
        </footer>

        <div className="grain-overlay pointer-events-none" />
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
      <AssetsModal />
    </div>
  );
}
