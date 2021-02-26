import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import withImagesContainer, {
  WithImages,
} from 'src/containers/withImages.container';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import StackScriptPanel from './StackScriptPanel';

import { filterImagesByType } from 'src/store/image/image.helpers';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  title: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1) + theme.spacing(1) / 2,
  },
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
        container
        justify="space-between"
        alignItems="flex-end"
        style={{ paddingBottom: 0 }}
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
            <Grid item className="pt0">
              <AddNewLink
                onClick={goToCreateStackScript}
                label="Create New StackScript"
                data-qa-create-new-stackscript
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
    imagesError,
  }))
)(StackScriptsLanding);
