import * as React from 'react';
import Close from '@mui/icons-material/Close';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Grid from 'src/components/core/Grid';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import { useMutatePreferences, usePreferences } from 'src/queries/preferences';

const useStyles = makeStyles((theme: Theme) => ({
  bannerOuter: {
    backgroundColor: theme.bg.mainContentBanner,
    padding: theme.spacing(2),
    position: 'sticky',
    top: 0,
    zIndex: 1110,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '65%',
    [theme.breakpoints.down('md')]: {
      width: '90%',
    },
    color: '#fff',
    textAlign: 'center',
    [theme.breakpoints.only('xs')]: {
      paddingRight: 30,
    },
  },
  link: {
    color: '#74AAE6',
  },
  closeIcon: {
    position: 'absolute',
    right: 4,
    cursor: 'pointer',
    border: 'none',
    color: theme.palette.text.primary,
    backgroundColor: 'transparent',
  },
}));

interface Props {
  bannerText: string;
  url: string;
  linkText: string;
  bannerKey: string;
  onClose: () => void;
}

const MainContentBanner: React.FC<Props> = (props) => {
  const { bannerText, url, linkText, bannerKey, onClose } = props;

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
    <Grid className={classes.bannerOuter} item xs={12}>
      <Typography variant="h2" className={classes.header}>
        {bannerText}&nbsp;
        {linkText && url && (
          <Link to={url} className={classes.link}>
            {linkText}
          </Link>
        )}
      </Typography>
      <button
        className={classes.closeIcon}
        onClick={dismiss}
        aria-label="Close"
      >
        <Close />
      </button>
    </Grid>
  );
};

export default React.memo(MainContentBanner);
