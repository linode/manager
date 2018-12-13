import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SelectionCard from 'src/components/SelectionCard';
import { resetEventsPolling } from 'src/events';
import SelectPlanPanel, { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { withLinode } from 'src/features/linodes/LinodesDetail/context';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import { linodeInTransition } from 'src/features/linodes/transitions';
import { resizeLinode } from 'src/services/linodes';

type ClassNames = 'root'
  | 'title'
  | 'subTitle'
  | 'currentPlanContainer';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 2,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  subTitle: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit,
  },
  currentPlanContainer: {
    '& .selectionCard': {
      padding: `0 ${theme.spacing.unit}px 0 0`,
      cursor: 'not-allowed',
      '& > div, &:focus > div': {
        backgroundColor: theme.bg.main,
        borderColor: theme.color.border2,
      },
    },
  },
});

interface LinodeContextProps {
  linodeId: number;
  linodeType: null | string;
  linodeStatus?: Linode.LinodeStatus;
  linodeLabel: string;
}

interface State {
  selectedId: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps =
  & WithTypesProps
  & LinodeContextProps
  & WithStyles<ClassNames>
  & InjectedNotistackProps;

export class LinodeResize extends React.Component<CombinedProps, State> {
  state: State = {
    selectedId: '',
  };

  static extendType = (type: Linode.LinodeType): ExtendedType => {
    const {
      label,
      memory,
      vcpus,
      disk,
      price: { monthly, hourly },
    } = type;

    return ({
      ...type,
      heading: label,
      subHeadings: [
        `$${monthly}/mo ($${hourly}/hr)`,
        typeLabelDetails(memory, disk, vcpus),
      ],
    });
  }

  onSubmit = () => {
    const { linodeId, enqueueSnackbar } = this.props;
    const { selectedId } = this.state;

    if (!linodeId) { return; }

    resizeLinode(linodeId, selectedId)
      .then((response) => {
        enqueueSnackbar('Linode resize started.', {
          variant: 'info'
        });
        this.setState({ selectedId: '' });
        resetEventsPolling();
      })
      .catch((errorResponse) => {
        pathOr(
          [{ reason: 'There was an issue resizing your Linode.' }],
          ['response', 'data', 'errors'],
          errorResponse
        )
          .forEach((err: Linode.ApiFieldError) => enqueueSnackbar(err.reason, {
            variant: 'error'
          }));
        this.setState({ selectedId: '' });
      });
  }

  handleSelectPlan = (id: string) => {
    this.setState({ selectedId: id });
  }

  render() {
    const { currentTypesData, deprecatedTypesData, linodeType, linodeLabel, classes } = this.props;
    const type = [...currentTypesData, ...deprecatedTypesData].find(t => t.id === linodeType);

    const currentPlanHeading = linodeType
      ? type
        ? type.label
        : 'Unknown Plan'
      : 'No Assigned Plan';

    const currentPlanSubHeadings = linodeType
      ? type
        ? [
          `$${type.price.monthly}/mo ($${type.price.hourly}/hr)`,
          typeLabelDetails(type.memory, type.disk, type.vcpus),
        ]
        : []
      : [];

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${linodeLabel} - Resize`} />
        <Paper className={classes.root}>
          <Typography
            role="header"
            variant="h2"
            className={classes.title}
            data-qa-title
          >
            Resize
          </Typography>
          <Typography data-qa-description>
            If you're expecting a temporary burst of traffic to your website,
            or if you're not using your Linode as much as you thought,
            you can temporarily or permanently resize your Linode
            to a different plan.
          </Typography>
          <div className={classes.currentPlanContainer} data-qa-current-container>
            <Typography
              role="header"
              variant="h3"
              className={classes.subTitle}
              data-qa-current-header
            >
              Current Plan
            </Typography>
            {<SelectionCard
              data-qa-current-plan
              checked={false}
              heading={currentPlanHeading}
              subheadings={currentPlanSubHeadings}
            />}
          </div>
        </Paper>
        <SelectPlanPanel
          currentPlanHeading={currentPlanHeading}
          types={this.props.currentTypesData}
          onSelect={this.handleSelectPlan}
          selectedID={this.state.selectedId}
        />
        <ActionsPanel>
          <Button
            disabled={!this.state.selectedId || linodeInTransition(this.props.linodeStatus || '')}
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
    .filter((eachType) => eachType.successor === null)
    .map(LinodeResize.extendType),

  deprecatedTypesData: state.__resources.types.entities
    .filter((eachType) => eachType.successor !== null)
    .map(LinodeResize.extendType),

}));

const linodeContext = withLinode((context) => ({
  linodeId: pathOr(undefined, ['data', 'id'], context),
  linodeType: pathOr(undefined, ['data', 'type'], context),
  linodeStatus: pathOr(undefined, ['data', 'status'], context),
  linodeLabel: pathOr(undefined, ['data', 'label'], context),
}));

export default compose<CombinedProps, {}>(
  linodeContext,
  withTypes,
  styled,
  withSnackbar
)(LinodeResize);
