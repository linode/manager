import * as React from 'react';
import { compose, pathOr } from 'ramda';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';

import SelectionCard from 'src/components/SelectionCard';
import SelectPlanPanel, { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import PromiseLoader from 'src/components/PromiseLoader';
import ActionsPanel from 'src/components/ActionsPanel';
import { resizeLinode, getLinodeTypes } from 'src/services/linodes';
import { resetEventsPolling } from 'src/events';
import { sendToast } from 'src/features/ToastNotifications/toasts';

type ClassNames = 'root'
  | 'title'
  | 'subTitle'
  | 'currentPlanContainer'
  | 'actionPanel';

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
        resetEventsPolling();
      })
      .catch((errorResponse) => {
        pathOr([], ['response', 'data', 'errors'], errorResponse)
          .forEach((err: Linode.ApiFieldError) => sendToast(err.reason, 'error'));
      });
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
            you can temporarily or permenantly resize your Linode
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
              onClick={e => null}
              heading={currentPlanHeading}
              subheadings={currentPlanSubHeadings}
            />}
          </div>
        </Paper>
        <SelectPlanPanel
          types={this.props.types.response}
          onSelect={(id: string) => this.setState({ selectedId: id })}
          selectedID={this.state.selectedId}
        />
        <ActionsPanel className={classes.actionPanel}>
          <Button
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
  actionPanel: {
    padding: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 3,
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
