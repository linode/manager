import * as Factory from 'factory.ts';
import { PromotionalOffer } from 'src/featureFlags';

export const promotionalOfferFactory = Factory.Sync.makeFactory<
  PromotionalOffer
>({
  name: Factory.each(i => `offer-${i}`),
  features: ['Object Storage'],
  body:
    'Sample promotional body. This offer is valid until January 1st. Try it out now.',
  footnote: 'Offer is inclusive of list price only.',
  logo: 'heavenly-bucket.svg',
  alt: 'Promotional Offer',
  displayOnDashboard: true,
  buttons: [
    { text: 'Try it Now', href: '/object-storage/buckets', type: 'primary' },
    {
      text: 'Cost Estimator',
      href: 'https://www.linode.com/products/object-storage/',
      type: 'secondary',
    },
  ],
});
