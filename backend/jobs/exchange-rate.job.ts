import { getAdminClient } from "../config";

export async function runExchangeRateSyncJob() {
  const admin = getAdminClient();
  const now = new Date();
  console.log(`[Job:ExchangeRate] Syncing reference currency rates at ${now.toISOString()}...`);

  let rates: Record<string, number> = {
    USD: 1.0,
    TRY: 38.5,
    EUR: 0.92,
    GBP: 0.78,
  };
  let provider = "Frankfurter Open API";
  let rateDate = now.toISOString().split("T")[0];

  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=TRY,EUR,GBP", {
      headers: { "User-Agent": "AvrasyaBackend/1.0" },
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      if (data && data.rates) {
        rates = {
          USD: 1.0,
          TRY: data.rates.TRY || rates.TRY,
          EUR: data.rates.EUR || rates.EUR,
          GBP: data.rates.GBP || rates.GBP,
        };
        rateDate = data.date || rateDate;
        console.log(
          `[Job:ExchangeRate] Successfully fetched live rates for date ${rateDate}:`,
          rates,
        );
      }
    } else {
      console.warn(
        `[Job:ExchangeRate] Remote provider returned status ${res.status}. Using cached/fallback rates.`,
      );
      provider = "Fallback System Reference";
    }
  } catch (err: any) {
    console.warn(
      `[Job:ExchangeRate] Could not reach remote exchange rate API (${err.message}). Using fallback baseline.`,
    );
    provider = "Fallback System Reference";
  }

  const payload = {
    base: "USD",
    provider,
    rate_date: rateDate,
    updated_at: now.toISOString(),
    rates,
  };

  const { error: updateError } = await admin
    .from("site_settings")
    .update({
      exchange_rates: payload,
      updated_at: now.toISOString(),
    })
    .eq("id", "default");

  if (updateError) {
    console.error(`[Job:ExchangeRate] Failed to update site_settings:`, updateError);
    return { success: false, error: updateError.message };
  }

  console.log(`[Job:ExchangeRate] Exchange rates updated successfully.`);
  return { success: true, payload };
}

// Allow CLI execution if invoked directly
if (import.meta.main || process.argv[1]?.endsWith("exchange-rate.job.ts")) {
  runExchangeRateSyncJob().then((res) => {
    console.log("Job result:", res);
    process.exit(res.success ? 0 : 1);
  });
}
