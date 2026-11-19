import { getDrugStability } from "@/lib/drugStability";

// BUD = Beyond Use Date: momento límite de uso de la mezcla preparada
export const DEFAULT_BUD_HOURS = 24;

export function computeBud(drugName, startSource) {
  const st = getDrugStability(drugName);
  const hours = st?.hours || DEFAULT_BUD_HOURS;
  const parsed = startSource ? new Date(startSource) : null;
  const start = parsed && !isNaN(parsed.getTime()) ? parsed : new Date();
  const limit = new Date(start.getTime() + hours * 3600 * 1000);
  return {
    hours,
    known: !!st?.hours,
    stability: st?.stability || null,
    storage: st?.storage || null,
    start,
    limit,
    expired: Date.now() > limit.getTime(),
  };
}