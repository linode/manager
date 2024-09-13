import { styled } from '@mui/material/styles';
import { useLDClient } from 'launchdarkly-react-client-sdk';
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
import { LD_DX_TOOLS_METRICS_KEYS } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';
import { useInProgressEvents } from 'src/queries/events/events';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics/customEventAnalytics';

import { CurlTabPanel } from './CurlTabPanel';
import { IntegrationsTabPanel } from './IntegrationsTabPanel';
import { LinodeCLIPanel } from './LinodeCLIPanel';
import { SDKTabPanel } from './SDKTabPanel';

import type { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';

export interface ApiAwarenessModalProps {
  isOpen: boolean;
  onClose: () => void;
  payLoad: CreateLinodeRequest;
}

export const baseTabs = [
  {
    component: CurlTabPanel,
    title: 'cURL',
    type: 'API',
  },
  {
    component: LinodeCLIPanel,
    title: 'Linode CLI',
    type: 'CLI',
  },
];

export const additionalTabs = [
  {
    component: IntegrationsTabPanel,
    title: 'Integrations',
    type: 'INTEGRATIONS',
  },
  {
    component: SDKTabPanel,
    title: `SDK's`,
    type: 'INTEGRATIONS',
  },
];

export const ApiAwarenessModal = (props: ApiAwarenessModalProps) => {
  const { isOpen, onClose, payLoad } = props;

  const flags = useFlags();
  const ldClient = useLDClient();
  const history = useHistory();
  const { data: events } = useInProgressEvents();

  const linodeCreationEvent = events?.find(
    (event) =>
      (event.action === 'linode_create' || event.action === 'linode_clone') &&
      event.entity?.label === payLoad.label &&
      (event.status === 'scheduled' || event.status === 'started')
  );

  const isLinodeCreated = linodeCreationEvent !== undefined;

  const isDxAdditionsFeatureEnabled = flags?.apicliDxToolsAdditions;
  const apicliButtonCopy = flags?.testdxtoolabexperiment;

  const tabs = isDxAdditionsFeatureEnabled
    ? [baseTabs[1], baseTabs[0], ...additionalTabs]
    : baseTabs;

  const handleTabChange = (index: number) => {
    const { title, type } = tabs[index];

    sendApiAwarenessClickEvent(`${type} Tab`, type);

    let trackingKey = '';

    if (type === 'INTEGRATIONS' && title !== "SDK's") {
      trackingKey = LD_DX_TOOLS_METRICS_KEYS.INTEGRATION_TAB_SELECTION;
    } else if (type === 'API') {
      trackingKey = LD_DX_TOOLS_METRICS_KEYS.CURL_TAB_SELECTION;
    } else if (title === "SDK's") {
      trackingKey = LD_DX_TOOLS_METRICS_KEYS.SDK_TAB_SELECTION;
    } else if (title === 'Linode CLI') {
      trackingKey = LD_DX_TOOLS_METRICS_KEYS.LINODE_CLI_TAB_SELECTION;
    }

    ldClient?.track(trackingKey, {
      variation: apicliButtonCopy,
    });
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
        {isDxAdditionsFeatureEnabled
          ? 'Create a Linode in the command line, powered by the Linode API. Select one of the methods below and paste the corresponding command into your local terminal. The values for each command have been populated with the selections made in the Cloud Manager create form.'
          : 'Create a Linode in the command line using either cURL or the Linode CLI — both of which are powered by the Linode API. Select one of the methods below and paste the corresponding command into your local terminal. The values for each command have been populated with the selections made in the Cloud Manager create form.'}
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
      {!isDxAdditionsFeatureEnabled && (
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
