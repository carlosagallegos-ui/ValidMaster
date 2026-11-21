import moment from "moment";
import { Droplets, ShieldCheck } from "lucide-react";
import { TONE_CLASSES } from "@/lib/hoodMaintenance";
import { areaLabel } from "@/lib/areasCentro";

export default function HoodEquipmentCard({ group }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm">{group.equipment}</p>
          <p className="text-xs text-muted-foreground">{group.equipment_type}</p>
        </div>
        {group.due && (
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${TONE_CLASSES[group.due.tone]}`}>
            {group.due.label}
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Droplets className="h-3.5 w-3.5 text-primary" />
          <span>
            Última limpieza:{" "}
            <span className="text-foreground font-medium">
              {group.lastCleaning ? moment(group.lastCleaning.performed_date).format("DD/MM/YYYY") : "Sin registro"}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>
            Certificación:{" "}
            <span className="text-foreground font-medium">
              {group.certification?.next_due_date
                ? moment(group.certification.next_due_date).format("DD/MM/YYYY")
                : "Sin registro"}
            </span>
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground pt-2 border-t border-border">
        {group.lastActivity
          ? `${group.lastActivity.activity_type} · ${moment(group.lastActivity.performed_date).format("DD/MM/YYYY")} · ${areaLabel(group.lastActivity.area)}`
          : "Sin actividades registradas"}
      </p>
    </div>
  );
}