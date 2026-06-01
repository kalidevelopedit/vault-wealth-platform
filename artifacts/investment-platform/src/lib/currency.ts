const COUNTRY_CURRENCY: Record<string, string> = {
  "United States": "USD",
  "United Kingdom": "GBP",
  "Canada": "CAD",
  "Australia": "AUD",
  "New Zealand": "NZD",
  "Switzerland": "CHF",
  "Norway": "NOK",
  "Sweden": "SEK",
  "Denmark": "DKK",
  "Japan": "JPY",
  "China": "CNY",
  "India": "INR",
  "South Korea": "KRW",
  "Singapore": "SGD",
  "Hong Kong": "HKD",
  "Brazil": "BRL",
  "Mexico": "MXN",
  "South Africa": "ZAR",
  "Nigeria": "NGN",
  "Kenya": "KES",
  "Ghana": "GHS",
  "United Arab Emirates": "AED",
  "Saudi Arabia": "SAR",
  "Qatar": "QAR",
  "Kuwait": "KWD",
  "Bahrain": "BHD",
  "Oman": "OMR",
  "Russia": "RUB",
  "Turkey": "TRY",
  "Egypt": "EGP",
  "Morocco": "MAD",
  "Tanzania": "TZS",
  "Uganda": "UGX",
  "Ethiopia": "ETB",
  "Pakistan": "PKR",
  "Bangladesh": "BDT",
  "Indonesia": "IDR",
  "Malaysia": "MYR",
  "Thailand": "THB",
  "Philippines": "PHP",
  "Vietnam": "VND",
  "Germany": "EUR",
  "France": "EUR",
  "Italy": "EUR",
  "Spain": "EUR",
  "Netherlands": "EUR",
  "Belgium": "EUR",
  "Austria": "EUR",
  "Portugal": "EUR",
  "Finland": "EUR",
  "Greece": "EUR",
  "Ireland": "EUR",
  "Luxembourg": "EUR",
  "Slovakia": "EUR",
  "Slovenia": "EUR",
  "Estonia": "EUR",
  "Latvia": "EUR",
  "Lithuania": "EUR",
  "Malta": "EUR",
  "Cyprus": "EUR",
  "Croatia": "EUR",
  "Poland": "PLN",
  "Czech Republic": "CZK",
  "Hungary": "HUF",
  "Romania": "RON",
  "Bulgaria": "BGN",
  "Ukraine": "UAH",
  "Israel": "ILS",
  "Argentina": "ARS",
  "Chile": "CLP",
  "Colombia": "COP",
  "Peru": "PEN",
  "Venezuela": "VES",
};

export function getCurrencyCode(country?: string | null): string {
  if (!country) return "USD";
  return COUNTRY_CURRENCY[country] ?? "USD";
}

export function makeFmt(country?: string | null) {
  const code = getCurrencyCode(country);
  let formatter: Intl.NumberFormat;
  try {
    formatter = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return {
    code,
    fmt: (n: number) => formatter.format(isNaN(n) ? 0 : n),
    fmtCompact: (n: number): string => {
      if (!n || isNaN(n)) return "—";
      const abs = Math.abs(n);
      if (abs >= 1e12) return formatter.format(n / 1e12).replace(/\.00$/, "") + "T";
      if (abs >= 1e9)  return formatter.format(n / 1e9 ).replace(/\.00$/, "") + "B";
      if (abs >= 1e6)  return formatter.format(n / 1e6 ).replace(/\.00$/, "") + "M";
      if (abs >= 1e3)  return formatter.format(n / 1e3 ).replace(/\.00$/, "") + "K";
      return formatter.format(n);
    },
  };
}
