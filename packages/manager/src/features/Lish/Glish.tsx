import * as React from 'react';
import { Linode } from '@linode/api-v4/lib/linodes';
import { VncScreen, VncScreenHandle } from 'react-vnc';
import { getLishSchemeAndHostname, resizeViewPort } from './lishUtils';
import { makeStyles } from 'src/components/core/styles';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';

const useStyles = makeStyles(() => ({
  container: {
    '& canvas': {
      margin: 'auto',
      display: 'block',
    },
  },
  errorState: {
    '& *': {
      color: '#f4f4f4 !important',
    },
  },
}));

interface Props {
  linode: Linode;
  token: string;
  refreshToken: () => Promise<void>;
}

let monitor: WebSocket;

const Glish = (props: Props) => {
  const classes = useStyles();
  const { linode, token, refreshToken } = props;
  const ref = React.useRef<VncScreenHandle>(null);
  const region = linode.region;
  const [powered, setPowered] = React.useState(linode.status === 'running');

  React.useEffect(() => {
    resizeViewPort(1080, 840);

    // Every 5 seconds, ping for the status?
    const monitorInterval = setInterval(() => {
      if (monitor.readyState === monitor.OPEN) {
        monitor.send(JSON.stringify({ action: 'status' }));
      }
    }, 5 * 1000);

    // Every 30 seconds, renew the Lish token
    const renewInterval = setInterval(() => {
      if (monitor.readyState === monitor.OPEN) {
        monitor.send(JSON.stringify({ action: 'renew' }));
      }
    }, 30 * 1000);

    return () => {
      clearInterval(monitorInterval);
      clearInterval(renewInterval);
      monitor.close();
    };
  }, []);

  React.useEffect(() => {
    // If the Lish token (from props) ever changes, we need to reconnect the monitor websocket
    connectMonitor();
    ref.current?.connect();
  }, [token]);

  const connectMonitor = () => {
    if (monitor && monitor.readyState === monitor.OPEN) {
      monitor.close();
    }

    const url = `${getLishSchemeAndHostname(region)}:8080/${token}/monitor`;

    monitor = new WebSocket(url);

    // eslint-disable-next-line scanjs-rules/call_addEventListener
    monitor.addEventListener('message', (ev) => {
      const data = JSON.parse(ev.data);

      if (data.poweredStatus === 'Running' && powered === false) {
        setPowered(true);
        return;
      } else if (data.poweredStatus === 'Powered Off' && powered === true) {
        setPowered(false);
        return;
      }

      if (
        data.type === 'error' &&
        data.reason === 'Your session has expired.'
      ) {
        refreshToken();
      }

      if (data.type === 'kick') {
        refreshToken();
      }
    });
  };

  if (!powered) {
    return (
      <div className={classes.errorState}>
        <ErrorState errorText="Please power on your Linode to use Glish" />
      </div>
    );
  }

  return (
    <VncScreen
      ref={ref}
      url={`${getLishSchemeAndHostname(region)}:8080/${token}`}
      loadingUI={<CircleProgress />}
      showDotCursor
      autoConnect={false}
    />
  );
};

export default Glish;
