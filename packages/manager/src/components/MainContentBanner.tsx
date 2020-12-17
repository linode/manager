import * as React from 'react';
import Close from '@material-ui/icons/Close';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/core/Grid';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import withPreferences, {
  Props as PreferencesProps
} from 'src/containers/preferences.container';
import { compose } from 'recompose';

const useStyles = makeStyles((theme: Theme) => ({
  bannerOuter: {
    backgroundColor: theme.bg.mainContentBanner,
    padding: theme.spacing(2),
    position: 'sticky',
    top: 0,
    zIndex: 1110,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    color: '#fff',
    textAlign: 'center',
    [theme.breakpoints.only('xs')]: {
      paddingRight: 30
    }
  },
  link: {
    color: '#fff',
    textDecoration: 'underline'
  },
  closeIcon: {
    position: 'absolute',
    right: 4,
    cursor: 'pointer',
    border: 'none',
    color: theme.palette.text.primary,
    backgroundColor: 'transparent'
  }
}));

interface Props {
  bannerText: string;
  url: string;
  linkText: string;
  bannerKey: string;
  onClose: () => void;
}

type CombinedProps = Props & PreferencesProps;

const MainContentBanner: React.FC<CombinedProps> = props => {
  const {
    bannerText,
    url,
    linkText,
    bannerKey,
    getUserPreferences,
    updateUserPreferences,
    onClose
  } = props;

  const classes = useStyles();

  const dismiss = () => {
    onClose();
    getUserPreferences()
      .then(preferences => {
        updateUserPreferences({
          ...preferences,
          main_content_banner_dismissal: {
            ...preferences.main_content_banner_dismissal,
            [bannerKey]: true
          }
        });
      })
      // It's OK if this fails (the banner is still dismissed in the UI due to local state).
      .catch(_ => null);
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

const enhanced = compose<CombinedProps, Props>(React.memo, withPreferences());

export default enhanced(MainContentBanner);
