import { getAdminClient } from "../config";

export async function runReservationExpiryJob() {
  const admin = getAdminClient();
  const startTime = new Date().toISOString();

  console.log(`[Job:ReservationExpiry] Running at ${startTime}...`);

  try {
    const { data: releasedCount, error } = await admin.rpc("release_expired_reservations");

    if (error) {
      console.error(`[Job:ReservationExpiry] Error releasing reservations: ${error.message}`);
      throw error;
    }

    console.log(`[Job:ReservationExpiry] Successfully released ${releasedCount} expired reservations.`);

    if ((releasedCount || 0) > 0) {
      await admin.from("audit_events").insert({
        actor_user_id: null, // System job
        entity_type: "reservations",
        action: "auto_expire_reservations",
        after_state: {
          releasedCount,
          executionTime: startTime,
        },
      });
    }

    return { success: true, releasedCount };
  } catch (err: any) {
    console.error(`[Job:ReservationExpiry] Job execution failed:`, err);
    return { success: false, error: err.message };
  }
}

// Allow CLI execution if invoked directly
if (import.meta.main || process.argv[1]?.endsWith("reservation-expiry.job.ts")) {
  runReservationExpiryJob().then((res) => {
    console.log("Job result:", res);
    process.exit(res.success ? 0 : 1);
  });
}
