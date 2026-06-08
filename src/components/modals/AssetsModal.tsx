import React, { useState, useRef, useMemo } from 'react';
import {
  X, Image, QrCode, Grid3X3, Upload, Search, Filter, Trash2,
  Edit3, Check, AlertTriangle, Plus, FolderOpen,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { fileToDataURL, formatDate } from '../../utils';
import type { Asset, AssetType } from '../../types';

const typeLabel: Record<AssetType, string> = {
  image: '照片',
  qr: '二维码',
  icon: '图标',
};

export const AssetsModal: React.FC = () => {
  const {
    showAssetsModal, setShowAssetsModal,
    assets, addAsset, renameAsset, deleteAsset,
    assetsFilter, setAssetsFilter, assetsSearch, setAssetsSearch,
    addElement, findProjectsUsingAsset,
  } = useEditorStore();

  const fileRef = useRef<HTMLInputElement>(null);
  const [qrValue, setQrValue] = useState('');
  const [showAddQr, setShowAddQr] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Asset | null>(null);

  const filtered = useMemo(() => {
    let list = [...assets];
    if (assetsFilter !== 'all') list = list.filter(a => a.type === assetsFilter);
    if (assetsSearch.trim()) {
      const q = assetsSearch.trim().toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, [assets, assetsFilter, assetsSearch]);

  if (!showAssetsModal) return null;

  const handleUploadImage = async (file: File) => {
    const dataUrl = await fileToDataURL(file);
    const thumb = dataUrl;
    addAsset({
      type: 'image',
      name: file.name.replace(/\.[^.]+$/, '').slice(0, 20),
      data: dataUrl,
      thumbnail: thumb,
    });
  };

  const handleAddQr = () => {
    if (!qrValue.trim()) return;
    addAsset({
      type: 'qr',
      name: qrValue.slice(0, 15),
      data: qrValue,
      thumbnail: '',
      meta: { value: qrValue, size: 256, fgColor: '#ffffff', bgColor: 'transparent' },
    });
    setQrValue('');
    setShowAddQr(false);
  };

  const handleAddIcon = (name: string) => {
    addAsset({
      type: 'icon',
      name,
      data: name,
      thumbnail: '',
      meta: { name, color: '#ffffff', strokeWidth: 2 },
    });
  };

  const handleAddToCanvas = (asset: Asset) => {
    if (asset.type === 'image') {
      addElement({
        type: 'image',
        width: 800, height: 800,
        styles: {
          src: asset.data,
          filter: 'none',
          borderRadius: 0,
          objectFit: 'cover',
        },
      });
    } else if (asset.type === 'qr') {
      addElement({
        type: 'qr',
        width: 600, height: 600,
        styles: {
          value: asset.meta?.value || asset.data,
          size: 256,
          fgColor: '#ffffff',
          bgColor: 'transparent',
          level: 'M',
        },
      });
    } else if (asset.type === 'icon') {
      addElement({
        type: 'icon',
        width: 400, height: 400,
        styles: {
          name: asset.meta?.name || asset.data,
          color: '#ffffff',
          strokeWidth: 2,
        },
      });
    }
    setShowAssetsModal(false);
  };

  const handleDelete = (asset: Asset) => {
    const usedBy = findProjectsUsingAsset(asset.id);
    if (usedBy.length > 0) {
      setConfirmDelete(asset);
    } else {
      if (confirm(`确定删除素材「${asset.name}」？`)) deleteAsset(asset.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[900px] max-h-[85vh] bg-ink-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white font-display flex items-center gap-2">
            <Image size={18} className="text-neon-teal" /> 我的素材库
            <span className="text-xs text-white/40 font-normal ml-2">共 {assets.length} 个素材</span>
          </h3>
          <button onClick={() => setShowAssetsModal(false)} className="btn-icon p-1.5">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={assetsSearch}
              onChange={(e) => setAssetsSearch(e.target.value)}
              placeholder="搜索素材名称..."
              className="input-base text-sm pl-9 pr-3 w-full"
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
            <Filter size={12} className="text-white/40 ml-1 mr-1.5" />
            {(['all', 'image', 'qr', 'icon'] as const).map(t => (
              <button
                key={t}
                onClick={() => setAssetsFilter(t)}
                className={`text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                  assetsFilter === t
                    ? 'bg-neon-teal/20 text-white border border-neon-teal/40'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {t === 'all' && <FolderOpen size={11} />}
                {t === 'image' && <Image size={11} />}
                {t === 'qr' && <QrCode size={11} />}
                {t === 'icon' && <Grid3X3 size={11} />}
                {t === 'all' ? '全部' : typeLabel[t]}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            {assetsFilter === 'all' || assetsFilter === 'qr' ? (
              <button
                onClick={() => setShowAddQr(!showAddQr)}
                className="btn-ghost text-xs flex items-center gap-1.5"
              >
                <QrCode size={13} /> 添加二维码
              </button>
            ) : null}
            {(assetsFilter === 'all' || assetsFilter === 'image') && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadImage(f);
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                />
                <button onClick={() => fileRef.current?.click()} className="btn-ghost text-xs flex items-center gap-1.5">
                  <Upload size={13} /> 上传图片
                </button>
              </>
            )}
            {assetsFilter === 'all' || assetsFilter === 'icon' ? (
              <button
                onClick={() => handleAddIcon('Headphones')}
                className="btn-ghost text-xs flex items-center gap-1.5"
              >
                <Plus size={13} /> 添加图标
              </button>
            ) : null}
          </div>
        </div>

        {showAddQr && (
          <div className="px-5 py-3 bg-neon-teal/5 border-b border-white/10 flex gap-2">
            <input
              type="text"
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              placeholder="输入二维码链接或文本..."
              className="input-base flex-1 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddQr()}
            />
            <button onClick={handleAddQr} className="btn-primary text-xs px-4">
              添加
            </button>
            <button onClick={() => setShowAddQr(false)} className="btn-ghost text-xs px-3">
              取消
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Image size={32} className="text-white/20" />
              </div>
              <p className="text-sm text-white/50 mb-1">暂无素材</p>
              <p className="text-xs text-white/30">上传图片、添加二维码或图标，方便下次快速使用</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filtered.map(asset => (
                <div
                  key={asset.id}
                  className="group rounded-xl bg-white/5 border border-white/10 hover:border-neon-teal/40 overflow-hidden transition-all"
                >
                  <div
                    className="aspect-square relative bg-gradient-to-br from-ink-800 to-ink-900 flex items-center justify-center cursor-pointer"
                    onClick={() => handleAddToCanvas(asset)}
                    title="点击添加到画布"
                  >
                    {asset.type === 'image' && asset.thumbnail ? (
                      <img src={asset.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : asset.type === 'qr' ? (
                      <div className="w-3/4 h-3/4 bg-white rounded-md flex items-center justify-center">
                        <QrCode size={60} className="text-ink-900" />
                      </div>
                    ) : (
                      <Grid3X3 size={48} className="text-white/50" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <span className="text-[11px] text-white flex items-center gap-1 px-3 py-1.5 rounded-md bg-neon-teal/20 border border-neon-teal/40">
                        <Plus size={12} /> 添加到画布
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5">
                    {editingId === asset.id ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => {
                            if (editingName.trim()) renameAsset(asset.id, editingName.trim());
                            setEditingId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (editingName.trim()) renameAsset(asset.id, editingName.trim());
                              setEditingId(null);
                            }
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="flex-1 text-xs bg-black/30 border border-white/10 rounded px-2 py-1 text-white outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (editingName.trim()) renameAsset(asset.id, editingName.trim());
                            setEditingId(null);
                          }}
                          className="text-neon-teal p-1 hover:bg-white/5 rounded"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-white/90 font-medium truncate">{asset.name}</p>
                          <p className="text-[9px] text-white/40 mt-0.5">
                            {typeLabel[asset.type]} · {formatDate(asset.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(asset.id);
                              setEditingName(asset.name);
                            }}
                            className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white"
                            title="重命名"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(asset);
                            }}
                            className="p-1.5 rounded hover:bg-red-500/10 text-white/50 hover:text-red-400"
                            title="删除"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
          <div className="w-[420px] bg-ink-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white mb-1">确认删除素材？</h4>
                  <p className="text-xs text-white/60">
                    素材「<span className="text-white/90">{confirmDelete.name}</span>」正在被
                    <span className="text-red-300 font-medium mx-1">{findProjectsUsingAsset(confirmDelete.id).length}</span>
                    个作品使用，删除后这些作品中的该元素可能无法正常显示。
                  </p>
                </div>
              </div>
              <div className="max-h-32 overflow-y-auto mb-4 space-y-1">
                {findProjectsUsingAsset(confirmDelete.id).map(p => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-purple to-neon-pink" />
                    )}
                    <span className="text-xs text-white/80 truncate flex-1">{p.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="btn-ghost flex-1 text-sm"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    deleteAsset(confirmDelete.id);
                    setConfirmDelete(null);
                  }}
                  className="text-sm px-5 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                >
                  仍然删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
