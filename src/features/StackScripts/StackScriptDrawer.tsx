import { path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, Dispatch, MapStateToProps } from 'react-redux';
import { bindActionCreators } from 'redux';
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
  closeStackScriptDrawer: () => void;
}

interface StateProps {
  open: boolean;
  stackScriptId?: number;
}

type Props = DispatchProps & StateProps;

class StackScriptDrawer extends React.Component<Props, State> {

  state: State = {
    loading: true,
    error: false
  };

  componentDidUpdate(prevProps: Props) {
    const { stackScriptId } = this.props;
    const { stackScriptId: prevStackScriptId } = prevProps;

    if (stackScriptId && stackScriptId !== prevStackScriptId) {
      this.setState({ loading: true });
      getStackScript(stackScriptId)
      .then(stackScript => {
        this.setState({ stackScript, loading: false })
      })
      .catch(() => {
        this.setState({ error: true, loading: false })
      })
    }
  }

  closeDrawer = () => {
    this.props.closeStackScriptDrawer();
  }


  render() {
    const { open } = this.props;
    const { stackScript, error, loading } = this.state;

    if (loading) {
      return <CircleProgress />
    }


    return (
      <Drawer
        title={stackScript ? `${stackScript.username} / ${stackScript.label}`: 'StackScript'}
        open={open}
        onClose={this.closeDrawer}
      >
        {error &&
          <Notice error spacingTop={8}>
            Couldn't load StackScript
          </Notice>
        }
        {stackScript && <StackScript data={stackScript} />}
      </Drawer>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  { closeStackScriptDrawer },
  dispatch,
);

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state: ApplicationState) => ({
  open: pathOr(false, ['stackScriptDrawer', 'open'], state),
  stackScriptId: path(['stackScriptDrawer', 'stackScriptId'], state),
});

const connected = connect(mapStateToProps, mapDispatchToProps);

export default connected(StackScriptDrawer)
