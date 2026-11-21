import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const ACCENTS = {
  validacion: "border-l-amber-400",
  caducidad: "border-l-red-400",
  salida: "border-l-blue-400",
  stock: "border-l-amber-400",
  temperatura: "border-l-red-400",
};

export default function AlertGroup({ group }) {
  return (
    <div className={`bg-card rounded-xl border border-border border-l-4 ${ACCENTS[group.key] || "border-l-border"} overflow-hidden flex flex-col`}>
      <div className="px-4 py-3 flex items-start justify-between gap-3 border-b border-border">
        <div>
          <p className="text-sm font-semibold">{group.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
        </div>
        <span className={`text-lg font-bold leading-none ${group.items.length ? "" : "text-muted-foreground"}`}>
          {group.items.length}
        </span>
      </div>

      {group.items.length === 0 ? (
        <div className="px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Sin pendientes
        </div>
      ) : (
        <div className="divide-y divide-border flex-1">
          {group.items.slice(0, 5).map(item => (
            <Link key={item.id} to={item.link} className="block px-4 py-2.5 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.meta}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
            </Link>
          ))}
          {group.items.length > 5 && (
            <p className="px-4 py-2 text-xs text-muted-foreground">y {group.items.length - 5} más</p>
          )}
        </div>
      )}

      <div className="px-4 py-2 border-t border-border">
        <Button asChild variant="link" size="sm" className="px-0 h-auto text-xs">
          <Link to={group.link}>Abrir módulo</Link>
        </Button>
      </div>
    </div>
  );
}