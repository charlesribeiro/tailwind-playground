import React from 'react';

// --- Data Definition ---

interface Tier {
  name: string;
  price: string;
  pricePeriod?: string; // Optional period like "/month"
  features: string[];
  isMostPopular: boolean;
  ctaText: string;
}

const tiers: Tier[] = [
  {
    name: "Hobby",
    price: "$49",
    pricePeriod: "/month",
    features: [
      "5 Projects",
      "10GB Storage",
      "Basic Analytics",
      "Community Support",
    ],
    isMostPopular: false,
    ctaText: "Get Started",
  },
  {
    name: "Pro",
    price: "$99",
    pricePeriod: "/month",
    features: [
      "Unlimited Projects",
      "100GB Storage",
      "Advanced Analytics",
      "Priority Support",
      "Team Collaboration",
    ],
    isMostPopular: true,
    ctaText: "Sign Up Now",
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Everything in Pro",
      "Unlimited Storage",
      "SAML/SSO Integration",
      "Dedicated Account Manager",
      "24/7/365 Support",
    ],
    isMostPopular: false,
    ctaText: "Contact Sales",
  },
];

// --- Helper Icon Component ---

/**
 * A simple checkmark icon component.
 */
const CheckIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);


// --- Main Pricing Component ---

/**
 * Renders the responsive grid of pricing tiers.
 */
const PricingTiers: React.FC = () => {
  return (
    // Container for padding and centering
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Responsive Layout:
          - Mobile: Single column stack (default flex-col, handled by `space-y-8`)
          - Desktop: Three-column grid (`lg:grid`, `lg:grid-cols-3`)
        */}
        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          {tiers.map((tier) => (
            <PricingCard key={tier.name} {...tier} />
          ))}
        </div>
      </div>
    </div>
  );
};


// --- Individual Card Sub-Component ---

/**
 * Renders a single pricing card.
 */
const PricingCard: React.FC<Tier> = ({
  name,
  price,
  pricePeriod,
  features,
  isMostPopular,
  ctaText,
}) => {
  
  // --- Dynamic Class Strings ---
  // We define dynamic classes here to keep the JSX clean.

  const cardClasses = `
    relative flex flex-col p-8 rounded-2xl shadow-lg
    ${isMostPopular ? 'bg-primary-600 text-white' : 'bg-white text-gray-900'}
  `;

  const pricePeriodClasses = `
    text-lg font-normal
    ${isMostPopular ? 'text-primary-100' : 'text-gray-500'}
  `;

  const dividerClasses = `
    my-6
    ${isMostPopular ? 'border-primary-400' : 'border-gray-200'}
  `;

  const checkIconClasses = `
    w-5 h-5
    ${isMostPopular ? 'text-white' : 'text-primary-600'}
  `;

  const buttonClasses = `
    mt-8 w-full py-3 px-6 rounded-lg font-bold transition-colors
    ${
      isMostPopular
        ? 'bg-white text-primary-600 hover:bg-gray-100'
        : 'bg-primary-600 text-white hover:bg-primary-700'
    }
  `;

  return (
    <div className={cardClasses}>
      {/* "Most Popular" Badge */}
      {isMostPopular && (
        <div className="absolute top-0 right-6 -translate-y-1/2 bg-yellow-400 text-yellow-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
          Most Popular
        </div>
      )}

      {/* Tier Name */}
      <h3 className="text-2xl font-semibold">{name}</h3>

      {/* Price */}
      <p className="mt-4 text-4xl font-bold">
        {price}
        {pricePeriod && (
          <span className={pricePeriodClasses}>{pricePeriod}</span>
        )}
      </p>

      {/* Divider */}
      <hr className={dividerClasses} />

      {/* Features List */}
      {/* 'flex-grow' makes the list expand to fill available space,
          pushing the button to the bottom for a uniform look. */}
      <ul className="space-y-4 flex-grow">
        {features.map((feature) => (
          <li key={feature} className="flex items-center">
            <CheckIcon className={checkIconClasses} />
            <span className="ml-3">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Call-to-Action Button */}
      <button
        className={buttonClasses}
        aria-label={`Get the ${name} plan`}
      >
        {ctaText}
      </button>
    </div>
  );
};

export default PricingTiers;