import { PlayCircleIcon, Typography } from '@linode/ui';
import * as React from 'react';

import { Markdown } from 'src/components/Markdown/Markdown';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import { StyledHtmlContent } from './HtmlContent.styles';
import {
  ContentSection,
  OverviewContainer,
  VideoPlaceholder,
} from './ProductDetailsTabs.styles';

import type { ProductTabDetails } from '../data/details';

interface Props {
  details: ProductTabDetails;
}

/**
 * Component to render sanitized Markdown content
 */
const MarkdownContentRenderer = ({ content }: { content: string }) => {
  return (
    <StyledHtmlContent>
      <Markdown textOrMarkdown={content} />
    </StyledHtmlContent>
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
  const [index, setIndex] = React.useState(0);
  const tabs: TabConfig[] = [];

  const hasDescription = (value?: { description: string }) => {
    return Boolean(value?.description && value.description.trim().length > 0);
  };

  // Overview Tab
  if (hasDescription(details.overview)) {
    tabs.push({
      content: (
        <OverviewContainer>
          <ContentSection>
            <MarkdownContentRenderer content={details.overview!.description} />
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
  if (hasDescription(details.pricing)) {
    tabs.push({
      content: (
        <ContentSection>
          <MarkdownContentRenderer content={details.pricing!.description} />
        </ContentSection>
      ),
      label: 'Pricing',
      pendoId: 'Cloud Marketplace Details-Pricing',
    });
  }

  // Documentation Tab
  if (hasDescription(details.documentation)) {
    tabs.push({
      content: (
        <ContentSection>
          <MarkdownContentRenderer
            content={details.documentation!.description}
          />
        </ContentSection>
      ),
      label: 'Documentation',
      pendoId: 'Cloud Marketplace Details-Documentation',
    });
  }

  // Support Tab
  if (hasDescription(details.support)) {
    tabs.push({
      content: (
        <ContentSection>
          <MarkdownContentRenderer content={details.support!.description} />
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
