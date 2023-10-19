import Close from '@mui/icons-material/Close';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { useMutatePreferences, usePreferences } from 'src/queries/preferences';

const useStyles = makeStyles((theme: Theme) => ({
  bannerOuter: {
    alignItems: 'center',
    backgroundColor: theme.bg.mainContentBanner,
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(2),
    position: 'sticky',
    top: 0,
    zIndex: 1110,
  },
  closeIcon: {
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.palette.text.primary,
    cursor: 'pointer',
    position: 'absolute',
    right: 4,
  },
  header: {
    color: '#fff',
    textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      width: '90%',
    },
    [theme.breakpoints.only('xs')]: {
      paddingRight: 30,
    },
    width: '65%',
  },
  link: {
    color: '#74AAE6',
  },
}));

interface Props {
  bannerKey: string;
  bannerText: string;
  linkText: string;
  onClose: () => void;
  url: string;
}

export const MainContentBanner = React.memo((props: Props) => {
  const { bannerKey, bannerText, linkText, onClose, url } = props;

  const { refetch: refetchPrefrences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const classes = useStyles();

  const dismiss = () => {
    onClose();
    refetchPrefrences()
      .then(({ data: preferences }) => preferences ?? Promise.reject())
      .then((preferences) => {
        return updatePreferences({
          main_content_banner_dismissal: {
            ...preferences.main_content_banner_dismissal,
            [bannerKey]: true,
          },
        });
      })
      // It's OK if this fails (the banner is still dismissed in the UI due to local state).
      .catch();
  };

  return (
    <Grid className={classes.bannerOuter} xs={12}>
      <Typography className={classes.header} variant="h2">
        {bannerText}&nbsp;
        {linkText && url && (
          <Link className={classes.link} to={url}>
            {linkText}
          </Link>
        )}
      </Typography>
      <button
        aria-label="Close"
        className={classes.closeIcon}
        onClick={dismiss}
      >
        <Close />
      </button>
    </Grid>
  );
});
