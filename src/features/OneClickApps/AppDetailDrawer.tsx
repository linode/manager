import * as React from 'react';
import Divider from 'src/components/core/Divider';
import Grid from 'src/components/core/Grid';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import { APP_ROOT } from 'src/constants';

import { oneClickApps } from './FakeSpec';
import LinkSection from './LinkSection';

import LibraryBook from 'src/assets/icons/guides.svg';
import Link from 'src/assets/icons/moreInfo.svg';

type ClassNames =
  | 'root'
  | 'logo'
  | 'appName'
  | 'summary'
  | 'description'
  | 'divider'
  | 'image';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  logo: {
    marginRight: theme.spacing.unit
  },
  appName: {
    fontSize: '2.3rem',
    fontFamily: theme.font.normal,
    color: theme.color.grey1
  },
  summary: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    textAlign: 'center'
  },
  description: {},
  divider: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 2
  },
  image: {
    maxWidth: 50
  }
});

interface Props {
  stackscriptID: string;
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const AppDetailDrawer: React.FunctionComponent<
  CombinedProps
> = props => {
  const { classes, stackscriptID, open, onClose } = props;
  const app = oneClickApps.find(eachApp =>
    Boolean(stackscriptID.match(eachApp.name))
  ); // This is horrible
  if (!app) {
    return null;
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        '' /* Empty so that we can display the logo beneath the close button rather than a text title */
      }
    >
      <Grid container direction="row" alignItems="center" justify="center">
        <Grid item className={classes.logo}>
          <img
            className={classes.image}
            src={`${APP_ROOT}/${app.logo_url}`}
            alt={`${app.name} logo`}
          />
        </Grid>
        <Grid item>
          <Typography variant="h2" className={classes.appName}>
            {app.name}
          </Typography>
        </Grid>
      </Grid>
      <Divider className={classes.divider} />
      <Grid container direction="column" alignItems="center" justify="center">
        <Grid item>
          <Typography variant="h3" className={classes.summary}>
            {app.summary}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1" className={classes.description}>
            {app.description}
          </Typography>
        </Grid>
        {app.href && (
          <LinkSection
            title="More info"
            links={[{ title: app.href, href: app.href }]}
            icon={Link}
          />
        )}
        <LinkSection
          title="Guides"
          links={app.related_guides || []}
          icon={LibraryBook}
        />
      </Grid>
    </Drawer>
  );
};

const styled = withStyles(styles);

export default styled(AppDetailDrawer);
