import * as React from 'react';
import {
  matchPath,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import { compose } from 'recompose';
import AppBar from 'src/components/core/AppBar';
import Paper from 'src/components/core/Paper';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import TabLink from 'src/components/TabLink';
import { HasNumericID } from 'src/store/types';
import { withLinodeDetailContext } from '../LinodesDetail/linodeDetailContext';
import Configs from './Configs';
import Details from './Details';
import Disks from './Disks';

type CombinedProps = RouteComponentProps<{}> & StateProps;

export const CloneLanding: React.FC<CombinedProps> = props => {
  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Configuration Profiles',
      routeName: `${props.match.url}/configs`
    },
    { title: 'Disks', routeName: `${props.match.url}/disks` }
  ];

  const handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = props;
    const routeName = tabs[value].routeName;
    history.push(`${routeName}`);
  };

  const {
    configs,
    disks,
    match: { url }
  } = props;

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const [selectedConfigs, setSelectedConfigs] = React.useState<
    Record<number, boolean>
  >(initSelected(props.configs));

  const [selectedDisks, setSelectedDisks] = React.useState<
    Record<number, boolean>
  >(initSelected(props.disks));

  const handleSelectConfig = (configId: number) => {
    setSelectedConfigs({
      ...selectedConfigs,
      [configId]: !selectedConfigs[configId]
    });
  };

  const handleSelectDisk = (diskId: number) => {
    setSelectedDisks({
      ...selectedDisks,
      [diskId]: !selectedDisks[diskId]
    });
  };

  const clearAll = () => {
    setSelectedConfigs({
      ...initSelected(props.configs)
    });
    setSelectedDisks({
      ...initSelected(props.disks)
    });
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Clone" />
      <Typography variant="h1" data-qa-clone-header>
        Clone
      </Typography>
      {/* @todo: Fix these styles */}
      <Grid container style={{ marginTop: 8 }}>
        <Grid item xs={12} md={8}>
          <Paper>
            <AppBar position="static" color="default">
              <Tabs
                value={tabs.findIndex(tab => matches(tab.routeName))}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="on"
              >
                {tabs.map(tab => (
                  <Tab
                    key={tab.title}
                    data-qa-tab={tab.title}
                    component={() => (
                      <TabLink to={tab.routeName} title={tab.title} />
                    )}
                  />
                ))}
              </Tabs>
            </AppBar>
            <Route
              exact
              path={`${url}/configs`}
              render={() => (
                // @todo: fix this (make classes)
                <div style={{ paddingLeft: 16, paddingBottom: 8 }}>
                  <Configs
                    configs={configs}
                    selectedConfigs={selectedConfigs}
                    handleSelect={handleSelectConfig}
                  />
                </div>
              )}
            />
            <Route
              exact
              path={`${url}/disks`}
              render={() => (
                <div style={{ paddingLeft: 16, paddingBottom: 8 }}>
                  <Typography>
                    You can make a copy of a disk to the same or different
                    Linode. We recommend you power off your Linode first.
                  </Typography>
                  {/* @todo fix these styles */}
                  <div style={{ marginTop: 32 }}>
                    <Disks
                      disks={disks}
                      selectedDisks={selectedDisks}
                      handleSelect={handleSelectDisk}
                    />
                  </div>
                </div>
              )}
            />
            <Route exact path={`${url}`} component={Configs} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Details
            selectedConfigs={configs.filter(
              config => selectedConfigs[config.id]
            )}
            selectedDisks={disks.filter(disk => selectedDisks[disk.id])}
            handleSelectConfig={handleSelectConfig}
            handleSelectDisk={handleSelectDisk}
            clearAll={clearAll}
          />
        </Grid>
      </Grid>
      <Switch />
    </React.Fragment>
  );
};

interface StateProps {
  linodeId: number;
  configs: Linode.Config[];
  disks: Linode.Disk[];
  readOnly: boolean;
}
const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id,
  configs: linode._configs,
  disks: linode._disks,
  readOnly: linode._permissions === 'read_only'
}));

const enhanced = compose<CombinedProps, {}>(
  linodeContext,
  withRouter
);

export default enhanced(CloneLanding);

const initSelected = <T extends HasNumericID[]>(itemsWithId: T) => {
  const selected: Record<number, boolean> = {};
  itemsWithId.forEach(eachItem => {
    selected[eachItem.id] = false;
  });
  return selected;
};
