import React, { useMemo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';
import { StyledActionPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { Dialog } from 'src/components/Dialog/Dialog';
import ExternalLink from 'src/components/ExternalLink';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import { Typography } from 'src/components/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Tabs from 'src/components/core/ReachTabs';
import TabPanels from 'src/components/core/ReachTabPanels';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics';
import generateCurlCommand from 'src/utilities/generate-cURL';
import generateCLICommand from 'src/utilities/generate-cli';

import CodeBlock from '../CodeBlock';
import { useEventsInfiniteQuery } from 'src/queries/events';

const useStyles = makeStyles((theme: Theme) => ({
  guides: {
    marginTop: 16,
  },
  modalIntroTypoClass: {
    paddingBottom: '6px',
  },
  modalContent: {
    overflowX: 'hidden',
    paddingBottom: '0px',
  },
  tabsStyles: {
    marginTop: '14px',
  },
  tabsContainer: {
    paddingTop: theme.spacing(),
  },
  actionPanelStyles: {
    marginTop: '18px !important',
    paddingBottom: 0,
    paddingTop: 0,
  },
  otherTools: {
    fontFamily: theme.font.bold,
    fontWeight: 400,
    fontSize: '14px !important',
  },
  tabDescription: {
    marginTop: theme.spacing(2),
  },
}));

export interface Props {
  isOpen: boolean;
  onClose: () => void;
  route: string;
  payLoad: CreateLinodeRequest;
}

const ApiAwarenessModal = (props: Props) => {
  const { isOpen, onClose, route, payLoad } = props;

  const classes = useStyles();
  const history = useHistory();
  const { events } = useEventsInfiniteQuery();

  const createdLinode = events?.find(
    (event) =>
      (event.action === 'linode_create' || event.action === 'linode_clone') &&
      event.entity?.label === payLoad.label &&
      (event.status === 'scheduled' || event.status === 'started')
  );

  const curlCommand = useMemo(
    () => generateCurlCommand(payLoad, '/linode/instances'),
    [payLoad]
  );

  const cliCommand = useMemo(() => generateCLICommand(payLoad), [payLoad]);

  const tabs = [
    {
      title: 'cURL',
      type: 'API',
      routeName: route,
    },
    {
      title: 'Linode CLI',
      type: 'CLI',
      routeName: route,
    },
  ];

  const handleTabChange = (index: number) => {
    sendApiAwarenessClickEvent(`${tabs[index].type} Tab`, tabs[index].type);
  };

  useEffect(() => {
    if (createdLinode && isOpen) {
      onClose();
      history.replace(`/linodes/${createdLinode[0].entity?.id}`);
    }
  }, [createdLinode, history, isOpen, onClose]);

  return (
    <Dialog
      className={classes.modalContent}
      title="Create Linode"
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <Typography variant="body1" className={classes.modalIntroTypoClass}>
        Create a Linode in the command line using either cURL or the Linode CLI
        — both of which are powered by the Linode API. Select one of the methods
        below and paste the corresponding command into your local terminal. The
        values for each command have been populated with the selections made in
        the Cloud Manager create form.
      </Typography>
      <Tabs
        defaultIndex={0}
        onChange={handleTabChange}
        className={classes.tabsContainer}
      >
        <TabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={0}>
            <Typography variant="body1" className={classes.tabDescription}>
              Most Linode API requests need to be authenticated with a valid{' '}
              <ExternalLink
                text="personal access token"
                link="/profile/tokens"
                onClick={() =>
                  sendApiAwarenessClickEvent('link', 'personal access token')
                }
                hideIcon
              />
              . The command below assumes that your personal access token has
              been stored within the TOKEN shell variable. For more information,
              see{' '}
              <ExternalLink
                text="Get Started with the Linode API"
                link="https://www.linode.com/docs/products/tools/api/get-started/"
                onClick={() =>
                  sendApiAwarenessClickEvent(
                    'link',
                    'Get Started with the Linode API'
                  )
                }
                hideIcon
              />{' '}
              and{' '}
              <ExternalLink
                text="Linode API Guides"
                link="https://www.linode.com/docs/products/tools/api/guides/"
                onClick={() =>
                  sendApiAwarenessClickEvent('link', 'Linode API Guides')
                }
                hideIcon
              />
              .
            </Typography>
            <CodeBlock
              command={curlCommand}
              language={'bash'}
              commandType={tabs[0].title}
            />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <Typography variant="body1">
              Before running the command below, the Linode CLI needs to be
              installed and configured on your system. See the{' '}
              <ExternalLink
                text="Install and Configure the Linode CLI"
                link="https://www.linode.com/docs/products/tools/cli/guides/install/"
                onClick={() =>
                  sendApiAwarenessClickEvent(
                    'link',
                    'Install and Configure the Linode CLI'
                  )
                }
                hideIcon
              />{' '}
              guide for instructions. To learn more and to use the Linode CLI
              for tasks, review additional{' '}
              <ExternalLink
                text="Linode CLI Guides"
                link="https://www.linode.com/docs/products/tools/cli/guides/"
                onClick={() =>
                  sendApiAwarenessClickEvent('link', 'Linode CLI Guides')
                }
                hideIcon
              />
              .
            </Typography>
            <CodeBlock
              command={cliCommand}
              language={'bash'}
              commandType={tabs[1].title}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
      <Notice marketing spacingBottom={0} spacingTop={24}>
        <Typography className={classes.otherTools}>
          Deploy and manage your infrastructure with the{' '}
          <ExternalLink
            text="Linode Terraform Provider"
            link="https://www.linode.com/products/linode-terraform-provider/"
            onClick={() =>
              sendApiAwarenessClickEvent('link', 'Linode Terraform Provider')
            }
            hideIcon
          />{' '}
          and{' '}
          <ExternalLink
            text="Ansible Collection"
            link="https://www.linode.com/products/linode-ansible-collection/"
            onClick={() =>
              sendApiAwarenessClickEvent('link', 'Ansible Collection')
            }
            hideIcon
          />
          .{' '}
          <ExternalLink
            text="View all tools"
            link="https://www.linode.com/docs/products/tools/api/developers/"
            onClick={() => sendApiAwarenessClickEvent('link', 'View all tools')}
            hideIcon
          />{' '}
          with programmatic access to the Linode platform.
        </Typography>
      </Notice>
      <StyledActionPanel className={classes.actionPanelStyles}>
        <Button
          buttonType="secondary"
          onClick={onClose}
          data-testid="close-button"
          compactX
        >
          Close
        </Button>
      </StyledActionPanel>
    </Dialog>
  );
};

export default ApiAwarenessModal;
