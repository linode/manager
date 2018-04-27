import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import { pathOr } from 'ramda';

import VolumesIcon from 'src/assets/addnewmenu/volume.svg';
import Placeholder from 'src/components/Placeholder';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import {
  getVolumes,
} from 'src/services/volumes';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  volumes: PromiseLoaderResponse<Linode.Volume[]>;
}

interface State {
  volumes: Linode.Volume[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class Volumes extends React.Component<CombinedProps, State> {
  state = {
    volumes: pathOr([], ['response', 'data'], this.props.volumes),
  };

  openVolumesDrawer() {
    console.log('volumes drawer opening');
  }

  render() {
    const { volumes } = this.state;
    return (
      <React.Fragment>
        {volumes.length
          ? <h1>Volumes Table</h1>
          : <Placeholder
              title="Create a Volume"
              copy="Add storage to your Linodes using the resilient Volumes service"
              icon={VolumesIcon}
              buttonProps={{
                onClick: () => this.openVolumesDrawer(),
                children: 'Create a Volume',
              }}
            />
        }
      </React.Fragment>
    );
  }
}

const preloaded = PromiseLoader<CombinedProps>({
  volumes: (props: Props) => getVolumes(),
});

const styled = withStyles(styles, { withTheme: true });

export default styled(preloaded(Volumes));
