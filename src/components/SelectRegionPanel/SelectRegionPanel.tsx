import DE from 'flag-icon-css/flags/4x3/de.svg';
import UK from 'flag-icon-css/flags/4x3/gb.svg';
import JP from 'flag-icon-css/flags/4x3/jp.svg';
import SG from 'flag-icon-css/flags/4x3/sg.svg';
import US from 'flag-icon-css/flags/4x3/us.svg';
import { isEmpty } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import Grid from 'src/components/Grid';
import RenderGuard from 'src/components/RenderGuard';
import SelectionCard from 'src/components/SelectionCard';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';

const flags = {
  us: () => <US width="32" height="24" viewBox="0 0 720 480" />,
  sg: () => <SG width="32" height="24" viewBox="0 0 640 480" />,
  jp: () => <JP width="32" height="24" viewBox="0 0 640 480" style={{ backgroundColor: '#fff' }} />,
  uk: () => <UK width="32" height="24" viewBox="0 0 640 480" />,
  de: () => <DE width="32" height="24" viewBox="0 0 720 480" />,
};

export interface ExtendedRegion extends Linode.Region {
  display: string;
}

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    marginTop: theme.spacing.unit * 3,
  },
});

interface Props {
  regions: ExtendedRegion[];
  copy?: string;
  error?: string;
  handleSelection: (id: string) => void;
  selectedID: string | null;
}

const getNARegions = (regions: ExtendedRegion[]) =>
  regions.filter(r => /us/.test(r.country));

const getEURegions = (regions: ExtendedRegion[]) =>
  regions.filter(r => /(de|uk)/.test(r.country));

const getASRegions = (regions: ExtendedRegion[]) =>
  regions.filter(r => /(jp|sg)/.test(r.country));

const renderCard = (selectedID: string | null, handleSelection: Function) =>
  (region: ExtendedRegion, idx: number) => (
    <SelectionCard
      key={idx}
      checked={region.id === String(selectedID)}
      onClick={e => handleSelection(region.id)}
      renderIcon={() => flags[region.country]()}
      heading={(region.country.toUpperCase())}
      subheadings={[region.display]}
    />
  );

class SelectRegionPanel extends React.Component<Props & WithStyles<ClassNames>> {

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
            <Grid container spacing={16}>
              {na.map(renderCard(this.props.selectedID, this.props.handleSelection))}
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
            <Grid container spacing={16}>
              {eu.map(renderCard(this.props.selectedID, this.props.handleSelection))}
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
              {as.map(renderCard(this.props.selectedID, this.props.handleSelection))}
            </Grid>
          );
        },
      });
    }

    return tabs;
  }

  render() {
    if (this.props.regions.length === 0) { return null; }
    return (
      <TabbedPanel
        rootClass={this.props.classes.root}
        error={this.props.error}
        header="Region"
        copy={this.props.copy}
        tabs={this.createTabs()}
      />
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(RenderGuard<Props & WithStyles<ClassNames>>(SelectRegionPanel));
