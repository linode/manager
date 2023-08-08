import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { ListItem } from 'src/components/ListItem';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';

interface MutateInfo {
  disk: null | number;
  memory: null | number;
  network_out: null | number;
  transfer: null | number;
  vcpus: null | number;
}

interface Spec {
  currentAmount: number;
  label: string;
  newAmount: null | number;
}

interface ExtendedUpgradeInfo {
  disk: Spec;
  memory: Spec;
  network_out: Spec;
  transfer: Spec;
  vcpus: Spec;
}

interface Props {
  currentTypeInfo: MutateInfo;
  error: string | undefined;
  estimatedTimeToUpgradeInMins: number;
  handleClose: () => void;
  initMutation: () => void;
  isMovingFromSharedToDedicated: boolean;
  linodeId: number;
  loading: boolean;
  mutateInfo: MutateInfo;
  open: boolean;
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
        disk: {
          currentAmount:
            props.currentTypeInfo.disk !== null
              ? props.currentTypeInfo.disk / 1024
              : props.currentTypeInfo.disk,
          label: 'Storage',
          newAmount:
            props.mutateInfo.disk !== null
              ? props.mutateInfo.disk / 1024
              : props.mutateInfo.disk,
          unit: 'GB',
        },
        memory: {
          currentAmount: props.currentTypeInfo.memory,
          label: 'RAM',
          newAmount: props.mutateInfo.memory,
          unit: 'MB',
        },
        network_out: {
          currentAmount: props.currentTypeInfo.network_out,
          label: 'Outbound Mbits',
          newAmount: props.mutateInfo.network_out,
          unit: 'Mbits',
        },
        transfer: {
          currentAmount: props.currentTypeInfo.transfer,
          label: 'Transfer',
          newAmount: props.mutateInfo.transfer,
          unit: 'GB',
        },
        vcpus: {
          currentAmount: props.currentTypeInfo.vcpus,
          label: 'vCPUs',
          newAmount: props.mutateInfo.vcpus,
          unit: '',
        },
      },
    } as State;
  }

  render() {
    const {
      error,
      estimatedTimeToUpgradeInMins,
      handleClose,
      loading,
      open,
    } = this.props;

    const { extendedUpgradeInfo } = this.state;

    return (
      <Drawer onClose={handleClose} open={open} title="Free Upgrade Available">
        {error && <Notice error text={error} />}
        <Typography>
          This Linode has pending upgrades. The resources that are affected
          include:
        </Typography>
        {this.props.isMovingFromSharedToDedicated ? (
          <HighmemG6ToG7 />
        ) : (
          <ul className="nonMUI-list">
            {Object.keys(extendedUpgradeInfo).map((newSpec) => {
              const {
                currentAmount,
                label,
                newAmount,
                unit,
              } = extendedUpgradeInfo[newSpec];

              if (newAmount === null) {
                return null;
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
        )}
        <Typography style={{ marginBottom: 16, marginTop: 32 }} variant="h2">
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
        <Typography style={{ marginTop: 16 }} variant="body1">
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
        <ActionsPanel
          primaryButtonProps={{
            label: 'Enter the Upgrade Queue',
            loading,
            onClick: this.props.initMutation,
          }}
          style={{ marginTop: 32 }}
        />

        {/*
         * Show when the relevant docs exist
         */}
        <Typography style={{ display: 'none' }}>
          {`Need help? Refer to the `}
          <Link external to="google.com">
            supporting documentation
          </Link>
          .
        </Typography>
      </Drawer>
    );
  }
}

export default MutateDrawer;

const HighmemG6ToG7: React.FC<{}> = () => {
  return (
    <ul className="nonMUI-list">
      <ListItem>
        <Typography>
          Linode now uses <strong>dedicated CPU cores</strong>
        </Typography>
      </ListItem>
    </ul>
  );
};
