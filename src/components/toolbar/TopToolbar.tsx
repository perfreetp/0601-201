import React, { useState, useEffect } from 'react';
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Download, Save, Share2,
  Layers, Monitor, Smartphone, Square, Play, FolderOpen, Sparkles, RotateCcw,
  X, Tag, FolderPlus, Check, Copy, Plus, RefreshCcw,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import * as htmlToImage from 'html-to-image';
import { downloadBlob } from '../../utils';

export const TopToolbar: React.FC = () => {
  const {
    undo, redo, historyIndex, history, zoom, setZoom,
    canvasSize, background, elements, setShowPreviewModal,
    setShowLibraryModal, setShowBatchModal, saveToLibrary,
    saveProjectAsNewVersion,
    generateShareLink, currentProject, categories,
  } = useEditorStore();

  const [saving, setSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveCategory, setSaveCategory] = useState('其他');
  const [saveTags, setSaveTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [saveMode, setSaveMode] = useState<'overwrite' | 'newversion' | 'new'>('overwrite');
  const [thumbnail, setThumbnail] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (showSaveModal) {
      setSaveName(currentProject?.name || `我的设计 ${new Date().toLocaleDateString()}`);
      setSaveCategory(currentProject?.category || '其他');
      setSaveTags(currentProject?.tags || []);
      setSaveMode(currentProject ? 'newversion' : 'new');
      const genThumb = async () => {
        const node = document.getElementById('export-canvas');
        if (node) {
          try {
            const t = await htmlToImage.toPng(node, { pixelRatio: 0.5, quality: 0.7, cacheBust: true });
            setThumbnail(t);
          } catch {}
        }
      };
      genThumb();
    }
  }, [showSaveModal, currentProject]);

  const handleExport = async (format: 'png' | 'jpeg', scale = 3) => {
    const node = document.getElementById('export-canvas');
    if (!node) return;
    try {
      const dataUrl = await htmlToImage.toPng(node, {
        pixelRatio: scale,
        quality: 1,
        cacheBust: true,
      });
      const blob = await (await fetch(dataUrl)).blob();
      downloadBlob(blob, `design_${Date.now()}.${format}`);
    } catch (e) {
      console.error(e);
      alert('导出失败，请重试');
    }
  };

  const handleConfirmSave = async () => {
    if (!saveName.trim()) { alert('请输入作品名称'); return; }
    if (saveMode === 'newversion' && currentProject) {
      saveProjectAsNewVersion(thumbnail);
    } else {
      saveToLibrary(saveName.trim(), thumbnail, saveCategory, saveTags);
    }
    setShowSaveModal(false);
    alert('保存成功！');
  };

  const handleShare = async () => {
    setSaving(true);
    const node = document.getElementById('export-canvas');
    let t = '';
    if (node) {
      try {
        t = await htmlToImage.toPng(node, { pixelRatio: 0.5, quality: 0.7, cacheBust: true });
      } catch {}
    }
    if (!currentProject) {
      saveToLibrary(`分享作品 ${new Date().toLocaleDateString()}`, t, '社交媒体', ['分享']);
    }
    setTimeout(() => {
      const link = generateShareLink();
      if (link) {
        setShareLink(link);
        setShowShareModal(true);
      }
      setSaving(false);
    }, 200);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareLink);
    alert('链接已复制到剪贴板');
  };

  return (
    <>
      <div className="h-14 flex items-center justify-between px-4 bg-ink-900/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center shadow-glow-purple">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm text-white tracking-wide">PodcastDesigner</span>
            {currentProject && (
              <span className="ml-2 text-xs text-white/50 truncate max-w-[120px]">
                · {currentProject.name}
              </span>
            )}
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
          <button onClick={handleShare} disabled={saving} className="btn-ghost text-xs flex items-center gap-1.5">
            <Share2 size={14} /> 分享
          </button>
          <button onClick={() => setShowSaveModal(true)} disabled={saving} className="btn-ghost text-xs flex items-center gap-1.5">
            <Save size={14} /> {saving ? '保存中...' : '保存'}
          </button>
          <button onClick={() => handleExport('png', 3)} className="btn-primary text-xs flex items-center gap-1.5">
            <Download size={14} /> 导出高清图
          </button>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[480px] bg-ink-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white font-display flex items-center gap-2">
                <Save size={16} className="text-neon-purple" /> 保存作品
              </h3>
              <button onClick={() => setShowSaveModal(false)} className="btn-icon p-1.5">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-white/60 block mb-1.5">作品名称</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="input-base text-sm"
                  placeholder="请输入作品名称"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1.5 flex items-center gap-1">
                  <FolderPlus size={12} /> 分类
                </label>
                <select
                  value={saveCategory}
                  onChange={(e) => setSaveCategory(e.target.value)}
                  className="input-base text-sm"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1.5 flex items-center gap-1">
                  <Tag size={12} /> 标签（按Enter添加，支持多个）
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {saveTags.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-neon-purple/20 border border-neon-purple/40 text-xs text-white/90">
                      #{t}
                      <button onClick={() => setSaveTags(saveTags.filter((_, idx) => idx !== i))} className="hover:text-white">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    placeholder="添加新标签"
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTag.trim()) {
                        e.preventDefault();
                        if (!saveTags.includes(newTag.trim())) {
                          setSaveTags([...saveTags, newTag.trim()]);
                        }
                        setNewTag('');
                      }
                    }}
                    className="input-base flex-1 text-sm"
                  />
                  <button
                    onClick={() => {
                      if (newTag.trim() && !saveTags.includes(newTag.trim())) {
                        setSaveTags([...saveTags, newTag.trim()]);
                        setNewTag('');
                      }
                    }}
                    className="btn-ghost px-3 text-xs"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              {currentProject && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <p className="text-xs text-white/60 mb-2">保存方式</p>
                  <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white/5">
                    <input
                      type="radio"
                      checked={saveMode === 'newversion'}
                      onChange={() => setSaveMode('newversion')}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm text-white/90 flex items-center gap-1.5">
                        <RefreshCcw size={13} className="text-neon-teal" /> 保存为新版本
                      </p>
                      <p className="text-[10px] text-white/40 mt-0.5">在当前作品下新增一个版本，不会覆盖历史</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white/5">
                    <input
                      type="radio"
                      checked={saveMode === 'overwrite'}
                      onChange={() => setSaveMode('overwrite')}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm text-white/90 flex items-center gap-1.5">
                        <Check size={13} className="text-neon-amber" /> 覆盖当前作品
                      </p>
                      <p className="text-[10px] text-white/40 mt-0.5">直接更新最新版本（仍会保留历史版本记录）</p>
                    </div>
                  </label>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowSaveModal(false)} className="btn-ghost flex-1 text-sm">取消</button>
                <button onClick={handleConfirmSave} className="btn-primary flex-1 text-sm">确认保存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[480px] bg-ink-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white font-display flex items-center gap-2">
                <Share2 size={16} className="text-neon-teal" /> 分享作品
              </h3>
              <button onClick={() => setShowShareModal(false)} className="btn-icon p-1.5">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-white/60">复制以下链接发送给他人，对方可在只读页面查看作品：</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="input-base flex-1 text-xs font-mono text-white/70"
                />
                <button onClick={handleCopyLink} className="btn-primary px-3 text-xs flex items-center gap-1.5 whitespace-nowrap">
                  <Copy size={12} /> 复制
                </button>
              </div>
              <div className="p-3 rounded-xl bg-neon-teal/10 border border-neon-teal/30">
                <p className="text-[11px] text-white/70 leading-relaxed">
                  <Check size={12} className="inline text-neon-teal mr-1.5 -mt-0.5" />
                  链接包含完整设计数据，在任何设备打开都能完整显示作品内容
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowShareModal(false)} className="btn-primary flex-1 text-sm">完成</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
