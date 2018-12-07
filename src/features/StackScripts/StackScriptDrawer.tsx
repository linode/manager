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

  closeDrawer = () => {
    this.props.closeDrawer();
  }


  render() {
    const { open } = this.props;
    const { stackScript, error, loading } = this.state;

    if (loading) {
      return (
        <Drawer
          title={'StackScript'}
          open={open}
          onClose={this.closeDrawer}
        >
          <CircleProgress />
        </Drawer>
      );
    }

    if (error) {
      return (
        <Drawer
          title={'StackScript'}
          open={open}
          onClose={this.closeDrawer}
        >
          {error &&
            <Notice error spacingTop={8}>
              Couldn't load StackScript
            </Notice>
          }
        </Drawer>
      );
    }

    return (
      <Drawer
        title={stackScript ? `${stackScript.username} / ${stackScript.label}`: 'StackScript'}
        open={open}
        onClose={this.closeDrawer}
      >
        {stackScript && <StackScript data={stackScript} />}
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
