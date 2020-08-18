import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink/AddNewLink_CMR';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import withImagesContainer, {
  WithImages
} from 'src/containers/withImages.container';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { filterImagesByType } from 'src/store/image/image.helpers';
import StackScriptPanel from './StackScriptPanel';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.color.white,
    margin: 0,
    marginRight: 15,
    padding: 0,
    width: '100%'
  },
  title: {
    marginTop: theme.spacing(3),
    marginLeft: 15
  },
  addNewLinkWrapper: {
    padding: 0
  },
  addNewLink: {
    height: 34
  }
}));

type CombinedProps = WithImages & RouteComponentProps<{}>;

export const StackScriptsLanding: React.FC<CombinedProps> = props => {
  const { history, imagesData, location } = props;
  const classes = useStyles();

  const goToCreateStackScript = () => {
    history.push('/stackscripts/create');
  };

  const { _loading } = useReduxLoad(['images']);

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="StackScripts" />
      {!!history.location.state && !!history.location.state.successMessage && (
        <Notice success text={history.location.state.successMessage} />
      )}
      <Grid
        className={classes.root}
        container
        justify="space-between"
        alignItems="flex-end"
      >
        <Grid item className="py0">
          <Breadcrumb
            pathname={location.pathname}
            labelTitle="StackScripts"
            data-qa-title
            className={classes.title}
          />
        </Grid>
        <Grid item className="py0">
          <Grid container alignItems="flex-end">
            <Grid item className={classes.addNewLinkWrapper}>
              <AddNewLink
                className={classes.addNewLink}
                data-qa-create-new-stackscript
                label="Create a StackScript..."
                onClick={goToCreateStackScript}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container>
        {_loading ? (
          <CircleProgress />
        ) : (
          <Grid item xs={12}>
            <StackScriptPanel
              publicImages={imagesData}
              queryString={props.location.search}
              history={props.history}
              location={props.location}
            />
          </Grid>
        )}
      </Grid>
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  withImagesContainer((ownProps, imagesData, imagesLoading, imagesError) => ({
    ...ownProps,
    imagesData: filterImagesByType(imagesData, 'public'),
    imagesLoading,
    imagesError
  }))
)(StackScriptsLanding);
