import { path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import CircleProgress from 'src/components/CircleProgress';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import StackScript from 'src/components/StackScript';

import { getStackScript } from 'src/services/stackscripts';
import {
  closeStackScriptDrawer,
} from 'src/store/reducers/stackScriptDrawer';

interface State {
  stackScript?: Linode.StackScript.Response,
  error: boolean;
  loading: boolean;
}

interface DispatchProps {
  closeDrawer: () => void;
}

interface StateProps {
  open: boolean;
  stackScriptId?: number;
}

type CombinedProps = DispatchProps
  & StateProps;

class StackScriptDrawer extends React.Component<CombinedProps, State> {

  state: State = {
    loading: true,
    error: false
  };

  componentDidUpdate(prevProps: StateProps) {
    const { stackScriptId } = this.props;
    const { stackScriptId: prevStackScriptId } = prevProps;

    if (stackScriptId && stackScriptId !== prevStackScriptId) {
      this.setState({ loading: true });
      getStackScript(stackScriptId)
      .then(stackScript => {
        this.setState({ stackScript, loading: false, error: false })
      })
      .catch(() => {
        this.setState({ error: true, loading: false })
      })
    }
  }

  render() {
    const { open, closeDrawer } = this.props;
    const { stackScript, error, loading } = this.state;
    const title = stackScript ? `${stackScript.username} / ${stackScript.label}`: 'StackScript';

    const DrawerContent = () => {
      if (loading) {
        return (
          <CircleProgress />
        )
      }

      if (error) {
        return (
          <Notice error spacingTop={8}>
            Couldn't load StackScript
          </Notice>
        );
      }
  
      if (stackScript) {
        return (
          <StackScript data={stackScript} />
        )  
      } else {
        return null;
      }
    }

    return (
      <Drawer
        title={title}
        open={open}
        onClose={closeDrawer}
        >
          {DrawerContent()}
      </Drawer>
    );
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch, ownProps) => {
  return {
    closeDrawer: () => dispatch(closeStackScriptDrawer()),
  };
};

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state: ApplicationState) => ({
  open: pathOr(false, ['stackScriptDrawer', 'open'], state),
  stackScriptId: path(['stackScriptDrawer', 'stackScriptId'], state),
});

export default connect(mapStateToProps, mapDispatchToProps)(StackScriptDrawer);
