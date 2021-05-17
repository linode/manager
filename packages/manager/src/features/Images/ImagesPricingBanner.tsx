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
    padding: theme.spacing(2),
    marginBottom: theme.spacing(),
  },
}));

export const ImagesPricingBanner: React.FC<{}> = (_) => {
  const { images } = useImages('private');
  const flags = useFlags();
  const classes = useStyles();

  const bannerCoreText = flags.imagesPricingBanner?.text;

  if (images.results === 0 || !bannerCoreText) {
    return null;
  }

  const bannerLede = flags.imagesPricingBanner?.lede ?? '';
  const bannerLinkUrl = flags.imagesPricingBanner?.link?.url ?? '';
  const bannerLinkText = flags.imagesPricingBanner?.link?.text ?? '';

  const lede = bannerLede ? (
    <span>
      <strong>{bannerLede}</strong>:{' '}
    </span>
  ) : null;

  const linkifiedText =
    bannerLinkUrl && bannerLinkText ? (
      <Link to={bannerLinkUrl}>{bannerLinkText}</Link>
    ) : null;

  return (
    <DismissibleBanner
      className={classes.root}
      preferenceKey="images-pricing-notification"
    >
      <Typography>
        {lede}
        {bannerCoreText} {linkifiedText}
      </Typography>
    </DismissibleBanner>
  );
};

export default ImagesPricingBanner;
