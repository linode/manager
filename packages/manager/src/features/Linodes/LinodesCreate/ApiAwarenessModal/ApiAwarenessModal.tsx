import { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import { Typography } from 'src/components/Typography';
import { TabPanels } from 'src/components/ReachTabPanels';
import { Tabs } from 'src/components/ReachTabs';
import useEvents from 'src/hooks/useEvents';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics';
import { generateCurlCommand } from 'src/utilities/generate-cURL';
import { generateCLICommand } from 'src/utilities/generate-cli';

import { CodeBlock } from '../CodeBlock/CodeBlock';

export interface ApiAwarenessModalProps {
  isOpen: boolean;
  onClose: () => void;
  payLoad: CreateLinodeRequest;
  route: string;
}

export const ApiAwarenessModal = (props: ApiAwarenessModalProps) => {
  const { isOpen, onClose, payLoad, route } = props;

  const theme = useTheme();
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
        Create a Linode in the command line using either cURL or the Linode CLI
        — both of which are powered by the Linode API. Select one of the methods
        below and paste the corresponding command into your local terminal. The
        values for each command have been populated with the selections made in
        the Cloud Manager create form.
      </Typography>
      <Tabs
        sx={{ paddingTop: theme.spacing() }}
        defaultIndex={0}
        onChange={handleTabChange}
      >
        <TabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={0}>
            <Typography sx={{ marginTop: theme.spacing(2) }} variant="body1">
              Most Linode API requests need to be authenticated with a valid{' '}
              <Link
                onClick={() =>
                  sendApiAwarenessClickEvent('link', 'personal access token')
                }
                to="/profile/tokens"
              >
                personal access token
              </Link>
              . The command below assumes that your personal access token has
              been stored within the TOKEN shell variable. For more information,
              see{' '}
              <Link
                onClick={() =>
                  sendApiAwarenessClickEvent(
                    'link',
                    'Get Started with the Linode API'
                  )
                }
                to="https://www.linode.com/docs/products/tools/api/get-started/"
              >
                Get Started with the Linode API
              </Link>{' '}
              and{' '}
              <Link
                onClick={() =>
                  sendApiAwarenessClickEvent('link', 'Linode API Guides')
                }
                to="https://www.linode.com/docs/products/tools/api/guides/"
              >
                Linode API Guides
              </Link>
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
              <Link
                onClick={() =>
                  sendApiAwarenessClickEvent(
                    'link',
                    'Install and Configure the Linode CLI'
                  )
                }
                to="https://www.linode.com/docs/products/tools/cli/guides/install/"
              >
                Install and Configure the Linode CLI
              </Link>{' '}
              guide for instructions. To learn more and to use the Linode CLI
              for tasks, review additional{' '}
              <Link
                onClick={() =>
                  sendApiAwarenessClickEvent('link', 'Linode CLI Guides')
                }
                to="https://www.linode.com/docs/products/tools/cli/guides/"
              >
                Linode CLI Guides
              </Link>
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
      <Notice spacingBottom={0} spacingTop={24} variant="marketing">
        <Typography
          sx={{
            fontFamily: theme.font.bold,
            fontSize: '14px !important',
            fontWeight: 400,
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
            onClick={() => sendApiAwarenessClickEvent('link', 'View all tools')}
            to="https://www.linode.com/docs/products/tools/api/developers/"
          >
            View all tools
          </Link>{' '}
          with programmatic access to the Linode platform.
        </Typography>
      </Notice>
      <ActionsPanel
        sx={{ marginTop: '18px !important', paddingBottom: 0, paddingTop: 0 }}
        secondaryButtonProps={{
          compactX: true,
          'data-testid': 'close-button',
          label: 'Close',
          onClick: onClose,
        }}
      />
    </Dialog>
  );
};
