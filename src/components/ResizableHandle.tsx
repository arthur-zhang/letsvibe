import { useEffect, useRef, useState } from 'react';

interface ResizableHandleProps {
  onDrag: (delta: number) => void;
  direction: 'left' | 'right';
}

export function ResizableHandle({ onDrag, direction }: ResizableHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startX.current = e.clientX;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const delta = direction === 'right' ? e.clientX - startX.current : startX.current - e.clientX;
      onDrag(delta);
      startX.current = e.clientX;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, direction, onDrag]);

  return (
    <div
      className={`
        relative z-10 flex-shrink-0 w-1 hover:w-1.5 transition-all duration-75
        ${isDragging ? 'w-1.5' : ''}
      `}
      onMouseDown={handleMouseDown}
      style={{ cursor: 'col-resize' }}
    >
      <div
        className={`
          absolute inset-y-0 left-1/2 -translate-x-1/2 w-px
          ${isDragging ? 'bg-blue-500' : 'bg-transparent hover:bg-[#555]'}
          transition-colors
        `}
      />
    </div>
  );
}
