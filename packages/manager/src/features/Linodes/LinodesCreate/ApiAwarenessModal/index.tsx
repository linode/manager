import { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { StyledActionPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { Dialog } from 'src/components/Dialog/Dialog';
import ExternalLink from 'src/components/ExternalLink';
import { Notice } from 'src/components/Notice/Notice';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import { Typography } from 'src/components/Typography';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import useEvents from 'src/hooks/useEvents';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics';
import generateCurlCommand from 'src/utilities/generate-cURL';
import generateCLICommand from 'src/utilities/generate-cli';

import CodeBlock from '../CodeBlock';

const useStyles = makeStyles((theme: Theme) => ({
  actionPanelStyles: {
    marginTop: '18px !important',
    paddingBottom: 0,
    paddingTop: 0,
  },
  guides: {
    marginTop: 16,
  },
  modalContent: {
    overflowX: 'hidden',
    paddingBottom: '0px',
  },
  modalIntroTypoClass: {
    paddingBottom: '6px',
  },
  otherTools: {
    fontFamily: theme.font.bold,
    fontSize: '14px !important',
    fontWeight: 400,
  },
  tabDescription: {
    marginTop: theme.spacing(2),
  },
  tabsContainer: {
    paddingTop: theme.spacing(),
  },
  tabsStyles: {
    marginTop: '14px',
  },
}));

export interface Props {
  isOpen: boolean;
  onClose: () => void;
  payLoad: CreateLinodeRequest;
  route: string;
}

const ApiAwarenessModal = (props: Props) => {
  const { isOpen, onClose, payLoad, route } = props;

  const classes = useStyles();
  const history = useHistory();
  const { events } = useEvents();

  const createdLinode = events.filter(
    (event) =>
      (event.action === 'linode_create' || event.action === 'linode_clone') &&
      event.entity?.label === payLoad.label &&
      (event.status === 'scheduled' || event.status === 'started')
  );

  const isLinodeCreated = createdLinode.length === 1;

  const curlCommand = useMemo(
    () => generateCurlCommand(payLoad, '/linode/instances'),
    [payLoad]
  );

  const cliCommand = useMemo(() => generateCLICommand(payLoad), [payLoad]);

  const tabs = [
    {
      routeName: route,
      title: 'cURL',
      type: 'API',
    },
    {
      routeName: route,
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
      history.replace(`/linodes/${createdLinode[0].entity?.id}`);
    }
  }, [isLinodeCreated]);

  return (
    <Dialog
      className={classes.modalContent}
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={isOpen}
      title="Create Linode"
    >
      <Typography className={classes.modalIntroTypoClass} variant="body1">
        Create a Linode in the command line using either cURL or the Linode CLI
        — both of which are powered by the Linode API. Select one of the methods
        below and paste the corresponding command into your local terminal. The
        values for each command have been populated with the selections made in
        the Cloud Manager create form.
      </Typography>
      <Tabs
        className={classes.tabsContainer}
        defaultIndex={0}
        onChange={handleTabChange}
      >
        <TabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={0}>
            <Typography className={classes.tabDescription} variant="body1">
              Most Linode API requests need to be authenticated with a valid{' '}
              <ExternalLink
                onClick={() =>
                  sendApiAwarenessClickEvent('link', 'personal access token')
                }
                hideIcon
                link="/profile/tokens"
                text="personal access token"
              />
              . The command below assumes that your personal access token has
              been stored within the TOKEN shell variable. For more information,
              see{' '}
              <ExternalLink
                onClick={() =>
                  sendApiAwarenessClickEvent(
                    'link',
                    'Get Started with the Linode API'
                  )
                }
                hideIcon
                link="https://www.linode.com/docs/products/tools/api/get-started/"
                text="Get Started with the Linode API"
              />{' '}
              and{' '}
              <ExternalLink
                onClick={() =>
                  sendApiAwarenessClickEvent('link', 'Linode API Guides')
                }
                hideIcon
                link="https://www.linode.com/docs/products/tools/api/guides/"
                text="Linode API Guides"
              />
              .
            </Typography>
            <CodeBlock
              command={curlCommand}
              commandType={tabs[0].title}
              language={'bash'}
            />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <Typography variant="body1">
              Before running the command below, the Linode CLI needs to be
              installed and configured on your system. See the{' '}
              <ExternalLink
                onClick={() =>
                  sendApiAwarenessClickEvent(
                    'link',
                    'Install and Configure the Linode CLI'
                  )
                }
                hideIcon
                link="https://www.linode.com/docs/products/tools/cli/guides/install/"
                text="Install and Configure the Linode CLI"
              />{' '}
              guide for instructions. To learn more and to use the Linode CLI
              for tasks, review additional{' '}
              <ExternalLink
                onClick={() =>
                  sendApiAwarenessClickEvent('link', 'Linode CLI Guides')
                }
                hideIcon
                link="https://www.linode.com/docs/products/tools/cli/guides/"
                text="Linode CLI Guides"
              />
              .
            </Typography>
            <CodeBlock
              command={cliCommand}
              commandType={tabs[1].title}
              language={'bash'}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
      <Notice marketing spacingBottom={0} spacingTop={24}>
        <Typography className={classes.otherTools}>
          Deploy and manage your infrastructure with the{' '}
          <ExternalLink
            onClick={() =>
              sendApiAwarenessClickEvent('link', 'Linode Terraform Provider')
            }
            hideIcon
            link="https://www.linode.com/products/linode-terraform-provider/"
            text="Linode Terraform Provider"
          />{' '}
          and{' '}
          <ExternalLink
            onClick={() =>
              sendApiAwarenessClickEvent('link', 'Ansible Collection')
            }
            hideIcon
            link="https://www.linode.com/products/linode-ansible-collection/"
            text="Ansible Collection"
          />
          .{' '}
          <ExternalLink
            hideIcon
            link="https://www.linode.com/docs/products/tools/api/developers/"
            onClick={() => sendApiAwarenessClickEvent('link', 'View all tools')}
            text="View all tools"
          />{' '}
          with programmatic access to the Linode platform.
        </Typography>
      </Notice>
      <StyledActionPanel className={classes.actionPanelStyles}>
        <Button
          buttonType="secondary"
          compactX
          data-testid="close-button"
          onClick={onClose}
        >
          Close
        </Button>
      </StyledActionPanel>
    </Dialog>
  );
};

export default ApiAwarenessModal;
