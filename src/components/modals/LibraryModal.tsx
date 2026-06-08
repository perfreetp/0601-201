import React, { useState, useMemo } from 'react';
import {
  X, Trash2, Clock, Share2, RotateCcw, Plus, FolderOpen, Search,
  ArrowUpDown, Tag, Filter, Eye, Check, ChevronDown, ChevronRight,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { formatDate, generateId } from '../../utils';
import { CanvasElementRenderer } from '../canvas/CanvasElementRenderer';
import type { Project } from '../../types';

export const LibraryModal: React.FC = () => {
  const {
    showLibraryModal, setShowLibraryModal, projects, loadProject,
    deleteProject, currentProject, restoreVersion, createVersion,
    librarySearch, setLibrarySearch,
    librarySort, setLibrarySort,
    libraryFilterTag, setLibraryFilterTag,
    libraryFilterCategory, setLibraryFilterCategory,
    categories,
  } = useEditorStore();

  const [selectedId, setSelectedId] = useState(currentProject?.id || projects[0]?.id || '');
  const [previewVersion, setPreviewVersion] = useState<number | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    projects.forEach(p => p.tags?.forEach(t => s.add(t)));
    return Array.from(s);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let list = [...projects];
    if (librarySearch.trim()) {
      const q = librarySearch.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q)) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    if (libraryFilterCategory) {
      list = list.filter(p => p.category === libraryFilterCategory);
    }
    if (libraryFilterTag) {
      list = list.filter(p => p.tags?.includes(libraryFilterTag));
    }
    list.sort((a, b) => {
      if (librarySort === 'name') return a.name.localeCompare(b.name);
      if (librarySort === 'createdAt') return b.createdAt - a.createdAt;
      return b.updatedAt - a.updatedAt;
    });
    return list;
  }, [projects, librarySearch, librarySort, libraryFilterCategory, libraryFilterTag]);

  const selected: Project | undefined = projects.find(p => p.id === selectedId);

  const previewingVersion = previewVersion !== null && selected ? selected.versions[previewVersion] : null;

  if (!showLibraryModal) return null;

  const handleRestoreVersion = (idx: number) => {
    if (!selected) return;
    if (!confirm(`确定恢复版本 v${selected.versions.length - idx}？当前未保存的更改将丢失。`)) return;
    loadProject(selected.id);
    setTimeout(() => restoreVersion(idx), 100);
    setPreviewVersion(null);
  };

  const sortLabel = librarySort === 'name' ? '按名称' : librarySort === 'createdAt' ? '按创建时间' : '按更新时间';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[1050px] max-h-[85vh] bg-ink-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white font-display flex items-center gap-2">
            <FolderOpen size={18} className="text-neon-purple" /> 我的作品库
            <span className="text-xs text-white/40 font-normal ml-2">共 {projects.length} 个作品</span>
          </h3>
          <button onClick={() => { setShowLibraryModal(false); setPreviewVersion(null); }} className="btn-icon p-1.5">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder="搜索作品名称、标签、分类..."
              className="input-base text-sm pl-9 pr-3 w-full"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="btn-ghost text-xs flex items-center gap-1.5"
            >
              <ArrowUpDown size={13} /> {sortLabel} <ChevronDown size={12} />
            </button>
            {showSortMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 rounded-xl bg-ink-800 border border-white/10 shadow-xl overflow-hidden z-50">
                {[
                  { v: 'updatedAt', l: '按更新时间' },
                  { v: 'createdAt', l: '按创建时间' },
                  { v: 'name', l: '按名称' },
                ].map(o => (
                  <button
                    key={o.v}
                    onClick={() => { setLibrarySort(o.v as any); setShowSortMenu(false); }}
                    className={`w-full px-3 py-2 text-xs text-left flex items-center gap-2 ${
                      librarySort === o.v ? 'text-white bg-neon-purple/15' : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {librarySort === o.v && <Check size={12} />}
                    <span className={librarySort === o.v ? '' : 'ml-5'}>{o.l}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-white/40" />
            <select
              value={libraryFilterCategory || ''}
              onChange={(e) => setLibraryFilterCategory(e.target.value || null)}
              className="bg-white/5 border border-white/10 rounded-lg text-xs px-2.5 py-1.5 text-white/80 outline-none"
            >
              <option value="">所有分类</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {allTags.length > 0 && (
              <select
                value={libraryFilterTag || ''}
                onChange={(e) => setLibraryFilterTag(e.target.value || null)}
                className="bg-white/5 border border-white/10 rounded-lg text-xs px-2.5 py-1.5 text-white/80 outline-none"
              >
                <option value="">所有标签</option>
                {allTags.map(t => <option key={t} value={t}>#{t}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="w-72 border-r border-white/5 overflow-y-auto p-3 space-y-2">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Plus size={24} className="text-white/30" />
                </div>
                <p className="text-sm text-white/50 mb-1">没有匹配的作品</p>
                <p className="text-xs text-white/30">
                  {librarySearch || libraryFilterCategory || libraryFilterTag ? '尝试修改筛选条件' : '点击顶部"保存"按钮添加'}
                </p>
              </div>
            ) : (
              filteredProjects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedId(p.id); setPreviewVersion(null); }}
                  className={`w-full p-2.5 rounded-xl text-left flex gap-2.5 transition-all ${
                    selectedId === p.id
                      ? 'bg-neon-purple/15 border border-neon-purple/40'
                      : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }`}
                >
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs text-white/90 font-medium truncate">{p.name}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-white/40">
                      <span>{formatDate(p.updatedAt)}</span>
                      {p.category && <span>· {p.category}</span>}
                    </div>
                    {p.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.tags.slice(0, 3).map(t => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-neon-purple/20 text-[9px] text-white/60">#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {selected ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white font-display mb-1">{selected.name}</h4>
                    <p className="text-xs text-white/50 flex items-center gap-2 flex-wrap">
                      <span>创建于 {formatDate(selected.createdAt)}</span>
                      <span>·</span>
                      <span>更新于 {formatDate(selected.updatedAt)}</span>
                      {selected.category && <><span>·</span><span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{selected.category}</span></>}
                    </p>
                    {selected.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selected.tags.map(t => (
                          <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neon-purple/15 border border-neon-purple/30 text-[10px] text-white/70">
                            <Tag size={9} /> #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const node = document.getElementById('export-canvas');
                        let thumb = selected.thumbnail;
                        if (node) {
                          const { toPng } = await import('html-to-image');
                          try { thumb = await toPng(node, { pixelRatio: 0.5, quality: 0.7, cacheBust: true }); } catch {}
                        }
                        createVersion(thumb);
                      }}
                      className="btn-ghost text-xs flex items-center gap-1.5"
                    >
                      <Plus size={12} /> 保存新版本
                    </button>
                    <button
                      onClick={() => loadProject(selected.id)}
                      className="btn-primary text-xs"
                    >
                      打开此作品
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定删除此作品？')) {
                          deleteProject(selected.id);
                          setSelectedId('');
                        }
                      }}
                      className="btn-icon p-2 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 items-start">
                  <div className="rounded-xl overflow-hidden border border-white/10">
                    {previewingVersion ? (
                      <div className="p-3 bg-neon-amber/10 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye size={13} className="text-neon-amber" />
                          <span className="text-xs text-white/80">正在预览版本 v{selected.versions.length - (previewVersion || 0)}</span>
                        </div>
                        <button
                          onClick={() => setPreviewVersion(null)}
                          className="text-[10px] text-white/50 hover:text-white"
                        >
                          关闭预览
                        </button>
                      </div>
                    ) : selected.thumbnail ? (
                      <div className="p-3 bg-white/5 border-b border-white/10 flex items-center gap-2">
                        <FolderOpen size={13} className="text-neon-purple" />
                        <span className="text-xs text-white/70">当前版本预览</span>
                      </div>
                    ) : null}
                    {previewingVersion ? (
                      <div
                        className="aspect-square bg-ink-950 p-4 flex items-center justify-center"
                        style={{ background: previewingVersion.state.background }}
                      >
                        <div
                          style={{
                            width: `${previewingVersion.state.canvasSize.width * 0.15}px`,
                            height: `${previewingVersion.state.canvasSize.height * 0.15}px`,
                            position: 'relative',
                          }}
                        >
                          <div
                            style={{
                              width: `${previewingVersion.state.canvasSize.width}px`,
                              height: `${previewingVersion.state.canvasSize.height}px`,
                              position: 'relative',
                              transform: 'scale(0.15)',
                              transformOrigin: 'top left',
                            }}
                          >
                            {previewingVersion.state.elements.map((el, i) => (
                              <CanvasElementRenderer key={i} element={el} />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : selected.thumbnail ? (
                      <img src={selected.thumbnail} alt="" className="w-full" />
                    ) : (
                      <div className="aspect-square bg-white/5 flex items-center justify-center text-white/30 text-xs">
                        暂无缩略图
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <Clock size={14} className="text-neon-amber" />
                        历史版本 <span className="text-white/40 font-normal text-xs">({selected.versions.length})</span>
                      </h5>
                    </div>
                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {selected.versions.slice().reverse().map((v, i, arr) => {
                        const realIndex = arr.length - 1 - i;
                        const isLatest = realIndex === selected.versions.length - 1;
                        const isPreviewing = previewVersion === realIndex;
                        return (
                          <div
                            key={i}
                            className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                              isPreviewing
                                ? 'bg-neon-amber/10 border-neon-amber/40'
                                : 'bg-white/5 border-white/10'
                            }`}
                          >
                            {v.thumbnail ? (
                              <img src={v.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-purple/50 to-neon-pink/50 flex-shrink-0 flex items-center justify-center">
                                <Eye size={14} className="text-white/60" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-xs text-white/90 font-medium">版本 v{selected.versions.length - realIndex}</p>
                                {isLatest && (
                                  <span className="px-1.5 py-0.5 rounded bg-neon-teal/20 text-[9px] text-neon-teal border border-neon-teal/30">最新</span>
                                )}
                              </div>
                              <p className="text-[10px] text-white/40">{formatDate(v.timestamp)}</p>
                              <div className="flex gap-1.5 mt-2">
                                <button
                                  onClick={() => setPreviewVersion(isPreviewing ? null : realIndex)}
                                  className={`text-[10px] px-2 py-1 rounded-md flex items-center gap-1 ${
                                    isPreviewing
                                      ? 'bg-neon-amber/30 text-white border border-neon-amber/50'
                                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                  }`}
                                >
                                  <Eye size={10} /> {isPreviewing ? '关闭预览' : '预览'}
                                </button>
                                {!isLatest && (
                                  <button
                                    onClick={() => handleRestoreVersion(realIndex)}
                                    className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 flex items-center gap-1"
                                  >
                                    <RotateCcw size={10} /> 恢复此版本
                                  </button>
                                )}
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-white/20 mt-3 flex-shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                    <Share2 size={14} className="text-neon-teal" />
                    分享
                  </h5>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neon-teal/20 flex items-center justify-center">
                      <Share2 size={18} className="text-neon-teal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80 font-medium">
                        {selected.shareToken ? '已生成只读分享链接' : '创建只读分享链接'}
                      </p>
                      <p className="text-[10px] text-white/40 truncate">
                        {selected.shareToken ? `${window.location.origin}/share/${selected.shareToken}` : '其他人可查看但不能编辑'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <FolderOpen size={48} className="text-white/10 mb-3" />
                <p className="text-sm text-white/40">从左侧选择一个作品</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {previewingVersion && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-3 rounded-2xl bg-ink-800/95 backdrop-blur border border-neon-amber/30 shadow-2xl flex items-center gap-4">
          <Eye size={16} className="text-neon-amber" />
          <div>
            <p className="text-xs text-white/90 font-medium">正在预览历史版本</p>
            <p className="text-[10px] text-white/50">版本 v{selected?.versions.length - (previewVersion || 0)} · {previewingVersion ? formatDate(previewingVersion.timestamp) : ''}</p>
          </div>
          <div className="flex gap-2 ml-2">
            <button
              onClick={() => setPreviewVersion(null)}
              className="btn-ghost text-xs"
            >
              关闭预览
            </button>
            {selected && previewVersion !== null && previewVersion !== selected.versions.length - 1 && (
              <button
                onClick={() => handleRestoreVersion(previewVersion)}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <RotateCcw size={12} /> 恢复此版本
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
