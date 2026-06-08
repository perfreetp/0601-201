import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import * as LucideIcons from 'lucide-react';
import type { CanvasElement as CanvasElementType, TextStyles, ImageStyles, ShapeStyles, QrStyles, IconStyles } from '../../types';
import { useEditorStore } from '../../store/editorStore';

interface Props {
  element: CanvasElementType;
  scale?: number;
}

const getShadowStyle = (shadow?: { x: number; y: number; blur: number; spread: number; color: string }) => {
  if (!shadow) return {};
  return { boxShadow: `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}` };
};

const getGradientBg = (gradient?: { type: 'linear' | 'radial'; colors: string[]; angle: number }) => {
  if (!gradient || gradient.colors.length < 2) return {};
  if (gradient.type === 'linear') {
    return { background: `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(', ')})` };
  }
  return { background: `radial-gradient(circle, ${gradient.colors.join(', ')})` };
};

const TextElement: React.FC<{ element: CanvasElementType; styles: TextStyles }> = ({ element, styles }) => {
  const updateStyles = useEditorStore(s => s.updateElementStyles);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        fontFamily: styles.fontFamily,
        fontSize: `${styles.fontSize}px`,
        fontWeight: styles.fontWeight,
        lineHeight: styles.lineHeight,
        letterSpacing: `${styles.letterSpacing}px`,
        color: styles.color,
        textAlign: styles.textAlign,
        display: 'flex',
        alignItems: 'center',
        justifyContent: styles.textAlign === 'center' ? 'center' : styles.textAlign === 'right' ? 'flex-end' : 'flex-start',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        textShadow: styles.textShadow
          ? `${styles.textShadow.x}px ${styles.textShadow.y}px ${styles.textShadow.blur}px ${styles.textShadow.color}`
          : undefined,
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        const newContent = prompt('编辑文本内容：', styles.content);
        if (newContent !== null) {
          updateStyles(element.id, { content: newContent });
          useEditorStore.getState().pushHistory();
        }
      }}
    >
      {styles.content}
    </div>
  );
};

const ImageElement: React.FC<{ element: CanvasElementType; styles: ImageStyles }> = ({ element, styles }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: `${styles.borderRadius}px`,
        overflow: 'hidden',
        border: styles.border ? `${styles.border.width}px solid ${styles.border.color}` : undefined,
        ...getShadowStyle(styles.shadow),
      }}
    >
      {styles.src ? (
        <img
          src={styles.src}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: styles.objectFit,
            filter: styles.filter,
            display: 'block',
          }}
          draggable={false}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #35354a 0%, #1a1a25 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontFamily: 'Inter',
            fontSize: '14px',
          }}
        >
          双击上传图片
        </div>
      )}
    </div>
  );
};

const ShapeElement: React.FC<{ element: CanvasElementType; styles: ShapeStyles }> = ({ element, styles }) => {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: styles.fill,
    ...getGradientBg(styles.gradient),
    ...getShadowStyle(styles.shadow),
    border: styles.border ? `${styles.border.width}px solid ${styles.border.color}` : undefined,
  };

  if (styles.shape === 'circle') {
    return <div style={{ ...baseStyle, borderRadius: '50%' }} />;
  }
  if (styles.shape === 'triangle') {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon
            points="50,5 95,95 5,95"
            fill={styles.gradient ? 'url(#grad)' : styles.fill}
          />
          {styles.gradient && (
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                {styles.gradient.colors.map((c, i) => (
                  <stop key={i} offset={`${(i / (styles.gradient!.colors.length - 1)) * 100}%`} stopColor={c} />
                ))}
              </linearGradient>
            </defs>
          )}
        </svg>
      </div>
    );
  }
  if (styles.shape === 'line') {
    return (
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: styles.fill,
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          borderRadius: '2px',
        }}
      />
    );
  }
  return <div style={{ ...baseStyle, borderRadius: `${styles.borderRadius}px` }} />;
};

const QrElement: React.FC<{ element: CanvasElementType; styles: QrStyles }> = ({ element, styles }) => {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: styles.bgColor, padding: '4%', borderRadius: '8px' }}>
      <QRCodeCanvas
        value={styles.value || 'https://example.com'}
        size={Math.min(element.width, element.height) * 0.92}
        fgColor={styles.fgColor}
        bgColor={styles.bgColor}
        level={styles.level}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

const IconElement: React.FC<{ element: CanvasElementType; styles: IconStyles }> = ({ element, styles }) => {
  const IconComponent = (LucideIcons as any)[styles.name] || LucideIcons.Star;
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconComponent color={styles.color} strokeWidth={styles.strokeWidth} style={{ width: '80%', height: '80%' }} />
    </div>
  );
};

export const CanvasElementRenderer: React.FC<Props> = ({ element }) => {
  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return <TextElement element={element} styles={element.styles as TextStyles} />;
      case 'image':
        return <ImageElement element={element} styles={element.styles as ImageStyles} />;
      case 'shape':
        return <ShapeElement element={element} styles={element.styles as ShapeStyles} />;
      case 'qr':
        return <QrElement element={element} styles={element.styles as QrStyles} />;
      case 'icon':
        return <IconElement element={element} styles={element.styles as IconStyles} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.opacity,
        zIndex: element.zIndex,
        cursor: element.locked ? 'not-allowed' : 'move',
      }}
    >
      {renderContent()}
    </div>
  );
};
