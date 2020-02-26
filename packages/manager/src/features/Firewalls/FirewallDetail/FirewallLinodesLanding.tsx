import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
// import { makeStyles, Theme } from 'src/components/core/styles'

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }))
import Typography from 'src/components/core/Typography';
import useFirewallDevices from 'src/hooks/useFirewallDevices';

interface Props {
  firewallID: number;
}

type CombinedProps = RouteComponentProps & Props;

const FirewallLinodesLanding: React.FC<CombinedProps> = props => {
  const { firewallID } = props;
  // const classes = useStyles();
  const { devices, requestDevices } = useFirewallDevices(firewallID);

  const deviceList = devices.itemsById ? Object.values(devices.itemsById) : [];
  React.useEffect(() => {
    if (devices.lastUpdated === 0 && !devices.loading) {
      requestDevices();
    }
  }, [firewallID]);
  return (
    <>
      <Typography>
        The following Linodes have been assigned to this Firewall.
      </Typography>
      <div>{deviceList.map((thisDevice: any) => thisDevice.entity.label)}</div>
    </>
  );
};

export default compose<CombinedProps, Props>(React.memo)(
  FirewallLinodesLanding
);
