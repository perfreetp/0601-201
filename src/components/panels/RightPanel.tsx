import React from 'react';
import {
  AlignLeft, AlignCenter, AlignRight, Lock, Unlock, Copy, Trash2,
  ChevronUp, ChevronDown, RotateCw, Minus, Plus, Eye, EyeOff, Palette, Sparkles
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { FONT_FAMILIES } from '../../data/templates';
import type { TextStyles, ImageStyles, ShapeStyles, QrStyles, IconStyles } from '../../types';

const SliderControl: React.FC<{
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; unit?: string;
}> = ({ label, value, min, max, step = 1, onChange, unit = '' }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <span className="text-xs text-white/60">{label}</span>
      <span className="text-xs text-white/80 font-mono">{Math.round(value)}{unit}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="slider-base"
    />
  </div>
);

export const RightPanel: React.FC = () => {
  const {
    elements, selectedId, selectElement, updateElement, updateElementStyles,
    deleteElement, duplicateElement, toggleLock, bringForward, sendBackward,
    restoreDeletedElement, canvasSize, setCanvasSize, zoom, setZoom,
    background, setBackground, pushHistory, deletedElements,
  } = useEditorStore();

  const el = elements.find(e => e.id === selectedId);

  const handleChange = (field: string, value: any) => {
    if (!el) return;
    if (['x', 'y', 'width', 'height', 'rotation', 'opacity'].includes(field)) {
      updateElement(el.id, { [field]: value });
    } else {
      updateElementStyles(el.id, { [field]: value });
    }
  };

  const handleChangeBlur = () => pushHistory();

  if (!el) {
    return (
      <div className="w-[300px] h-full bg-ink-900/80 backdrop-blur-xl border-l border-white/5 flex flex-col">
        <div className="px-4 py-3 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white font-display">画布设置</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div className="space-y-2">
            <span className="text-xs text-white/60">画布尺寸</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: '方形 1:1', w: 3000, h: 3000 },
                { name: '竖版 9:16', w: 1080, h: 1920 },
                { name: '横版 16:9', w: 1920, h: 1080 },
                { name: '正方形', w: 1080, h: 1080 },
              ].map(s => (
                <button
                  key={s.name}
                  onClick={() => setCanvasSize({ ...canvasSize, width: s.w, height: s.h, name: s.name, aspect: `${s.w}:${s.h}` })}
                  className={`px-3 py-2 rounded-lg text-xs border transition-all ${
                    canvasSize.width === s.w
                      ? 'bg-neon-purple/20 border-neon-purple/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60 block mb-1.5">宽度</label>
              <input
                type="number" value={canvasSize.width}
                onChange={(e) => setCanvasSize({ ...canvasSize, width: Number(e.target.value) })}
                className="input-base text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1.5">高度</label>
              <input
                type="number" value={canvasSize.height}
                onChange={(e) => setCanvasSize({ ...canvasSize, height: Number(e.target.value) })}
                className="input-base text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 block mb-1.5">背景颜色</label>
            <div className="flex gap-2 items-center">
              <input
                type="color" value={background.startsWith('#') ? background : '#0a0a0f'}
                onChange={(e) => setBackground(e.target.value)}
                className="w-10 h-10 rounded-lg overflow-hidden cursor-pointer"
              />
              <input
                type="text" value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="input-base flex-1 text-xs font-mono"
              />
            </div>
          </div>
          <SliderControl label="缩放比例" value={zoom * 100} min={5} max={200} unit="%" onChange={(v) => setZoom(v / 100)} />
          <div className="space-y-2">
            <span className="text-xs text-white/60">图层列表 ({elements.length})</span>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {[...elements].sort((a, b) => b.zIndex - a.zIndex).map(e => (
                <button
                  key={e.id}
                  onClick={() => selectElement(e.id)}
                  className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-left transition-all ${
                    e.id === selectedId
                      ? 'bg-neon-purple/20 border border-neon-purple/40'
                      : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }`}
                >
                  <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] text-white/60">
                    {e.type[0].toUpperCase()}
                  </span>
                  <span className="text-xs text-white/80 flex-1 truncate">
                    {e.type === 'text' ? (e.styles as TextStyles).content.slice(0, 20) : e.type}
                  </span>
                  {e.locked && <Lock size={12} className="text-white/40" />}
                </button>
              ))}
            </div>
          </div>
          {deletedElements.length > 0 && (
            <button
              onClick={restoreDeletedElement}
              className="w-full px-3 py-2 rounded-lg bg-neon-amber/10 border border-neon-amber/30 text-neon-amber text-xs flex items-center gap-2 hover:bg-neon-amber/20 transition-all"
            >
              <RotateCw size={12} />
              恢复最近删除的元素 ({deletedElements.length})
            </button>
          )}
        </div>
      </div>
    );
  }

  const renderTypeSpecific = () => {
    switch (el.type) {
      case 'text': {
        const s = el.styles as TextStyles;
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/60 block mb-1.5">文本内容</label>
              <textarea
                value={s.content} rows={3}
                onChange={(e) => handleChange('content', e.target.value)}
                onBlur={handleChangeBlur}
                className="input-base text-sm resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1.5">字体</label>
              <select
                value={s.fontFamily}
                onChange={(e) => { handleChange('fontFamily', e.target.value); handleChangeBlur(); }}
                className="input-base text-sm"
              >
                {FONT_FAMILIES.map(f => (
                  <option key={f.name} value={f.name} style={{ fontFamily: f.name }}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 block mb-1.5">字重</label>
                <select
                  value={s.fontWeight}
                  onChange={(e) => { handleChange('fontWeight', Number(e.target.value)); handleChangeBlur(); }}
                  className="input-base text-sm"
                >
                  {[300, 400, 500, 600, 700].map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1.5">字号</label>
                <input
                  type="number" value={s.fontSize} min={8}
                  onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                  onBlur={handleChangeBlur}
                  className="input-base text-sm"
                />
              </div>
            </div>
            <SliderControl label="行高" value={s.lineHeight * 100} min={80} max={300} unit="%" onChange={(v) => handleChange('lineHeight', v / 100)} />
            <SliderControl label="字间距" value={s.letterSpacing} min={-20} max={50} unit="px" onChange={(v) => { handleChange('letterSpacing', v); handleChangeBlur(); }} />
            <div>
              <label className="text-xs text-white/60 block mb-1.5">文字颜色</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color" value={s.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  onBlur={handleChangeBlur}
                  className="w-10 h-10 rounded-lg"
                />
                <input
                  type="text" value={s.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  onBlur={handleChangeBlur}
                  className="input-base flex-1 text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1.5">对齐方式</label>
              <div className="grid grid-cols-3 gap-1">
                {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([align, Icon]) => (
                  <button
                    key={align}
                    onClick={() => { handleChange('textAlign', align); handleChangeBlur(); }}
                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                      s.textAlign === align ? 'bg-neon-purple/30 border border-neon-purple/50 text-white' : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }
      case 'image': {
        const s = el.styles as ImageStyles;
        return (
          <div className="space-y-4">
            <SliderControl label="圆角" value={s.borderRadius} min={0} max={500} unit="px" onChange={(v) => { handleChange('borderRadius', v); handleChangeBlur(); }} />
            <SliderControl label="阴影模糊" value={s.shadow?.blur || 0} min={0} max={100} unit="px" onChange={(v) => handleChange('shadow', { ...s.shadow, x: 0, y: 10, blur: v, spread: 0, color: 'rgba(0,0,0,0.5)' })} />
            <div>
              <label className="text-xs text-white/60 block mb-1.5">描边宽度</label>
              <input
                type="range" min={0} max={40} value={s.border?.width || 0}
                onChange={(e) => handleChange('border', { width: Number(e.target.value), color: s.border?.color || '#ffffff' })}
                onMouseUp={handleChangeBlur}
                className="slider-base"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1.5">描边颜色</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color" value={s.border?.color || '#ffffff'}
                  onChange={(e) => handleChange('border', { ...s.border, color: e.target.value })}
                  onBlur={handleChangeBlur}
                  className="w-10 h-10 rounded-lg"
                />
              </div>
            </div>
          </div>
        );
      }
      case 'shape': {
        const s = el.styles as ShapeStyles;
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/60 block mb-1.5">填充颜色</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color" value={s.fill.startsWith('#') ? s.fill : '#8b5cf6'}
                  onChange={(e) => { handleChange('fill', e.target.value); handleChange('gradient', undefined); handleChangeBlur(); }}
                  className="w-10 h-10 rounded-lg"
                />
                <input
                  type="text" value={s.fill}
                  onChange={(e) => handleChange('fill', e.target.value)}
                  onBlur={handleChangeBlur}
                  className="input-base flex-1 text-xs font-mono"
                />
              </div>
            </div>
            {s.shape === 'rect' && (
              <SliderControl label="圆角" value={s.borderRadius} min={0} max={400} unit="px" onChange={(v) => { handleChange('borderRadius', v); handleChangeBlur(); }} />
            )}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-white/60">渐变效果</label>
                <button
                  onClick={() => {
                    if (s.gradient) {
                      handleChange('gradient', undefined);
                    } else {
                      handleChange('gradient', { type: 'linear', colors: ['#8b5cf6', '#ec4899'], angle: 135 });
                    }
                    handleChangeBlur();
                  }}
                  className="text-xs px-2 py-1 rounded bg-white/5 text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  {s.gradient ? '移除' : '启用'}
                </button>
              </div>
              {s.gradient && (
                <div className="space-y-2 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex gap-2">
                    <input type="color" value={s.gradient.colors[0]} onChange={(e) => handleChange('gradient', { ...s.gradient!, colors: [e.target.value, s.gradient!.colors[1]] })} className="w-full h-8 rounded" />
                    <input type="color" value={s.gradient.colors[1]} onChange={(e) => handleChange('gradient', { ...s.gradient!, colors: [s.gradient!.colors[0], e.target.value] })} className="w-full h-8 rounded" />
                  </div>
                  <select value={s.gradient.type} onChange={(e) => handleChange('gradient', { ...s.gradient!, type: e.target.value as any })} className="input-base text-xs">
                    <option value="linear">线性渐变</option>
                    <option value="radial">径向渐变</option>
                  </select>
                  {s.gradient.type === 'linear' && (
                    <SliderControl label="角度" value={s.gradient.angle} min={0} max={360} unit="°" onChange={(v) => handleChange('gradient', { ...s.gradient!, angle: v })} />
                  )}
                </div>
              )}
            </div>
            <SliderControl label="描边宽度" value={s.border?.width || 0} min={0} max={40} unit="px" onChange={(v) => { handleChange('border', { width: v, color: s.border?.color || '#ffffff' }); handleChangeBlur(); }} />
          </div>
        );
      }
      case 'qr': {
        const s = el.styles as QrStyles;
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/60 block mb-1.5">二维码内容</label>
              <input
                type="text" value={s.value}
                onChange={(e) => handleChange('value', e.target.value)}
                onBlur={handleChangeBlur}
                className="input-base text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1.5">前景色</label>
              <input
                type="color" value={s.fgColor}
                onChange={(e) => handleChange('fgColor', e.target.value)}
                onBlur={handleChangeBlur}
                className="w-full h-10 rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1.5">背景色</label>
              <input
                type="color" value={s.bgColor}
                onChange={(e) => handleChange('bgColor', e.target.value)}
                onBlur={handleChangeBlur}
                className="w-full h-10 rounded-lg"
              />
            </div>
          </div>
        );
      }
      case 'icon': {
        const s = el.styles as IconStyles;
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/60 block mb-1.5">颜色</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color" value={s.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  onBlur={handleChangeBlur}
                  className="w-10 h-10 rounded-lg"
                />
              </div>
            </div>
            <SliderControl label="线条粗细" value={s.strokeWidth} min={1} max={6} step={0.5} onChange={(v) => { handleChange('strokeWidth', v); handleChangeBlur(); }} />
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="w-[300px] h-full bg-ink-900/80 backdrop-blur-xl border-l border-white/5 flex flex-col">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white font-display">属性</h2>
        <div className="flex gap-1">
          <button onClick={() => toggleLock(el.id)} className="btn-icon p-1.5" title={el.locked ? '解锁' : '锁定'}>
            {el.locked ? <Lock size={14} className="text-neon-amber" /> : <Unlock size={14} />}
          </button>
          <button onClick={() => duplicateElement(el.id)} className="btn-icon p-1.5" title="复制"><Copy size={14} /></button>
          <button onClick={() => deleteElement(el.id)} className="btn-icon p-1.5 hover:text-red-400" title="删除"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => bringForward(el.id)} className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 border border-white/10">
            <ChevronUp size={12} /> 上移
          </button>
          <button onClick={() => sendBackward(el.id)} className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 border border-white/10">
            <ChevronDown size={12} /> 下移
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/60 block mb-1.5">X 位置</label>
            <input type="number" value={Math.round(el.x)} onChange={(e) => updateElement(el.id, { x: Number(e.target.value) })} onBlur={handleChangeBlur} className="input-base text-sm" />
          </div>
          <div>
            <label className="text-xs text-white/60 block mb-1.5">Y 位置</label>
            <input type="number" value={Math.round(el.y)} onChange={(e) => updateElement(el.id, { y: Number(e.target.value) })} onBlur={handleChangeBlur} className="input-base text-sm" />
          </div>
          <div>
            <label className="text-xs text-white/60 block mb-1.5">宽度</label>
            <input type="number" value={Math.round(el.width)} min={20} onChange={(e) => updateElement(el.id, { width: Math.max(20, Number(e.target.value)) })} onBlur={handleChangeBlur} className="input-base text-sm" />
          </div>
          <div>
            <label className="text-xs text-white/60 block mb-1.5">高度</label>
            <input type="number" value={Math.round(el.height)} min={20} onChange={(e) => updateElement(el.id, { height: Math.max(20, Number(e.target.value)) })} onBlur={handleChangeBlur} className="input-base text-sm" />
          </div>
        </div>
        <SliderControl label="旋转角度" value={el.rotation} min={-180} max={180} unit="°" onChange={(v) => updateElement(el.id, { rotation: v })} />
        <SliderControl label="不透明度" value={el.opacity * 100} min={0} max={100} unit="%" onChange={(v) => { updateElement(el.id, { opacity: v / 100 }); handleChangeBlur(); }} />
        <div className="h-px bg-white/10 my-2" />
        {renderTypeSpecific()}
      </div>
    </div>
  );
};
