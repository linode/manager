import * as React from 'react';
import Logo from 'src/assets/logo/logo.svg';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import useFlags from 'src/hooks/useFlags';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logo: {
    height: 30,
    width: 30,
    paddingRight: theme.spacing()
  }
}));

export const LinodeNews: React.FC<{}> = _ => {
  const classes = useStyles();
  const flags = useFlags();
  const { VERSION } = process.env || null;
  if (!VERSION) {
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
    </Paper>
  );
};

export default React.memo(LinodeNews);
