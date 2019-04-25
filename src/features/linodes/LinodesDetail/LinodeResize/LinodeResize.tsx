import { withSnackbar, WithSnackbarProps } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SelectionCard from 'src/components/SelectionCard';
import { resetEventsPolling } from 'src/events';
import SelectPlanPanel, {
  ExtendedType
} from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import { linodeInTransition } from 'src/features/linodes/transitions';
import { resizeLinode } from 'src/services/linodes';
import { ApplicationState } from 'src/store';
import { withNotifications } from 'src/store/notification/notification.containers';
import LinodePermissionsError from '../LinodePermissionsError';

type ClassNames = 'root' | 'title' | 'subTitle' | 'currentPlanContainer';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 2
  },
  title: {
    marginBottom: theme.spacing.unit * 2
  },
  subTitle: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit
  },
  currentPlanContainer: {
    '& .selectionCard': {
      padding: `0 ${theme.spacing.unit}px 0 0`,
      cursor: 'not-allowed',
      '& > div, &:focus > div': {
        backgroundColor: theme.bg.main,
        borderColor: theme.color.border2
      }
    }
  }
});

interface LinodeContextProps {
  linodeId: number;
  linodeType: null | string;
  linodeStatus?: Linode.LinodeStatus;
  linodeLabel: string;
  permissions: Linode.GrantLevel;
}

interface State {
  selectedId: string;
  isLoading: boolean;
  errors?: Linode.ApiFieldError[];
}

interface NotificationProps {
  requestNotifications: () => void;
}

type CombinedProps = WithTypesProps &
  RouteComponentProps &
  LinodeContextProps &
  NotificationProps &
  WithStyles<ClassNames> &
  WithSnackbarProps;

export class LinodeResize extends React.Component<CombinedProps, State> {
  state: State = {
    selectedId: '',
    isLoading: false
  };

  static extendType = (type: Linode.LinodeType): ExtendedType => {
    const {
      label,
      memory,
      vcpus,
      disk,
      price: { monthly, hourly }
    } = type;

    return {
      ...type,
      heading: label,
      subHeadings: [
        `$${monthly}/mo ($${hourly}/hr)`,
        typeLabelDetails(memory, disk, vcpus)
      ]
    };
  };

  onSubmit = () => {
    const {
      linodeId,
      enqueueSnackbar,
      requestNotifications,
      history
    } = this.props;
    const { selectedId } = this.state;

    if (!linodeId) {
      return;
    }

    this.setState({ isLoading: true });

    resizeLinode(linodeId, selectedId)
      .then(_ => {
        this.setState({ selectedId: '', isLoading: false });
        resetEventsPolling();
        enqueueSnackbar('Linode queued for resize.', {
          variant: 'info'
        });
        requestNotifications();
        history.push(`/linodes/${linodeId}/summary`);
      })
      .catch(errorResponse => {
        pathOr(
          [{ reason: 'There was an issue resizing your Linode.' }],
          ['response', 'data', 'errors'],
          errorResponse
        ).forEach((err: Linode.ApiFieldError) =>
          enqueueSnackbar(err.reason, {
            variant: 'error'
          })
        );
        this.setState({ selectedId: '', isLoading: false });
      });
  };

  handleSelectPlan = (id: string) => {
    this.setState({ selectedId: id });
  };

  render() {
    const {
      currentTypesData,
      deprecatedTypesData,
      linodeType,
      linodeLabel,
      permissions,
      classes
    } = this.props;
    const type = [...currentTypesData, ...deprecatedTypesData].find(
      t => t.id === linodeType
    );

    const disabled = permissions === 'read_only';

    const currentPlanHeading = linodeType
      ? type
        ? type.label
        : 'Unknown Plan'
      : 'No Assigned Plan';

    const currentPlanSubHeadings = linodeType
      ? type
        ? [
            `$${type.price.monthly}/mo ($${type.price.hourly}/hr)`,
            typeLabelDetails(type.memory, type.disk, type.vcpus)
          ]
        : []
      : [];

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${linodeLabel} - Resize`} />
        <Paper className={classes.root}>
          {disabled && <LinodePermissionsError />}
          <Typography
            role="header"
            variant="h2"
            className={classes.title}
            data-qa-title
          >
            Resize
          </Typography>
          <Typography data-qa-description>
            If you're expecting a temporary burst of traffic to your website, or
            if you're not using your Linode as much as you thought, you can
            temporarily or permanently resize your Linode to a different plan.
          </Typography>
          <div
            className={classes.currentPlanContainer}
            data-qa-current-container
          >
            <Typography
              variant="h3"
              className={classes.subTitle}
              data-qa-current-header
            >
              Current Plan
            </Typography>
            {
              <SelectionCard
                data-qa-current-plan
                checked={false}
                heading={currentPlanHeading}
                subheadings={currentPlanSubHeadings}
                disabled={disabled}
              />
            }
          </div>
        </Paper>
        <SelectPlanPanel
          currentPlanHeading={currentPlanHeading}
          types={this.props.currentTypesData}
          onSelect={this.handleSelectPlan}
          selectedID={this.state.selectedId}
          disabled={disabled}
        />
        <ActionsPanel>
          <Button
            disabled={
              !this.state.selectedId ||
              linodeInTransition(this.props.linodeStatus || '') ||
              disabled
            }
            loading={this.state.isLoading}
            type="primary"
            onClick={this.onSubmit}
            data-qa-submit
          >
            Submit
          </Button>
        </ActionsPanel>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

interface WithTypesProps {
  currentTypesData: ExtendedType[];
  deprecatedTypesData: ExtendedType[];
}

const withTypes = connect((state: ApplicationState, ownProps) => ({
  currentTypesData: state.__resources.types.entities
    .filter(eachType => eachType.successor === null)
    .map(LinodeResize.extendType),

  deprecatedTypesData: state.__resources.types.entities
    .filter(eachType => eachType.successor !== null)
    .map(LinodeResize.extendType)
}));

const linodeContext = withLinodeDetailContext(state => {
  const { linode } = state;
  return {
    linodeId: linode.id,
    linodeType: linode.type,
    linodeStatus: linode.status,
    linodeLabel: linode.label,
    permissions: linode._permissions
  };
});

export default compose<CombinedProps, {}>(
  linodeContext,
  withTypes,
  styled,
  withSnackbar,
  withRouter,
  withNotifications(undefined, ({ requestNotifications }) => ({
    requestNotifications
  }))
)(LinodeResize);
