import { withSnackbar, WithSnackbarProps } from 'notistack';
import {
  compose as _compose,
  isEmpty,
  isNil,
  map,
  pathOr,
  reject,
  sort,
  uniq
} from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { ApplicationState } from 'src/store';
import getEntitiesWithGroupsToImport, {
  emptyGroupedEntities,
  GroupedEntitiesForImport,
  GroupImportProps
} from 'src/store/selectors/getEntitiesWithGroupsToImport';
import {
  addTagsToEntities,
  closeGroupDrawer as _close,
  handleReset,
  TagError
} from 'src/store/tagImportDrawer';
import { ThunkDispatch } from 'src/store/types';
import { sendImportDisplayGroupSubmitEvent } from 'src/utilities/ga';
import { sortAlphabetically } from 'src/utilities/sort-by';
import { storage } from 'src/utilities/storage';
import DisplayGroupList from './DisplayGroupList';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
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
  };
}

type CombinedProps = StateProps &
  DispatchProps &
  WithSnackbarProps &
  WithStyles<ClassNames>;

export const getGroupImportList = (entities: GroupImportProps[]) => {
  const importList: any = _compose(
    sort(sortAlphabetically),
    uniq, // Only return each group once
    reject(isNil), // No undefined/null results
    map((entity: GroupImportProps) => entity.group) // Extract group from GIP object
  )(entities);
  return importList;
};

export const TagImportDrawer: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    actions: { close, update },
    entitiesWithGroupsToImport: { linodes, domains },
    errors,
    loading,
    open
  } = props;

  const handleSubmit = () => {
    // Send event to GA
    sendImportDisplayGroupSubmitEvent(
      createLabel(linodes.length, domains.length),
      linodes.length + domains.length
    );
    // Add tags to entities (Redux action)
    update();
  };

  const linodeGroups = getGroupImportList(linodes);
  const domainGroups = getGroupImportList(domains);
  return (
    <Drawer title="Import Display Groups as Tags" open={open} onClose={close}>
      <Grid container direction={'column'}>
        <Grid item>
          <Typography variant="body1" data-qa-group-body>
            You now have the ability to import your Display Groups from Classic
            Manager as tags and they will be associated with your Linodes and
            Domains. This will give you the ability to organize and view your
            Linodes and Domains by tags.{' '}
            <strong>Your existing tags will not be affected.</strong>
          </Typography>
        </Grid>
        {!isEmpty(errors) &&
          errors.map((error, idx: number) => (
            <Grid key={`tag-error-notice-${idx}`} item data-qa-import-error>
              <Notice error spacingBottom={0}>
                {error.entityLabel
                  ? `Error adding tag to ${error.entityLabel}: ${error.reason}`
                  : error.reason}
              </Notice>
            </Grid>
          ))}
        <Grid item data-qa-linode-group-list>
          <DisplayGroupList entity="Linode" groups={linodeGroups} />
        </Grid>
        <Grid item data-qa-domain-group-list>
          <DisplayGroupList entity="Domain" groups={domainGroups} />
        </Grid>
        <Grid item>
          <ActionsPanel style={{ marginTop: 16 }}>
            <Button
              onClick={handleSubmit}
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
  return {
    open: pathOr(false, ['tagImportDrawer', 'open'], state),
    loading: pathOr(false, ['tagImportDrawer', 'loading'], state),
    errors: pathOr([], ['tagImportDrawer', 'errors'], state),
    success: pathOr(false, ['tagImportDrawer', 'success'], state),
    entitiesWithGroupsToImport: !storage.hasImportedGroups.get()
      ? getEntitiesWithGroupsToImport(state)
      : emptyGroupedEntities
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch,
  ownProps
) => {
  return {
    actions: {
      close: () => dispatch(_close()),
      update: () => dispatch(addTagsToEntities())
    }
  };
};

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

const styled = withStyles(styles);

// Create Label for GA event. Contains the number of Linodes and Domains
// with groups that have been imported. Example: "Linodes: 3; Domains: 0"
export const createLabel = (numLinodes: number, numDomains: number) => {
  // Arbitrary set upper limit – just in case.
  const numLinodesDisplay = numLinodes < 10000 ? String(numLinodes) : '9999+';
  const numDomainsDisplay = numDomains < 10000 ? String(numDomains) : '9999+';

  return `Linodes: ${numLinodesDisplay}; Domains: ${numDomainsDisplay}`;
};

export const withUpdates = lifecycle({
  componentDidUpdate(prevProps: CombinedProps) {
    const {
      actions: { close },
      success,
      enqueueSnackbar
    } = this.props;
    if (!prevProps.success && success) {
      enqueueSnackbar('Your display groups have been imported successfully.', {
        variant: 'success'
      });
      close();
      handleReset();
    }
  }
});

const enhanced = compose<CombinedProps, {}>(
  styled,
  connected,
  withSnackbar,
  withUpdates
)(TagImportDrawer);

export default enhanced;
