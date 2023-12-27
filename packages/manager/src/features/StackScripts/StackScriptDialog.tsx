import { StackScript, getStackScript } from '@linode/api-v4/lib/stackscripts';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';

import { CircleProgress } from 'src/components/CircleProgress';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Notice } from 'src/components/Notice/Notice';
import { StackScript as _StackScript } from 'src/components/StackScript/StackScript';
import { ApplicationState } from 'src/store';
import { closeStackScriptDialog } from 'src/store/stackScriptDialog';
import { MapState } from 'src/store/types';

interface DispatchProps {
  closeDrawer: () => void;
}

interface Props {
  open: boolean;
  stackScriptId?: number;
}

type CombinedProps = DispatchProps & Props;

export const StackScriptDialog = (props: CombinedProps) => {
  const { closeDrawer, open, stackScriptId } = props;

  const [stackScript, setStackScript] = React.useState<StackScript | undefined>(
    undefined
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(true);

  const title = stackScript
    ? `${stackScript.username} / ${stackScript.label}`
    : 'StackScript';

  React.useEffect(() => {
    if (stackScriptId) {
      setLoading(true);
      getStackScript(stackScriptId)
        .then((stackScript) => {
          setStackScript(stackScript);
          setLoading(false);
          setError(false);
        })
        .catch(() => {
          setLoading(false);
          setError(true);
        });
    }
  }, [stackScriptId]);

  return (
    <Dialog
      fullHeight
      fullWidth
      maxWidth="md"
      onClose={closeDrawer}
      open={open}
      title={title}
    >
      {loading ? (
        <CircleProgress />
      ) : (
        <>
          {error && (
            <Notice
              text="There was an error loading this StackScript."
              variant="error"
            />
          )}
          {stackScript && (
            <_StackScript data={stackScript} userCanModify={false} />
          )}
        </>
      )}
    </Dialog>
  );
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch
) => {
  return {
    closeDrawer: () => dispatch(closeStackScriptDialog()),
  };
};

const mapStateToProps: MapState<Props, {}> = (state: ApplicationState) => ({
  open: pathOr(false, ['stackScriptDialog', 'open'], state),
  stackScriptId: path(['stackScriptDialog', 'stackScriptId'], state),
});

export default connect(mapStateToProps, mapDispatchToProps)(StackScriptDialog);
