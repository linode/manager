import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { sanitizeHTML } from 'src/utilities/sanitize-html';
import { oneClickApps } from './oneClickApps';
import Close from '@mui/icons-material/Close';
import Button from 'src/components/Button/Button';
import Box from 'src/components/core/Box';
import Drawer from 'src/components/core/Drawer';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import { OCA } from 'src/features/OneClickApps/oneClickApps';
import useFlags from 'src/hooks/useFlags';

const useStyles = makeStyles((theme: Theme) => ({
  appName: {
    color: '#fff !important',
    fontFamily: theme.font.bold,
    fontSize: '2.2rem',
    lineHeight: '2.5rem',
    textAlign: 'center',
  },
  button: {
    '& :hover, & :focus, & :active': {
      backgroundColor: 'unset !important',
      color: 'white',
    },
    backgroundColor: 'unset !important',
    borderRadius: '50%',
    color: 'white',
    margin: theme.spacing(2),
    minHeight: 'auto',
    minWidth: 'auto',
    padding: theme.spacing(2),
    position: 'absolute',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(4),
  },
  description: {
    lineHeight: 1.5,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  image: {
    width: 50,
  },
  link: {
    fontSize: '0.875rem',
    lineHeight: '24px',
    wordBreak: 'break-word',
  },
  logoContainer: {
    gap: theme.spacing(),
    height: 225,
    padding: theme.spacing(2),
  },
  paper: {
    [theme.breakpoints.up('sm')]: {
      width: 480,
    },
    width: 300,
  },
  wrapAppName: {
    maxWidth: 'fit-content',
    minWidth: 170,
  },
  wrapLogo: {
    marginLeft: `-${theme.spacing(3)}`,
  },
}));

interface Props {
  stackScriptLabel: string;
  open: boolean;
  onClose: () => void;
}

export const AppDetailDrawer: React.FunctionComponent<Props> = (props) => {
  const { onClose, open, stackScriptLabel } = props;
  const classes = useStyles();
  const { oneClickAppsDocsOverride } = useFlags();

  const [selectedApp, setSelectedApp] = React.useState<OCA | null>(null);

  const gradient = {
    backgroundImage: `url(/assets/marketplace-background.png),linear-gradient(to right, #${selectedApp?.colors.start}, #${selectedApp?.colors.end})`,
  };

  React.useEffect(() => {
    const app = oneClickApps.find((app) => {
      const cleanedStackScriptLabel = stackScriptLabel
        .replace(/[^\w\s\/$*+-?&.:()]/gi, '')
        .trim();

      const cleanedAppName = app.name.replace('&reg;', '');

      return cleanedStackScriptLabel === cleanedAppName;
    });

    if (!app) {
      return;
    }

    setSelectedApp(app);

    return () => {
      setSelectedApp(null);
    };
  }, [stackScriptLabel]);

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
      {selectedApp ? (
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
              src={`/assets/white/${
                REUSE_WHITE_ICONS[selectedApp?.logo_url] ||
                selectedApp?.logo_url
              }`}
              alt={`${selectedApp.name} logo`}
            />
            <Typography
              variant="h2"
              className={classes.appName}
              data-testid="app-name"
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML(selectedApp.name),
              }}
            />
          </Box>
          <Box className={classes.container}>
            <Box>
              <Typography variant="h3">{selectedApp.summary}</Typography>
              <Typography
                variant="body1"
                className={classes.description}
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(selectedApp.description),
                }}
              />
            </Box>
            {selectedApp.website ? (
              <Box>
                <Typography variant="h3">Website</Typography>
                <ExternalLink
                  className={classes.link}
                  link={selectedApp.website}
                  text={selectedApp.website}
                  hideIcon
                />
              </Box>
            ) : null}
            {selectedApp.related_guides ? (
              <Box>
                <Typography variant="h3">Guides</Typography>
                <Box display="flex" flexDirection="column" style={{ gap: 6 }}>
                  {(
                    oneClickAppsDocsOverride?.[selectedApp.name] ??
                    selectedApp.related_guides
                  ).map((link, idx) => (
                    <ExternalLink
                      className={classes.link}
                      key={`${selectedApp.name}-guide-${idx}`}
                      text={link.title}
                      link={link.href}
                      hideIcon
                    />
                  ))}
                </Box>
              </Box>
            ) : null}
            {selectedApp.tips ? (
              <Box>
                <Typography variant="h3">Tips</Typography>
                <Box display="flex" flexDirection="column" style={{ gap: 6 }}>
                  {selectedApp.tips.map((tip, idx) => (
                    <Typography
                      variant="body1"
                      key={`${selectedApp.name}-tip-${idx}`}
                    >
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
          style={{ gap: 10, height: '100%' }}
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

// remove this when we make the svgs white via css
const REUSE_WHITE_ICONS = {
  'mongodbmarketplaceocc.svg': 'mongodb.svg',
  'postgresqlmarketplaceocc.svg': 'postgresql.svg',
  'redissentinelmarketplaceocc.svg': 'redis.svg',
};

export default AppDetailDrawer;
