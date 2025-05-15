import { Box, CircleProgress, ErrorState } from '@linode/ui';
import * as React from 'react';
import { VncScreen } from 'react-vnc';
import type { VncScreenHandle } from 'react-vnc';

import type { LinodeLishData } from '@linode/api-v4/lib/linodes';
import type { Linode } from '@linode/api-v4/lib/linodes';

interface Props extends Omit<LinodeLishData, 'weblish_url'> {
  linode: Linode;
  refreshToken: () => Promise<void>;
}

let monitor: WebSocket;

const Glish = (props: Props) => {
  const { glish_url, linode, monitor_url, refreshToken, ws_protocols } = props;
  const ref = React.useRef<VncScreenHandle>(null);
  const [powered, setPowered] = React.useState(linode.status === 'running');

  React.useEffect(() => {
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
  }, [glish_url, monitor_url, ws_protocols]);

  const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault();
    if (
      !ref.current?.rfb ||
      ref.current.rfb._rfbConnectionState !== 'connected'
    ) {
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

    monitor = new WebSocket(monitor_url, ws_protocols);

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
      <ErrorState
        errorText="Please power on your Linode to use Glish"
        typographySx={(theme) => ({ color: theme.palette.common.white })}
      />
    );
  }

  const rfbOptions = { wsProtocols: ws_protocols };

  return (
    <VncScreen
      autoConnect={false}
      loadingUI={
        <Box p={8} position="absolute" top="0" width="100%">
          <CircleProgress />
        </Box>
      }
      ref={ref}
      rfbOptions={rfbOptions}
      scaleViewport
      showDotCursor
      style={{
        height: 'calc(100vh - 60px)',
        padding: 8,
      }}
      url={glish_url}
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
  if (
    !ref.current?.rfb ||
    ref.current.rfb._rfbConnectionState !== 'connected'
  ) {
    return;
  }
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
