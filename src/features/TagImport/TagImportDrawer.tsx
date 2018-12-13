import { compose as _compose, defaultTo, map, uniq } from 'ramda';
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
import {
  addTagsToEntities,
  closeGroupDrawer as _close,
} from 'src/store/reducers/tagImportDrawer'
import getEntitiesWithGroupsToImport,
  {
    GroupedEntitiesForImport,
    GroupImportProps,
  } from 'src/store/selectors/getEntitiesWithGroupsToImport';


import DisplayGroupList from './DisplayGroupList';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface StateProps {
  open: boolean;
  loading: boolean;
  success: boolean;
  errors: string[];
  entitiesWithGroupsToImport: GroupedEntitiesForImport;
}

interface DispatchProps {
  actions: {
    close: () => void;
    update: () => void;
  }
}

type CombinedProps = StateProps
  & DispatchProps
  & WithStyles<ClassNames>;

export const getGroupImportList = (entities: GroupImportProps[]) => {
  const importList: any = _compose(
    defaultTo([]),         // Always return something
    uniq,                  // Only return each group once
    map((entity: GroupImportProps) => entity.group) // Extract group from GIP object
  )(entities);
  return importList;
}

const TagImportDrawer: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    actions: { close, update },
    entitiesWithGroupsToImport: { linodes }, // { linodes, domains } after Domains are available
    errors,
    loading,
    open,
    success
  } = props;

  const linodeGroups = getGroupImportList(linodes);
  // const domainGroups = getGroupImportList(domains);
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
                There was an error importing your display groups.
              </Notice>
            </Grid>
          }
          {success &&
            <Grid item>
              <Notice success spacingBottom={0} >
                Your display groups have been imported successfully.
              </Notice>
            </Grid>
          }
          <Grid item data-qa-linode-group-list>
            <DisplayGroupList entity="Linode" groups={linodeGroups} />
          </Grid>
          {/* @todo add when Domains have been cached in Redux */}
          {/* <Grid item data-qa-domain-group-list>
            <DisplayGroupList entity="Domain" groups={["group1", "group2"]} />
          </Grid>*/}
          <Grid item>
            <ActionsPanel style={{ marginTop: 16 }} >
              <Button
                onClick={update}
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
    errors: pathOr([], ['tagImportDrawer', 'errors'], state),
    success: pathOr(false, ['tagImportDrawer', 'success'], state),
    entitiesWithGroupsToImport: getEntitiesWithGroupsToImport(state),
  });
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch, ownProps) => {
  return {
    actions: {
      close: () => dispatch(_close()),
      update: () => dispatch(addTagsToEntities()),
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
