import { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';
import { styled } from '@mui/material/styles';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { Typography } from 'src/components/Typography';
import { useInProgressEvents } from 'src/queries/events/events';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics/customEventAnalytics';

import { CurlTabPanel } from './CurlTabPanel';
import { IntegrationsTabPanel } from './IntegrationsTabPanel';
import { LinodeCLIPanel } from './LinodeCLIPanel';
import { SDKTabPanel } from './SDKTabPanel';

export interface ApiAwarenessModalProps {
  isOpen: boolean;
  onClose: () => void;
  payLoad: CreateLinodeRequest;
}

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

  const isFeatureEnabled = true;

  const tabs = isFeatureEnabled
    ? [
        {
          title: 'Linode CLI',
          type: 'CLI',
        },
        {
          title: 'cURL',
          type: 'API',
        },
        {
          title: 'Integrations',
          type: 'INTEGRATIONS',
        },
        {
          title: `SDK's`,
          type: 'INTEGRATIONS',
        },
      ]
    : [
        {
          title: 'cURL',
          type: 'API',
        },
        {
          title: 'Linode CLI',
          type: 'CLI',
        },
      ];

  const handleTabChange = (index: number) => {
    sendApiAwarenessClickEvent(`${tabs[index].type} Tab`, tabs[index].type);
  };

  useEffect(() => {
    if (isLinodeCreated && isOpen) {
      onClose();
      history.replace(`/linodes/${linodeCreationEvent.entity?.id}`);
    }
  }, [isLinodeCreated]);

  return (
    <Dialog
      sx={{
        overflowX: 'hidden',
        paddingBottom: '0px',
      }}
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={isOpen}
      title="Create Linode"
    >
      <Typography sx={{ paddingBottom: '6px' }} variant="body1">
        {isFeatureEnabled
          ? 'Create a Linode in the command line, powered by the Linode API. Select one of the methods below and paste the corresponding command into your local terminal. The values for each command have been populated with the selections made in the Cloud Manager create form.'
          : 'Create a Linode in the command line using either cURL or the Linode CLI — both of which are powered by the Linode API. Select one of the methods below and paste the corresponding command into your local terminal. The values for each command have been populated with the selections made in the Cloud Manager create form.'}
      </Typography>
      <StyledTabs defaultIndex={0} onChange={handleTabChange}>
        <TabList>
          {isFeatureEnabled ? (
            <>
              <Tab>Linode CLI</Tab>
              <Tab>cURL</Tab>
              <Tab>Integrations</Tab>
              <Tab>SDK&apos;s</Tab>
            </>
          ) : (
            <>
              <Tab>cURL</Tab>
              <Tab>Linode CLI</Tab>
            </>
          )}
        </TabList>
        <TabPanels>
          {isFeatureEnabled ? (
            <>
              <LinodeCLIPanel index={0} payLoad={payLoad} tabs={tabs} />
              <CurlTabPanel index={1} payLoad={payLoad} tabs={tabs} />
              <IntegrationsTabPanel payLoad={payLoad} tabs={tabs} />
              <SDKTabPanel payLoad={payLoad} tabs={tabs} />
            </>
          ) : (
            <>
              <CurlTabPanel index={0} payLoad={payLoad} tabs={tabs} />
              <LinodeCLIPanel index={1} payLoad={payLoad} tabs={tabs} />
            </>
          )}
        </TabPanels>
      </StyledTabs>
      {!isFeatureEnabled && (
        <Notice spacingBottom={0} spacingTop={24} variant="marketing">
          <Typography
            sx={{
              fontSize: '14px !important',
            }}
          >
            Deploy and manage your infrastructure with the{' '}
            <Link
              onClick={() =>
                sendApiAwarenessClickEvent('link', 'Linode Terraform Provider')
              }
              to="https://www.linode.com/products/linode-terraform-provider/"
            >
              Linode Terraform Provider
            </Link>{' '}
            and{' '}
            <Link
              onClick={() =>
                sendApiAwarenessClickEvent('link', 'Ansible Collection')
              }
              to="https://www.linode.com/products/linode-ansible-collection/"
            >
              Ansible Collection
            </Link>
            .{' '}
            <Link
              onClick={() =>
                sendApiAwarenessClickEvent('link', 'View all tools')
              }
              to="https://www.linode.com/docs/products/tools/api/developers/"
            >
              View all tools
            </Link>{' '}
            with programmatic access to the Linode platform.
          </Typography>
        </Notice>
      )}
      <ActionsPanel
        secondaryButtonProps={{
          compactX: true,
          'data-testid': 'close-button',
          label: 'Close',
          onClick: onClose,
        }}
        sx={{ marginTop: '18px !important', paddingBottom: 0, paddingTop: 0 }}
      />
    </Dialog>
  );
};

const StyledTabs = styled(Tabs, {
  label: 'StyledTabs',
})(() => ({
  position: 'relative',
}));
