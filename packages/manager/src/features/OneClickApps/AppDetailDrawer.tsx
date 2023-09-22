import Close from '@mui/icons-material/Close';
import Drawer from '@mui/material/Drawer';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { sanitizeHTML } from 'src/utilities/sanitize-html';

import { oneClickApps } from './oneClickApps';
import { mapStackScriptLabelToOCA } from './utils';

import type { OCA } from './types';

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
  onClose: () => void;
  open: boolean;
  stackScriptLabel: string;
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
    const app = mapStackScriptLabelToOCA({
      oneClickApps,
      stackScriptLabel,
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
      anchor="right"
      classes={{ paper: classes.paper }}
      data-qa-drawer
      data-testid="drawer"
      disablePortal
      onClose={onClose}
      open={open}
    >
      <Box display="flex" justifyContent="flex-end">
        <Button
          aria-label="Close drawer"
          className={classes.button}
          onClick={onClose}
        >
          <Close />
        </Button>
      </Box>
      {selectedApp ? (
        <>
          <Box
            alignItems="center"
            className={classes.logoContainer}
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            style={gradient}
          >
            <img
              src={`/assets/white/${
                REUSE_WHITE_ICONS[selectedApp?.logo_url] ||
                selectedApp?.logo_url
              }`}
              alt={`${selectedApp.name} logo`}
              className={classes.image}
            />
            <Typography
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML(selectedApp.name),
              }}
              className={classes.appName}
              data-qa-drawer-title={stackScriptLabel}
              data-testid="app-name"
              variant="h2"
            />
          </Box>
          <Box className={classes.container}>
            <Box>
              <Typography variant="h3">{selectedApp.summary}</Typography>
              <Typography
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(selectedApp.description),
                }}
                className={classes.description}
                variant="body1"
              />
            </Box>
            {selectedApp.website ? (
              <Box>
                <Typography variant="h3">Website</Typography>
                <Link
                  className={classes.link}
                  external
                  to={selectedApp.website}
                >
                  {selectedApp.website}
                </Link>
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
                    <Link
                      className={classes.link}
                      key={`${selectedApp.name}-guide-${idx}`}
                      to={link.href}
                    >
                      {sanitizeHTML(link.title)}
                    </Link>
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
                      key={`${selectedApp.name}-tip-${idx}`}
                      variant="body1"
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
          alignItems="center"
          display="flex"
          flexDirection="column"
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
