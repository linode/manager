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

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface UpgradeInfo {
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
  upgradeInfo: UpgradeInfo;
  currentTypeInfo: UpgradeInfo;
}

interface State {
  extendedUpgradeInfo: ExtendedUpgradeInfo;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UpgradeDrawer extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    
    this.state = {
      extendedUpgradeInfo: {
        vcpus: {
          label: 'vCPUs',
          newAmount: props.upgradeInfo.vcpus,
          currentAmount: props.currentTypeInfo.vcpus,
          unit: ''
        },
        memory: {
          label: 'RAM',
          newAmount: props.upgradeInfo.memory,
          currentAmount: props.currentTypeInfo.memory,
          unit: 'MB'
        },
        disk: {
          label: 'Storage',
          newAmount: props.upgradeInfo.disk,
          currentAmount: props.currentTypeInfo.disk,
          unit: 'GB'
        },
        transfer: {
          label: 'Transfer',
          newAmount: props.upgradeInfo.transfer,
          currentAmount: props.currentTypeInfo.transfer,
          unit: ''
        },
        network_out: {
          label: 'Outbound Mbits',
          newAmount: props.upgradeInfo.network_out,
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
    } = this.props;

    const { extendedUpgradeInfo } = this.state;

    return (
      <Drawer
        open={open}
        onClose={handleClose}
        title="Free Upgrade Available"
      >
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
        <Button type="primary">
          Enter the Upgrade Queue
        </Button>
        <p>
          Need help? Refer to the
          <a href="google.com" target="_blank">supporting documentation</a>.
        </p>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(UpgradeDrawer);
