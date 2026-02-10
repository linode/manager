import { PlayCircleIcon, Typography } from '@linode/ui';
import * as React from 'react';

import { Markdown } from 'src/components/Markdown/Markdown';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { allowedHTMLAttr, allowedHTMLTagsFlexible } from 'src/constants';

import {
  ContentSection,
  OverviewContainer,
  VideoPlaceholder,
} from './ProductDetailsTabs.styles';
import { StyledTabContent } from './TabContent.styles';

import type { ProductTabDetails } from './pages';

interface Props {
  details: ProductTabDetails;
}

/**
 * Tab configuration for available detail sections
 */
interface TabConfig {
  content: React.ReactNode;
  label: string;
  pendoId: string;
}

/**
 * Component to render sanitized Markdown content
 */
const MarkdownContentRenderer = ({ content }: { content: string }) => {
  return (
    <StyledTabContent>
      <Markdown
        sanitizeOptions={{
          ALLOWED_ATTR: [...allowedHTMLAttr, 'target', 'src', 'alt', 'style'],
          ALLOWED_TAGS: [...allowedHTMLTagsFlexible, 'img'],
        }}
        textOrMarkdown={content}
      />
    </StyledTabContent>
  );
};

/**
 * ProductDetailsTabs component displays product information in tabs
 * Only renders tabs for sections that have content
 */
export const ProductDetailsTabs = ({ details }: Props) => {
  const [index, setIndex] = React.useState(0);
  const tabs: TabConfig[] = [];

  const overview = details.overview?.trim();
  const pricing = details.pricing?.trim();
  const documentation = details.documentation?.trim();
  const support = details.support?.trim();

  // Overview Tab
  if (overview) {
    tabs.push({
      content: (
        <OverviewContainer>
          <ContentSection>
            <MarkdownContentRenderer content={overview} />
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

  // Pricing Tab
  if (pricing) {
    tabs.push({
      content: (
        <ContentSection>
          <MarkdownContentRenderer content={pricing} />
        </ContentSection>
      ),
      label: 'Pricing',
      pendoId: 'Cloud Marketplace Details-Pricing',
    });
  }

  // Documentation Tab
  if (documentation) {
    tabs.push({
      content: (
        <ContentSection>
          <MarkdownContentRenderer content={documentation} />
        </ContentSection>
      ),
      label: 'Documentation',
      pendoId: 'Cloud Marketplace Details-Documentation',
    });
  }

  // Support Tab
  if (support) {
    tabs.push({
      content: (
        <ContentSection>
          <MarkdownContentRenderer content={support} />
        </ContentSection>
      ),
      label: 'Support',
      pendoId: 'Cloud Marketplace Details-Support',
    });
  }

  if (tabs.length === 0) {
    return null;
  }

  const handleTabChange = (newIndex: number) => {
    setIndex(newIndex);
  };

  return (
    <Tabs index={index} onChange={handleTabChange}>
      <TabList>
        {tabs.map((tab, idx) => (
          <Tab data-pendo-id={tab.pendoId} key={idx}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {tabs.map((tab, idx) => (
          <SafeTabPanel index={idx} key={idx}>
            {tab.content}
          </SafeTabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};
