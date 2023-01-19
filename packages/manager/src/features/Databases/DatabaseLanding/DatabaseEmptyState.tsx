import * as React from 'react';
import { useHistory } from 'react-router-dom';
import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';
import ProductInformationBanner from 'src/components/ProductInformationBanner';
import { sendEvent } from 'src/utilities/ga';
import LinksSection from 'src/features/linodes/LinodesLanding/LinksSection';
import LinkSubSection from 'src/features/linodes/LinodesLanding/LinksSubSection';
import DocsIcon from 'src/assets/icons/docs.svg';
import ExternalLinkIcon from 'src/assets/icons/external-link.svg';
import YoutubeIcon from 'src/assets/icons/youtube.svg';
import PointerIcon from 'src/assets/icons/pointer.svg';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';

const guidesLinkData = [
  {
    to: 'https://www.linode.com/docs/products/databases/managed-databases/',
    text: 'Overview of Managed Databases',
  },
  {
    to:
      'https://www.linode.com/docs/products/databases/managed-databases/get-started/',
    text: 'Get Started with Managed Databases',
  },
  {
    to:
      'https://www.linode.com/docs/products/databases/managed-databases/guides/database-engines/',
    text: 'Choosing a Database Engine',
  },
];

const youtubeLinkData = [
  {
    to: 'https://www.youtube.com/watch?v=loEVtzUN2i8',
    text: 'Linode Managed Databases Overview',
  },
  {
    to: 'https://www.youtube.com/watch?v=dnV-6TtfYfY',
    text: 'How to Choose the Right Database for Your Application',
  },
  {
    to:
      'https://www.youtube.com/playlist?list=PLTnRtjQN5ieZl3kM_jqfnK98uqYeXbfmC',
    text: 'MySQL Beginner Series',
  },
];

const getLinkOnClick = (linkText: string) => () => {
  sendEvent({
    ...linkGAEventTemplate,
    label: linkText,
  });
};

const guideLinks = (
  <List>
    {guidesLinkData.map((linkData) => (
      <ListItem key={linkData.to}>
        <Link to={linkData.to} onClick={getLinkOnClick(linkData.text)}>
          {linkData.text}
        </Link>
      </ListItem>
    ))}
  </List>
);

const youtubeLinks = (
  <List>
    {youtubeLinkData.map((linkData) => (
      <ListItem key={linkData.to}>
        <Link to={linkData.to} onClick={getLinkOnClick(linkData.text)}>
          {linkData.text}
          <ExternalLinkIcon />
        </Link>
      </ListItem>
    ))}
  </List>
);

const useStyles = makeStyles(() => ({
  root: {
    '& > svg': {
      transform: 'scale(0.8)',
    },
  },
}));

const gaCategory = 'Managed Databases landing page empty';

const linkGAEventTemplate = {
  category: gaCategory,
  action: 'Click:link',
};

const onLinkClick = (
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
) => {
  const label = event.currentTarget.textContent ?? '';
  sendEvent({ ...linkGAEventTemplate, label });
};

const DatabaseEmptyState: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();

  return (
    <>
      <ProductInformationBanner bannerLocation="Databases" warning important />
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
              MoreLink={(props) => (
                <Link
                  onClick={onLinkClick}
                  to="https://www.linode.com/docs/"
                  {...props}
                >
                  Check out all our Docs
                  <PointerIcon />
                </Link>
              )}
            >
              {guideLinks}
            </LinkSubSection>
            <LinkSubSection
              title="Getting Started Playlist"
              icon={<YoutubeIcon />}
              external
              MoreLink={(props) => (
                <Link
                  onClick={onLinkClick}
                  to="https://www.youtube.com/playlist?list=PLTnRtjQN5ieb4XyvC9OUhp7nxzBENgCxJ"
                  {...props}
                >
                  View the complete playlist
                  <ExternalLinkIcon style={{ marginLeft: 8 }} />
                </Link>
              )}
            >
              {youtubeLinks}
            </LinkSubSection>
          </LinksSection>
        }
      >
        <Typography variant="subtitle1">
          Deploy popular database engines such as MySQL and PostgreSQL using
          Linode&rsquo;s performant, reliable, and fully managed database
          solution.
        </Typography>
      </Placeholder>
    </>
  );
};

export default React.memo(DatabaseEmptyState);
