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
import PlusSquare from '../../../src/assets/icons/plus-square.svg';

import SelectStackScriptPanel from './SelectStackScriptPanel';

import { images } from 'src/__data__/images';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { }

interface State {
}

type CombinedProps = Props
  & SetDocsProps
  & WithStyles<ClassNames>;

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

  filterPublicImages = () => {
    // get images and preloaded and give us just the public ones
    // to pass to selectstackscriptpanel
    // we dont' want to display the deprecated ones because
    // they're useless.
    return;
  }

  render() {

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
            publicImages={images}
            noHeader={true}
          />
        </Grid>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  styled,
  setDocs(StackScriptsLanding.docs),
)(StackScriptsLanding);
