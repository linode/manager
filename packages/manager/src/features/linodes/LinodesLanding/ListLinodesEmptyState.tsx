import * as React from 'react';
import { useHistory } from 'react-router-dom';
import LinodeSvg from 'src/assets/icons/entityIcons/linode.svg';
import Typography from 'src/components/core/Typography';
import Placeholder from 'src/components/Placeholder';
import DocsIcon from 'src/assets/icons/docs.svg';
import MarketplaceIcon from 'src/assets/icons/marketplace.svg';
import YoutubeIcon from 'src/assets/icons/youtube.svg';
import PointerIcon from 'src/assets/icons/pointer.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Link from 'src/components/Link';
import Divider from 'src/components/core/Divider';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';
import ExternalLink from 'src/components/ExternalLink';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(),
  },
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    columnGap: `${theme.spacing(6)}px`,
    gridAutoFlow: 'row',
    width: '85%',
    marginTop: theme.spacing(10),
    alignItems: 'start',
    [theme.breakpoints.down('sm')]: {
      marginTop: `calc(${theme.spacing(10)}px - 66px)`,
      marginLeft: theme.spacing(5),
      marginRight: theme.spacing(4),
    },
  },
  section: {
    [theme.breakpoints.down('sm')]: {
      gridColumn: 'span 3',
      marginBottom: 66,
    },
    gridColumn: 'span 1',
    '& li': {
      paddingLeft: 0,
    },
    '& ul': {
      marginTop: theme.spacing(2),
    },
  },
  appSection: {
    display: 'grid',
    gridTemplateColumns: `repeat(2, ${theme.spacing(17.125)}px)`,
    columnGap: `${theme.spacing()}px`,
    rowGap: `${theme.spacing()}px`,
    gridAutoFlow: 'row',
    marginTop: theme.spacing(2),
  },
  appLink: {
    display: 'flex',
    alignItems: 'center',
    gridColumn: 'span 1',
    height: theme.spacing(4.25),
    maxWidth: theme.spacing(17.125),
    paddingLeft: theme.spacing(),
    justifyContent: 'space-between',
    backgroundColor: theme.bg.offWhite,
    fontSize: '1.125rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.color.border3}`,
    '&:hover': {
      textDecoration: 'none',
    },
    '&:focus': {
      textDecoration: 'none',
    },
  },
  appLinkIcon: {
    display: 'flex',
    height: '100%',
    aspectRatio: '1 / 1',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeft: `1px solid ${theme.color.border3}`,
  },
  dividerWrapper: {
    gridColumn: 'span 3',
  },
  moreLink: {
    marginTop: 25,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
  },
}));

export const ListLinodesEmptyState: React.FC<{}> = (_) => {
  const { push } = useHistory();

  const classes = useStyles();

  return (
    <Placeholder
      title={'Linodes'}
      subtitle="Cloud-based virtual machines"
      icon={LinodeSvg}
      isEntity
      buttonProps={[
        {
          onClick: () => {
            push('/linodes/create');
          },
          children: 'Create Linode',
        },
      ]}
      linksSection={
        <>
          <div className={classes.container}>
            <div className={classes.dividerWrapper}>
              <Divider spacingBottom={40} />
            </div>
            <div className={classes.section}>
              <DocsIcon className={classes.icon} />
              <Typography display="inline" variant="h2">
                Getting Started Guides
              </Typography>
              <List>
                <ListItem>
                  <Link to="https://www.linode.com/docs/guides/creating-a-compute-instance/">
                    Create a Compute Instance
                  </Link>
                </ListItem>
                <ListItem>
                  <Link to="">
                    Getting Started With Linode Compute Instances
                  </Link>
                </ListItem>
                <ListItem>
                  <Link to="">Understanding Billing and Payments</Link>
                </ListItem>
                <ListItem>
                  <Link to="">Hosting a Website or Application on Linode</Link>
                </ListItem>
              </List>
              <ListItem className={classes.moreLink}>
                <Link to="">
                  Check out all our Docs <PointerIcon />
                </Link>
              </ListItem>
            </div>
            <div className={classes.section}>
              <MarketplaceIcon className={classes.icon} />
              <Typography display="inline" variant="h2">
                Deploy an App
              </Typography>
              <div className={classes.appSection}>
                <Link
                  to="https://cloud.linode.com/linodes/create?type=One-Click&appID=401697&utm_source=marketplace&utm_medium=website&utm_campaign=WordPress"
                  className={classes.appLink}
                >
                  Wordpress
                  <div className={classes.appLinkIcon}>
                    <PointerIcon />
                  </div>
                </Link>
                <Link
                  to="https://cloud.linode.com/linodes/create?type=One-Click&appID=869129&utm_source=marketplace&utm_medium=website&utm_campaign=aaPanel"
                  className={classes.appLink}
                >
                  aaPanel
                  <div className={classes.appLinkIcon}>
                    <PointerIcon />
                  </div>
                </Link>
                <Link
                  to="https://cloud.linode.com/linodes/create?type=One-Click&appID=595742&utm_source=marketplace&utm_medium=website&utm_campaign=cPanel"
                  className={classes.appLink}
                >
                  cPanel
                  <div className={classes.appLinkIcon}>
                    <PointerIcon />
                  </div>
                </Link>
                <Link
                  to="https://cloud.linode.com/linodes/create?type=One-Click&appID=691621&utm_source=marketplace&utm_medium=website&utm_campaign=Cloudron"
                  className={classes.appLink}
                >
                  Cloudron
                  <div className={classes.appLinkIcon}>
                    <PointerIcon />
                  </div>
                </Link>
                <Link
                  to="https://cloud.linode.com/linodes/create?type=One-Click&appID=593835&utm_source=marketplace&utm_medium=website&utm_campaign=Plesk"
                  className={classes.appLink}
                >
                  Plesk
                  <div className={classes.appLinkIcon}>
                    <PointerIcon />
                  </div>
                </Link>
                <Link
                  to="https://cloud.linode.com/linodes/create?type=One-Click&appID=985372&utm_source=marketplace&utm_medium=website&utm_campaign=Joomla"
                  className={classes.appLink}
                >
                  Joomla
                  <div className={classes.appLinkIcon}>
                    <PointerIcon />
                  </div>
                </Link>
              </div>
              <div className={classes.moreLink}>
                <Link to="">
                  See all Marketplace Apps <PointerIcon />
                </Link>
              </div>
            </div>
            <div className={classes.section}>
              <YoutubeIcon className={classes.icon} />
              <Typography display="inline" variant="h2">
                Getting Started Playlist
              </Typography>
              <List>
                <ListItem>
                  <ExternalLink
                    fixedIcon
                    link=""
                    text="Linode Getting Started Guide"
                  />
                </ListItem>
                <ListItem>
                  <ExternalLink
                    fixedIcon
                    link=""
                    text="Common Linux Commands"
                  />
                </ListItem>
                <ListItem>
                  <ExternalLink
                    fixedIcon
                    link=""
                    text="Copying files to a Compute Instance"
                  />
                </ListItem>
                <ListItem>
                  <ExternalLink fixedIcon link="" text="How to use SSH" />
                </ListItem>
                <ListItem className={classes.moreLink}>
                  <ExternalLink
                    fixedIcon
                    link=""
                    text="Check out all our Docs"
                  />
                </ListItem>
              </List>
            </div>
          </div>
        </>
      }
    >
      <Typography
        style={{ fontSize: '1.125rem', lineHeight: '1.75rem', maxWidth: 541 }}
      >
        Host your websites, applications, or any other Cloud-based workloads on
        a scalable and reliable platform.
      </Typography>
    </Placeholder>
  );
};

export default React.memo(ListLinodesEmptyState);
