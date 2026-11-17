const AREA_MAP = {
  Antibiotico: { label: "ATB", cls: "bg-emerald-100 text-emerald-700" },
  NPT: { label: "NPT", cls: "bg-amber-100 text-amber-700" },
  Oncologico: { label: "QT", cls: "bg-violet-100 text-violet-700" },
};

export default function AreaBadge({ type }) {
  const cfg = AREA_MAP[type] || AREA_MAP.Oncologico;
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}