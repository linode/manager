import { compose } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import AddNewLink from 'src/components/AddNewLink';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import Grid from 'src/components/Grid';
import PromiseLoader from 'src/components/PromiseLoader';
import { getImages } from 'src/services/images';

import SelectStackScriptPanel from './SelectStackScriptPanel';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {}

interface PreloadedProps {
  images: { response: Linode.Image[] };
}

interface State {}

type CombinedProps = Props
  & SetDocsProps
  & WithStyles<ClassNames>
  & PreloadedProps;

  const preloaded = PromiseLoader<Props>({
    images: () => getImages()
      .then(response => response.data || []),
  });

export class StackScriptsLanding extends React.Component<CombinedProps, State> {
  state: State = {};

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

    const { images, classes } = this.props;

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Grid item>
            <Typography variant="headline" className={classes.title} data-qa-title >
                StackScripts
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item>
                <AddNewLink
                  onClick={() => console.log('Feature Not currently available')}
                  label="Create New StackScript"
                  disabled
                  data-qa-create-new-stackscript
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container>
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
