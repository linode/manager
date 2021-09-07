import * as Factory from 'factory.ts';
import { ProductInformationBanner } from 'src/featureFlags';

export const productInformationBannerFactory = Factory.Sync.makeFactory<ProductInformationBanner>(
  {
    key: Factory.each((i) => `product-information-banner-${i}`),
    // safe
    message:
      'Store critical data and media files with S3-Compatible Object Storage. <a target="_blank" href="https://www.linode.com/docs/products/storage/object-storage/">New Availability: Atlanta</a>',
    bannerLocation: 'Object Storage',
  }
);
