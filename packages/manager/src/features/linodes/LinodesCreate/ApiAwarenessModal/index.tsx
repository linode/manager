import React from 'react';

import { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/Dialog';
import ExternalLink from 'src/components/ExternalLink';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabLinkList from 'src/components/TabLinkList';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tabs from 'src/components/core/ReachTabs';
import TabPanels from 'src/components/core/ReachTabPanels';
import { sendEvent } from 'src/utilities/ga';

import CodeBlock from '../CodeBlock';

const useStyles = makeStyles((theme: Theme) => ({
  cancelButtonStyles: {
    justifyContent: 'right',
    paddingRight: '4px',
  },
  guides: {
    marginTop: 16,
  },
  modalIntroTypoClass: {
    paddingTop: '16px',
  },
  modalContent: {
    overflowX: 'hidden',
  },
  tabsStyles: {
    marginTop: '14px',
  },
  tabPanelStyles: {
    paddingBottom: '24px',
    paddingTop: '16px',
  },
  actionPanelStyles: {
    marginTop: '0px',
    paddingTop: '4px',
  },
  otherTools: {
    fontFamily: theme.font.bold,
    fontWeight: 400,
    fontSize: '14px !important',
  },
}));
export interface Props {
  isOpen: boolean;
  onClose: () => void;
  route: string;
  payLoad: CreateLinodeRequest;
}

const fireGAEvent = (action: string) => {
  sendEvent({
    action,
    category: 'API CLI Awareness Contextual Help',
  });
};
const ApiAwarenessModal = (props: Props) => {
  const { isOpen, onClose, route } = props;

  const classes = useStyles();

  const curlCommand = `curl -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -X POST -d '{
    "image": "linode/debian11",
    "region": "us-southeast",
    "type": "g6-nanode-1",
    "label": "debian-us-southeast-001",
    "tags": [],
    "root_pass": "asdfasdfasdfasdf",
    "authorized_users": [],
    "booted": true,
    "backups_enabled": false,
    "private_ip": false
  }' https://api.linode.com/v4/linode/instances`;

  const cliCommand = `linode-cli linodes create 
  --image linode/debian11 
  --region us-central 
  --type g6-nanode-1 
  --label debian-us-central 
  --tags 
  --root_pass asd 
  --authorized_users 
  --booted true 
  --backups_enabled false 
  --backup_id undefined 
  --private_ip false 
  --stackscript_id undefined 
  --stackscript_data undefined`;

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
    sendEvent({
      category: 'API CLI Awareness',
      action: `Click: ${tabs[index].type} Tab`,
    });
  };

  return (
    <Dialog
      className={classes.modalContent}
      title="Create Linode"
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
    >
      <Typography variant="body1" className={classes.modalIntroTypoClass}>
        Create a Linode in the command line using either cURL or the Linode CLI
        — both of which are powered by the Linode API. Select one of the methods
        below and paste the corresponding command into your local terminal. The
        values for each command have been populated with the selections made in
        the Cloud Manager create form.
      </Typography>
      <Tabs defaultIndex={0} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />
        <TabPanels className={classes.tabPanelStyles}>
          <SafeTabPanel index={0}>
            <Typography variant="body1">
              Most Linode API requests need to be authenticated with a valid{' '}
              <ExternalLink
                text="personal access token"
                link="https://cloud.linode.com/profile/tokens"
                onClick={() => fireGAEvent('Click: personal access token')}
                hideIcon
              />
              . The command below assumes that your personal access token has
              been stored within the TOKEN shell variable. For more information,
              see{' '}
              <ExternalLink
                text="Get Started with the Linode API"
                link="https://www.linode.com/docs/products/tools/api/get-started/"
                onClick={() =>
                  fireGAEvent('Click: Get Started with the Linode API')
                }
                hideIcon
              />{' '}
              and{' '}
              <ExternalLink
                text="Linode API Guides"
                link="https://www.linode.com/docs/products/tools/api/guides/"
                onClick={() => fireGAEvent('Click: Linode API Guides')}
                hideIcon
              />
              .
            </Typography>
            <CodeBlock command={curlCommand} language={'curl'} />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <CodeBlock command={cliCommand} language={'bash'} />
            <Typography className={classes.guides} variant="h2">
              Guides
            </Typography>
            <Typography>
              <ExternalLink
                text="Get Started with the Linode API"
                link="https://www.linode.com/docs/products/tools/api/get-started/"
                onClick={() =>
                  fireGAEvent('Click: Get Started with the Linode API')
                }
                hideIcon
              />{' '}
              and{' '}
              <ExternalLink
                text="Linode API Guides"
                link="https://www.linode.com/docs/products/tools/api/guides/"
                onClick={() => fireGAEvent('Click: Linode API Guides')}
                hideIcon
              />
              .
            </Typography>
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <Typography variant="body1">
              Before running the command below, the Linode CLI needs to be
              installed and configured on your system. See the{' '}
              <ExternalLink
                text="Install and Configure the Linode CLI"
                link="https://www.linode.com/docs/products/tools/cli/guides/install/"
                onClick={() =>
                  fireGAEvent('Click: Install and Configure the Linode CLI')
                }
                hideIcon
              />{' '}
              guide for instructions. To learn more and to use the Linode CLI
              for tasks, review additional{' '}
              <ExternalLink
                text="Linode CLI Guides"
                link="https://www.linode.com/docs/products/tools/cli/guides/"
                onClick={() => fireGAEvent('Click: Linode CLI Guides')}
                hideIcon
              />
              .
            </Typography>
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
      <Notice marketing spacingBottom={16}>
        <Typography className={classes.otherTools}>
          Deploy and manage your infrastructure with the{' '}
          <ExternalLink
            text="Linode Terraform Provider"
            link="https://www.linode.com/products/linode-terraform-provider/"
            onClick={() => fireGAEvent('Click: Linode Terraform Provider')}
            hideIcon
          />{' '}
          and{' '}
          <ExternalLink
            text="Ansible Collection"
            link="https://www.linode.com/products/linode-ansible-collection/"
            onClick={() => fireGAEvent('Click: Ansible Collection')}
            hideIcon
          />
          .{' '}
          <ExternalLink
            text="View all tools"
            link="https://www.linode.com/docs/products/tools/api/developers/"
            onClick={() => fireGAEvent('Click: View all tools')}
            hideIcon
          />{' '}
          with programmatic access to the Linode platform.
        </Typography>
      </Notice>

      <ActionsPanel className={classes.actionPanelStyles}>
        <Button
          buttonType="secondary"
          className={classes.cancelButtonStyles}
          onClick={onClose}
          data-testid="close-button"
        >
          Close
        </Button>
      </ActionsPanel>
    </Dialog>
  );
};

export default ApiAwarenessModal;
