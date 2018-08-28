import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

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
}

interface State {
  extendedUpgradeInfo: ExtendedUpgradeInfo;
}

type CombinedProps = Props & WithStyles<ClassNames>;

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
          newAmount: props.mutateInfo.disk,
          currentAmount: props.currentTypeInfo.disk,
          unit: 'GB'
        },
        transfer: {
          label: 'Transfer',
          newAmount: props.mutateInfo.transfer,
          currentAmount: props.currentTypeInfo.transfer,
          unit: ''
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
    } = this.props;

    const { extendedUpgradeInfo } = this.state;

    return (
      <Drawer
        open={open}
        onClose={handleClose}
        title="Free Upgrade Available"
      >
        {error &&
          <Notice error text={error} />
        }
        <p>This Linode has pending upgrades. The resouces that are affected include:</p>
        <ul>
          {Object.keys(extendedUpgradeInfo).map((newSpec) => {
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
              <li key={label}>
                {`${label} goes from ${currentAmount} ${unit} to
                ${newAmount} ${unit}`}
              </li>
            )
          })}
        </ul>
        <Typography variant="title">How it Works</Typography>
        <p>After entering the upgrade queue, the following will occur:</p>
        <ol>
          <li>Wait your turn in the upgrade queue</li>
          <li>Your Linode will be shut down and its disk images will be migrated</li>
          <li>Your Linode will be upgraded and booted (if it was previously running).</li>
          <Typography variant="caption">
            After the migration completes, you can take advantage of the new resources
            by resizing your disk images.
          </Typography>
        </ol>
        <Button loading={loading} onClick={this.props.initMutation} type="primary">
          Enter the Upgrade Queue
        </Button>
        {/*
        * Show when the relevant docs exist
        */}
        <p style={{ display: 'none' }}>
          {`Need help? Refer to the `}
          <a href="google.com" target="_blank">supporting documentation</a>.
        </p>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(MutateDrawer);
