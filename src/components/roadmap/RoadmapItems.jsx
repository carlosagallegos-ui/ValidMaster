import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckSquare, Square } from "lucide-react";

export default function RoadmapItems() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.RoadmapTask.list("order_index", 100)
      .then(items => {
        setTasks(Array.isArray(items) ? items : items?.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (task) => {
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, done: !t.done } : t)));
    base44.entities.RoadmapTask.update(task.id, { done: !task.done });
  };

  if (loading) {
    return <div className="px-3 py-4 text-[11px] text-muted-foreground">Cargando plan…</div>;
  }

  const pending = tasks.filter(t => !t.done).length;

  return (
    <div>
      <div className="px-3 py-1.5 text-[10px] text-muted-foreground border-b border-border">
        {pending} pendientes de {tasks.length} · toca para completar
      </div>
      <div className="max-h-72 overflow-y-auto p-1">
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => toggle(task)}
            className="w-full flex items-start gap-2 text-left px-2 py-1.5 rounded-md hover:bg-muted transition-colors"
          >
            {task.done
              ? <CheckSquare className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
              : <Square className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />}
            <span className="min-w-0">
              <span className={`block text-[11px] leading-tight ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {task.title}
              </span>
              {task.category && <span className="text-[9px] text-muted-foreground">{task.category}</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}