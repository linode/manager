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

import { getOneClickApps, OneClickApp } from 'linode-js-sdk/lib/one-click-apps';

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
interface State {
  apps: OneClickApp[];
}

type CombinedProps = Props & WithStyles<ClassNames>;
class AppDetailDrawer extends React.PureComponent<
  CombinedProps,
  State
>{
  constructor(props: CombinedProps) {
    super(props)
    this.state = {
      apps: []
    }
  }

  componentDidMount(){
    getOneClickApps().then(response => {
      this.setState({ apps: response.data });
    })
  }

  render() {
    const { classes, stackscriptID, open, onClose } = this.props;
    
    const app = this.state.apps.find((eachApp: { label: string; }) => 
      Boolean(stackscriptID.match(eachApp.label))
    );
    if(!app) {
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
                src={`${APP_ROOT}/${app.color_logo_url}`}
                alt={`${app.label} logo`}
              />
          </Grid>
          <Grid item>
            <Typography variant="h2" className={classes.appName}>
              {app.label}
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
            <Typography
            variant="body1"
            className={classes.description}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(app.description) }}
            />
          </Grid>
          {app.related_info.length > 0 && (
            <LinkSection
              title="More info"
              links={app.related_info}
              icon={Link}
            />
          )}
          {app.related_guides.length > 0 && (
            <LinkSection
              title="Guides"
              links={app.related_guides}
              icon={LibraryBook}
            />
          )}
          {app.tips.length > 0 && (
            <TipSection
            title="Tips"
            tips={app.tips}
            icon={Info}
            />
          )}
        </Grid>
      </Drawer>
    );
  }
}

const styled = withStyles(styles);

export default styled(AppDetailDrawer);
