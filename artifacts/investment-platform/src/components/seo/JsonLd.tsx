const SITE = "https://www.intbrokers.com";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "FinancialService"],
    name: "INT Brokers (Vault Wealth Management)",
    alternateName: ["INT Brokers", "Vault Wealth", "Vault Wealth Management"],
    url: SITE,
    logo: `${SITE}/logo.png`,
    description:
      "INT Brokers (Vault Wealth Management LLC) is a registered broker-dealer offering commission-free US stock trading, global market access across 170+ market centres in 33 countries, and institutional-grade tools to 4.4 million clients worldwide.",
    foundingDate: "1977",
    numberOfEmployees: { "@type": "QuantitativeValue", value: 2700 },
    address: {
      "@type": "PostalAddress",
      streetAddress: "One Pickwick Plaza",
      addressLocality: "Greenwich",
      addressRegion: "CT",
      postalCode: "06830",
      addressCountry: "US",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: "+1-877-442-2757",
        availableLanguage: ["English", "Spanish", "Chinese"],
      },
      {
        "@type": "ContactPoint",
        contactType: "press",
        email: "press@intbrokers.com",
      },
    ],
    sameAs: [
      "https://twitter.com/InteractiveBrok",
      "https://www.linkedin.com/company/interactive-brokers",
    ],
    areaServed: { "@type": "GeoShape", description: "200+ countries worldwide" },
    serviceType: [
      "Online Brokerage",
      "Stock Trading",
      "Options Trading",
      "Futures Trading",
      "Forex Trading",
      "Cryptocurrency Trading",
      "Retirement Accounts",
    ],
  };
}

export interface Breadcrumb {
  name: string;
  item: string;
}

export function breadcrumbSchema(crumbs: Breadcrumb[]) {
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE },
    ...crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 2,
      name: c.name,
      item: `${SITE}${c.item}`,
    })),
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

export function pressReleasesSchema(
  releases: Array<{ headline: string; date: string; category: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "INT Brokers Press Releases",
    itemListElement: releases.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "NewsArticle",
        headline: r.headline,
        datePublished: r.date,
        articleSection: r.category,
        publisher: {
          "@type": "Organization",
          name: "INT Brokers",
          url: SITE,
        },
      },
    })),
  };
}
