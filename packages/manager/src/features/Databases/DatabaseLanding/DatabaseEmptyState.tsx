import * as React from 'react';
import { useHistory } from 'react-router-dom';
import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';
import ProductInformationBanner from 'src/components/ProductInformationBanner';
import useFlags from 'src/hooks/useFlags';
import { sendEvent } from 'src/utilities/ga';
import LinksSection from 'src/features/linodes/LinodesLanding/LinksSection';
import LinkSubSection from 'src/features/linodes/LinodesLanding/LinksSubSection';
import DocsIcon from 'src/assets/icons/docs.svg';
import ExternalLinkIcon from 'src/assets/icons/external-link.svg';
import YoutubeIcon from 'src/assets/icons/youtube.svg';
import PointerIcon from 'src/assets/icons/pointer.svg';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';

const useStyles = makeStyles(() => ({
  root: {
    '& > svg': {
      transform: 'scale(0.8)',
    },
  },
  entityDescription: {
    marginBottom: '1rem',
  },
}));

const DatabaseEmptyState: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const flags = useFlags();

  const gaCategory = 'Managed Databases landing page empty';

  const linkGAEventTemplate = {
    category: gaCategory,
    action: 'Click:link',
  };

  const onLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    const label = event.currentTarget.textContent ?? '';
    sendEvent({ ...linkGAEventTemplate, label: label });
  };

  return (
    <>
      {flags.databaseBeta ? (
        <DismissibleBanner
          preferenceKey="dbaas-open-beta-notice"
          productInformationIndicator
        >
          <Typography>
            Managed Database for MySQL is available in a free, open beta period
            until May 2nd, 2022. This is a beta environment and should not be
            used to support production workloads. Review the{' '}
            <Link to="https://www.linode.com/legal-eatp">
              Early Adopter Program SLA
            </Link>
            .
          </Typography>
        </DismissibleBanner>
      ) : null}
      <ProductInformationBanner
        bannerLocation="Databases"
        productInformationIndicator={false}
        productInformationWarning
      />
      <Placeholder
        title="Databases"
        subtitle="Fully managed cloud database clusters"
        className={classes.root}
        icon={DatabaseIcon}
        isEntity
        buttonProps={[
          {
            onClick: () => {
              sendEvent({
                category: gaCategory,
                action: 'Click:button',
                label: 'Create Database Cluster',
              });
              history.push('/databases/create');
            },
            children: 'Create Database Cluster',
          },
        ]}
        linksSection={
          <LinksSection>
            <LinkSubSection
              title="Getting Started Guides"
              icon={<DocsIcon />}
              moreLink={
                <Link onClick={onLinkClick} to="">
                  Check out all our Docs
                  <PointerIcon />
                </Link>
              }
            >
              <List>
                <ListItem>
                  <Link
                    onClick={onLinkClick}
                    to="https://www.linode.com/docs/products/databases/managed-databases/"
                  >
                    Overview of Managed Databases
                  </Link>
                </ListItem>
                <ListItem>
                  <Link
                    onClick={onLinkClick}
                    to="https://www.linode.com/docs/products/databases/managed-databases/get-started/"
                  >
                    Get Started with Managed Databases
                  </Link>
                </ListItem>
                <ListItem>
                  <Link
                    onClick={onLinkClick}
                    to="https://www.linode.com/docs/products/databases/managed-databases/guides/database-engines/"
                  >
                    Choosing a Database Engine
                  </Link>
                </ListItem>
              </List>
            </LinkSubSection>
            <LinkSubSection
              title="Getting Started Playlist"
              icon={<YoutubeIcon />}
              moreLink={
                <Link
                  onClick={onLinkClick}
                  to="https://www.youtube.com/playlist?list=PLTnRtjQN5ieb4XyvC9OUhp7nxzBENgCxJ"
                >
                  View the complete playlist
                  <ExternalLinkIcon style={{ marginLeft: 8 }} />
                </Link>
              }
            >
              <List>
                <ListItem>
                  <Link
                    onClick={onLinkClick}
                    to="https://www.youtube.com/watch?v=loEVtzUN2i8"
                  >
                    Linode Managed Databases Overview
                    <ExternalLinkIcon style={{ marginLeft: 8 }} />
                  </Link>
                </ListItem>
                <ListItem>
                  <Link
                    onClick={onLinkClick}
                    to="https://www.youtube.com/watch?v=dnV-6TtfYfY"
                  >
                    How to Choose the Right Database for Your Application
                    <ExternalLinkIcon style={{ marginLeft: 8 }} />
                  </Link>
                </ListItem>
                <ListItem>
                  <Link
                    onClick={onLinkClick}
                    to="https://www.youtube.com/playlist?list=PLTnRtjQN5ieZl3kM_jqfnK98uqYeXbfmC"
                  >
                    MySQL Beginner Series
                    <ExternalLinkIcon style={{ marginLeft: 8 }} />
                  </Link>
                </ListItem>
              </List>
            </LinkSubSection>
          </LinksSection>
        }
      >
        <Typography variant="subtitle1">
          <div className={classes.entityDescription}>
            Deploy popular database engines such as MySQL and PostgreSQL using
            Linode's performant, reliable, and fully managed database solution.
          </div>
        </Typography>
      </Placeholder>
    </>
  );
};

export default React.memo(DatabaseEmptyState);
