export interface CustomerReview {
  id: string;
  customerName: string;
  city: string;
  rating: number;
  date: string;
  productName: string;
  comment: string;
  verifiedPurchase: boolean;
}

export const MOCK_REVIEWS: CustomerReview[] = [
  {
    id: "rev-1",
    customerName: "Hamza Tariq",
    city: "Lahore",
    rating: 5,
    date: "2 weeks ago",
    productName: "Handcrafted Rosewood Pen in Engraved Case",
    comment:
      "Ordered this as a retirement gift for my father with his name and designation engraved on the timber box. The laser engraving is remarkably sharp and the packaging was gift-ready. Arrived in Lahore via COD within 3 days!",
    verifiedPurchase: true,
  },
  {
    id: "rev-2",
    customerName: "Ayesha Noor",
    city: "Karachi",
    rating: 5,
    date: "1 month ago",
    productName: "Matte Vacuum Insulated Thermal Flask (750ml)",
    comment:
      "The engraving on the matte black bottle looks so elegant! It doesn't peel or rub off like cheap stickers. The thermal insulation really keeps ice cold for over 24 hours. Highly recommended for gym and work.",
    verifiedPurchase: true,
  },
  {
    id: "rev-3",
    customerName: "Usman Ali Shah",
    city: "Islamabad",
    rating: 5,
    date: "3 weeks ago",
    productName: "Royal Executive 3-Piece Gift Box",
    comment:
      "We ordered 25 customized sets for our corporate partners in Islamabad. Every single pen, keychain, and cardholder was flawlessly laser-marked with our company logo and individual executive names. Top-tier service.",
    verifiedPurchase: true,
  },
  {
    id: "rev-4",
    customerName: "Fatima Zahra",
    city: "Faisalabad",
    rating: 5,
    date: "Just recently",
    productName: "Executive Matte Black Rollerball Pen",
    comment:
      "Got this for my husband with Urdu nastaliq script engraved on the clip side. The weight of the pen feels very premium in hand. The Cash on Delivery process was smooth and secure.",
    verifiedPurchase: true,
  },
];
