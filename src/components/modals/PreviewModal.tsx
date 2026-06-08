import React from 'react';
import { X, Instagram, Twitter, Youtube, Music, Smartphone, Monitor } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { CanvasElementRenderer } from '../canvas/CanvasElementRenderer';

const platforms = [
  { name: 'Spotify 专辑', icon: Music, aspect: '1:1', width: 640, height: 640 },
  { name: 'Apple Music', icon: Music, aspect: '1:1', width: 640, height: 640 },
  { name: 'Instagram 帖子', icon: Instagram, aspect: '1:1', width: 400, height: 400 },
  { name: 'Instagram 故事', icon: Instagram, aspect: '9:16', width: 225, height: 400 },
  { name: '微博封面', icon: Twitter, aspect: '16:9', width: 440, height: 248 },
  { name: 'YouTube 缩略图', icon: Youtube, aspect: '16:9', width: 440, height: 248 },
  { name: '手机壁纸', icon: Smartphone, aspect: '9:16', width: 225, height: 400 },
  { name: '电脑壁纸', icon: Monitor, aspect: '16:9', width: 440, height: 248 },
];

export const PreviewModal: React.FC = () => {
  const { showPreviewModal, setShowPreviewModal, elements, background, canvasSize } = useEditorStore();

  if (!showPreviewModal) return null;

  const scale = 0.15;

  const renderPlatformPreview = (platform: typeof platforms[0]) => {
    const [pw, ph] = platform.aspect.split(':').map(Number);
    const platformRatio = pw / ph;
    const canvasRatio = canvasSize.width / canvasSize.height;

    let scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0;
    if (canvasRatio > platformRatio) {
      scaleY = 1;
      scaleX = canvasRatio / platformRatio;
      offsetX = -(scaleX - 1) / 2 * platform.width;
    } else {
      scaleX = 1;
      scaleY = platformRatio / canvasRatio;
      offsetY = -(scaleY - 1) / 2 * platform.height;
    }

    const safeMargin = Math.min(platform.width, platform.height) * 0.08;

    return (
      <div key={platform.name} className="p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-1.5 mb-2">
          <platform.icon size={12} className="text-neon-purple" />
          <span className="text-xs text-white/80">{platform.name}</span>
          <span className="text-[10px] text-white/40 ml-auto">{platform.aspect}</span>
        </div>
        <div
          className="relative mx-auto rounded-lg overflow-hidden"
          style={{
            width: `${platform.width / 2}px`,
            height: `${platform.height / 2}px`,
            background: background,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
                transform: `scale(${Math.min(platform.width, platform.height) / Math.min(canvasSize.width, canvasSize.height) * scaleX / 2}, ${Math.min(platform.width, platform.height) / Math.min(canvasSize.width, canvasSize.height) * scaleY / 2})`,
                transformOrigin: 'top left',
                left: `${offsetX / 2 + (platform.width / 2 - canvasSize.width * Math.min(platform.width, platform.height) / Math.min(canvasSize.width, canvasSize.height) / 2 * scaleX) / 2}px`,
                top: `${offsetY / 2 + (platform.height / 2 - canvasSize.height * Math.min(platform.width, platform.height) / Math.min(canvasSize.width, canvasSize.height) / 2 * scaleY) / 2}px`,
              }}
            >
              {elements.map(el => <CanvasElementRenderer key={el.id} element={el} />)}
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              inset: `${safeMargin / 2}px`,
              border: '1px dashed rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '6px',
              fontSize: '8px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: 'monospace',
            }}
          >
            安全区
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[900px] max-h-[85vh] bg-ink-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white font-display">多平台裁切预览</h3>
          <button onClick={() => setShowPreviewModal(false)} className="btn-icon p-1.5">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/60 mb-2">原始尺寸</p>
            <div className="relative inline-block">
              <div
                style={{
                  width: `${canvasSize.width * scale}px`,
                  height: `${canvasSize.height * scale}px`,
                  background: background,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: `${canvasSize.width}px`,
                    height: `${canvasSize.height}px`,
                    position: 'relative',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {elements.map(el => <CanvasElementRenderer key={el.id} element={el} />)}
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-white/60 mb-3">各平台裁切效果预览（虚线框为安全区）</p>
          <div className="grid grid-cols-4 gap-3">
            {platforms.map(p => renderPlatformPreview(p))}
          </div>
        </div>
      </div>
    </div>
  );
};
