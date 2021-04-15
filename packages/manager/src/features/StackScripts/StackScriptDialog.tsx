import { getStackScript, StackScript } from '@linode/api-v4/lib/stackscripts';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import CircleProgress from 'src/components/CircleProgress';
import Dialog from 'src/components/Dialog';
import Notice from 'src/components/Notice';
import _StackScript from 'src/components/StackScript';
import { ApplicationState } from 'src/store';
import { closeStackScriptDialog } from 'src/store/stackScriptDialog';
import { MapState } from 'src/store/types';

interface DispatchProps {
  closeDrawer: () => void;
}

interface Props {
  stackScriptId?: number;
  open: boolean;
}

type CombinedProps = DispatchProps & Props;

export const StackScriptDialog: React.FC<CombinedProps> = (props) => {
  const { stackScriptId, open, closeDrawer } = props;

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
      title={title}
      open={open}
      onClose={closeDrawer}
      fullWidth
      fullHeight
      maxWidth="md"
    >
      {loading ? (
        <CircleProgress />
      ) : (
        <>
          {error && (
            <Notice error text="There was an error loading this StackScript." />
          )}
          {stackScript && <_StackScript data={stackScript} />}
        </>
      )}
    </Dialog>
  );
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch,
  ownProps
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
