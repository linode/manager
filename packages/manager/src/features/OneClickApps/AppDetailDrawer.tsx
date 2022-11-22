import Close from '@material-ui/icons/Close';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import Button from 'src/components/Button/Button';
import Box from 'src/components/core/Box';
import Drawer from 'src/components/core/Drawer';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import { OCA } from 'src/features/OneClickApps/FakeSpec';
import useFlags from 'src/hooks/useFlags';
import { sanitizeHTML } from 'src/utilities/sanitize-html';
import { oneClickApps } from './FakeSpec';

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

  const [selectedApp, setSelectedApp] = React.useState<OCA | null>(null);

  const labelIndicatesCluster = /.+\s(Cluster)/.test(stackScriptLabel);

  /*
    Since we use the label to search within the OCA array and clusters use
    the app info from their individual app counterparts, we need to extract
    the base StackScript label out to be able to search the array successfully.
  */
  const baseStackScriptLabel = stackScriptLabel.replace(' Cluster', '');

  const gradient = {
    backgroundImage: `url(/assets/marketplace-background.png),linear-gradient(to right, #${selectedApp?.colors.start}, #${selectedApp?.colors.end})`,
  };

  React.useEffect(() => {
    const app = oneClickApps.find((app) => {
      const cleanedStackScriptLabel = stackScriptLabel
        .replace(/[^\w\s\/$*+-?&.:()]/gi, '')
        .trim();

      const cleanedBaseStackScriptLabel = baseStackScriptLabel
        .replace(/[^\w\s\/$*+-?&.:()]/gi, '')
        .trim();

      const cleanedAppName = app.name.replace('&reg;', '');

      /* This logic is to capture two cases:
          1) the matching app name does not contain " Cluster " (e.g., MongoDB)
          2) the matching app name does contain " Cluster " (e.g., Galera Cluster)
      */
      return (
        cleanedStackScriptLabel === cleanedAppName ||
        cleanedBaseStackScriptLabel === cleanedAppName
      );
    });

    if (!app) {
      return;
    }

    const appCopy = cloneDeep(app);

    if (labelIndicatesCluster) {
      appCopy.name += ' Cluster';
      // eslint-disable-next-line no-unused-expressions
      appCopy.related_guides?.push(
        {
          title: 'Learn about database clusters',
          href: 'https://www.linode.com/docs/guides', // temporary placeholder
        },
        {
          title: 'Set up Linode API token',
          href: 'https://www.linode.com/docs/guides', // temporary placeholder
        }
      );
    }

    setSelectedApp(appCopy);

    return () => {
      setSelectedApp(null);
    };
  }, [baseStackScriptLabel, labelIndicatesCluster, stackScriptLabel]);

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
              src={`/assets/white/${selectedApp.logo_url}`}
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
