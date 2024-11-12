import React from 'react';

import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import { PreviewReply } from './PreviewReply';
import { TicketReply } from './TicketReply';

import type { Props as ReplyProps } from './TicketReply';

interface Props extends ReplyProps {
  isReply?: boolean;
  required?: boolean;
}

export const TabbedReply = (props: Props) => {
  const { error, value, ...rest } = props;

  const title = props.isReply ? 'Reply' : 'Description';

  return (
    <Tabs>
      <TabList>
        <Tab>{props.required ? `${title} (required)` : title}</Tab>
        <Tab>Preview</Tab>
      </TabList>
      <TabPanels>
        <SafeTabPanel index={0}>
          <TicketReply {...rest} error={error} value={value} />
        </SafeTabPanel>
        <SafeTabPanel index={1}>
          <PreviewReply error={error} value={value} />
        </SafeTabPanel>
      </TabPanels>
    </Tabs>
  );
};
