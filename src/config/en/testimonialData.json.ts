import Img1 from "@images/testimonials/man.jpg";
import Img2 from "@images/testimonials/travis-b.jpg";
import Img3 from "@images/testimonials/BowTiedFocus.jpg";
import Img4 from "@images/testimonials/geoffrey.webp";
import Img5 from "@images/testimonials/connor.webp";

import { type TestimonialItem } from "../types/configDataTypes";

export const testimonialData: TestimonialItem[] = [
  {
    avatar: Img1,
    name: "Marcus T.",
    title: "VP of Analytics",
    testimonial: `Chris built our entire dbt layer from scratch — clean models, thorough tests, real documentation. Within two months our analysts stopped going to engineering for data questions. That's the standard he sets.`,
  },
  {
    avatar: Img2,
    name: "Jordan R.",
    title: "Director of Finance",
    testimonial: `We handed Chris a mess of Excel files and a spreadsheet-based P&L process. He came back with a Snowflake warehouse, a Power BI dashboard, and a model we could actually trust in board meetings. Night and day.`,
  },
  {
    avatar: Img3,
    name: "Priya S.",
    title: "Head of Product",
    testimonial: `What sets Chris apart is that he asks the right business questions before writing a single line of SQL. The dashboards he built for us were adopted immediately because they answered what we actually needed — not what we thought we wanted.`,
  },
  {
    avatar: Img4,
    name: "Derek M.",
    title: "Senior Data Engineer",
    testimonial: `Worked alongside Chris on a warehouse migration project. His data modeling instincts are sharp — he pushed back on our original star schema design with a better approach and was right. I learned a lot from working with him.`,
  },
  {
    avatar: Img5,
    name: "Alicia W.",
    title: "Marketing Analytics Lead",
    testimonial: `Chris built our marketing attribution pipeline when three vendors had told us it couldn't be done cleanly in our stack. He documented every decision, wrote the tests, and handed it off in a way that our junior analyst could maintain. That's rare.`,
  },
];

export default testimonialData;
