import { Factory } from '@linode/utilities';

import { PromotionalOffer } from 'src/featureFlags';

export const promotionalOfferFactory =
  Factory.Sync.makeFactory<PromotionalOffer>({
    alt: 'Promotional Offer',
    body: 'Sample promotional body. This offer is valid until January 1st. Try it out now.',
    buttons: [
      { href: '/object-storage/buckets', text: 'Try it Now', type: 'primary' },
      {
        href: 'https://www.linode.com/products/object-storage/',
        text: 'Cost Estimator',
        type: 'secondary',
      },
    ],
    displayOnDashboard: true,
    features: ['Object Storage'],
    footnote: 'Offer is inclusive of list price only.',
    logo: 'heavenly-bucket.svg',
    name: Factory.each((i) => `offer-${i}`),
  });
