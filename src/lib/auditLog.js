import { base44 } from "@/api/base44Client";

/**
 * Registra un evento en la bitácora de auditoría.
 * Nunca interrumpe la operación clínica: si el registro falla, se ignora.
 */
export async function logAudit({
  action,
  description,
  patient_name,
  drug_name,
  prescription_id,
  entity_id,
  details,
  user,
}) {
  try {
    const currentUser = user || (await base44.auth.me());
    const payload = {
      timestamp: new Date().toISOString(),
      action,
      description,
      user_name: currentUser?.full_name || currentUser?.email || "Sistema",
      user_email: currentUser?.email,
      user_role: currentUser?.role,
      patient_name,
      drug_name,
      prescription_id,
      entity_id,
      details,
    };
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === null || payload[key] === "") delete payload[key];
    });
    return await base44.entities.AuditLog.create(payload);
  } catch {
    return null;
  }
}