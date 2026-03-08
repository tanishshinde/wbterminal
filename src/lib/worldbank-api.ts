const BASE_URL = "https://api.worldbank.org/v2";

// --- Request throttle to avoid rate limiting ---
const MAX_CONCURRENT = 4;
const QUEUE: Array<() => void> = [];
let active = 0;

function enqueue(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active++;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    QUEUE.push(() => {
      active++;
      resolve();
    });
  });
}

function dequeue() {
  active--;
  if (QUEUE.length > 0) {
    const next = QUEUE.shift()!;
    next();
  }
}

async function throttledFetch(url: string): Promise<Response> {
  await enqueue();
  try {
    const res = await fetch(url);
    return res;
  } finally {
    dequeue();
  }
}

// Key indicator codes organized by theme
export const INDICATORS = {
  economy: {
    gdp: { code: "NY.GDP.MKTP.CD", label: "GDP (current US$)", format: "currency" },
    gdpGrowth: { code: "NY.GDP.MKTP.KD.ZG", label: "GDP Growth (%)", format: "percent" },
    gdpPerCapita: { code: "NY.GDP.PCAP.CD", label: "GDP per Capita (US$)", format: "currency" },
    gniPerCapita: { code: "NY.GNP.PCAP.CD", label: "GNI per Capita (US$)", format: "currency" },
    inflation: { code: "FP.CPI.TOTL.ZG", label: "Inflation, CPI (%)", format: "percent" },
    fdi: { code: "BX.KLT.DINV.CD.WD", label: "FDI Net Inflows (US$)", format: "currency" },
    debt: { code: "GC.DOD.TOTL.GD.ZS", label: "Govt Debt (% of GDP)", format: "percent" },
    remittances: { code: "BX.TRF.PWKR.CD.DT", label: "Remittances Received (US$)", format: "currency" },
    unemployment: { code: "SL.UEM.TOTL.ZS", label: "Unemployment (%)", format: "percent" },
    tradeGdp: { code: "NE.TRD.GNFS.ZS", label: "Trade (% of GDP)", format: "percent" },
  },
  health: {
    lifeExpectancy: { code: "SP.DYN.LE00.IN", label: "Life Expectancy", format: "number" },
    infantMortality: { code: "SP.DYN.IMRT.IN", label: "Infant Mortality (per 1000)", format: "number" },
    healthExpenditure: { code: "SH.XPD.CHEX.GD.ZS", label: "Health Expenditure (% GDP)", format: "percent" },
    immunization: { code: "SH.IMM.MEAS", label: "Measles Immunization (%)", format: "percent" },
    hivPrevalence: { code: "SH.DYN.AIDS.ZS", label: "HIV Prevalence (%)", format: "percent" },
    birthRate: { code: "SP.DYN.CBRT.IN", label: "Birth Rate (per 1000)", format: "number" },
    deathRate: { code: "SP.DYN.CDRT.IN", label: "Death Rate (per 1000)", format: "number" },
    maternalMortality: { code: "SH.STA.MMRT", label: "Maternal Mortality Ratio", format: "number" },
  },
  education: {
    literacy: { code: "SE.ADT.LITR.ZS", label: "Literacy Rate (%)", format: "percent" },
    primaryEnrollment: { code: "SE.PRM.ENRR", label: "Primary Enrollment (%)", format: "percent" },
    secondaryEnrollment: { code: "SE.SEC.ENRR", label: "Secondary Enrollment (%)", format: "percent" },
    tertiaryEnrollment: { code: "SE.TER.ENRR", label: "Tertiary Enrollment (%)", format: "percent" },
    educationSpending: { code: "SE.XPD.TOTL.GD.ZS", label: "Education Spending (% GDP)", format: "percent" },
    pupilTeacherRatio: { code: "SE.PRM.ENRL.TC.ZS", label: "Pupil-Teacher Ratio", format: "number" },
  },
  environment: {
    co2Emissions: { code: "EN.ATM.CO2E.PC", label: "CO2 Emissions (metric tons pc)", format: "number" },
    forestArea: { code: "AG.LND.FRST.ZS", label: "Forest Area (%)", format: "percent" },
    renewableEnergy: { code: "EG.FEC.RNEW.ZS", label: "Renewable Energy (%)", format: "percent" },
    electricityAccess: { code: "EG.ELC.ACCS.ZS", label: "Access to Electricity (%)", format: "percent" },
    arableLand: { code: "AG.LND.ARBL.ZS", label: "Arable Land (%)", format: "percent" },
    waterAccess: { code: "SH.H2O.BASW.ZS", label: "Basic Water Access (%)", format: "percent" },
  },
  infrastructure: {
    internetUsers: { code: "IT.NET.USER.ZS", label: "Internet Users (%)", format: "percent" },
    mobileSubscriptions: { code: "IT.CEL.SETS.P2", label: "Mobile Subscriptions (per 100)", format: "number" },
    sanitationAccess: { code: "SH.STA.BASS.ZS", label: "Basic Sanitation (%)", format: "percent" },
    airTransport: { code: "IS.AIR.PSGR", label: "Air Passengers", format: "number" },
  },
  demographics: {
    population: { code: "SP.POP.TOTL", label: "Population", format: "number" },
    popGrowth: { code: "SP.POP.GROW", label: "Population Growth (%)", format: "percent" },
    urbanPop: { code: "SP.URB.TOTL.IN.ZS", label: "Urban Population (%)", format: "percent" },
    fertilityRate: { code: "SP.DYN.TFRT.IN", label: "Fertility Rate", format: "number" },
    ageDependency: { code: "SP.POP.DPND", label: "Age Dependency Ratio", format: "number" },
    popDensity: { code: "EN.POP.DNST", label: "Population Density", format: "number" },
  },
  trade: {
    exports: { code: "NE.EXP.GNFS.CD", label: "Exports (US$)", format: "currency" },
    imports: { code: "NE.IMP.GNFS.CD", label: "Imports (US$)", format: "currency" },
    currentAccount: { code: "BN.CAB.XOKA.CD", label: "Current Account (US$)", format: "currency" },
    reserves: { code: "FI.RES.TOTL.CD", label: "Total Reserves (US$)", format: "currency" },
    stockMarket: { code: "CM.MKT.LCAP.CD", label: "Market Cap (US$)", format: "currency" },
  },
  poverty: {
    povertyHeadcount: { code: "SI.POV.DDAY", label: "Poverty Headcount $2.15/day (%)", format: "percent" },
    giniIndex: { code: "SI.POV.GINI", label: "Gini Index", format: "number" },
    incomeShareLowest: { code: "SI.DST.FRST.20", label: "Income Share Lowest 20%", format: "percent" },
  },
} as const;

// Flat list of all indicators
export const ALL_INDICATORS = Object.entries(INDICATORS).flatMap(([theme, indicators]) =>
  Object.entries(indicators).map(([key, ind]) => ({ ...ind, key, theme }))
);

// Key ticker indicators
export const TICKER_INDICATORS = [
  { code: "NY.GDP.MKTP.KD.ZG", label: "World GDP Growth", country: "WLD" },
  { code: "FP.CPI.TOTL.ZG", label: "World Inflation", country: "WLD" },
  { code: "SP.POP.TOTL", label: "World Population", country: "WLD" },
  { code: "NY.GDP.MKTP.CD", label: "US GDP", country: "USA" },
  { code: "NY.GDP.MKTP.CD", label: "China GDP", country: "CHN" },
  { code: "NY.GDP.MKTP.CD", label: "EU GDP", country: "EUU" },
  { code: "SL.UEM.TOTL.ZS", label: "World Unemployment", country: "WLD" },
  { code: "EN.ATM.CO2E.PC", label: "World CO2/capita", country: "WLD" },
];

export const REGIONS = [
  { code: "EAS", name: "East Asia & Pacific" },
  { code: "ECS", name: "Europe & Central Asia" },
  { code: "LCN", name: "Latin America & Caribbean" },
  { code: "MEA", name: "Middle East & North Africa" },
  { code: "NAC", name: "North America" },
  { code: "SAS", name: "South Asia" },
  { code: "SSF", name: "Sub-Saharan Africa" },
];

export const INCOME_GROUPS = [
  { code: "HIC", name: "High Income" },
  { code: "UMC", name: "Upper Middle Income" },
  { code: "LMC", name: "Lower Middle Income" },
  { code: "LIC", name: "Low Income" },
];

export interface WBCountry {
  id: string;
  iso2Code: string;
  name: string;
  region: { id: string; value: string };
  incomeLevel: { id: string; value: string };
  capitalCity: string;
  longitude: string;
  latitude: string;
}

export interface WBIndicatorValue {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code?: string;
  date: string;
  value: number | null;
}

async function fetchWB<T>(path: string, params: Record<string, string> = {}): Promise<T[]> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("format", "json");
  url.searchParams.set("per_page", params.per_page || "500");
  Object.entries(params).forEach(([k, v]) => {
    if (k !== "per_page") url.searchParams.set(k, v);
  });

  const res = await throttledFetch(url.toString());
  if (!res.ok) throw new Error(`World Bank API error: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length < 2 || !Array.isArray(data[1])) {
    return [];
  }
  return data[1] as T[];
}

export async function fetchCountries(): Promise<WBCountry[]> {
  const countries = await fetchWB<WBCountry>("/country", { per_page: "300" });
  return countries.filter(c => c.region.id !== "NA");
}

export async function fetchIndicatorData(
  countryCode: string,
  indicatorCode: string,
  dateRange = "1960:2024"
): Promise<WBIndicatorValue[]> {
  return fetchWB<WBIndicatorValue>(
    `/country/${countryCode}/indicator/${indicatorCode}`,
    { date: dateRange, per_page: "100" }
  );
}

/**
 * Fetch latest value for an indicator across multiple countries in ONE request.
 * The WB API supports semicolon-separated country codes.
 */
export async function fetchLatestIndicatorMulti(
  countryCodes: string[],
  indicatorCode: string
): Promise<WBIndicatorValue[]> {
  const codes = countryCodes.join(";");
  const data = await fetchWB<WBIndicatorValue>(
    `/country/${codes}/indicator/${indicatorCode}`,
    { per_page: "50", mrnev: "1" }
  );
  return data;
}

export async function fetchLatestIndicator(
  countryCode: string,
  indicatorCode: string
): Promise<WBIndicatorValue | null> {
  const data = await fetchWB<WBIndicatorValue>(
    `/country/${countryCode}/indicator/${indicatorCode}`,
    { per_page: "10", mrnev: "1" }
  );
  return data.find(d => d.value !== null) || null;
}

export async function fetchMultiCountryIndicator(
  countryCodes: string[],
  indicatorCode: string,
  dateRange = "2020:2024"
): Promise<WBIndicatorValue[]> {
  const codes = countryCodes.join(";");
  return fetchWB<WBIndicatorValue>(
    `/country/${codes}/indicator/${indicatorCode}`,
    { date: dateRange, per_page: "1000" }
  );
}

// Format values for display
export function formatValue(value: number | null | undefined, format: string): string {
  if (value === null || value === undefined) return "N/A";
  switch (format) {
    case "currency":
      if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
      if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
      if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
      if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
      return `$${value.toFixed(2)}`;
    case "percent":
      return `${value.toFixed(2)}%`;
    case "number":
      if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
      if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
      if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
      return value.toFixed(2);
    default:
      return String(value);
  }
}
