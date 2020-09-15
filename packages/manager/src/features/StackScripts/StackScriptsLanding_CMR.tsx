import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';

import Breadcrumb from 'src/components/Breadcrumb';
import { makeStyles, Theme } from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import withImagesContainer, {
  WithImages
} from 'src/containers/withImages.container';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { filterImagesByType } from 'src/store/image/image.helpers';
import StackScriptPanel from './StackScriptPanel/StackScriptPanel_CMR';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3)
  },
  panel: {
    '& > div': {
      padding: theme.spacing(2)
    }
  }
}));

type CombinedProps = WithImages & RouteComponentProps<{}>;

export const StackScriptsLanding: React.FC<CombinedProps> = props => {
  const { history, imagesData } = props;
  const { _loading } = useReduxLoad(['images']);
  const classes = useStyles();

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="StackScripts" />
      {!!history.location.state && !!history.location.state.successMessage && (
        <Notice success text={history.location.state.successMessage} />
      )}
      <div className={classes.root}>
        <Breadcrumb
          pathname={location.pathname}
          labelTitle="StackScripts"
          removeCrumbX={1}
        />
      </div>
      <Grid container>
        {_loading ? (
          <CircleProgress />
        ) : (
          <Grid className={classes.panel} item xs={12}>
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
