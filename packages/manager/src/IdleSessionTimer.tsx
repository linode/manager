import { Duration } from 'luxon';
import * as React from 'react';
import { useIdleTimer } from 'react-idle-timer';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import usePreferences from 'src/hooks/usePreferences';

// const PROMPT_TIMEOUT_IN_MS = 1000 * 60 * 3; // 3 minutes
// const MINIMUM_TIMEOUT = 1000 * 60 * 15; // 15 minutes;

// USE THESE VALUES FOR TESTING:
const PROMPT_TIMEOUT_IN_MS = 1000 * 5; // 5 seconds
const MINIMUM_TIMEOUT = 1000 * 10; // 10 seconds

const logout = () => {
  // eslint-disable-next-line scanjs-rules/assign_to_href
  window.location.href = '/logout';
};

export const IdleSessionTimer: React.FC<{}> = () => {
  const { preferences } = usePreferences();
  const timeoutPreference = preferences?.idle_session_timeout ?? 0;

  const onIdle = () => {
    logout();
  };

  const timeout = Math.max(timeoutPreference, MINIMUM_TIMEOUT);

  const idleTimer = useIdleTimer({
    onIdle,
    // The overall timeout should equal the value from user preferences.
    // Overall timeout = timeout + promptTimeout
    timeout: timeout - PROMPT_TIMEOUT_IN_MS,
    promptTimeout: PROMPT_TIMEOUT_IN_MS,
    stopOnIdle: true,
    crossTab: true,
    // Disable the timeout if the user has no preference set
    startManually: timeoutPreference === 0,
  });

  const [remainingTime, setRemainingTime] = React.useState<number>(0);
  const getRemainingTime = idleTimer.getRemainingTime;
  React.useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(getRemainingTime());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [idleTimer.isIdle, getRemainingTime]);

  // @TODO: Humanize these duration format.
  const formattedTimeRemaining = Duration.fromMillis(remainingTime).toFormat(
    'mm:ss'
  );

  return (
    <ConfirmationDialog
      title="Idle Session"
      open={idleTimer.isPrompted()}
      onClose={() => {
        idleTimer.reset();
      }}
      actions={
        <ActionsPanel style={{ padding: 0 }}>
          <Button buttonType="secondary" onClick={logout}>
            Log Out
          </Button>
          <Button
            buttonType="primary"
            onClick={() => {
              idleTimer.reset();
            }}
          >
            Stay Logged In
          </Button>
        </ActionsPanel>
      }
    >
      <Typography>
        You will be logged out due to inactivity in {formattedTimeRemaining}{' '}
        minutes.{' '}
      </Typography>
    </ConfirmationDialog>
  );
};

export default IdleSessionTimer;
