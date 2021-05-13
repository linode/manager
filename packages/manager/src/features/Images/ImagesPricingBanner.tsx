import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Link from 'src/components/Link';
import useFlags from 'src/hooks/useFlags';
import useImages from 'src/hooks/useImages';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontSize: '1rem',
    borderLeft: `solid 6px ${theme.color.yellow}`,
    padding: theme.spacing(1),
    marginBottom: theme.spacing(),
  },
}));

export const ImagesPricingBanner: React.FC<{}> = (_) => {
  const { images } = useImages('private');
  const flags = useFlags();
  const classes = useStyles();

  return images.results > 0 && flags.imagesPricingBanner ? (
    <DismissibleBanner
      className={classes.root}
      preferenceKey="images-pricing-notification"
    >
      <Typography>
        <strong>Pricing change</strong>: Beginning on September 1, 2021, Images
        will transition to a paid service with a cost of $0.10/GB per month for
        each Custom Image stored on an account. Recovery Images, generated
        automatically after a Linode is deleted, are provided at no cost for a
        finite period of time. For more information, please see our{' '}
        <Link to="https://www.linode.com/docs/products/tools/images/">
          Images tutorial
        </Link>
        .
      </Typography>
    </DismissibleBanner>
  ) : null;
};

export default ImagesPricingBanner;
