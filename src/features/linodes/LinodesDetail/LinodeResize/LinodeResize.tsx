import * as React from 'react';
import Axios, { AxiosResponse } from 'axios';
import { compose } from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';

import SelectionCard from 'src/components/SelectionCard';
import SelectPlanPanel, { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { typeLabelDetails, typeLabel } from 'src/features/linodes/presentation';
import PromiseLoader from 'src/components/PromiseLoader';
import { API_ROOT } from 'src/constants';
import ActionsPanel from 'src/components/ActionsPanel';
import { resize as resizeLinode } from 'src/service/linodes';
import { resetEventsPolling, events$ } from 'src/events';
import { genEvent } from 'src/features/linodes/LinodesLanding/powerActions';

import LinodeTheme from 'src/theme';

type ClassNames = 'root'
 | 'title'
 | 'subTitle'
 | 'currentPlanContainer'
 | 'actionPanel';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
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
        backgroundColor: LinodeTheme.bg.main,
        borderColor: '#C9CACB',
      },
    },
  },
  actionPanel: {
    padding: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 3,
  },
});

interface Props {
  linodeId: number;
  linodeLabel: string;
  type: Linode.LinodeType;
  types: { response: ExtendedType[] };
}

interface State {
  selectedId: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeResize extends React.Component<CombinedProps, State> {
  state: State = {
    selectedId: this.props.type.id,
  };

  onSubmit = () => {
    const { linodeId, linodeLabel } = this.props;
    const { selectedId } = this.state;
    resizeLinode(linodeId, selectedId)
      .then((response: AxiosResponse<{}>) => {
        events$.next(genEvent('linode_resize', linodeId, linodeLabel));
        resetEventsPolling();
      })
      .catch((errorResponse) => {
        /** @todo Toast notification. */
      });
  }

  render() {
    const { type: { memory, disk, vcpus, price }, classes } = this.props;

    return (
      <React.Fragment>
        <Paper className={classes.root}>
          <Typography variant="headline" className={classes.title}>Resize</Typography>
          <Typography>
            If you're expecting a temporary burst of traffic to your website,
            or if you're not using your Linode as much as you thought,
            you can temporarily or permenantly resize your Linode
            to a different plan.
          </Typography>
          <div className={classes.currentPlanContainer}>
            <Typography variant="title" className={classes.subTitle}>Current Plan</Typography>
            {<SelectionCard
              checked={false}
              onClick={e => null}
              heading={typeLabel(memory) || ''}
              subheadings={[
                `$${price.monthly}/mo ($${price.hourly}/hr)`,
                typeLabelDetails(memory, disk, vcpus),
              ]}
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
          >
            Submit
          </Button>
        </ActionsPanel>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const preloaded = PromiseLoader({
  types: () => Axios.get(`${API_ROOT}/linode/types`)
    .then(response => response.data)
    .then((data: Linode.ManyResourceState<Linode.LinodeType>) => {
      return data.data.map((type) => {
        const {
          memory,
          vcpus,
          disk,
          price: { monthly, hourly },
        } = type;

        return ({
          ...type,
          heading: typeLabel(memory),
          subHeadings: [
            `$${monthly}/mo ($${hourly}/hr)`,
            typeLabelDetails(memory, disk, vcpus),
          ],
        });
      }) || [];
    }),
});

export default compose<any, any, any>(
  preloaded,
  styled,
)(LinodeResize);
