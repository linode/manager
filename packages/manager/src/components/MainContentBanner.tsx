import * as React from 'react';
import Close from '@mui/icons-material/Close';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
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
  bannerText: string;
  url: string;
  linkText: string;
  bannerKey: string;
  onClose: () => void;
}

const MainContentBanner: React.FC<Props> = (props) => {
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
