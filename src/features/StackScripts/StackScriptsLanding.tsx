import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { compose } from 'ramda';

import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import Grid from 'src/components/Grid';
import IconTextLink from 'src/components/IconTextLink';
import PromiseLoader from 'src/components/PromiseLoader';

import PlusSquare from '../../../src/assets/icons/plus-square.svg';

import SelectStackScriptPanel from './SelectStackScriptPanel';

import { getImages } from 'src/services/images';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { }

interface PreloadedProps {
  images: { response: Linode.Image[] };
}

interface State {
}

type CombinedProps = Props
  & SetDocsProps
  & WithStyles<ClassNames>
  & PreloadedProps;

  const preloaded = PromiseLoader<Props>({
    images: () => getImages()
      .then(response => response.data || []),
  });

export class StackScriptsLanding extends React.Component<CombinedProps, State> {
  state: State = {
  };

  static docs = [
    {
      title: 'Automate Deployment with StackScripts',
      src: 'https://www.linode.com/docs/platform/stackscripts/',
      body: `Create Custom Instances and Automate Deployment with StackScripts.`,
    },
  ];

  handleTabClick = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    this.setState({ selectedTab: value });
  }

  filterPublicImages = (images: Linode.Image[]) => {
    // get images and preloaded and give us just the public ones
    // to pass to selectstackscriptpanel
    // we dont' want to display the deprecated ones because
    // they're useless.
    return images.filter((image: Linode.Image) => image.is_public)
  }

  render() {

    const { images } = this.props;

    return (
      <React.Fragment>
        <Grid container>
          <Grid item xs={9}>
            <Typography variant="headline">
              StackScripts
        </Typography>
          </Grid>
          <Grid item xs={3}>
            <IconTextLink
              SideIcon={PlusSquare}
              text="Create New StackScript"
              onClick={() => console.log('hello world')}
              title="Create New StackScript"
            />
          </Grid>
          <SelectStackScriptPanel
            publicImages={this.filterPublicImages(images.response)}
            noHeader={true}
          />
        </Grid>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  preloaded,
  styled,
  setDocs(StackScriptsLanding.docs),
)(StackScriptsLanding);
