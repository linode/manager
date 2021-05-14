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

  if (images.results === 0 || !flags.imagesPricingBanner) {
    return null;
  }

  const bannerLede = flags.imagesPricingBanner.lede;
  const bannerCoreText = flags.imagesPricingBanner.text;
  const bannerLinkUrl = flags.imagesPricingBanner.link.url;
  const bannerLinkText = flags.imagesPricingBanner.link.text;

  return (
    <DismissibleBanner
      className={classes.root}
      preferenceKey="images-pricing-notification"
    >
      <Typography>
        <strong>{bannerLede}</strong>: {bannerCoreText}{' '}
        <Link to={bannerLinkUrl}>{bannerLinkText}</Link>.
      </Typography>
    </DismissibleBanner>
  );
};

export default ImagesPricingBanner;
