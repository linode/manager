import * as React from 'react';
import Divider from 'src/components/core/Divider';
import Grid from 'src/components/core/Grid';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import { APP_ROOT } from 'src/constants';

import { oneClickApps } from './FakeSpec';
import LinkSection from './LinkSection';
import TipSection from './TipSection';

import LibraryBook from 'src/assets/icons/guides.svg';
import Info from 'src/assets/icons/info.svg';
import Link from 'src/assets/icons/moreInfo.svg';

type ClassNames =
  | 'root'
  | 'logo'
  | 'appName'
  | 'summary'
  | 'description'
  | 'divider'
  | 'image';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    logo: {
      marginRight: theme.spacing(1)
    },
    appName: {
      fontSize: '2.4rem',
      fontFamily: theme.font.normal,
      color: theme.color.grey4
    },
    summary: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      textAlign: 'center'
    },
    description: {
      lineHeight: 1.5
    },
    divider: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2)
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
        {app.related_guides && (
          <LinkSection
            title="Guides"
            links={app.related_guides}
            icon={LibraryBook}
          />
        )}
        {app.tips && (
          <TipSection
          title="Tips"
          tips={app.tips}
          icon={Info}
          />
        )}
      </Grid>
    </Drawer>
  );
};

const styled = withStyles(styles);

export default styled(AppDetailDrawer);
