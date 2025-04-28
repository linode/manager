import { Box, Button, CloseIcon, Typography } from '@linode/ui';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import { getMarketplaceAppLabel, useMarketplaceApps } from './utilities';

import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  appName: {
    color: `${theme.tokens.color.Neutrals.White} !important`,
    font: theme.font.bold,
    fontSize: '2.2rem',
    lineHeight: '2.5rem',
    textAlign: 'center',
  },
  button: {
    color: `${theme.tokens.color.Neutrals.White} !important`,
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

export const AppDetailDrawer = (props: Props) => {
  const { onClose, open, stackScriptId } = props;
  const { classes } = useStyles();
  const { apps } = useMarketplaceApps();

  const selectedApp = apps.find((app) => app.stackscript.id === stackScriptId);
  const displayLabel = selectedApp
    ? getMarketplaceAppLabel(selectedApp?.stackscript.label)
    : '';

  const gradient = {
    backgroundImage: `url(/assets/marketplace-background.png),linear-gradient(to right, #${selectedApp?.details?.colors.start}, #${selectedApp?.details?.colors.end})`,
  };

  return (
    <Drawer
      anchor="right"
      classes={{ paper: classes.paper }}
      data-qa-drawer
      data-testid="drawer"
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
          <CloseIcon />
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
              alt={`${displayLabel} logo`}
              className={classes.image}
              src={`/assets/white/${selectedApp?.details?.logo_url}`}
            />
            <Typography
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML({
                  sanitizingTier: 'flexible',
                  text: displayLabel,
                }),
              }}
              className={classes.appName}
              data-qa-drawer-title={displayLabel}
              data-testid="app-name"
              variant="h2"
            />
          </Box>
          <Box className={classes.container}>
            <Box>
              <Typography variant="h3">
                {selectedApp?.details.summary}
              </Typography>
              <Typography
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML({
                    sanitizingTier: 'flexible',
                    text: selectedApp?.details?.description,
                  }),
                }}
                className={classes.description}
                variant="body1"
              />
            </Box>
            {selectedApp?.details.website && (
              <Box>
                <Typography variant="h3">Website</Typography>
                <Link
                  className={classes.link}
                  external
                  to={selectedApp?.details.website}
                >
                  {selectedApp?.details.website}
                </Link>
              </Box>
            )}
            {selectedApp?.details.related_guides && (
              <Box>
                <Typography variant="h3">Guides</Typography>
                <Box display="flex" flexDirection="column" style={{ gap: 6 }}>
                  {selectedApp?.details.related_guides.map((link, idx) => (
                    <Link
                      className={classes.link}
                      key={`${displayLabel}-guide-${idx}`}
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
            {selectedApp?.details.tips && (
              <Box>
                <Typography variant="h3">Tips</Typography>
                <Box display="flex" flexDirection="column" style={{ gap: 6 }}>
                  {selectedApp?.details.tips.map((tip, idx) => (
                    <Typography
                      key={`${displayLabel}-tip-${idx}`}
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
