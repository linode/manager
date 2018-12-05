import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import AddNewLink from 'src/components/AddNewLink';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import PromiseLoader from 'src/components/PromiseLoader';
import { StackScripts } from 'src/documentation';
import { getLinodeImages } from 'src/services/images';

// import StackScriptPanel from './LandingPanel/StackScriptPanel';
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
    StackScripts,
  ];

  goToCreateStackScript = () => {
    const { history } = this.props;
    history.push('/stackscripts/create');
  }

  render() {

    const { classes, history, images } = this.props;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="StackScripts" />
        {!!history.location.state && !!history.location.state.successMessage &&
          <Notice success text={history.location.state.successMessage} />
        }
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Grid item>
            <Typography role="header" variant="h1" className={classes.title} data-qa-title >
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

const styled = withStyles(styles);

export default compose(
  preloaded,
  styled,
  withRouter,
  setDocs(StackScriptsLanding.docs),
)(StackScriptsLanding);
