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

    interface DrawerContentProps {
      title: string;
      children: any;
    }

    const DrawerContent = (props: DrawerContentProps) => (<Drawer
      title={props.title}
      open={open}
      onClose={closeDrawer}
      >
        {props.children}
      </Drawer>
    )

    if (loading) {
      return (
        <DrawerContent title="StackScript">
          <CircleProgress />
        </DrawerContent>
      )
    }

    if (error) {
      return (
        <DrawerContent title="StackScript">
          {error &&
            <Notice error spacingTop={8}>
              Couldn't load StackScript
            </Notice>
          }
        </DrawerContent>
      );
    }

    return (
      <DrawerContent
        title={stackScript ? `${stackScript.username} / ${stackScript.label}`: 'StackScript'}
      >
        {stackScript && <StackScript data={stackScript} />}
        </DrawerContent>
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
