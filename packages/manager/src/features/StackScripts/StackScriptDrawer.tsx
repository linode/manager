import { getStackScript, StackScript } from 'linode-js-sdk/lib/stackscripts';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import Drawer from 'src/components/Drawer';
import DrawerContent from 'src/components/DrawerContent';
import _StackScript from 'src/components/StackScript';
import { ApplicationState } from 'src/store';
import { closeStackScriptDrawer } from 'src/store/stackScriptDrawer';
import { MapState } from 'src/store/types';

interface State {
  stackScript?: StackScript;
  error: boolean;
  loading: boolean;
}

interface DispatchProps {
  closeDrawer: () => void;
}

interface Props {
  open: boolean;
  stackScriptId?: number;
}

type CombinedProps = DispatchProps & Props;

export class StackScriptDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    loading: false,
    error: false
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { stackScriptId } = this.props;

    if (stackScriptId && !prevProps.open && this.props.open) {
      this.setState({ loading: true, stackScript: undefined });
      getStackScript(stackScriptId)
        .then(stackScript => {
          this.setState({ stackScript, loading: false, error: false });
        })
        .catch(() => {
          this.setState({ error: true, loading: false });
        });
    }
  }

  componentWillUnmount() {
    this.props.closeDrawer();
  }

  render() {
    const { open, closeDrawer } = this.props;
    const { stackScript, error, loading } = this.state;
    const title = stackScript
      ? `${stackScript.username} / ${stackScript.label}`
      : 'StackScript';

    return (
      <Drawer title={title} open={open} onClose={closeDrawer}>
        <DrawerContent title={title} error={error} loading={loading}>
          {stackScript && <_StackScript data={stackScript} />}
        </DrawerContent>
      </Drawer>
    );
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch,
  ownProps
) => {
  return {
    closeDrawer: () => dispatch(closeStackScriptDrawer())
  };
};

const mapStateToProps: MapState<Props, {}> = (state: ApplicationState) => ({
  open: pathOr(false, ['stackScriptDrawer', 'open'], state),
  stackScriptId: path(['stackScriptDrawer', 'stackScriptId'], state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StackScriptDrawer);
