import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import { CanvasElement } from '../../types';

type HandleType = 'move' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotate';

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    elements, selectedId, selectElement, updateElement,
    background, canvasSize, zoom, setZoom, pushHistory, readonly,
  } = useEditorStore();

  const [dragging, setDragging] = useState<{
    handle: HandleType;
    element: CanvasElement;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
    origRot: number;
  } | null>(null);

  const selectedElement = elements.find(e => e.id === selectedId) || null;

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom,
    };
  }, [zoom]);

  const handleMouseDown = (e: React.MouseEvent, element: CanvasElement, handle: HandleType) => {
    if (readonly) return;
    if (element.locked) return;
    e.stopPropagation();
    selectElement(element.id);
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    setDragging({
      handle,
      element,
      startX: x,
      startY: y,
      origX: element.x,
      origY: element.y,
      origW: element.width,
      origH: element.height,
      origRot: element.rotation,
    });
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      const dx = x - dragging.startX;
      const dy = y - dragging.startY;

      if (dragging.handle === 'move') {
        updateElement(dragging.element.id, {
          x: dragging.origX + dx,
          y: dragging.origY + dy,
        });
      } else if (dragging.handle === 'rotate') {
        const cx = dragging.origX + dragging.origW / 2;
        const cy = dragging.origY + dragging.origH / 2;
        const angle = Math.atan2(y - cy, x - cx) * 180 / Math.PI + 90;
        updateElement(dragging.element.id, { rotation: angle });
      } else {
        let newX = dragging.origX;
        let newY = dragging.origY;
        let newW = dragging.origW;
        let newH = dragging.origH;

        if (dragging.handle.includes('e')) newW = Math.max(20, dragging.origW + dx);
        if (dragging.handle.includes('w')) {
          newW = Math.max(20, dragging.origW - dx);
          newX = dragging.origX + (dragging.origW - newW);
        }
        if (dragging.handle.includes('s')) newH = Math.max(20, dragging.origH + dy);
        if (dragging.handle.includes('n')) {
          newH = Math.max(20, dragging.origH - dy);
          newY = dragging.origY + (dragging.origH - newH);
        }

        updateElement(dragging.element.id, { x: newX, y: newY, width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      pushHistory();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, getCanvasCoords, updateElement, pushHistory]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom(zoom - e.deltaY * 0.001);
    }
  };

  const handleBgClick = () => selectElement(null);

  const handlePositions: Record<string, { top?: string; left?: string; right?: string; bottom?: string; cursor: string }> = {
    nw: { top: '-6px', left: '-6px', cursor: 'nw-resize' },
    n: { top: '-6px', left: '50%', cursor: 'n-resize' },
    ne: { top: '-6px', right: '-6px', cursor: 'ne-resize' },
    e: { top: '50%', right: '-6px', cursor: 'e-resize' },
    se: { bottom: '-6px', right: '-6px', cursor: 'se-resize' },
    s: { bottom: '-6px', left: '50%', cursor: 's-resize' },
    sw: { bottom: '-6px', left: '-6px', cursor: 'sw-resize' },
    w: { top: '50%', left: '-6px', cursor: 'w-resize' },
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden gradient-mesh-bg"
      onWheel={handleWheel}
    >
      <div
        className="absolute"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          inset: 0,
        }}
      />
      <div
        ref={canvasRef}
        onClick={handleBgClick}
        style={{
          width: `${canvasSize.width * zoom}px`,
          height: `${canvasSize.height * zoom}px`,
          position: 'relative',
          boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5), 0 30px 60px -30px rgba(139,92,246,0.2)',
          borderRadius: '8px',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
            position: 'relative',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            background: background,
          }}
          id="export-canvas"
        >
          {elements.map(el => (
            <div
              key={el.id}
              onMouseDown={(e) => handleMouseDown(e, el, 'move')}
              style={{
                position: 'absolute',
                left: 0, top: 0,
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
                pointerEvents: 'none',
              }}
            >
              <div style={{ pointerEvents: 'auto' }}>
                <CanvasElementRenderer element={el} />
              </div>
            </div>
          ))}
        </div>

        {selectedElement && !readonly && (
          <div
            style={{
              position: 'absolute',
              left: `${(selectedElement.x - 4) * zoom}px`,
              top: `${(selectedElement.y - 4) * zoom}px`,
              width: `${(selectedElement.width + 8) * zoom}px`,
              height: `${(selectedElement.height + 8) * zoom}px`,
              transform: `rotate(${selectedElement.rotation}deg)`,
              transformOrigin: `${(selectedElement.width + 8) / 2 * zoom}px ${(selectedElement.height + 8) / 2 * zoom}px`,
              border: `${2 * zoom}px solid #8b5cf6`,
              boxShadow: `0 0 0 ${1 * zoom}px rgba(139,92,246,0.3)`,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            {!selectedElement.locked && Object.entries(handlePositions).map(([pos, style]) => (
              <div
                key={pos}
                onMouseDown={(e) => handleMouseDown(e as any, selectedElement, pos as HandleType)}
                style={{
                  position: 'absolute',
                  width: `${12 * zoom}px`,
                  height: `${12 * zoom}px`,
                  background: '#8b5cf6',
                  border: `${2 * zoom}px solid #0a0a0f`,
                  borderRadius: `${3 * zoom}px`,
                  transform: 'translate(-50%, -50%)',
                  ...style,
                  pointerEvents: 'auto',
                } as React.CSSProperties}
              />
            ))}
            {!selectedElement.locked && (
              <div
                onMouseDown={(e) => handleMouseDown(e as any, selectedElement, 'rotate')}
                style={{
                  position: 'absolute',
                  top: `${-30 * zoom}px`,
                  left: '50%',
                  width: `${2 * zoom}px`,
                  height: `${20 * zoom}px`,
                  background: '#8b5cf6',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'auto',
                  cursor: 'grab',
                }}
              >
                <div
                  style={{
                    width: `${14 * zoom}px`,
                    height: `${14 * zoom}px`,
                    borderRadius: '50%',
                    background: '#8b5cf6',
                    position: 'absolute',
                    top: `${-8 * zoom}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    border: `${2 * zoom}px solid #0a0a0f`,
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
