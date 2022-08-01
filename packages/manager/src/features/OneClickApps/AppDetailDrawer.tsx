import Close from '@material-ui/icons/Close';
import classNames from 'classnames';
import * as React from 'react';
import Accordion from 'src/components/Accordion';
import Button from 'src/components/Button/Button';
import Box from 'src/components/core/Box';
import Drawer from 'src/components/core/Drawer';
import Grid from 'src/components/core/Grid';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import { APP_ROOT } from 'src/constants';
import useFlags from 'src/hooks/useFlags';
import { sanitizeHTML } from 'src/utilities/sanitize-html';
import { oneClickApps } from './FakeSpec';

const useStyles = makeStyles((theme: Theme) => ({
  logo: {
    marginRight: theme.spacing(1),
  },
  logoContainer: {
    height: 225,
  },
  appName: {
    fontSize: '2.2rem',
    fontFamily: theme.font.bold,
    color: '#fff !important',
    lineHeight: '2.5rem',
  },
  description: {
    lineHeight: 1.5,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  image: {
    width: 50,
  },
  wrapLogo: {
    marginLeft: -theme.spacing(3),
  },
  wrapAppName: {
    maxWidth: 'fit-content',
    minWidth: 170,
  },
  container: {
    padding: theme.spacing(4),
  },
  paper: {
    width: 300,
    [theme.breakpoints.up('sm')]: {
      width: 480,
    },
  },
  website: {
    fontSize: '0.875rem',
  },
  accordion: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    borderTop: `1px solid ${theme.borderColors.divider}`,
  },
  button: {
    position: 'absolute',
    minWidth: 'auto',
    minHeight: 'auto',
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    color: 'white',
    borderRadius: '50%',
    backgroundColor: 'unset !important',
    '& :hover, & :focus, & :active': {
      color: 'white',
      backgroundColor: 'unset !important',
    },
  },
}));

interface Props {
  stackScriptLabel: string;
  open: boolean;
  onClose: () => void;
}

export const AppDetailDrawer: React.FunctionComponent<Props> = (props) => {
  const { stackScriptLabel, open, onClose } = props;
  const classes = useStyles();
  const { oneClickAppsDocsOverride } = useFlags();

  const app = oneClickApps.find((app) => {
    const cleanedStackScriptLabel = stackScriptLabel
      .replace(/[^\w\s\/$*+-?&.:()]/gi, '')
      .trim();
    const cleanedAppName = app.name.replace('&reg;', '');
    return cleanedStackScriptLabel === cleanedAppName;
  });

  const gradient = {
    backgroundImage: `url(https://www.linode.com/wp-content/themes/linode-website-theme/images/Triangles-Background--Dark--Desktop.png),linear-gradient(to right, #${app?.colors.start}, #${app?.colors.end})`,
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      classes={{ paper: classes.paper }}
    >
      <Box display="flex" justifyContent="flex-end">
        <Button
          className={classes.button}
          onClick={onClose}
          aria-label="Close drawer"
        >
          <Close />
        </Button>
      </Box>
      {app ? (
        <>
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
            className={classes.logoContainer}
            style={gradient}
          >
            <Grid
              item
              className={classNames(classes.logo, {
                [classes.wrapLogo]: app.name.length > 20,
              })}
            >
              <img
                className={classes.image}
                src={`${APP_ROOT}/assets/white/${app.logo_url}`}
                alt={`${app.name} logo`}
              />
            </Grid>
            <Grid item>
              <Typography
                variant="h2"
                className={classNames(classes.appName, {
                  [classes.wrapAppName]: app.name.length > 20,
                })}
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(app.name) }}
              />
            </Grid>
          </Grid>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            height="calc(100% - 225px)"
          >
            <div className={classes.container}>
              <Typography variant="h3">{app.summary}</Typography>
              <Typography
                variant="body1"
                className={classes.description}
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(app.description),
                }}
              />
              {app.website && (
                <>
                  <Typography variant="h3">Website</Typography>
                  <ExternalLink
                    className={classes.website}
                    link={app.website}
                    text={app.website}
                    hideIcon
                  />
                </>
              )}
            </div>
            <div>
              {app.related_guides && (
                <Accordion className={classes.accordion} heading="Guides">
                  <ul>
                    {(
                      oneClickAppsDocsOverride?.[app.name] ?? app.related_guides
                    ).map((link) => (
                      <li key={link.href}>
                        <ExternalLink text={link.title} link={link.href} />
                      </li>
                    ))}
                  </ul>
                </Accordion>
              )}
              {app.tips && (
                <Accordion className={classes.accordion} heading="Tips">
                  <ul>
                    {app.tips.map((tip, idx) => (
                      <li key={`${app.name}-tip-${idx}`}>{tip} </li>
                    ))}
                  </ul>
                </Accordion>
              )}
            </div>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          style={{ height: '100%', gap: 10 }}
        >
          <Typography variant="h2">App Details Not Found</Typography>
          <Typography>
            We were unable to load the details of this app.
          </Typography>
          <Button buttonType="primary" onClick={onClose}>
            Exit
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default AppDetailDrawer;
