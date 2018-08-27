import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

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
  amount: number | null;
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
          amount: props.upgradeInfo.vcpus,
        },
        memory: {
          label: 'RAM',
          amount: props.upgradeInfo.memory,
        },
        disk: {
          label: 'Storage',
          amount: props.upgradeInfo.disk,
        },
        transfer: {
          label: 'Transfer',
          amount: props.upgradeInfo.transfer,
        },
        network_out: {
          label: 'Outbound Mbits',
          amount: props.upgradeInfo.network_out,
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

    console.log(extendedUpgradeInfo);

    return (
      <Drawer
        open={open}
        onClose={handleClose}
        title="Free Upgrade Available"
      >
        <p>This Linode has pending upgrades. The resouces that are affected include:</p>
        <ul>
          {Object.keys(extendedUpgradeInfo).map((newSpec) => {
            console.log(newSpec);
            if(extendedUpgradeInfo[newSpec].amount === null) {
              console.log('null');
              return;
            }
            return (
              <li key={extendedUpgradeInfo[newSpec]}>
                {`${extendedUpgradeInfo[newSpec].label}
                goes from xxxx to
                ${extendedUpgradeInfo[newSpec].amount}`}
              </li>
            )
          })}
          </ul>
        <Button>Do the thing</Button>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(UpgradeDrawer);
