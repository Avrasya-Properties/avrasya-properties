import { getAdminClient } from "../config";

export async function runRentChargeGenerationJob(targetYear?: number, targetMonth?: number) {
  const admin = getAdminClient();
  const now = new Date();
  const year = targetYear || now.getFullYear();
  const month = targetMonth || now.getMonth() + 1;

  console.log(
    `[Job:RentCharge] Generating charges for ${year}-${String(month).padStart(2, "0")}...`,
  );

  try {
    const { data: generatedCount, error } = await admin.rpc("generate_rent_charges_for_month", {
      p_year: year,
      p_month: month,
    });

    if (error) {
      console.error(`[Job:RentCharge] Error generating rent charges: ${error.message}`);
      throw error;
    }

    console.log(
      `[Job:RentCharge] Successfully generated ${generatedCount} charges for ${year}-${month}.`,
    );

    if ((generatedCount || 0) > 0) {
      await admin.from("audit_events").insert({
        actor_user_id: null, // System job
        entity_type: "rent_charges",
        action: "auto_generate_monthly_charges",
        after_state: {
          year,
          month,
          generatedCount,
          executionTime: now.toISOString(),
        },
      });
    }

    return { success: true, year, month, generatedCount };
  } catch (err: any) {
    console.error(`[Job:RentCharge] Job execution failed:`, err);
    return { success: false, error: err.message };
  }
}

// Allow CLI execution if invoked directly
if (import.meta.main || process.argv[1]?.endsWith("rent-charge.job.ts")) {
  runRentChargeGenerationJob().then((res) => {
    console.log("Job result:", res);
    process.exit(res.success ? 0 : 1);
  });
}
