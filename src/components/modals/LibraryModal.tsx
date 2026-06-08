import React, { useState } from 'react';
import { X, Trash2, Clock, Share2, RotateCcw, Plus, FolderOpen } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { formatDate } from '../../utils';

export const LibraryModal: React.FC = () => {
  const {
    showLibraryModal, setShowLibraryModal, projects, loadProject,
    deleteProject, currentProject, restoreVersion, createVersion,
  } = useEditorStore();
  const [selectedId, setSelectedId] = useState(currentProject?.id || projects[0]?.id || '');

  const selected = projects.find(p => p.id === selectedId);

  if (!showLibraryModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[1000px] max-h-[85vh] bg-ink-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white font-display flex items-center gap-2">
            <FolderOpen size={18} className="text-neon-purple" /> 我的作品库
          </h3>
          <button onClick={() => setShowLibraryModal(false)} className="btn-icon p-1.5">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden flex">
          <div className="w-72 border-r border-white/5 overflow-y-auto p-3 space-y-2">
            {projects.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Plus size={24} className="text-white/30" />
                </div>
                <p className="text-sm text-white/50 mb-1">还没有保存的作品</p>
                <p className="text-xs text-white/30">点击顶部"保存"按钮添加</p>
              </div>
            ) : (
              projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
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
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/90 font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-white/40">{formatDate(p.updatedAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {selected ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white font-display mb-1">{selected.name}</h4>
                    <p className="text-xs text-white/50">
                      创建于 {formatDate(selected.createdAt)} · 更新于 {formatDate(selected.updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadProject(selected.id)}
                      className="btn-primary text-xs"
                    >
                      打开此作品
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定删除此作品？')) deleteProject(selected.id);
                      }}
                      className="btn-icon p-2 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {selected.thumbnail && (
                  <div className="rounded-xl overflow-hidden border border-white/10 max-w-md">
                    <img src={selected.thumbnail} alt="" className="w-full" />
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Clock size={14} className="text-neon-amber" />
                      历史版本
                    </h5>
                    <button
                      onClick={createVersion}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 flex items-center gap-1"
                    >
                      <Plus size={12} /> 保存新版本
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selected.versions.slice().reverse().map((v, i, arr) => {
                      const realIndex = arr.length - 1 - i;
                      return (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs text-white/80 font-medium">版本 v{selected.versions.length - realIndex}</p>
                            <p className="text-[10px] text-white/40">{formatDate(v.timestamp)}</p>
                          </div>
                          <div className="flex gap-1.5">
                            {realIndex !== selected.versions.length - 1 && (
                              <button
                                onClick={() => {
                                  if (confirm('恢复到此版本？当前未保存的更改将丢失。')) {
                                    loadProject(selected.id);
                                    setTimeout(() => restoreVersion(realIndex), 100);
                                  }
                                }}
                                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 flex items-center gap-1"
                              >
                                <RotateCcw size={12} /> 恢复
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                      <p className="text-[10px] text-white/40">
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
    </div>
  );
};
