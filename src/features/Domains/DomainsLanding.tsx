import { InjectedNotistackProps, withSnackbar } from 'notistack';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import FormControlLabel from 'src/components/core/FormControlLabel';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Placeholder from 'src/components/Placeholder';
import Toggle from 'src/components/Toggle';
import domainsContainer, {
  Props as WithDomainsProps
} from 'src/containers/domains.container';
import localStorageContainer from 'src/containers/localStorage.container';
import { Domains } from 'src/documentation';
import ListDomains from 'src/features/Domains/ListDomains';
import ListGroupedDomains from 'src/features/Domains/ListGroupedDomains';
import { openForCloning, openForCreating } from 'src/store/domainDrawer';
import {
  DomainActionsProps,
  withDomainActions
} from 'src/store/domains/domains.container';
import { sendEvent } from 'src/utilities/analytics';
import DomainZoneImportDrawer from './DomainZoneImportDrawer';

type ClassNames =
  | 'root'
  | 'titleWrapper'
  | 'title'
  | 'domain'
  | 'tagWrapper'
  | 'tagGroup';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  titleWrapper: {
    flex: 1
  },
  title: {
    marginBottom: theme.spacing.unit + theme.spacing.unit / 2
  },
  domain: {
    width: '60%'
  },
  tagWrapper: {
    marginTop: theme.spacing.unit / 2,
    '& [class*="MuiChip"]': {
      cursor: 'pointer'
    }
  },
  tagGroup: {
    flexDirection: 'row-reverse',
    marginBottom: theme.spacing.unit
  }
});

interface State {
  importDrawer: {
    open: boolean;
    submitting: boolean;
    errors?: Linode.ApiFieldError[];
    domain?: string;
    remote_nameserver?: string;
  };
  createDrawer: {
    open: boolean;
    mode: 'clone' | 'create';
    domain?: string;
    cloneID?: number;
  };
  removeDialog: {
    open: boolean;
    domain?: string;
    domainID?: number;
  };
}

type CombinedProps = WithDomainsProps &
  DomainActionsProps &
  LocalStorageProps &
  WithStyles<ClassNames> &
  RouteComponentProps<{}> &
  DispatchProps &
  InjectedNotistackProps;

class DomainsLanding extends React.Component<CombinedProps, State> {
  static eventCategory = `domains landing`;
  state: State = {
    importDrawer: {
      open: false,
      submitting: false
    },
    createDrawer: {
      open: false,
      mode: 'create'
    },
    removeDialog: {
      open: false
    }
  };

  static docs: Linode.Doc[] = [Domains];

  cancelRequest: Function;

  openImportZoneDrawer = () =>
    this.setState({ importDrawer: { ...this.state.importDrawer, open: true } });

  closeImportZoneDrawer = () =>
    this.setState({
      importDrawer: {
        open: false,
        submitting: false,
        remote_nameserver: undefined,
        domain: undefined,
        errors: undefined
      }
    });

  handleSuccess = (domain: Linode.Domain) => {
    if (domain.id) {
      return this.props.history.push(`/domains/${domain.id}`);
    }
  };

  getActions = () => {
    return (
      <ActionsPanel>
        <Button type="cancel" onClick={this.closeRemoveDialog} data-qa-cancel>
          Cancel
        </Button>
        <Button
          type="secondary"
          destructive
          onClick={this.removeDomain}
          data-qa-submit
        >
          Confirm
        </Button>
      </ActionsPanel>
    );
  };

  removeDomain = () => {
    const {
      removeDialog: { domainID }
    } = this.state;
    const { enqueueSnackbar, domainActions } = this.props;
    if (domainID) {
      // @todo: Replace all "domainID" with "domainId"
      domainActions
        .deleteDomain({ domainId: domainID })
        .then(() => {
          this.closeRemoveDialog();
        })
        .catch(() => {
          this.closeRemoveDialog();
          /** @todo render this error inside the modal */
          enqueueSnackbar('Error when removing domain', {
            variant: 'error'
          });
        });
    } else {
      this.closeRemoveDialog();
      enqueueSnackbar('Error when removing domain', {
        variant: 'error'
      });
    }
  };

  openRemoveDialog = (domain: string, domainID: number) => {
    this.setState({
      removeDialog: { open: true, domain, domainID }
    });
  };

  closeRemoveDialog = () => {
    const { removeDialog } = this.state;
    this.setState({
      removeDialog: { ...removeDialog, open: false }
    });
  };

  render() {
    const { classes } = this.props;
    const { domainsError, domainsData, domainsLoading } = this.props;

    if (domainsLoading) {
      return <RenderLoading />;
    }

    if (domainsError) {
      return <RenderError />;
    }

    if (domainsData.length === 0) {
      return <RenderEmpty onClick={this.props.openForCreating} />;
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Domains" />
        <Grid
          container
          justify="space-between"
          alignItems="flex-end"
          style={{ paddingBottom: 0 }}
        >
          <Grid item className={classes.titleWrapper}>
            <Typography
              role="header"
              variant="h1"
              data-qa-title
              className={classes.title}
            >
              Domains
            </Typography>
          </Grid>
          <Grid item className="p0">
            <FormControlLabel
              className={classes.tagGroup}
              control={
                <Toggle
                  className={this.props.groupByTag ? ' checked' : ' unchecked'}
                  onChange={(e, checked) =>
                    this.props.toggleGroupByTag(checked)
                  }
                  checked={this.props.groupByTag}
                />
              }
              label="Group by Tag:"
            />
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end" style={{ width: 'auto' }}>
              <Grid item className="pt0">
                <AddNewLink
                  onClick={this.openImportZoneDrawer}
                  label="Import a Zone"
                />
              </Grid>
              <Grid item className="pt0">
                <AddNewLink
                  onClick={this.props.openForCreating}
                  label="Add a Domain"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {/* Duplication starts here. How can we refactor this? */}
          <OrderBy data={domainsData} order={'asc'} orderBy={'domain'}>
            {({ data: orderedData, handleOrderChange, order, orderBy }) => {
              const props = {
                orderBy,
                order,
                handleOrderChange,
                data: orderedData,
                onClone: this.props.openForCloning,
                onRemove: this.openRemoveDialog
              };

              return this.props.groupByTag ? (
                <ListGroupedDomains {...props} />
              ) : (
                <ListDomains {...props} />
              );
            }}
          </OrderBy>
        </Grid>
        <DomainZoneImportDrawer
          open={this.state.importDrawer.open}
          onClose={this.closeImportZoneDrawer}
          onSuccess={this.handleSuccess}
        />
        <ConfirmationDialog
          open={this.state.removeDialog.open}
          title={`Remove ${this.state.removeDialog.domain}`}
          onClose={this.closeRemoveDialog}
          actions={this.getActions}
        >
          <Typography>Are you sure you want to remove this domain?</Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
}

const RenderLoading: React.StatelessComponent<{}> = () => {
  return <CircleProgress />;
};

const RenderError: React.StatelessComponent<{}> = () => {
  return (
    <ErrorState errorText="There was an error retrieving your domains. Please reload and try again." />
  );
};

const RenderEmpty: React.StatelessComponent<{
  onClick: () => void;
}> = props => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Domains" />
      <Placeholder
        title="Add a Domain"
        copy="Adding a new domain is easy. Click below to add a domain."
        icon={DomainIcon}
        buttonProps={{
          onClick: props.onClick,
          children: 'Add a Domain'
        }}
      />
    </React.Fragment>
  );
};

const styled = withStyles(styles);

interface DispatchProps {
  openForCloning: (domain: string, cloneId: number) => void;
  openForCreating: () => void;
}

type LocalStorageProps = LocalStorageState & LocalStorageUpdater;

interface LocalStorageState {
  groupByTag: boolean;
}

interface LocalStorageUpdater {
  toggleGroupByTag: (checked: boolean) => Partial<LocalStorageState>;
  [key: string]: (...args: any[]) => Partial<LocalStorageState>;
}

const withLocalStorage = localStorageContainer<
  LocalStorageState,
  LocalStorageUpdater,
  {}
>(
  storage => {
    return {
      groupByTag: storage.groupDomainsByTag.get()
    };
  },
  storage => ({
    toggleGroupByTag: state => (checked: boolean) => {
      storage.groupDomainsByTag.set(checked ? 'true' : 'false');

      sendEvent({
        category: DomainsLanding.eventCategory,
        action: 'group by tag',
        label: String(checked)
      });

      return {
        ...state,
        groupByTag: checked
      };
    }
  })
);

export const connected = connect(
  undefined,
  { openForCreating, openForCloning }
);

export default compose<CombinedProps, {}>(
  setDocs(DomainsLanding.docs),
  domainsContainer,
  withRouter,
  withLocalStorage,
  styled,
  connected,
  withSnackbar,
  withDomainActions
)(DomainsLanding);
