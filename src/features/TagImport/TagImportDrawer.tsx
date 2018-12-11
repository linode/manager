import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

// import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { isEmpty, pathOr } from 'ramda';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { close as _close } from 'src/store/reducers/tagImportDrawer'

import DisplayGroupList from './DisplayGroupList';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface StateProps {
  open: boolean;
  loading: boolean;
  errors: string[];
}

interface DispatchProps {
  actions: {
    close: () => void;
  }
}

type CombinedProps = StateProps
  & DispatchProps
  & WithStyles<ClassNames>;

const TagImportDrawer: React.StatelessComponent<CombinedProps> = (props) => {
  const { actions: { close }, errors, loading, open } = props;
  return (
    <Drawer
        title="Import Display Groups to Tags"
        open={open}
        onClose={close}
      >
        <Grid container direction={'column'} >
          <Grid item>
            <Typography variant="body1">
             This will import Display Groups from Classic Manager and convert them
             to tags. <strong>Your existing tags will not be affected.</strong>
            </Typography>
          </Grid>
          {!isEmpty(errors) &&
            <Grid item>
              <Notice error spacingBottom={0} >
                Failure!
              </Notice>
            </Grid>
          }
          <Grid item data-qa-linode-group-list>
            <DisplayGroupList entity="Linode" groups={["group1", "group2"]} />
          </Grid>
          <Grid item data-qa-domain-group-list>
            <DisplayGroupList entity="Domain" groups={["group1", "group2"]} />
          </Grid>
          <Grid item>
            <ActionsPanel style={{ marginTop: 16 }} >
              <Button
                onClick={() => null}
                loading={loading}
                type="primary"
                data-qa-submit
              >
                Import
              </Button>
              <Button
                onClick={close}
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
};

const mapStateToProps = (state: ApplicationState, ownProps: CombinedProps) => {
  return ({
    open: pathOr(false, ['tagImportDrawer', 'open'], state),
    loading: pathOr(false, ['tagImportDrawer', 'loading'], state),
    errors: pathOr([], ['tagImportDrawer', 'errors'], state)
  });
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch, ownProps) => {
  return {
    actions: {
      close: () => dispatch(_close()),
    }
  };
};


const connected = connect(mapStateToProps, mapDispatchToProps)

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  styled,
  connected,
)(TagImportDrawer);

export default enhanced;
