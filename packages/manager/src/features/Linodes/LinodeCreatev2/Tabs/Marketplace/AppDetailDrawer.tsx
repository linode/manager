import Close from '@mui/icons-material/Close';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { oneClickApps } from 'src/features/OneClickApps/oneClickAppsv2';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

const useStyles = makeStyles()((theme: Theme) => ({
  appName: {
    color: '#fff !important',
    fontFamily: theme.font.bold,
    fontSize: '2.2rem',
    lineHeight: '2.5rem',
    textAlign: 'center',
  },
  button: {
    color: 'white !important',
    margin: theme.spacing(2),
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
}));

interface Props {
  onClose: () => void;
  open: boolean;
  stackScriptId: number | undefined;
}

export const AppDetailDrawerv2 = (props: Props) => {
  const { onClose, open, stackScriptId } = props;
  const { classes } = useStyles();

  const selectedApp = stackScriptId ? oneClickApps[stackScriptId] : null;

  const gradient = {
    backgroundImage: `url(/assets/marketplace-background.png),linear-gradient(to right, #${selectedApp?.colors.start}, #${selectedApp?.colors.end})`,
  };

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
        <IconButton
          aria-label="Close drawer"
          className={classes.button}
          data-qa-close-drawer
          onClick={onClose}
        >
          <Close />
        </IconButton>
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
                __html: sanitizeHTML({
                  sanitizingTier: 'flexible',
                  text: selectedApp.name,
                }),
              }}
              className={classes.appName}
              data-testid="app-name"
              variant="h2"
            />
          </Box>
          <Box className={classes.container}>
            <Box>
              <Typography variant="h3">{selectedApp.summary}</Typography>
              <Typography
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML({
                    sanitizingTier: 'flexible',
                    text: selectedApp.description,
                  }),
                }}
                className={classes.description}
                variant="body1"
              />
            </Box>
            {selectedApp.website && (
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
            )}
            {selectedApp.related_guides && (
              <Box>
                <Typography variant="h3">Guides</Typography>
                <Box display="flex" flexDirection="column" style={{ gap: 6 }}>
                  {selectedApp.related_guides.map((link, idx) => (
                    <Link
                      className={classes.link}
                      key={`${selectedApp.name}-guide-${idx}`}
                      to={link.href}
                    >
                      {sanitizeHTML({
                        sanitizingTier: 'flexible',
                        text: link.title,
                      })}
                    </Link>
                  ))}
                </Box>
              </Box>
            )}
            {selectedApp.tips && (
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
            )}
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
