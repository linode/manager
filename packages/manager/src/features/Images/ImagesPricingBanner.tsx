import * as React from 'react';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Link from 'src/components/Link';
import useFlags from 'src/hooks/useFlags';
import useImages from 'src/hooks/useImages';

export const ImagesPricingBanner: React.FC<{}> = (_) => {
  const { images } = useImages('private');
  const flags = useFlags();

  return images.results > 0 && flags.imagesPricingBanner ? (
    <DismissibleBanner preferenceKey="images-pricing-notification">
      <Typography>
        <strong>Pricing change</strong>: Images will transition to a paid
        service with a cost of $0.10/GB per month for each Custom Image stored
        on an account. Recovery Images, generated automatically after a Linode
        is deleted, are provided at no cost for a finite period of time. For
        more information, please see our{' '}
        <Link to="https://www.linode.com/docs/products/tools/images/">
          Images tutorial
        </Link>
        .
      </Typography>
    </DismissibleBanner>
  ) : null;
};

export default ImagesPricingBanner;
