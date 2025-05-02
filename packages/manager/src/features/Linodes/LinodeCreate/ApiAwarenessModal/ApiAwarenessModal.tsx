import { ActionsPanel, Dialog, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { Link } from 'src/components/Link';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { useInProgressEvents } from 'src/queries/events/events';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics/customEventAnalytics';

import { CurlTabPanel } from './CurlTabPanel';
import { IntegrationsTabPanel } from './IntegrationsTabPanel';
import { LinodeCLIPanel } from './LinodeCLIPanel';
import { SDKTabPanel } from './SDKTabPanel';

import type { CreateLinodeRequest } from '@linode/api-v4';

export interface ApiAwarenessModalProps {
  isOpen: boolean;
  onClose: () => void;
  payLoad: CreateLinodeRequest;
}

export const tabs = [
  {
    component: LinodeCLIPanel,
    title: 'Linode CLI',
    type: 'CLI',
  },
  {
    component: CurlTabPanel,
    title: 'cURL',
    type: 'API',
  },
  {
    component: IntegrationsTabPanel,
    title: 'Integrations',
    type: 'INTEGRATIONS',
  },
  {
    component: SDKTabPanel,
    title: 'SDKs',
    type: 'INTEGRATIONS',
  },
];

export const ApiAwarenessModal = (props: ApiAwarenessModalProps) => {
  const { isOpen, onClose, payLoad } = props;

  const history = useHistory();
  const { data: events } = useInProgressEvents();

  const linodeCreationEvent = events?.find(
    (event) =>
      (event.action === 'linode_create' || event.action === 'linode_clone') &&
      event.entity?.label === payLoad.label &&
      (event.status === 'scheduled' || event.status === 'started')
  );

  const isLinodeCreated = linodeCreationEvent !== undefined;

  const handleTabChange = (index: number) => {
    const { type } = tabs[index];

    sendApiAwarenessClickEvent(`${type} Tab`, type);
  };

  useEffect(() => {
    if (isLinodeCreated && isOpen) {
      onClose();
      history.replace(`/linodes/${linodeCreationEvent.entity?.id}`);
    }
  }, [isLinodeCreated]);

  return (
    <Dialog
      fullHeight
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={isOpen}
      sx={{
        overflowX: 'hidden',
        paddingBottom: '0px',
      }}
      title="Create Linode"
    >
      <Typography sx={{ paddingBottom: '6px' }} variant="body1">
        Create a Linode in the command line, powered by the{' '}
        <Link
          onClick={() => sendApiAwarenessClickEvent('link', 'Linode API')}
          to="https://techdocs.akamai.com/linode-api/reference/api/"
        >
          Linode API
        </Link>
        . Select one of the methods below and paste the corresponding command
        into your local terminal. The values for each command have been
        populated with the selections made in the Cloud Manager create form.
      </Typography>
      <StyledTabs defaultIndex={0} onChange={handleTabChange}>
        <TabList>
          {tabs.map((tab) => (
            <Tab key={tab.title}>{tab.title}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((tab, index) => (
            <tab.component
              index={index}
              key={index}
              payLoad={payLoad}
              title={tab.title}
            />
          ))}
        </TabPanels>
      </StyledTabs>
      <ActionsPanel
        secondaryButtonProps={{
          compactX: true,
          'data-testid': 'close-button',
          label: 'Close',
          onClick: onClose,
        }}
        sx={{
          display: 'flex',
          marginTop: '18px !important',
          paddingBottom: 0,
          paddingTop: 0,
        }}
      />
    </Dialog>
  );
};

const StyledTabs = styled(Tabs, {
  label: 'StyledTabs',
})(() => ({
  position: 'relative',
}));
