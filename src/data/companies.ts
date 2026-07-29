/**
 * Organizations Chris has worked with — shared between the company strip
 * (TestimonialsMarquee) and the career timeline (AboutCareerPath) so the
 * two can cross-link without duplicating logo/url data.
 */
export interface Company {
  name: string;
  logo: string;
  url: string;
}

export const companies: Company[] = [
  {
    name: "Wells Fargo",
    logo: "/images/companies/wellsfargo.svg",
    url: "https://www.wellsfargo.com",
  },
  { name: "Intrinio", logo: "/images/companies/intrinio.svg", url: "https://intrinio.com" },
  {
    name: "Socrates Platform",
    logo: "/images/companies/socrates.svg",
    url: "https://standard.socratesplatform.com/MKC/Content/IntroPlatform/WhatIsSocrates.htm",
  },
  {
    name: "Trader Joe's",
    logo: "/images/companies/traderjoes.svg",
    url: "https://www.traderjoes.com",
  },
  { name: "Walgreens", logo: "/images/companies/walgreens.svg", url: "https://www.walgreens.com" },
  { name: "Kroger", logo: "/images/companies/kroger.svg", url: "https://www.kroger.com" },
  {
    name: "Velvet Taco",
    logo: "/images/companies/velvettaco.svg",
    url: "https://www.velvettaco.com",
  },
  { name: "Chipotle", logo: "/images/companies/chipotle.svg", url: "https://www.chipotle.com" },
  { name: "Renuity", logo: "/images/companies/renuity.svg", url: "https://renuityhome.com" },
];

export function findCompany(org: string): Company | undefined {
  const q = org.trim().toLowerCase();
  return companies.find((c) => {
    const name = c.name.toLowerCase();
    return name.includes(q) || q.includes(name);
  });
}
