import { PlayCircleIcon, Typography } from '@linode/ui';
import * as React from 'react';

import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import { StyledHtmlContent } from './HtmlContent.styles';
import {
  ContentSection,
  OverviewContainer,
  VideoPlaceholder,
} from './ProductDetailsTabs.styles';

import type { MarketplaceProductDetail } from '@linode/api-v4';

interface Props {
  details: MarketplaceProductDetail;
}

/**
 * Component to render sanitized HTML content
 */
const HtmlContentRenderer = ({ content }: { content: string }) => {
  const sanitizedContent = React.useMemo(
    () => sanitizeHTML({ sanitizingTier: 'flexible', text: content }),
    [content]
  );

  return (
    <StyledHtmlContent dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
  );
};

/**
 * Tab configuration for available detail sections
 */
interface TabConfig {
  content: React.ReactNode;
  label: string;
  pendoId: string;
}

/**
 * ProductDetailsTabs component displays product information in tabs
 * Only renders tabs for sections that have content
 */
export const ProductDetailsTabs = ({ details }: Props) => {
  const [currentTab, setCurrentTab] = React.useState(0);

  const handleTabChange = (index: number) => {
    setCurrentTab(index);
  };

  // Build tabs dynamically based on available content
  const tabs = React.useMemo(() => {
    const availableTabs: TabConfig[] = [];

    if (details.overview?.description) {
      availableTabs.push({
        content: (
          <OverviewContainer>
            <ContentSection>
              <HtmlContentRenderer content={details.overview.description} />
            </ContentSection>
            <VideoPlaceholder>
              <PlayCircleIcon />
              <Typography
                sx={(theme) => ({
                  color: theme.tokens.alias.Content.Text.Secondary.Default,
                  fontFamily: theme.font.bold,
                  fontSize: theme.tokens.font.FontSize.Xs,
                })}
                variant="body1"
              >
                Video Coming Soon
              </Typography>
            </VideoPlaceholder>
          </OverviewContainer>
        ),
        label: 'Overview',
        pendoId: 'Cloud Marketplace Details-Overview',
      });
    }

    if (details.pricing?.description) {
      availableTabs.push({
        content: <HtmlContentRenderer content={details.pricing.description} />,
        label: 'Pricing',
        pendoId: 'Cloud Marketplace Details-Pricing',
      });
    }

    if (details.documentation?.description) {
      availableTabs.push({
        content: (
          <HtmlContentRenderer content={details.documentation.description} />
        ),
        label: 'Documentation',
        pendoId: 'Cloud Marketplace Details-Documentation',
      });
    }

    if (details.support?.description) {
      availableTabs.push({
        content: <HtmlContentRenderer content={details.support.description} />,
        label: 'Support',
        pendoId: 'Cloud Marketplace Details-Support',
      });
    }

    return availableTabs;
  }, [details]);

  // If no tabs are available, don't render anything
  if (tabs.length === 0) {
    return null;
  }

  return (
    <Tabs index={currentTab} onChange={handleTabChange}>
      <TabList>
        {tabs.map((tab) => (
          <Tab data-pendo-id={tab.pendoId} key={tab.pendoId}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {tabs.map((tab, index) => (
          <SafeTabPanel index={index} key={tab.pendoId}>
            {tab.content}
          </SafeTabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};
