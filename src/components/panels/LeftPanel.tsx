import React, { useRef } from 'react';
import {
  LayoutTemplate, Shapes, Type, Palette, Image, FolderOpen,
  Upload, Music, Headphones, Radio, Mic, Star, Heart, Play, Sun, Moon, Zap,
  Circle, Square, Triangle, Minus, Plus, X, QrCode
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { TEMPLATES, COLOR_PALETTES, FONT_FAMILIES, FILTER_PRESETS, ICON_NAMES } from '../../data/templates';
import { fileToDataURL, cropImageToCircle } from '../../utils';
import * as LucideIcons from 'lucide-react';

const panelConfig = [
  { id: 'templates', icon: LayoutTemplate, label: '模板' },
  { id: 'elements', icon: Shapes, label: '元素' },
  { id: 'text', icon: Type, label: '文字' },
  { id: 'colors', icon: Palette, label: '配色' },
  { id: 'images', icon: Image, label: '图片' },
  { id: 'library', icon: FolderOpen, label: '作品库' },
] as const;

const shapeIcons: Record<string, any> = {
  rect: Square, circle: Circle, triangle: Triangle, line: Minus,
};

export const LeftPanel: React.FC = () => {
  const {
    activePanel, setActivePanel, applyTemplate, addElement,
    setBackground, brandColors, addBrandColor, updateElementStyles,
    selectedId, elements, setShowLibraryModal,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const selectedEl = elements.find(e => e.id === selectedId);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, cropToCircle = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    let dataUrl = await fileToDataURL(file);
    if (cropToCircle) {
      dataUrl = await cropImageToCircle(dataUrl);
    }
    addElement({
      type: 'image',
      x: 500, y: 500,
      width: 800, height: 800,
      styles: {
        src: dataUrl,
        filter: 'none',
        borderRadius: cropToCircle ? 400 : 16,
        objectFit: 'cover',
      },
    });
    e.target.value = '';
  };

  const renderContent = () => {
    switch (activePanel) {
      case 'templates':
        return (
          <div className="p-4 space-y-4 overflow-y-auto h-full">
            <h3 className="text-sm font-semibold text-white/90 font-display">模板广场</h3>
            {['专辑封面', '节目卡片'].map(cat => (
              <div key={cat}>
                <p className="text-xs text-white/50 mb-2">{cat}</p>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.filter(t => t.category === cat).map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => applyTemplate(tpl.id)}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-neon-purple/60 transition-all hover:shadow-glow-purple"
                      style={{ background: tpl.background }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center p-2">
                        <div className="text-[8px] text-center font-display text-white/80 font-bold truncate px-2">
                          {tpl.name}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end p-1.5">
                        <span className="text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          使用
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'elements':
        return (
          <div className="p-4 space-y-5 overflow-y-auto h-full">
            <h3 className="text-sm font-semibold text-white/90 font-display">基础形状</h3>
            <div className="grid grid-cols-4 gap-2">
              {(['rect', 'circle', 'triangle', 'line'] as const).map(shape => {
                const Icon = shapeIcons[shape];
                return (
                  <button
                    key={shape}
                    onClick={() => addElement({
                      type: 'shape',
                      x: 1000, y: 1000,
                      width: 400, height: 400,
                      styles: {
                        fill: '#8b5cf6',
                        shape,
                        borderRadius: shape === 'rect' ? 24 : shape === 'circle' ? 200 : 0,
                        gradient: { type: 'linear', colors: ['#8b5cf6', '#ec4899'], angle: 135 },
                      },
                    })}
                    className="aspect-square rounded-xl bg-white/5 border border-white/10 hover:border-neon-purple/60 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                  >
                    <Icon size={22} />
                  </button>
                );
              })}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/90 font-display mb-2">二维码</h3>
              <button
                onClick={() => addElement({
                  type: 'qr',
                  x: 1000, y: 1000,
                  width: 600, height: 600,
                  styles: {
                    value: 'https://example.com',
                    fgColor: '#000000',
                    bgColor: '#ffffff',
                    size: 500,
                    level: 'M',
                  },
                })}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:border-neon-purple/60 hover:bg-white/10 flex items-center gap-3 text-white/70 hover:text-white transition-all"
              >
                <QrCode size={20} />
                <span className="text-sm">添加二维码</span>
              </button>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/90 font-display mb-2">图标库</h3>
              <div className="grid grid-cols-6 gap-1.5">
                {ICON_NAMES.map(name => {
                  const Icon = (LucideIcons as any)[name] || Star;
                  return (
                    <button
                      key={name}
                      onClick={() => addElement({
                        type: 'icon',
                        x: 1200, y: 1200,
                        width: 200, height: 200,
                        styles: { name, color: '#ffffff', strokeWidth: 2 },
                      })}
                      className="aspect-square rounded-lg bg-white/5 border border-white/5 hover:border-neon-purple/60 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                    >
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="p-4 space-y-5 overflow-y-auto h-full">
            <h3 className="text-sm font-semibold text-white/90 font-display">添加文字</h3>
            <div className="space-y-2">
              <button
                onClick={() => addElement({
                  type: 'text',
                  x: 800, y: 1200,
                  width: 1400, height: 300,
                  styles: {
                    content: '大标题',
                    fontFamily: 'Space Grotesk',
                    fontSize: 180, fontWeight: 700,
                    lineHeight: 1.1, letterSpacing: -1,
                    color: '#ffffff', textAlign: 'center',
                  },
                })}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-white/10 hover:border-neon-purple/60 text-left transition-all group"
              >
                <span className="block text-2xl font-display font-bold text-white mb-1 group-hover:scale-[1.02] transition-transform">大标题</span>
                <span className="text-xs text-white/50">Space Grotesk · 180px</span>
              </button>
              <button
                onClick={() => addElement({
                  type: 'text',
                  x: 800, y: 1400,
                  width: 1400, height: 180,
                  styles: {
                    content: '副标题',
                    fontFamily: 'Space Grotesk',
                    fontSize: 90, fontWeight: 600,
                    lineHeight: 1.2, letterSpacing: 0,
                    color: '#ffffff', textAlign: 'center',
                  },
                })}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:border-neon-purple/60 text-left transition-all group"
              >
                <span className="block text-lg font-display font-bold text-white mb-0.5 group-hover:scale-[1.02] transition-transform">副标题</span>
                <span className="text-xs text-white/50">Space Grotesk · 90px</span>
              </button>
              <button
                onClick={() => addElement({
                  type: 'text',
                  x: 800, y: 1500,
                  width: 1400, height: 120,
                  styles: {
                    content: '正文描述文字信息',
                    fontFamily: 'Inter',
                    fontSize: 48, fontWeight: 400,
                    lineHeight: 1.5, letterSpacing: 0,
                    color: '#ffffff', textAlign: 'center',
                  },
                })}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:border-neon-purple/60 text-left transition-all group"
              >
                <span className="block text-sm font-sans text-white mb-0.5 group-hover:scale-[1.02] transition-transform">正文描述文字</span>
                <span className="text-xs text-white/50">Inter · 48px</span>
              </button>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/90 font-display mb-2">字体预览</h3>
              <div className="space-y-1.5">
                {FONT_FAMILIES.slice(0, 6).map(font => (
                  <div
                    key={font.name}
                    className="p-2.5 rounded-lg bg-white/5 border border-transparent hover:border-white/20 cursor-pointer text-white"
                    style={{ fontFamily: font.name, fontSize: '16px' }}
                  >
                    {font.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'colors':
        return (
          <div className="p-4 space-y-5 overflow-y-auto h-full">
            <h3 className="text-sm font-semibold text-white/90 font-display">配色方案</h3>
            <div className="space-y-3">
              {COLOR_PALETTES.map(palette => (
                <div
                  key={palette.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer transition-all"
                >
                  <p className="text-xs text-white/60 mb-2">{palette.name}</p>
                  <div className="flex gap-1.5">
                    {palette.colors.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (selectedEl && selectedEl.type === 'text') {
                            updateElementStyles(selectedEl.id, { color });
                          } else {
                            setBackground(color);
                          }
                        }}
                        className="flex-1 h-8 rounded-lg hover:scale-105 transition-transform"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white/90 font-display">品牌色</h3>
                <button
                  onClick={() => {
                    const name = prompt('输入颜色名称：', '新颜色');
                    if (!name) return;
                    addBrandColor({ name, color: '#8b5cf6' });
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {brandColors.map(bc => (
                  <button
                    key={bc.id}
                    onClick={() => {
                      if (selectedEl && selectedEl.type === 'text') {
                        updateElementStyles(selectedEl.id, { color: bc.color });
                      } else {
                        setBackground(bc.color);
                      }
                    }}
                    className="aspect-square rounded-lg border-2 border-white/10 hover:border-white/40 transition-all relative group"
                    style={{ background: bc.color }}
                    title={bc.name}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/90 font-display mb-2">渐变背景</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                  'radial-gradient(circle at 30% 30%, #ff6b6b, #ee5a24)',
                ].map((bg, i) => (
                  <button
                    key={i}
                    onClick={() => setBackground(bg)}
                    className="aspect-video rounded-xl border border-white/10 hover:border-neon-purple/60 transition-all"
                    style={{ background: bg }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'images':
        return (
          <div className="p-4 space-y-5 overflow-y-auto h-full">
            <h3 className="text-sm font-semibold text-white/90 font-display">上传图片</h3>
            <div className="space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-pink/10 border border-dashed border-white/20 hover:border-neon-purple/60 flex flex-col items-center gap-2 transition-all group"
              >
                <Upload size={24} className="text-white/70 group-hover:text-white transition-colors" />
                <span className="text-sm text-white/80">上传照片</span>
                <span className="text-xs text-white/40">支持 JPG, PNG, WEBP</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, false)}
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="w-full p-4 rounded-xl bg-white/5 border border-dashed border-white/20 hover:border-neon-pink/60 flex flex-col items-center gap-2 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center">
                  <Image size={20} className="text-white" />
                </div>
                <span className="text-sm text-white/80">智能裁切头像</span>
                <span className="text-xs text-white/40">自动圆形裁切</span>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, true)}
              />
            </div>
            {selectedEl?.type === 'image' && (
              <div>
                <h3 className="text-sm font-semibold text-white/90 font-display mb-2">滤镜效果</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {FILTER_PRESETS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => updateElementStyles(selectedEl.id, { filter: f.filter })}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-neon-purple/50 text-xs text-white/70 hover:text-white transition-all text-left"
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'library':
        return (
          <div className="p-4 space-y-4 overflow-y-auto h-full">
            <h3 className="text-sm font-semibold text-white/90 font-display">我的作品</h3>
            <button
              onClick={() => setShowLibraryModal(true)}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-white/10 hover:border-neon-purple/60 flex items-center gap-3 transition-all"
            >
              <FolderOpen size={20} className="text-neon-purple" />
              <span className="text-sm font-medium text-white">打开作品库</span>
            </button>
            <div className="text-xs text-white/50 leading-relaxed">
              <p className="mb-2">💡 提示：</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>点击顶部"保存"可将作品存入库</li>
                <li>支持多个历史版本管理</li>
                <li>可生成只读分享链接</li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full w-[300px] bg-ink-900/80 backdrop-blur-xl border-r border-white/5">
      <div className="w-16 flex flex-col items-center py-4 gap-1 border-r border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center mb-4 shadow-glow-purple">
          <Music size={20} className="text-white" />
        </div>
        {panelConfig.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActivePanel(id as any)}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
              activePanel === id
                ? 'bg-gradient-to-br from-neon-purple/30 to-neon-pink/20 text-white shadow-glow-purple border border-neon-purple/30'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={18} />
            <span className="text-[9px]">{label}</span>
          </button>
        ))}
        <div className="flex-1" />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white font-display">
            {panelConfig.find(p => p.id === activePanel)?.label}
          </h2>
        </div>
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
