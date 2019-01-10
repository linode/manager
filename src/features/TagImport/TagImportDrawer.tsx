import { compose as _compose, isNil, map, reject, sort, uniq } from 'ramda';
import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { isEmpty, pathOr } from 'ramda';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import {
  addTagsToEntities,
  closeGroupDrawer as _close,
  handleReset,
} from 'src/store/reducers/tagImportDrawer'
import getEntitiesWithGroupsToImport,
  {
    emptyGroupedEntities,
    GroupedEntitiesForImport,
    GroupImportProps,
  } from 'src/store/selectors/getEntitiesWithGroupsToImport';


import { sortAlphabetically } from 'src/utilities/sort-by';
import { storage } from 'src/utilities/storage';
import DisplayGroupList from './DisplayGroupList';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface StateProps {
  open: boolean;
  loading: boolean;
  success: boolean;
  errors: TagError[];
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
  & InjectedNotistackProps
  & WithStyles<ClassNames>;


export const getGroupImportList = (entities: GroupImportProps[]) => {
  const importList: any = _compose(
    sort(sortAlphabetically),
    uniq,                                           // Only return each group once
    reject(isNil),                                  // No undefined/null results
    map((entity: GroupImportProps) => entity.group) // Extract group from GIP object
  )(entities);
  return importList;
}

export const TagImportDrawer: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    actions: { close, update },
    entitiesWithGroupsToImport: { linodes, domains },
    errors,
    loading,
    open,
  } = props;

  const linodeGroups = getGroupImportList(linodes);
  const domainGroups = getGroupImportList(domains);
  return (
    <Drawer
        title="Import Display Groups as Tags"
        open={open}
        onClose={close}
      >
        <Grid container direction={'column'} >
          <Grid item>
            <Typography variant="body1" data-qa-group-body>
              You now have the ability to import your Display Groups from Classic Manager as tags and they will be associated with your Domains and Linodes. This will give you the ability to organize and view your Domains and Linodes by tags. <strong>Your existing tags will not be affected.</strong>
            </Typography>
          </Grid>
          {!isEmpty(errors) && errors.map((error, idx: number) =>
            <Grid key={`tag-error-notice-${idx}`} item data-qa-import-error>
              <Notice error spacingBottom={0} >
                {error.entityLabel
                  ? `Error adding tag to ${error.entityLabel}: ${error.reason}`
                  : error.reason
                }
              </Notice>
            </Grid>
          )}
          <Grid item data-qa-linode-group-list>
            <DisplayGroupList entity="Linode" groups={linodeGroups} />
          </Grid>
          <Grid item data-qa-domain-group-list>
            <DisplayGroupList entity="Domain" groups={domainGroups} />
          </Grid>
          <Grid item>
            <ActionsPanel style={{ marginTop: 16 }} >
              <Button
                onClick={update}
                loading={loading}
                type="primary"
                data-qa-submit
              >
                Import Display Groups Now
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
    entitiesWithGroupsToImport: (
      !storage.hasImportedGroups.get()
        ? getEntitiesWithGroupsToImport(state)
        : emptyGroupedEntities),
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

const withUpdates = lifecycle({
  componentDidUpdate(prevProps: CombinedProps) {
    const { actions: { close }, success, enqueueSnackbar } = this.props;
    if (!prevProps.success && success) {
      enqueueSnackbar(
        'Your display groups have been imported successfully.',
        {variant: 'success'}
      );
      close();
      handleReset();
    }
  }
})

const enhanced = compose<CombinedProps, {}>(
  styled,
  connected,
  withSnackbar,
  withUpdates,
)(TagImportDrawer);

export default enhanced;
