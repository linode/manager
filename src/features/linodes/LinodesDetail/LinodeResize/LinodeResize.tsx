import * as React from 'react';

import { compose, pathOr } from 'ramda';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import SelectionCard from 'src/components/SelectionCard';
import SelectPlanPanel, { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';

import ActionsPanel from 'src/components/ActionsPanel';
import PromiseLoader from 'src/components/PromiseLoader';

import { getLinodeTypes, resizeLinode } from 'src/services/linodes';

import { resetEventsPolling } from 'src/events';

import { typeLabelDetails } from 'src/features/linodes/presentation';
import { sendToast } from 'src/features/ToastNotifications/toasts';

type ClassNames = 'root'
  | 'title'
  | 'subTitle'
  | 'currentPlanContainer';

interface Props {
  linodeId: number;
  linodeType: null | string;
  types: { response: ExtendedType[] };
}

interface State {
  selectedId: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

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
    const { linodeId } = this.props;
    const { selectedId } = this.state;
    resizeLinode(linodeId, selectedId)
      .then((response) => {
        sendToast('Linode resize started.');
        this.setState({ selectedId: '' });
        resetEventsPolling();
      })
      .catch((errorResponse) => {
        pathOr([], ['response', 'data', 'errors'], errorResponse)
          .forEach((err: Linode.ApiFieldError) => sendToast(err.reason, 'error'));
        this.setState({ selectedId: '' });
      });
  }

  handleSelectPlan = (id: string) => {
    this.setState({ selectedId: id });
  }

  render() {
    const { types: { response: types }, linodeType, classes } = this.props;
    const type = types.find(t => t.id === linodeType);

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
        <Paper className={classes.root}>
          <Typography
            variant="headline"
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
              variant="title"
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
          types={this.props.types.response}
          onSelect={this.handleSelectPlan}
          selectedID={this.state.selectedId}
        />
        <ActionsPanel>
          <Button
            disabled={!this.state.selectedId}
            variant="raised"
            color="primary"
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

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 1,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  subTitle: {
    margin: `${theme.spacing.unit * 3}px 0`,
  },
  currentPlanContainer: {
    '& .selectionCard': {
      padding: 0,
      cursor: 'not-allowed',
      '& > div, &:focus > div': {
        backgroundColor: theme.bg.main,
        borderColor: theme.color.border2,
      },
    },
  },
});

const styled = withStyles(styles, { withTheme: true });

const preloaded = PromiseLoader<CombinedProps>({
  types: () => getLinodeTypes()
    .then((data) => {
      return data.data.map(LinodeResize.extendType) || [];
    }),
});

export default compose<any, any, any>(
  preloaded,
  styled,
)(LinodeResize);
