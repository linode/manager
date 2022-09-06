import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import { sanitizeHTML } from 'src/utilities/sanitize-html';
import { oneClickApps } from './FakeSpec';
import Close from '@material-ui/icons/Close';
import Button from 'src/components/Button/Button';
import Box from 'src/components/core/Box';
import Drawer from 'src/components/core/Drawer';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import useFlags from 'src/hooks/useFlags';

const useStyles = makeStyles((theme: Theme) => ({
  logoContainer: {
    height: 225,
    padding: theme.spacing(2),
    gap: theme.spacing(),
  },
  appName: {
    fontSize: '2.2rem',
    fontFamily: theme.font.bold,
    color: '#fff !important',
    lineHeight: '2.5rem',
    textAlign: 'center',
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
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(4),
  },
  paper: {
    width: 300,
    [theme.breakpoints.up('sm')]: {
      width: 480,
    },
  },
  link: {
    fontSize: '0.875rem',
    wordBreak: 'break-word',
    lineHeight: '24px',
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
    backgroundImage: `url(/assets/marketplace-background.png),linear-gradient(to right, #${app?.colors.start}, #${app?.colors.end})`,
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
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
            className={classes.logoContainer}
            style={gradient}
          >
            <img
              className={classes.image}
              src={`/assets/white/${app.logo_url}`}
              alt={`${app.name} logo`}
            />
            <Typography
              variant="h2"
              className={classes.appName}
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(app.name) }}
            />
          </Box>
          <Box className={classes.container}>
            <Box>
              <Typography variant="h3">{app.summary}</Typography>
              <Typography
                variant="body1"
                className={classes.description}
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(app.description),
                }}
              />
            </Box>
            {app.website ? (
              <Box>
                <Typography variant="h3">Website</Typography>
                <ExternalLink
                  className={classes.link}
                  link={app.website}
                  text={app.website}
                  hideIcon
                />
              </Box>
            ) : null}
            {app.related_guides ? (
              <Box>
                <Typography variant="h3">Guides</Typography>
                <Box display="flex" flexDirection="column" style={{ gap: 6 }}>
                  {(
                    oneClickAppsDocsOverride?.[app.name] ?? app.related_guides
                  ).map((link, idx) => (
                    <ExternalLink
                      className={classes.link}
                      key={`${app.name}-guide-${idx}`}
                      text={link.title}
                      link={link.href}
                      hideIcon
                    />
                  ))}
                </Box>
              </Box>
            ) : null}
            {app.tips ? (
              <Box>
                <Typography variant="h3">Tips</Typography>
                <Box display="flex" flexDirection="column" style={{ gap: 6 }}>
                  {app.tips.map((tip, idx) => (
                    <Typography variant="body1" key={`${app.name}-tip-${idx}`}>
                      {tip}
                    </Typography>
                  ))}
                </Box>
              </Box>
            ) : null}
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
