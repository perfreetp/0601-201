import React, { useEffect } from 'react';
import { TopToolbar } from '../components/toolbar/TopToolbar';
import { LeftPanel } from '../components/panels/LeftPanel';
import { RightPanel } from '../components/panels/RightPanel';
import { Canvas } from '../components/canvas/Canvas';
import { PreviewModal } from '../components/modals/PreviewModal';
import { LibraryModal } from '../components/modals/LibraryModal';
import { BatchModal } from '../components/modals/BatchModal';
import { useEditorStore } from '../store/editorStore';

export default function Home() {
  const { undo, redo } = useEditorStore();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedId, deleteElement } = useEditorStore.getState();
        const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
        if (selectedId && !isInput) {
          deleteElement(selectedId);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-ink-950">
      <TopToolbar />
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <div className="flex-1 relative">
          <Canvas />
        </div>
        <RightPanel />
      </div>
      <div className="grain-overlay" />
      <PreviewModal />
      <LibraryModal />
      <BatchModal />
    </div>
  );
}
