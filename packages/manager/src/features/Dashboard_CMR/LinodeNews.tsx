import * as React from 'react';
import Logo from 'src/assets/logo/logo.svg';
import Close from '@material-ui/icons/Close';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import useFlags from 'src/hooks/useFlags';
import usePreferences from 'src/hooks/usePreferences';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& a': {
      color: theme.palette.cmrTextColors.linkActiveMedium
    }
  },
  logo: {
    height: 30,
    width: 30,
    paddingRight: theme.spacing()
  },
  icon: {
    ...theme.applyLinkStyles,
    color: theme.palette.cmrIconColors.iActiveMedium
  }
}));

export const LinodeNews: React.FC<{}> = _ => {
  const classes = useStyles();
  const flags = useFlags();
  const { preferences, updatePreferences } = usePreferences();
  const { VERSION } = process.env || null;

  /**
   * Rather than wait for the request to clear, when the banner is dismissed
   * immediately hide it.
   */
  const [optimisticallyHidden, setOptimisticallyHidden] = React.useState(false);

  const handleClick = () => {
    setOptimisticallyHidden(true);
    updatePreferences({ linode_news_banner_dismissed: true });
  };

  if (
    !VERSION ||
    preferences?.linode_news_banner_dismissed ||
    optimisticallyHidden
  ) {
    return null;
  }

  return (
    <Paper className={classes.root}>
      <div className="flexCenter">
        <Logo className={classes.logo} />
        <Typography style={{ fontSize: '1rem' }}>
          Cloud Manager v{VERSION} has been released! {` `}
          {/** If changelog text for this version is present in LaunchDarkly, display it here. */}
          {flags.changelog?.version === VERSION
            ? `${flags.changelog.message} `
            : null}
          <Link
            to={`https://github.com/linode/manager/releases/tag/linode-manager@v${VERSION}`}
          >
            Read the release notes{` `}
          </Link>
          for details.
        </Typography>
      </div>
      <button onClick={handleClick} className={classes.icon}>
        <Close />
      </button>
    </Paper>
  );
};

export default React.memo(LinodeNews);
