import * as React from 'react';
import { isEmpty } from 'ramda';
import US from 'flag-icon-css/flags/4x3/us.svg';
import SG from 'flag-icon-css/flags/4x3/sg.svg';
import JP from 'flag-icon-css/flags/4x3/jp.svg';
import UK from 'flag-icon-css/flags/4x3/gb.svg';
import DE from 'flag-icon-css/flags/4x3/de.svg';

const flags = {
  us: () => <US width="32" height="24" viewBox="0 0 720 480"/>,
  sg: () => <SG width="32" height="24" viewBox="0 0 640 480"/>,
  jp: () => <JP width="32" height="24" viewBox="0 0 640 480" style={{ backgroundColor: '#fff' }} />,
  uk: () => <UK width="32" height="24" viewBox="0 0 640 480"/>,
  de: () => <DE width="32" height="24" viewBox="0 0 720 480"/>,
};

import Grid from 'src/components/Grid';

import TabbedPanel from '../../../components/TabbedPanel';
import { Tab } from '../../../components/TabbedPanel/TabbedPanel';
import SelectionCard from '../../../components/SelectionCard';

export interface ExtendedRegion extends Linode.Region {
  display: string;
}

interface Props {
  regions: ExtendedRegion[];
  error?: string;
  handleSelection: (key: string) =>
    (event: React.SyntheticEvent<HTMLElement>, value: string) => void;
  selectedID: string | null;
}

const getNARegions = (regions: ExtendedRegion[]) =>
  regions.filter(r => /us/.test(r.country));

const getEURegions = (regions: ExtendedRegion[]) =>
  regions.filter(r => /uk/.test(r.country));

const getASRegions = (regions: ExtendedRegion[]) =>
  regions.filter(r => /(jp|sg)/.test(r.country));

const renderCard = (selectedID: string|null, handleSelection: Function) =>
  (region: ExtendedRegion, idx: number) => (
      <SelectionCard
        key={idx}
        checked={region.id === String(selectedID)}
        onClick={e => handleSelection('selectedRegionID')(e, region.id)}
        renderIcon={() => flags[region.country]()}
        heading={(region.country.toUpperCase())}
        subheadings={[region.display]}
      />
    );

class SelectRegionPanel extends React.Component<Props> {

  createTabs = () => {
    const { regions } = this.props;
    const tabs: Tab[] = [];
    const na = getNARegions(regions);
    const eu = getEURegions(regions);
    const as = getASRegions(regions);

    if (!isEmpty(na)) {
      tabs.push({
        title: 'North America',
        render: () => {

          return (
            <Grid container spacing={8}>
            { na.map(renderCard(this.props.selectedID, this.props.handleSelection))}
            </Grid>
          );
        },
      });
    }

    if (!isEmpty(eu)) {
      tabs.push({
        title: 'Europe',
        render: () => {
          return (
            <Grid container spacing={8}>
              { eu.map(renderCard(this.props.selectedID, this.props.handleSelection))}
            </Grid>
          );
        },
      });
    }

    if (!isEmpty(as)) {
      tabs.push({
        title: 'Asia',
        render: () => {
          return (
            <Grid container>
              { as.map(renderCard(this.props.selectedID, this.props.handleSelection))}
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
        header="Region"
        copy="Determine the best location for your Linode."
        tabs={this.createTabs()}
      />
    );
  }
}

export default SelectRegionPanel;
