import { compose, path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, } from 'react-redux';


import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import DisplayPrice from 'src/components/DisplayPrice';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import { withTypes } from 'src/context/types';
import { requestLinodesWithoutBackups } from 'src/store/reducers/backupDrawer';
import { getTypeInfo } from 'src/utilities/typesHelpers';

import BackupsTable from './BackupsTable';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

export interface LinodeWithTypeInfo extends Linode.Linode {
  typeInfo: Linode.LinodeType;
}

interface Props {}

interface TypesContextProps {
  typesLoading: boolean;
  typesData: Linode.LinodeType[];
}

interface DispatchProps {
  actions: {
    getLinodesWithBackups: () => void;
  },
}

interface StateProps {
  backupLoadError: string;
  linodesWithBackups: LinodeWithTypeInfo[];
  backupsLoading: boolean;
}

interface State {
  backupsToggle: boolean;
}

type CombinedProps = Props
  & DispatchProps
  & StateProps
  & TypesContextProps
  & WithStyles<ClassNames>;

class BackupDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    backupsToggle: false,
  };

  componentDidMount() {
    this.props.actions.getLinodesWithBackups();
  }

  getTotalPrice = (linodes: LinodeWithTypeInfo[]) => {
    return linodes.reduce((prevValue: number, linode: LinodeWithTypeInfo) => {
      return prevValue + pathOr(0, ['typeInfo','addons','backups','price','monthly'], linode);
    }, 0)
  }

  render() {
    const { linodesWithBackups } = this.props;
    const linodeCount = linodesWithBackups.length;
    return (
      <Drawer
        title="Enable All Backups"
        open={true}
      >
        <Grid container direction={'column'} >
          <Grid item>
            <Typography variant="body1">
              Three backup slots are executed and rotated automatically: a daily backup,
              a 2-7 day old backup, and an 8-14 day old backup. Confirm to add backups
              to <strong>{linodeCount}</strong> {linodeCount > 1 ? 'Linodes' : 'Linode'}.
            </Typography>
          </Grid>
          <Grid item>
            <BackupsTable linodes={linodesWithBackups} />
          </Grid>
          <Grid item>
            <DisplayPrice price={this.getTotalPrice(linodesWithBackups)} />
          </Grid>
          <Grid item>
            <ActionsPanel style={{ marginTop: 16 }} >
              <Button
                onClick={() => null}
                disabled={false}
                type="primary"
                data-qa-submit
              >
                Confirm
              </Button>
              <Button
                onClick={() => null}
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

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (dispatch, ownProps) => {
  return {
    actions: {
      getLinodesWithBackups: () => dispatch(requestLinodesWithoutBackups()),
    }
  };
};

const addTypeInfo = (linodes: Linode.Linode[] = [], types: Linode.LinodeType[] = []) =>
  linodes.map((linode) => {
    const typeInfo = getTypeInfo(linode.type, types || []);
    return {
      ...linode,
      typeInfo,
    }
  });

const mapStateToProps = (state: ApplicationState, ownProps: CombinedProps) => ({
  backupLoadError: path(['backups','error'], state),
  linodesWithBackups: addTypeInfo(path(['backups','data'], state), ownProps.typesData),
  backupsLoading: path(['backups','loading'], state)
});

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
