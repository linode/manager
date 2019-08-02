import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ListItem from 'src/components/core/ListItem';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';

interface MutateInfo {
  vcpus: number | null;
  memory: number | null;
  disk: number | null;
  transfer: number | null;
  network_out: number | null;
}

interface Spec {
  label: string;
  newAmount: number | null;
  currentAmount: number;
}

interface ExtendedUpgradeInfo {
  vcpus: Spec;
  memory: Spec;
  disk: Spec;
  transfer: Spec;
  network_out: Spec;
}

interface Props {
  open: boolean;
  handleClose: () => void;
  initMutation: () => void;
  mutateInfo: MutateInfo;
  currentTypeInfo: MutateInfo;
  linodeId: number;
  loading: boolean;
  error: string;
  estimatedTimeToUpgradeInMins: number;
}

interface State {
  extendedUpgradeInfo: ExtendedUpgradeInfo;
}

type CombinedProps = Props;

class MutateDrawer extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);

    this.state = {
      extendedUpgradeInfo: {
        vcpus: {
          label: 'vCPUs',
          newAmount: props.mutateInfo.vcpus,
          currentAmount: props.currentTypeInfo.vcpus,
          unit: ''
        },
        memory: {
          label: 'RAM',
          newAmount: props.mutateInfo.memory,
          currentAmount: props.currentTypeInfo.memory,
          unit: 'MB'
        },
        disk: {
          label: 'Storage',
          newAmount:
            props.mutateInfo.disk !== null
              ? props.mutateInfo.disk / 1024
              : props.mutateInfo.disk,
          currentAmount:
            props.currentTypeInfo.disk !== null
              ? props.currentTypeInfo.disk / 1024
              : props.currentTypeInfo.disk,
          unit: 'GB'
        },
        transfer: {
          label: 'Transfer',
          newAmount: props.mutateInfo.transfer,
          currentAmount: props.currentTypeInfo.transfer,
          unit: 'GB'
        },
        network_out: {
          label: 'Outbound Mbits',
          newAmount: props.mutateInfo.network_out,
          currentAmount: props.currentTypeInfo.network_out,
          unit: 'Mbits'
        }
      }
    } as State;
  }

  render() {
    const {
      open,
      handleClose,
      loading,
      error,
      estimatedTimeToUpgradeInMins
    } = this.props;

    const { extendedUpgradeInfo } = this.state;

    return (
      <Drawer open={open} onClose={handleClose} title="Free Upgrade Available">
        {error && <Notice error text={error} />}
        <Typography>
          This Linode has pending upgrades. The resources that are affected
          include:
        </Typography>
        <ul className="nonMUI-list">
          {Object.keys(extendedUpgradeInfo).map(newSpec => {
            const {
              label,
              currentAmount,
              newAmount,
              unit
            } = extendedUpgradeInfo[newSpec];

            if (newAmount === null) {
              return;
            }
            return (
              <ListItem key={label}>
                <Typography>
                  {label} goes from {currentAmount} {unit} to{' '}
                  <strong>
                    {newAmount} {unit}
                  </strong>
                </Typography>
              </ListItem>
            );
          })}
        </ul>
        <Typography variant="h2" style={{ marginTop: 32, marginBottom: 16 }}>
          How it Works
        </Typography>
        <Typography>
          After entering the upgrade queue, the following will occur:
        </Typography>
        <ol className="nonMUI-list">
          <ListItem>Wait your turn in the upgrade queue.</ListItem>
          <ListItem>
            Your Linode will be shut down and its disk images will be migrated.
          </ListItem>
          <ListItem>
            Your Linode will be upgraded and booted (if it was previously
            running).
          </ListItem>
        </ol>
        <Typography variant="body1" style={{ marginTop: 16 }}>
          After the migration completes, you can take advantage of the new
          resources by resizing your disk images. We estimate this upgrade
          process will take{' '}
          <strong>
            {estimatedTimeToUpgradeInMins < 1
              ? '< 1'
              : estimatedTimeToUpgradeInMins}
            {estimatedTimeToUpgradeInMins < 1 ? ` minute` : ` minutes`}
          </strong>
          , but that may vary based on host and network load.
        </Typography>
        <ActionsPanel style={{ marginTop: 32 }}>
          <Button
            loading={loading}
            onClick={this.props.initMutation}
            buttonType="primary"
            compact
          >
            Enter the Upgrade Queue
          </Button>
        </ActionsPanel>
        {/*
         * Show when the relevant docs exist
         */}
        <Typography style={{ display: 'none' }}>
          {`Need help? Refer to the `}
          <a href="google.com" target="_blank">
            supporting documentation
          </a>
          .
        </Typography>
      </Drawer>
    );
  }
}

export default MutateDrawer;
