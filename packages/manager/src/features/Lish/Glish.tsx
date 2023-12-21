/* eslint-disable no-unused-expressions */
import { Linode } from '@linode/api-v4/lib/linodes';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { VncScreen, VncScreenHandle } from 'react-vnc';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { StyledCircleProgress } from 'src/features/Lish/Lish';

import { getLishSchemeAndHostname, resizeViewPort } from './lishUtils';

const useStyles = makeStyles()(() => ({
  container: {
    '& canvas': {
      display: 'block',
      margin: 'auto',
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
  refreshToken: () => Promise<void>;
  token: string;
}

let monitor: WebSocket;

const Glish = (props: Props) => {
  const { classes } = useStyles();
  const { linode, refreshToken, token } = props;
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

    // eslint-disable-next-line scanjs-rules/call_addEventListener
    document.addEventListener('paste', handlePaste);

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

  const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault();
    if (!ref.current?.rfb) {
      return;
    }
    if (event.clipboardData === null) {
      return;
    }
    if (event.clipboardData.getData('text') === null) {
      return;
    }

    const text = event.clipboardData.getData('text/plain');

    sendString(text, ref);
  };

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
      autoConnect={false}
      loadingUI={<StyledCircleProgress />}
      ref={ref}
      showDotCursor
      url={`${getLishSchemeAndHostname(region)}:8080/${token}`}
    />
  );
};

export default Glish;

/**
 * Sends RFB keystrokes for an individual character.
 *
 * Key strokes for `shift` will be simulated for characters which require
 * them.
 *
 * @param character - Character keystroke(s) to send via RFB.
 */
const sendCharacter = (
  character: string,
  ref: React.RefObject<VncScreenHandle>
) => {
  const actualCharacter = character[0];
  const requiresShift = actualCharacter.match(/[A-Z!@#$%^&*()_+{}:\"<>?~|]/);

  // Necessary key codes.
  const returnCode = 0xff0d;
  const shiftCode = 0xffe1;
  const charCode = actualCharacter.charCodeAt(0);

  // Handle newline.
  if (character.match(/\n/)) {
    ref.current?.rfb?.sendKey(returnCode, undefined, undefined);
    return;
  }

  if (requiresShift) {
    ref.current?.rfb?.sendKey(shiftCode, undefined, true);
  }
  ref.current?.rfb?.sendKey(charCode, undefined, undefined);
  if (requiresShift) {
    ref?.current?.rfb?.sendKey(shiftCode, undefined, false);
  }
};

/**
 * Sends a complete string by sending RFB keystrokes for each character.
 *
 * @param contents - String contents to send via RFB keystrokes.
 * @param delay - Delay between sent characters, in milliseconds.
 */
const sendString = (
  contents: string,
  ref: React.RefObject<VncScreenHandle>,
  delay: number = 10
) => {
  // Bail out if contents is empty.
  if (contents.length < 1) {
    return;
  }

  const character = contents[0];

  setTimeout(() => {
    sendCharacter(character, ref);
    sendString(contents.slice(1), ref);
  }, delay);
};
