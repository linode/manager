import { isEmpty } from 'ramda';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Link from 'src/components/Link';
import { FlagSet } from 'src/featureFlags';
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

  const bannerHasContents = checkFlagsForImagesPricingBanner(flags);

  if (images.results === 0 || !bannerHasContents) {
    return null;
  }

  const bannerCoreText = flags.imagesPricingBanner?.text;

  const bannerLede = flags.imagesPricingBanner?.lede ?? '';
  const bannerLinkUrl = flags.imagesPricingBanner?.link?.url ?? '';
  const bannerLinkText = flags.imagesPricingBanner?.link?.text ?? '';

  const generateLede = () => {
    return bannerLede ? (
      <span>
        <strong>{bannerLede}</strong>:{' '}
      </span>
    ) : null;
  };

  const generateLinkifiedText = () => {
    return bannerLinkUrl && bannerLinkText ? (
      <Link to={bannerLinkUrl}>{bannerLinkText}</Link>
    ) : null;
  };

  return (
    <DismissibleBanner
      className={classes.root}
      preferenceKey="images-pricing-notification"
    >
      <Typography>
        {generateLede()}
        {bannerCoreText} {generateLinkifiedText()}
      </Typography>
    </DismissibleBanner>
  );
};

export default ImagesPricingBanner;

export const checkFlagsForImagesPricingBanner = (flags: FlagSet) => {
  return Boolean(
    flags.imagesPricingBanner &&
      !isEmpty(flags.imagesPricingBanner) &&
      flags.imagesPricingBanner.key
  );
};
