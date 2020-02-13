import * as Factory from 'factory.ts';
import { PromotionalOffer } from 'src/featureFlags';

export const promotionalOfferFactory = Factory.Sync.makeFactory<
  PromotionalOffer
>({
  name: Factory.each(i => `offer-${i}`),
  feature: 'Object Storage',
  body:
    'Sample promotional body. This offer is valid until January 1st. Try it out now.',
  footnote: 'Offer is inclusive of list price only.',
  logo: 'Heavenly Bucket',
  alt: 'Promotional Offer',
  backgroundColor: '#406E51',
  displayInPrimaryNav: true,
  displayOnDashboard: true
});
