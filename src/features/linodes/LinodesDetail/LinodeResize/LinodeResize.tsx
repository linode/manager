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

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
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
    const { type: { memory, disk, vcpus, price } } = this.props;

    return (
      <Paper>
        <Typography variant="headline">Resize</Typography>
        <Typography>
          If you're expecting a temporary burst of traffic to your website, or if you're not using
          your Linode as much as you thought, you can temporarily or permenantly resize your Linode
          to a different plan.
        </Typography>
        <Typography variant="subheading">Current Plan</Typography>
        {<SelectionCard
          checked={true}
          disabled
          onClick={e => null}
          heading={typeLabel(memory) || ''}
          subheadings={[
            `$${price.monthly}/mo ($${price.hourly}/hr)`,
            typeLabelDetails(memory, disk, vcpus),
          ]}
        />}
        <SelectPlanPanel
          types={this.props.types.response}
          onSelect={(id: string) => this.setState({ selectedId: id })}
          selectedID={this.state.selectedId}
        />
        <ActionsPanel>
          <Button
            variant="raised"
            color="primary"
            onClick={this.onSubmit}
          >Submit</Button>
        </ActionsPanel>
      </Paper>
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
