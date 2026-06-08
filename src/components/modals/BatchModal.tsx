import React, { useState } from 'react';
import { X, Plus, Layers, Download, Trash2, Play } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { CanvasElementRenderer } from '../canvas/CanvasElementRenderer';
import * as htmlToImage from 'html-to-image';
import { downloadBlob } from '../../utils';
import type { TextStyles } from '../../types';

export const BatchModal: React.FC = () => {
  const {
    showBatchModal, setShowBatchModal, elements, background,
    canvasSize, batchTitles, setBatchTitles, updateElementStyles,
  } = useEditorStore();
  const [exporting, setExporting] = useState(false);

  if (!showBatchModal) return null;

  const textElements = elements.filter(e => e.type === 'text');
  const targetTextEl = textElements.find(e => (e.styles as TextStyles).content.includes('EP') || (e.styles as TextStyles).content.includes('标题')) || textElements[0];

  const handleExportAll = async () => {
    if (!targetTextEl) { alert('请先添加一个文本元素'); return; }
    setExporting(true);
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    try {
      for (let i = 0; i < batchTitles.length; i++) {
        const title = batchTitles[i];
        const node = document.createElement('div');
        node.style.width = `${canvasSize.width}px`;
        node.style.height = `${canvasSize.height}px`;
        node.style.position = 'relative';
        node.style.background = background;
        node.style.overflow = 'hidden';
        container.appendChild(node);

        const snapElements = elements.map(e => ({
          ...e,
          styles: e.id === targetTextEl.id
            ? { ...e.styles, content: title } as any
            : e.styles,
        }));

        for (const el of snapElements) {
          const inner = document.createElement('div');
          inner.style.position = 'absolute';
          inner.style.left = `${el.x}px`;
          inner.style.top = `${el.y}px`;
          inner.style.width = `${el.width}px`;
          inner.style.height = `${el.height}px`;
          inner.style.transform = `rotate(${el.rotation}deg)`;
          inner.style.opacity = String(el.opacity);
          inner.style.zIndex = String(el.zIndex);
          if (el.type === 'text') {
            const s = el.styles as TextStyles;
            inner.style.fontFamily = s.fontFamily;
            inner.style.fontSize = `${s.fontSize}px`;
            inner.style.fontWeight = String(s.fontWeight);
            inner.style.lineHeight = String(s.lineHeight);
            inner.style.letterSpacing = `${s.letterSpacing}px`;
            inner.style.color = s.color;
            inner.style.textAlign = s.textAlign;
            inner.style.display = 'flex';
            inner.style.alignItems = 'center';
            inner.style.justifyContent = s.textAlign === 'center' ? 'center' : s.textAlign === 'right' ? 'flex-end' : 'flex-start';
            inner.style.wordBreak = 'break-word';
            inner.style.whiteSpace = 'pre-wrap';
            inner.textContent = s.content;
          } else if (el.type === 'shape') {
            const s: any = el.styles;
            if (s.gradient) {
              inner.style.background = s.gradient.type === 'linear'
                ? `linear-gradient(${s.gradient.angle}deg, ${s.gradient.colors.join(', ')})`
                : `radial-gradient(circle, ${s.gradient.colors.join(', ')})`;
            } else {
              inner.style.backgroundColor = s.fill;
            }
            if (s.shape === 'circle') inner.style.borderRadius = '50%';
            else if (s.shape === 'rect') inner.style.borderRadius = `${s.borderRadius}px`;
          }
          node.appendChild(inner);
        }

        const dataUrl = await htmlToImage.toPng(node, { pixelRatio: 2, quality: 1 });
        const blob = await (await fetch(dataUrl)).blob();
        downloadBlob(blob, `${title.replace(/[^\w\u4e00-\u9fa5]/g, '_')}.png`);
        await new Promise(r => setTimeout(r, 300));
        container.innerHTML = '';
      }
      alert(`已导出 ${batchTitles.length} 张图片！`);
    } catch (e) {
      console.error(e);
      alert('导出失败');
    } finally {
      document.body.removeChild(container);
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[900px] max-h-[85vh] bg-ink-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white font-display flex items-center gap-2">
            <Layers size={18} className="text-neon-purple" /> 批量出图
          </h3>
          <button onClick={() => setShowBatchModal(false)} className="btn-icon p-1.5">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden flex">
          <div className="w-80 border-r border-white/5 p-4 flex flex-col">
            <p className="text-xs text-white/60 mb-2">期数/标题列表（每行一个）</p>
            <textarea
              value={batchTitles.join('\n')}
              onChange={(e) => setBatchTitles(e.target.value.split('\n').filter(t => t.trim()))}
              className="input-base flex-1 text-sm font-mono resize-none"
              placeholder="EP. 001&#10;EP. 002&#10;EP. 003"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  const start = Number(prompt('起始期数：', '1')) || 1;
                  const count = Number(prompt('生成数量：', '10')) || 10;
                  const titles: string[] = [];
                  for (let i = 0; i < count; i++) {
                    titles.push(`EP. ${String(start + i).padStart(3, '0')}`);
                  }
                  setBatchTitles(titles);
                }}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 flex items-center justify-center gap-1"
              >
                <Plus size={12} /> 批量生成
              </button>
              <button
                onClick={() => setBatchTitles([])}
                className="btn-icon p-2 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="mt-2 text-[10px] text-white/40">
              将替换画布中包含"EP"或"标题"的文本元素，共 {batchTitles.length} 个
            </div>
          </div>
          <div className="flex-1 p-5 overflow-y-auto">
            <p className="text-xs text-white/60 mb-3">预览效果</p>
            <div className="grid grid-cols-2 gap-4">
              {batchTitles.slice(0, 6).map((title, i) => {
                const scale = canvasSize.width > canvasSize.height ? 180 / canvasSize.width : 180 / canvasSize.height;
                return (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-white/50 mb-2">{title}</p>
                    <div className="relative mx-auto rounded-lg overflow-hidden" style={{
                      width: `${canvasSize.width * scale}px`,
                      height: `${canvasSize.height * scale}px`,
                      background: background,
                    }}>
                      <div style={{
                        width: `${canvasSize.width}px`,
                        height: `${canvasSize.height}px`,
                        position: 'relative',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                      }}>
                        {elements.map(el => {
                          if (el.id === targetTextEl?.id) {
                            return <CanvasElementRenderer key={el.id} element={{ ...el, styles: { ...el.styles, content: title } as any }} />;
                          }
                          return <CanvasElementRenderer key={el.id} element={el} />;
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-white/5 flex justify-end gap-2">
          <button onClick={() => setShowBatchModal(false)} className="btn-ghost text-xs">取消</button>
          <button
            onClick={handleExportAll}
            disabled={exporting || batchTitles.length === 0}
            className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {exporting ? <Play size={14} className="animate-spin" /> : <Download size={14} />}
            {exporting ? '导出中...' : `导出全部 (${batchTitles.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};
