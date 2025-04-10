import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import React, { useEffect, useRef, useState } from 'react';

import ResizeWindow from 'src/assets/icons/ResizeWindow.svg';

import type { ReactNode } from 'react';

interface DraggableProps {
  children?: ReactNode;
  draggable: boolean;
}

export const Draggable = ({ children, draggable }: DraggableProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({
    x: 40,
    y: window.innerHeight - 400,
  });
  const [size, setSize] = useState({ height: 400, width: 380 });
  const [rel, setRel] = useState<{ x: number; y: number } | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const minWidth = 380;
  const minHeight = 400;

  const onMouseDown = (e: React.MouseEvent) => {
    if (!draggable || e.button !== 0) {
      return;
    }

    const node = nodeRef.current;
    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();
    setIsDragging(true);
    setRel({
      x: e.pageX - rect.left,
      y: e.pageY - rect.top,
    });
    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.pageX - (rel?.x || 0),
          y: e.pageY - (rel?.y || 0),
        });
      } else if (isResizing) {
        const newSize = {
          height: Math.max(e.pageY - position.y, minHeight) + 30,
          width: Math.max(e.pageX - position.x, minWidth) + 10,
        };
        setSize(newSize);
      }
      e.stopPropagation();
      e.preventDefault();
    },
    [isDragging, isResizing, position, rel]
  );

  const onMouseUp = React.useCallback((e: MouseEvent) => {
    setIsDragging(false);
    setIsResizing(false);
    e.stopPropagation();
    e.preventDefault();
  }, []);

  const onResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    } else {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, isResizing, onMouseMove, onMouseUp]);

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onMouseDown((e as unknown) as React.MouseEvent);
        }
      }}
      style={
        draggable
          ? {
              height: `${size.height}px`,
              left: `${position.x}px`,
              position: 'absolute',
              top: `${position.y}px`,
              width: `${size.width}px`,
            }
          : {}
      }
      ref={nodeRef}
      role="button"
      tabIndex={0}
    >
      {children}
      {draggable && (
        <>
          <button
            className="dev-tools-button dev-tools__draggable-handle"
            onMouseDown={(e) => onMouseDown(e)}
            title="Drag to move"
          >
            <DragIndicatorIcon />
          </button>
          <button
            className="dev-tools-button dev-tools__resize-handle"
            onMouseDown={(e) => onResizeStart(e)}
            title="Resize"
          >
            <ResizeWindow />
          </button>
        </>
      )}
    </div>
  );
};
