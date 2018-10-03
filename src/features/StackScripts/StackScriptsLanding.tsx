import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { compose } from 'ramda';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import AddNewLink from 'src/components/AddNewLink';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import PromiseLoader from 'src/components/PromiseLoader';
import { getLinodeImages } from 'src/services/images';

import SelectStackScriptPanel from './SelectStackScriptPanel';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface PreloadedProps {
  images: { response: Linode.Image[] };
}

type CombinedProps = SetDocsProps
  & WithStyles<ClassNames>
  & PreloadedProps
  & RouteComponentProps<{}>;

  const preloaded = PromiseLoader<{}>({
    images: () => getLinodeImages()
      .then(response => response.data || []),
  });

export class StackScriptsLanding extends React.Component<CombinedProps, {}> {
  static docs = [
    {
      title: 'Automate Deployment with StackScripts',
      src: 'https://www.linode.com/docs/platform/stackscripts/',
      body: `Create Custom Instances and Automate Deployment with StackScripts.`,
    },
  ];

  goToCreateStackScript = () => {
    const { history } = this.props;
    history.push('/stackscripts/create');
  }

  render() {

    const { images, classes, history } = this.props;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="StackScripts" />
        {!!history.location.state && !!history.location.state.successMessage &&
          <Notice success text={history.location.state.successMessage} />
        }
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Grid item>
            <Typography role="header" variant="headline" className={classes.title} data-qa-title >
                StackScripts
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item>
                <AddNewLink
                  onClick={this.goToCreateStackScript}
                  label="Create New StackScript"
                  data-qa-create-new-stackscript
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container>
          <SelectStackScriptPanel
            publicImages={images.response}
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
  withRouter,
  setDocs(StackScriptsLanding.docs),
)(StackScriptsLanding);
