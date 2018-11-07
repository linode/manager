import { compose, isEmpty, path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, } from 'react-redux';


import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import DisplayPrice from 'src/components/DisplayPrice';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { withTypes } from 'src/context/types';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import {
  enableAllBackups,
  handleClose,
  handleResetError,
  handleResetSuccess,
  requestLinodesWithoutBackups,
} from 'src/store/reducers/backupDrawer';
import { clearSidebar } from 'src/store/reducers/sidebar';
import { getTypeInfo } from 'src/utilities/typesHelpers';

// import AutoEnroll from './AutoEnroll';
import BackupsTable from './BackupsTable';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

export interface LinodeWithTypeInfo extends Linode.Linode {
  typeInfo?: Linode.LinodeType;
}

export interface ExtendedLinode extends LinodeWithTypeInfo {
  linodeError?: BackupError;
}

interface TypesContextProps {
  typesLoading: boolean;
  typesData: Linode.LinodeType[];
}

interface DispatchProps {
  actions: {
    enable: () => void;
    getLinodesWithoutBackups: () => void;
    close: () => void;
    dismissError: () => void;
    dismissSuccess: () => void;
    clearSidebar: () => void;
  },
}

interface StateProps {
  open: boolean;
  loading: boolean;
  enabling: boolean;
  backupLoadError: string;
  linodesWithBackups: ExtendedLinode[];
  backupsLoading: boolean;
  enableSuccess: boolean;
  enableErrors?: string;
}

interface State {
  backupsToggle: boolean;
}

type CombinedProps = DispatchProps
  & StateProps
  & TypesContextProps
  & WithStyles<ClassNames>;

class BackupDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    backupsToggle: false,
  };

  componentDidMount() {
    this.props.actions.getLinodesWithoutBackups();
  }

  componentDidUpdate() {
    const { close, dismissSuccess } = this.props.actions;
    const { enableSuccess } = this.props;

    if (enableSuccess) {
      sendToast(
        'All of your Linodes have been enrolled in automatic backups.',
        'success'
      );
      dismissSuccess();
      close();
      this.props.actions.clearSidebar();
    }
  }

  toggleBackups = () => {
    this.setState({ backupsToggle: !this.state.backupsToggle });
  }

  getTotalPrice = (linodes: LinodeWithTypeInfo[]) => {
    return linodes.reduce((prevValue: number, linode: LinodeWithTypeInfo) => {
      return prevValue + pathOr(0, ['typeInfo','addons','backups','price','monthly'], linode);
    }, 0)
  }

  handleSubmit = () => {
    const { enable } = this.props.actions;
    enable()
  }

  render() {
    const { actions: { close }, enableErrors, enabling, linodesWithBackups, loading } = this.props;
    // const { backupsToggle } = this.state;
    const linodeCount = linodesWithBackups.length;
    return (
      <Drawer
        title="Enable All Backups"
        open={this.props.open}
      >
        <Grid container direction={'column'} >
          <Grid item>
            <Typography variant="body1">
              Three backup slots are executed and rotated automatically: a daily backup,
              a 2-7 day old backup, and an 8-14 day old backup. Confirm to add backups
              to <strong>{linodeCount}</strong> {linodeCount > 1 ? 'Linodes' : 'Linode'}.
            </Typography>
          </Grid>
          {!isEmpty(enableErrors) &&
            <Grid item>
              <Notice error>There was an error enabling backups for some of your Linodes.</Notice>
            </Grid>
          }
          <Grid item>
            <BackupsTable linodes={linodesWithBackups} loading={loading} />
          </Grid>
          <Grid item>
            <DisplayPrice price={this.getTotalPrice(linodesWithBackups)} />
          </Grid>
          {/* <Grid item>
            <AutoEnroll
              enabled={backupsToggle}
              toggle={this.toggleBackups}
            />
          </Grid> */}
          <Grid item>
            <ActionsPanel style={{ marginTop: 16 }} >
              <Button
                onClick={this.handleSubmit}
                loading={loading || enabling}
                type="primary"
                data-qa-submit
              >
                Confirm
              </Button>
              <Button
                onClick={close}
                variant="raised"
                type="secondary"
                className="cancel"
                data-qa-cancel
              >
                Cancel
              </Button>
            </ActionsPanel>
          </Grid>
        </Grid>
      </Drawer>
    );
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch, ownProps) => {
  return {
    actions: {
      enable: () => dispatch(enableAllBackups()),
      getLinodesWithoutBackups: () => dispatch(requestLinodesWithoutBackups()),
      close: () => dispatch(handleClose()),
      dismissError: () => dispatch(handleResetError()),
      dismissSuccess: () => dispatch(handleResetSuccess()),
      clearSidebar: () => dispatch(clearSidebar())
    }
  };
};

const addTypeInfo = (types: Linode.LinodeType[], linodes: Linode.Linode[]) =>
  linodes.map((linode) => {
    const typeInfo = getTypeInfo(linode.type, types || []);
    return {
      ...linode,
      typeInfo,
    }
  });

const addErrors = (errors: BackupError[], linodes: LinodeWithTypeInfo[]) =>
  linodes.map((linode: LinodeWithTypeInfo) => {
    const linodeError = errors.find((error) => Number(error.linodeId) === Number(linode.id));
    return {
      ...linode,
      linodeError,
    }
  });

  /* Add type and error info to each Linode, so that it's available when rendering each Linode later */
  const enhanceLinodes = (linodes: Linode.Linode[], errors: BackupError[], types: Linode.LinodeType[]) => {
    const linodesWithTypes = addTypeInfo(types, linodes);
    return addErrors(errors, linodesWithTypes);
  }

const mapStateToProps = (state: ApplicationState, ownProps: CombinedProps) => {
  const enableErrors = pathOr([], ['backups','enableErrors'], state);
  const linodes = pathOr([], ['backups','data'], state);
  return ({
    backupLoadError: path(['backups','error'], state),
    backupsLoading: path(['backups','loading'], state),
    enableErrors,
    enableSuccess: path(['backups','enableSuccess'], state),
    open: path(['backups','open'], state),
    loading: pathOr(false, ['backups','loading'], state),
    enabling: pathOr(false, ['backups','enabling'], state),
    linodesWithBackups: enhanceLinodes(linodes, enableErrors, ownProps.typesData),
  })
};

const connected = connect(mapStateToProps, mapDispatchToProps);

const styled = withStyles(styles, { withTheme: true });

const typesContext = withTypes(({ data: typesData, loading: typesLoading }) => ({
  typesData,
  typesLoading,
}));

const enhanced: any = compose(
  styled,
  typesContext,
  connected,
);

export default enhanced(BackupDrawer);
