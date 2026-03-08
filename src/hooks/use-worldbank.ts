import { useQuery } from "@tanstack/react-query";
import {
  fetchCountries,
  fetchIndicatorData,
  fetchLatestIndicator,
  fetchMultiCountryIndicator,
  TICKER_INDICATORS,
  type WBCountry,
  type WBIndicatorValue,
} from "@/lib/worldbank-api";

export function useCountries() {
  return useQuery<WBCountry[]>({
    queryKey: ["wb-countries"],
    queryFn: fetchCountries,
    staleTime: 24 * 60 * 60 * 1000, // 24h
  });
}

export function useIndicatorData(countryCode: string, indicatorCode: string, dateRange = "1960:2024") {
  return useQuery<WBIndicatorValue[]>({
    queryKey: ["wb-indicator", countryCode, indicatorCode, dateRange],
    queryFn: () => fetchIndicatorData(countryCode, indicatorCode, dateRange),
    enabled: !!countryCode && !!indicatorCode,
    staleTime: 60 * 60 * 1000,
  });
}

export function useLatestIndicator(countryCode: string, indicatorCode: string) {
  return useQuery<WBIndicatorValue | null>({
    queryKey: ["wb-latest", countryCode, indicatorCode],
    queryFn: () => fetchLatestIndicator(countryCode, indicatorCode),
    enabled: !!countryCode && !!indicatorCode,
    staleTime: 60 * 60 * 1000,
  });
}

export function useMultiCountryIndicator(countryCodes: string[], indicatorCode: string, dateRange = "2015:2024") {
  return useQuery<WBIndicatorValue[]>({
    queryKey: ["wb-multi", countryCodes.join(","), indicatorCode, dateRange],
    queryFn: () => fetchMultiCountryIndicator(countryCodes, indicatorCode, dateRange),
    enabled: countryCodes.length > 0 && !!indicatorCode,
    staleTime: 60 * 60 * 1000,
  });
}

export function useTickerData() {
  return useQuery({
    queryKey: ["wb-ticker"],
    queryFn: async () => {
      const results = await Promise.allSettled(
        TICKER_INDICATORS.map(async (ind) => {
          const val = await fetchLatestIndicator(ind.country, ind.code);
          return { ...ind, value: val?.value ?? null, date: val?.date ?? null };
        })
      );
      return results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
        .map((r) => r.value);
    },
    staleTime: 60 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
