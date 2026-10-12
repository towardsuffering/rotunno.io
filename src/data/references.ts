// Quotes from professional references shown on the homepage.
// PLACEHOLDER: replace each entry with a real quote, the person's full name and title,
// and only after they have agreed to be quoted. Set `placeholder: false` once real.
export interface ReferenceQuote {
  quote: string;
  name: string;
  title: string;
  context: string; // where you worked together
  placeholder?: boolean;
}

export const references: ReferenceQuote[] = [
  {
    quote:
      "Placeholder quote from a reference about the financial data platform: the reliability, the accuracy, and what it meant for the clients who depended on it.",
    name: "Reference Name",
    title: "Title, AE Global Solutions",
    context: "Financial data infrastructure",
    placeholder: true,
  },
  {
    quote:
      "Placeholder quote from a reference about Root Labs: building the ingestion pipeline, leading the team, and cutting data costs without cutting corners.",
    name: "Reference Name",
    title: "Title, Root Labs",
    context: "Data engineering leadership",
    placeholder: true,
  },
  {
    quote:
      "Placeholder quote from a reference about the sales floor: earning trust with homeowners, setting the standard for the team, and treating every customer like a neighbor.",
    name: "Reference Name",
    title: "Title, Renuity Home",
    context: "B2C sales",
    placeholder: true,
  },
];
