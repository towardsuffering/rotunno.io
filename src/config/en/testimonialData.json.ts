import Img1 from "@images/testimonials/man.png";
import Img2 from "@images/testimonials/travis-b.png";
import Img3 from "@images/testimonials/BowTiedFocus.jpg";
import Img4 from "@images/testimonials/geoffrey.webp";
import Img5 from "@images/testimonials/connor.webp";

import { type TestimonialItem } from "../types/configDataTypes";

export const testimonialData: TestimonialItem[] = [
  {
    avatar: Img1,
    name: "Kash",
    title: "Farmers Market Regular",
    testimonial: `I didn't expect much — it's watermelon juice. Then I tried it and couldn't believe how good something so simple could taste. Rob and Chris are genuinely passionate about what they do and it shows in every cup.`,
  },
  {
    avatar: Img2,
    name: "Curtis",
    title: "Trade Show Attendee",
    testimonial: `Walked past their booth and the energy stopped me. Two guys who clearly love what they're doing, pressing everything fresh right in front of you. The Ancient City Splash was the most refreshing thing I had all day — and I wasn't expecting that.`,
  },
  {
    avatar: Img3,
    name: "Jen",
    title: "Private Event Host",
    testimonial: `Booked them for our backyard party and they were an absolute joy to work with. Professional, friendly, on time, and our guests couldn't stop talking about the drinks. That surprise on people's faces when they take the first sip — priceless.`,
  },
  {
    avatar: Img4,
    name: "Megan",
    title: "Saint Augustine Local",
    testimonial: `Love that these guys are local and putting something real into the community. Simple ingredients, made with care, and somehow it tastes better than anything fancy. Chris and Rob make you feel like a neighbor, not a customer.`,
  },
  {
    avatar: Img5,
    name: "Kelsey",
    title: "Loyal Customer",
    testimonial: `There's something about the Ancient City Splash that just hits differently. Refreshing in the best way, surprisingly delicious, and the guys behind it are as warm as the Florida sun. My Sunday isn't complete without it.`,
  },
];

export default testimonialData;
