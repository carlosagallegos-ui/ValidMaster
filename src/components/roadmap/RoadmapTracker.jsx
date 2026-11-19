import { useState, useEffect, useRef } from "react";
import { GripVertical, ListTodo, Minus, Plus } from "lucide-react";
import RoadmapItems from "@/components/roadmap/RoadmapItems";

const STORAGE_KEY = "sivf-roadmap-widget";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export default function RoadmapTracker() {
  const [pos, setPos] = useState(() => {
    const saved = loadState().pos;
    if (!saved) return null;
    if (saved.x > window.innerWidth - 120 || saved.y > window.innerHeight - 60) return null;
    return saved;
  });
  const [collapsed, setCollapsed] = useState(() => !!loadState().collapsed);
  const dragRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pos, collapsed }));
  }, [pos, collapsed]);

  const startDrag = (e) => {
    const rect = panelRef.current.getBoundingClientRect();
    dragRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const moveDrag = (e) => {
    if (!dragRef.current) return;
    const x = Math.min(Math.max(e.clientX - dragRef.current.dx, 8), window.innerWidth - Math.min(304, window.innerWidth - 16) - 8);
    const y = Math.min(Math.max(e.clientY - dragRef.current.dy, 8), window.innerHeight - 48);
    setPos({ x, y });
  };

  const endDrag = (e) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      ref={panelRef}
      className="fixed z-50 print:hidden"
      style={pos ? { left: pos.x, top: pos.y } : { right: 16, bottom: 16 }}
    >
      <div className="w-[19rem] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        <div
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <GripVertical className="h-3.5 w-3.5 opacity-70" />
          <ListTodo className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold flex-1">Plan de mejoras</span>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={() => setCollapsed(c => !c)}
            className="p-1 rounded hover:bg-primary-foreground/20 transition-colors"
            aria-label={collapsed ? "Expandir lista" : "Contraer lista"}
          >
            {collapsed ? <Plus className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
          </button>
        </div>
        {!collapsed && <RoadmapItems />}
      </div>
    </div>
  );
}