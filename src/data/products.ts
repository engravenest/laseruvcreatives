import { Product, ProductCategory } from "@/types/product";

/**
 * ============================================================================
 * LaserUVCreatives Product Catalog Data
 * ============================================================================
 * You can easily update product names, prices (PKR), images, descriptions,
 * variants, and customization settings in this single file.
 */

export const CATEGORIES: ProductCategory[] = [
  {
    id: "cat-1",
    name: "Personalized Pens",
    slug: "personalized-pens",
    description: "Laser-engraved executive metal and rollerball pens with individual names and titles.",
    image: "/images/cat-pens.jpg",
    productCount: 3,
  },
  {
    id: "cat-2",
    name: "Wooden Pens",
    slug: "wooden-pens",
    description: "Handcrafted natural rosewood and bamboo pens paired with engraved timber cases.",
    image: "/images/cat-wooden.jpg",
    productCount: 2,
  },
  {
    id: "cat-3",
    name: "Customized Bottles",
    slug: "customized-bottles",
    description: "Double-walled vacuum insulated stainless steel flasks etched with names or logos.",
    image: "/images/cat-bottles.jpg",
    productCount: 2,
  },
  {
    id: "cat-4",
    name: "Gift Sets",
    slug: "gift-sets",
    description: "Curated luxury velvet gift boxes containing personalized pens, keychains, and cardholders.",
    image: "/images/cat-giftsets.jpg",
    productCount: 1,
  },
  {
    id: "cat-5",
    name: "Corporate Gifts",
    slug: "corporate-gifts",
    description: "Branded executive onboarding bundles, company pens, and client appreciation packages.",
    image: "/images/cat-corporate.jpg",
    productCount: 2,
  },
];

const DEFAULT_FONTS = [
  { id: "script", name: "Elegant Script Calligraphy", styleClass: "italic font-serif" },
  { id: "sans", name: "Modern Minimalist Sans", styleClass: "font-sans uppercase tracking-widest" },
  { id: "serif", name: "Executive Bold Serif", styleClass: "font-serif tracking-wide font-bold" },
];

export const PRODUCTS: Product[] = [
  {
    id: "prod-wooden-pen-box",
    slug: "customized-wooden-pen-with-engraved-box",
    name: "Customized Wooden Pen with Engraved Name & Box",
    tagline: "Handcrafted Natural Grain Rosewood with Solid Brass Trim",
    description:
      "A timeless artisanal writing instrument crafted from natural rosewood, accompanied by a custom matching timber gift box. Precision laser engraving permanence ensures your name or message never fades.",
    detailedDescription:
      "Our flagship handcrafted wooden pen is balanced for effortless everyday writing. Both the natural wood pen barrel and the solid timber presentation box are permanently laser-engraved with your recipient's name, designation, or personal anniversary message. Packaged presentation-ready for gift giving.",
    price: 2650,
    originalPrice: 3200,
    categorySlug: "wooden-pens",
    categoryName: "Wooden Pens",
    images: ["/images/cat-wooden.jpg", "/images/hero-gifts.jpg"],
    inStock: true,
    rating: 4.9,
    reviewsCount: 42,
    badge: "Bestseller",
    customization: {
      allowsText: true,
      maxTextLength: 30,
      textLabel: "Recipient Name & Title for Pen & Box",
      allowsLogo: true,
      logoLabel: "Optional Logo on Wooden Box Lid",
      supportedFormats: ["PNG", "JPG", "SVG", "PDF"],
      engravingLocations: ["Pen Barrel", "Box Lid Top", "Inner Lid (Optional)"],
      fontOptions: DEFAULT_FONTS,
      placeholderText: "e.g. Dr. Sarah Jennings",
      notes: "Engraving on both the pen and the box is included at no extra charge.",
    },
    variants: [
      {
        id: "wood-type",
        name: "Wood Finish",
        options: [
          { id: "rosewood", label: "Classic Rosewood (Deep Auburn)", inStock: true },
          { id: "bamboo", label: "Natural Golden Bamboo", inStock: true },
        ],
      },
    ],
    specs: {
      Material: "Natural Rosewood / Bamboo with Brass Core",
      Refill: "Standard 0.7mm German Rollerball (Black Ink)",
      "Box Dimensions": "17.5 cm x 5.0 cm x 2.5 cm",
      Finishing: "Protective organic wax polish & laser etch",
      Weight: "Pen 38g | Full Box 145g",
    },
    includedItems: [
      "Handcrafted Wooden Pen",
      "Engraved Matching Solid Wooden Case",
      "1x Extra High-Capacity Rollerball Refill",
      "Velvet Gift Bag",
    ],
    deliveryEstimate: "3–4 working days nationwide via Cash on Delivery",
    createdAt: "2026-03-01",
  },
  {
    id: "prod-pack-5-pens",
    slug: "5-pens-with-name-logo",
    name: "5 Executive Metal Pens with Name & Logo (Team Pack)",
    tagline: "Cohesive Corporate Branding & Executive Gifting in a Single Pack",
    description:
      "A set of 5 matching premium matte anodized metal pens. Each individual pen can be personalized with a unique name, or engraved with your unified corporate organization logo.",
    detailedDescription:
      "Designed specifically for corporate teams, project milestones, wedding parties, and executive gifts. Each pen features a weighted metal core, responsive twist or click mechanism, and crisp fiber-laser engraving that exposes the gleaming raw brass or silver underlayer.",
    price: 4950,
    originalPrice: 6200,
    categorySlug: "corporate-gifts",
    categoryName: "Corporate Gifts",
    images: ["/images/cat-pens.jpg", "/images/cat-corporate.jpg"],
    inStock: true,
    rating: 5.0,
    reviewsCount: 56,
    badge: "Popular",
    customization: {
      allowsText: true,
      maxTextLength: 120,
      textLabel: "5 Individual Names (e.g. 1. Ali, 2. Bilal, 3. Usman, 4. Zain, 5. Hamza)",
      allowsLogo: true,
      logoLabel: "Upload Corporate Vector Logo (applies to all 5 pens)",
      supportedFormats: ["PNG", "JPG", "SVG", "AI", "PDF"],
      engravingLocations: ["Pen Barrel Right", "Pen Barrel Left", "Clip Area"],
      fontOptions: DEFAULT_FONTS,
      placeholderText: "1. Ahmed Khan, 2. Fahad Malik, 3. Bilal Tariq...",
      notes: "You may specify 5 distinct names or 1 common logo across all pens.",
    },
    variants: [
      {
        id: "pack-color",
        name: "Pen Set Color",
        options: [
          { id: "matte-black", label: "Matte Black with Gold Laser", inStock: true },
          { id: "gunmetal", label: "Gunmetal Charcoal with Silver Laser", inStock: true },
          { id: "midnight-navy", label: "Midnight Blue with Chrome Trim", inStock: true },
        ],
      },
    ],
    specs: {
      PackQuantity: "5 Individual Metal Pens",
      Material: "Anodized Aerospace Aluminum Alloy",
      RefillType: "0.5mm Fine Black Gel / Rollerball",
      LaserTech: "High Precision Fiber Laser Marking",
    },
    includedItems: [
      "5x Custom Engraved Metal Pens",
      "5x Individual Sleek Velvet Sleeve Pouches",
      "Quality Inspection Guarantee Certificate",
    ],
    deliveryEstimate: "3–5 working days nationwide via Cash on Delivery",
    createdAt: "2026-03-05",
  },
  {
    id: "prod-customized-500ml-bottle",
    slug: "customized-500ml-bottle",
    name: "Customized 500ml Vacuum Insulated Thermal Bottle",
    tagline: "Double-Walled 304 Stainless Steel • 24h Cold / 12h Hot",
    description:
      "A sleek matte-finish 500ml vacuum insulated bottle laser-etched with your recipient's name, monogram, or motivational quote. Sweat-proof, leak-proof, and BPA-free.",
    detailedDescription:
      "Engineered for daily gym sessions, office desks, and university commutes. The exterior powder-coat matte finish is precision-ablated with our high-power laser, revealing the brilliant stainless steel underneath in clean typography or graphic motifs.",
    price: 1950,
    originalPrice: 2400,
    categorySlug: "customized-bottles",
    categoryName: "Customized Bottles",
    images: ["/images/cat-bottles.jpg", "/images/hero-gifts.jpg"],
    inStock: true,
    rating: 4.8,
    reviewsCount: 39,
    badge: "Trending",
    customization: {
      allowsText: true,
      maxTextLength: 25,
      textLabel: "Name or Vertical Monogram Text",
      allowsLogo: true,
      logoLabel: "Upload Logo or Silhouette Graphic",
      supportedFormats: ["PNG", "JPG", "SVG", "PDF"],
      engravingLocations: ["Vertical Center Front", "Horizontal Lower Body", "Lid Rim"],
      fontOptions: DEFAULT_FONTS,
      placeholderText: "e.g. LIAM or ELIZA",
      notes: "Vertical lettering is positioned along the bottle body for a modern aesthetic.",
    },
    variants: [
      {
        id: "bottle-color",
        name: "Bottle Color",
        options: [
          { id: "matte-black", label: "Matte Stealth Black", inStock: true },
          { id: "forest-green", label: "Forest Green", inStock: true },
          { id: "steel-silver", label: "Brushed Silver Steel", inStock: true },
        ],
      },
    ],
    specs: {
      Capacity: "500 ml (17 oz)",
      Insulation: "Double-Wall Vacuum Sealed",
      Material: "Food-Grade 18/8 304 Stainless Steel",
      ThermalPerformance: "24 Hours Cold | 12 Hours Hot",
      Lid: "Leak-proof stainless steel cap with carry handle",
    },
    includedItems: [
      "Custom Engraved 500ml Insulated Bottle",
      "Sealed Silicone Leak-Proof Lid",
      "Cardboard Cylinder Protective Packaging",
    ],
    deliveryEstimate: "3–4 working days nationwide via Cash on Delivery",
    createdAt: "2026-03-08",
  },
  {
    id: "prod-premium-a-ballpoint",
    slug: "premium-a-quality-customized-ballpoint-pen",
    name: "Premium A-Quality Customized Ballpoint Pen",
    tagline: "Solid Metal Weighted Barrel with Crisp Personalized Name",
    description:
      "Our most popular executive everyday writing pen. Crafted with solid brass underlay, matte velvet-touch lacquer, and your name laser-etched in sharp contrast.",
    detailedDescription:
      "An essential gift for graduations, promotions, doctors, lawyers, and corporate executives. Balanced weighting in hand provides an exceptionally smooth writing flow with instant start Swiss ballpoint ink.",
    price: 1350,
    originalPrice: 1650,
    categorySlug: "personalized-pens",
    categoryName: "Personalized Pens",
    images: ["/images/cat-pens.jpg", "/images/hero-gifts.jpg"],
    inStock: true,
    rating: 4.9,
    reviewsCount: 47,
    badge: "Bestseller",
    customization: {
      allowsText: true,
      maxTextLength: 26,
      textLabel: "Recipient Name & Initials",
      allowsLogo: false,
      engravingLocations: ["Pen Barrel Front", "Pen Barrel Opposite Clip"],
      fontOptions: DEFAULT_FONTS,
      placeholderText: "e.g. Muhammad Bilal",
      notes: "Laser ablation exposes the bright gleaming brass substrate underneath.",
    },
    variants: [
      {
        id: "pen-finish",
        name: "Metal Finish",
        options: [
          { id: "matte-black-gold", label: "Matte Black with Gold Laser Engraving", inStock: true },
          { id: "silver-chrome", label: "Satin Silver with Charcoal Laser", inStock: true },
          { id: "burgundy-gold", label: "Deep Burgundy with Gold Laser", inStock: true },
        ],
      },
    ],
    specs: {
      Material: "Brass Core with Powder-Coated Lacquer",
      Mechanism: "Twist Action Ballpoint",
      InkColor: "Blue / Black High-Viscosity Ink Refill",
      Weight: "34 grams (Executive Weighted)",
    },
    includedItems: [
      "Personalized Laser-Engraved Ballpoint Pen",
      "Executive Magnetic Snap Case",
      "Pre-installed Smooth Ballpoint Cartridge",
    ],
    deliveryEstimate: "3–4 working days nationwide via Cash on Delivery",
    createdAt: "2026-03-10",
  },
  {
    id: "prod-diamond-top-pen",
    slug: "diamond-top-customized-pen",
    name: "Diamond-Top Customized Pen",
    tagline: "Crystal Faceted Diamond Crown with Personalized Calligraphy Name",
    description:
      "An exquisite gift pen crowned with a large multifaceted crystal diamond. Custom engraved with names or wedding dates on the slim metallic barrel.",
    detailedDescription:
      "A stunning personalized piece tailored for bridal gifts, birthdays, celebrations, and signing ceremonies. The top jewel catches the light brilliantly while your custom laser-engraved calligraphy adds a deeply heartfelt touch.",
    price: 1750,
    originalPrice: 2100,
    categorySlug: "personalized-pens",
    categoryName: "Personalized Pens",
    images: ["/images/cat-pens.jpg", "/images/cat-giftsets.jpg"],
    inStock: true,
    rating: 4.9,
    reviewsCount: 33,
    badge: "New",
    customization: {
      allowsText: true,
      maxTextLength: 24,
      textLabel: "Name or Short Message",
      allowsLogo: false,
      engravingLocations: ["Lower Barrel", "Upper Body"],
      fontOptions: DEFAULT_FONTS,
      placeholderText: "e.g. Ayesha Noor / Bride 2026",
      notes: "Fine line laser engraving specifically formatted for slim pen barrels.",
    },
    variants: [
      {
        id: "crystal-color",
        name: "Pen & Jewel Color",
        options: [
          { id: "rose-gold", label: "Rose Gold with Clear Crystal Diamond", inStock: true },
          { id: "pearl-white", label: "Pearl White with Iridescent Diamond", inStock: true },
          { id: "obsidian-black", label: "Metallic Black with Smoked Diamond", inStock: true },
        ],
      },
    ],
    specs: {
      TopCrown: "Facet-cut K9 Optical Crystal",
      Body: "Polished Stainless Alloy",
      Mechanism: "Smooth Twist Retractable",
      Ink: "0.5mm Smooth Black Gel Ink",
    },
    includedItems: [
      "Custom Engraved Diamond-Top Pen",
      "Soft Velvet Drawstring Gift Pouch",
      "Protective Tip Seal",
    ],
    deliveryEstimate: "3–4 working days nationwide via Cash on Delivery",
    createdAt: "2026-03-12",
  },
  {
    id: "prod-royal-giftset",
    slug: "royal-executive-gift-set",
    name: "Royal Executive 3-Piece Gift Set",
    tagline: "Custom Engraved Pen, Leather Keychain & Metallic Cardholder",
    description:
      "A luxury 3-piece curated presentation box. Includes personalized executive pen, engraved leatherette keychain, and metallic business card case in a ribbon-tied box.",
    detailedDescription:
      "The definitive gift for high achievers, promotions, and milestone birthdays. All three pieces are permanently engraved to match with recipient name, initials, or corporate insignia.",
    price: 4200,
    originalPrice: 4950,
    categorySlug: "gift-sets",
    categoryName: "Gift Sets",
    images: ["/images/cat-giftsets.jpg", "/images/cat-corporate.jpg"],
    inStock: true,
    rating: 5.0,
    reviewsCount: 44,
    badge: "Bestseller",
    customization: {
      allowsText: true,
      maxTextLength: 28,
      textLabel: "Name & Initials for All 3 Items",
      allowsLogo: true,
      logoLabel: "Company Logo for Cardholder & Box",
      supportedFormats: ["PNG", "JPG", "SVG", "PDF"],
      engravingLocations: ["Pen Barrel", "Cardholder Face", "Leather Keychain Tag"],
      fontOptions: DEFAULT_FONTS,
      placeholderText: "e.g. Sarah J. Reed",
      notes: "All 3 items are customized in matching fonts and finish.",
    },
    variants: [
      {
        id: "set-palette",
        name: "Gift Set Palette",
        options: [
          { id: "black-leather", label: "Classic Black & Tan Leather", inStock: true },
          { id: "carbon-silver", label: "Carbon Grey & Silver", inStock: true },
        ],
      },
    ],
    specs: {
      Contents: "Rollerball Pen + Cardholder + Keychain",
      BoxStyle: "Velvet-Lined Hardcover Gift Box with Satin Pull Ribbon",
      CardholderCapacity: "Up to 15 standard business cards",
    },
    includedItems: [
      "Customized Rollerball Pen",
      "Custom Laser-Marked Cardholder",
      "Engraved Leatherette Keychain",
      "Luxury Velvet Presentation Box with Ribbon",
    ],
    deliveryEstimate: "3–5 working days nationwide via Cash on Delivery",
    createdAt: "2026-02-28",
  },
  {
    id: "prod-corporate-onboarding-kit",
    slug: "corporate-executive-onboarding-kit",
    name: "Corporate Executive Onboarding Kit",
    tagline: "Hardbound Journal, Thermal Tumbler & Laser Pen in Branded Box",
    description:
      "Our premier corporate gift solution. Features a custom logo-embossed/laser hardbound executive diary, 350ml insulated coffee tumbler, and matching engraved metal pen.",
    detailedDescription:
      "Elevate your corporate brand perception and welcome new directors, clients, or team members with a cohesive, beautifully laser-branded package.",
    price: 5800,
    originalPrice: 6800,
    categorySlug: "corporate-gifts",
    categoryName: "Corporate Gifts",
    images: ["/images/cat-corporate.jpg", "/images/cat-giftsets.jpg"],
    inStock: true,
    rating: 4.9,
    reviewsCount: 67,
    badge: "Popular",
    customization: {
      allowsText: true,
      maxTextLength: 30,
      textLabel: "Executive Name & Designation",
      allowsLogo: true,
      logoLabel: "Upload High-Resolution Company Logo",
      supportedFormats: ["PNG", "JPG", "SVG", "PDF", "AI"],
      engravingLocations: ["Notebook Cover", "Tumbler Front", "Pen Barrel"],
      fontOptions: DEFAULT_FONTS,
      placeholderText: "e.g. Aurora Innovations / Ali Khan",
      notes: "Bulk corporate discounts available for orders over 10 kits.",
    },
    specs: {
      Diary: "A5 Hardbound Textured Leatherette with Gold Gilt Edges",
      Tumbler: "350ml Double-Walled Stainless Steel Travel Mug",
      Pen: "Executive Matte Black Ballpoint with Gold Trim",
    },
    includedItems: [
      "Personalized A5 Hardbound Diary",
      "Custom Laser-Etched 350ml Tumbler",
      "Laser-Engraved Metal Pen",
      "Magnetic Presentation Gift Box",
    ],
    deliveryEstimate: "4–6 working days nationwide via Cash on Delivery",
    createdAt: "2026-02-20",
  },
  {
    id: "prod-750ml-flask",
    slug: "customized-750ml-vacuum-flask",
    name: "Customized 750ml Vacuum Insulated Thermal Flask",
    tagline: "Large Capacity High-Performance Stainless Steel Bottle",
    description:
      "Generous 750ml stainless steel insulated flask with durable powder coat and permanent laser name/logo engraving. Built for all-day hydration.",
    detailedDescription:
      "Keeps water chilled during hot summer afternoons across Pakistan or tea steaming hot on highway road trips. Features an airtight steel lid with silicon loop.",
    price: 2350,
    originalPrice: 2800,
    categorySlug: "customized-bottles",
    categoryName: "Customized Bottles",
    images: ["/images/cat-bottles.jpg", "/images/hero-gifts.jpg"],
    inStock: true,
    rating: 4.8,
    reviewsCount: 29,
    badge: "Trending",
    customization: {
      allowsText: true,
      maxTextLength: 28,
      textLabel: "Name or Custom Text",
      allowsLogo: true,
      logoLabel: "Upload Custom Logo / Graphic",
      supportedFormats: ["PNG", "JPG", "SVG"],
      engravingLocations: ["Center Body", "Lower Base"],
      fontOptions: DEFAULT_FONTS,
      placeholderText: "e.g. Liam O'Connell",
    },
    specs: {
      Capacity: "750 ml (25 oz)",
      Material: "304 Food-Grade Stainless Steel",
      ThermalPerformance: "24h Cold | 12h Hot",
    },
    includedItems: [
      "Customized 750ml Insulated Flask",
      "Airtight Steel Loop Cap",
      "Box Packaging",
    ],
    deliveryEstimate: "3–4 working days nationwide via Cash on Delivery",
    createdAt: "2026-03-02",
  },
  {
    id: "prod-bamboo-pen-case",
    slug: "eco-friendly-bamboo-pen-case",
    name: "Eco-Friendly Bamboo Pen with Magnetic Gift Case",
    tagline: "100% Sustainable Bamboo with Laser-Carved Box",
    description:
      "Lightweight natural bamboo pen accompanied by a magnetic flip-top bamboo presentation case. Laser etched with personalized names or ecological quotes.",
    detailedDescription:
      "Celebrate sustainability with this warm, lightweight natural bamboo writing instrument. The organic grain ensures every single piece has unique natural patterns.",
    price: 1850,
    categorySlug: "wooden-pens",
    categoryName: "Wooden Pens",
    images: ["/images/cat-wooden.jpg", "/images/hero-gifts.jpg"],
    inStock: true,
    rating: 4.7,
    reviewsCount: 21,
    badge: "New",
    customization: {
      allowsText: true,
      maxTextLength: 26,
      textLabel: "Name for Pen & Bamboo Box",
      allowsLogo: false,
      engravingLocations: ["Pen Barrel", "Box Lid Top"],
      fontOptions: DEFAULT_FONTS,
      placeholderText: "e.g. Eco Creatives",
    },
    specs: {
      Material: "100% Sustainable Bamboo Wood",
      Refill: "Standard Blue Ink Gel Rollerball",
      BoxStyle: "Dual Magnetic Snap Wooden Box",
    },
    includedItems: [
      "Engraved Bamboo Pen",
      "Engraved Magnetic Bamboo Display Box",
    ],
    deliveryEstimate: "3–4 working days nationwide via Cash on Delivery",
    createdAt: "2026-03-14",
  },
];

/**
 * Catalog helper functions
 */
export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  if (categorySlug === "all") return PRODUCTS;
  return PRODUCTS.filter((p) => p.categorySlug === categorySlug);
}

export function getCategories(): ProductCategory[] {
  return CATEGORIES;
}
