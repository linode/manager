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
import { sanitizeHTML } from 'src/utilities/sanitize-html';

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
  | 'image'
  | 'wrapLogo'
  | 'wrapAppName';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    logo: {
      marginRight: theme.spacing(1)
    },
    appName: {
      fontSize: '2.0rem',
      fontFamily: theme.font.normal,
      color: theme.color.grey4,
      lineHeight: '2.5rem'
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
    },
    wrapLogo: {
      alignSelf: 'flex-start',
      marginLeft: -theme.spacing(3)
    },
    wrapAppName: {
      maxWidth: 'fit-content',
      minWidth: 170
    }
  });

interface Props {
  stackscriptID: string;
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const AppDetailDrawer: React.FunctionComponent<CombinedProps> = props => {
  const { classes, stackscriptID, open, onClose } = props;
  const app = oneClickApps.find(eachApp => {
    const cleanedAppName = eachApp.name.replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      '\\$&'
    );
    const strippedAppName = cleanedAppName.replace('&reg;', '');
    const regex = new RegExp(strippedAppName);
    return Boolean(stackscriptID.match(regex));
  }); // This is horrible
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
        <Grid
          item
          className={`${classes.logo} ${
            app.name.length > 20 ? classes.wrapLogo : ''
          }`}
        >
          <img
            className={classes.image}
            src={`${APP_ROOT}/${app.logo_url}`}
            alt={`${app.name} logo`}
          />
        </Grid>
        <Grid item>
          <Typography
            variant="h2"
            className={`${classes.appName} ${
              app.name.length > 20 ? classes.wrapAppName : ''
            }`}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(app.name) }}
          />
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
          <Typography
            variant="body1"
            className={classes.description}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(app.description) }}
          />
        </Grid>
        {app.related_info && (
          <LinkSection title="More info" links={app.related_info} icon={Link} />
        )}
        {app.related_guides && (
          <LinkSection
            title="Guides"
            links={app.related_guides}
            icon={LibraryBook}
          />
        )}
        {app.tips && <TipSection title="Tips" tips={app.tips} icon={Info} />}
      </Grid>
    </Drawer>
  );
};

const styled = withStyles(styles);

export default styled(AppDetailDrawer);
