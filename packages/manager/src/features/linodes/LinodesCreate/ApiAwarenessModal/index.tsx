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
import { makeStyles } from 'src/components/core/styles';
import Tabs from 'src/components/core/ReachTabs';
import TabPanels from 'src/components/core/ReachTabPanels';
import { sendEvent } from 'src/utilities/ga';

import CodeBlock from '../CodeBlock';

const useStyles = makeStyles(() => ({
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
}));
export interface Props {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  route: string;
  payLoad: CreateLinodeRequest;
}

const fireGAEvent = (action: string) => {
  sendEvent({
    action: action,
    category: 'API CLI Awareness Contextual Help',
  });
};
const ApiAwarenessModal = (props: Props) => {
  const { isOpen, label, onClose, route } = props;

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
      title={`Create Linode ${label} using command line`}
      open={isOpen}
      onClose={onClose}
      maxWidth={'sm'}
    >
      <Typography variant="body1" className={classes.modalIntroTypoClass}>
        You&#39;ll first need to{' '}
        <ExternalLink
          onClick={() => fireGAEvent('Click: Creatre API Access Token Link')}
          link="/profile/tokens"
          text="create an API access token"
          hideIcon
        />{' '}
        then save your existing token to an environment variable or substitue it
        into the command. Read our guides to learn about creating{' '}
        <ExternalLink
          onClick={() => fireGAEvent('Click: API Access Token Link')}
          link="https://www.linode.com/docs/api/profile/#personal-access-token-create"
          text=" API access tokens"
          hideIcon
        />{' '}
        and Linodes using the{' '}
        <ExternalLink
          onClick={() => fireGAEvent('Click: Linode API Link')}
          link="https://www.linode.com/docs/api/"
          text="Linode API"
          hideIcon
        />
        .
      </Typography>
      <Tabs defaultIndex={0} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={0}>
            <CodeBlock command={curlCommand} language={'curl'} />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <CodeBlock command={cliCommand} language={'bash'} />
            <Typography className={classes.guides} variant="h2">
              Guides
            </Typography>
            <Typography>
              <ExternalLink
                onClick={() =>
                  fireGAEvent(
                    'Click: Install and Configure the Linode CLI Link'
                  )
                }
                link="https://www.linode.com/docs/products/tools/cli/get-started/#installing-the-linode-cli"
                text="Install and Configure the Linode CLI"
                hideIcon
              />
            </Typography>
            <Typography>
              <ExternalLink
                onClick={() => fireGAEvent('Click: Using The Linode CLI Link')}
                link="https://www.linode.com/docs/products/tools/cli/get-started/#basic-usage"
                text="Using the Linode CLI"
                hideIcon
              />
            </Typography>
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
      <Notice marketing spacingTop={16} spacingBottom={16}>
        <Typography>
          Check out our{' '}
          <ExternalLink
            onClick={() =>
              fireGAEvent('Click: Collection Of Integrations Link')
            }
            link="https://www.linode.com/docs/products/tools/api/developers/#linode-developedsupported-tools"
            text="collection of integrations"
            hideIcon
          />{' '}
          such as Terraform and Ansible that allow you to connect infrastructure
          and dev tools to the Linode platform. Manage your Linode resources
          using the tools you know and love.
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
