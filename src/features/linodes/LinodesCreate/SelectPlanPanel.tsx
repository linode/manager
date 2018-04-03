import * as React from 'react';
import { isEmpty } from 'ramda';

import Grid from 'src/components/Grid';

import TabbedPanel from '../../../components/TabbedPanel';
import { Tab } from '../../../components/TabbedPanel/TabbedPanel';
import SelectionCard from '../../../components/SelectionCard';

export interface ExtendedType extends Linode.LinodeType {
  heading: string;
  subHeadings: [string, string];
}

interface Props {
  types: ExtendedType[];
  error?: string;
  handleSelection: (key: string) =>
    (event: React.SyntheticEvent<HTMLElement>, value: string) => void;
  selectedID: string | null;
}

const getNanodes = (types: ExtendedType[]) =>
  types.filter(t => /nanode/.test(t.class));

const getStandard = (types: ExtendedType[]) =>
  types.filter(t => /standard/.test(t.class));

const getHighMem = (types: ExtendedType[]) =>
  types.filter(t => /highmem/.test(t.class));

const renderCard = (selectedID: string|null, handleSelection: Function) =>
  (region: ExtendedType, idx: number) => (
      <SelectionCard
        key={idx}
        checked={region.id === String(selectedID)}
        onClick={e => handleSelection('selectedTypeID')(e, region.id)}
        heading={region.heading}
        subheadings={region.subHeadings}
      />
    );

class SelectPlanPanel extends React.Component<Props> {

  createTabs = () => {
    const { types } = this.props;

    const tabs: Tab[] = [];
    const nanodes = getNanodes(types);
    const standards = getStandard(types);
    const highmem = getHighMem(types);

    if (!isEmpty(nanodes)) {
      tabs.push({
        title: 'Nanode',
        render: () => {

          return (
            <Grid container spacing={8}>
            { nanodes.map(renderCard(this.props.selectedID, this.props.handleSelection))}
            </Grid>
          );
        },
      });
    }

    if (!isEmpty(standards)) {
      tabs.push({
        title: 'Standard',
        render: () => {
          return (
            <Grid container spacing={8}>
              { standards.map(renderCard(this.props.selectedID, this.props.handleSelection))}
            </Grid>
          );
        },
      });
    }

    if (!isEmpty(highmem)) {
      tabs.push({
        title: 'High Memory',
        render: () => {
          return (
            <Grid container spacing={8}>
              { highmem.map(renderCard(this.props.selectedID, this.props.handleSelection))}
            </Grid>
          );
        },
      });
    }

    return tabs;
  }

  render() {
    return (
      <TabbedPanel
        error={this.props.error}
        header="Linode Plan"
        tabs={this.createTabs()}
        initTab={1}
      />
    );
  }
}

export default SelectPlanPanel;
