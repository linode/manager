import { Image } from '@linode/api-v4';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Notice } from 'src/components/Notice/Notice';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { listToItemsByID } from 'src/queries/base';
import { useAllImagesQuery } from 'src/queries/images';

import StackScriptPanel from './StackScriptPanel';

export const StackScriptsLanding = () => {
  const history = useHistory<{
    successMessage?: string;
  }>();

  const { data: _imagesData, isLoading: _loading } = useAllImagesQuery(
    {},
    { is_public: true }
  );

  const imagesData: Record<string, Image> = listToItemsByID(_imagesData ?? []);

  const goToCreateStackScript = () => {
    history.push('/stackscripts/create');
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="StackScripts" />
      <ProductInformationBanner bannerLocation="StackScripts" />
      {!!history.location.state && !!history.location.state.successMessage ? (
        <Notice
          text={history.location.state.successMessage}
          variant="success"
        />
      ) : null}
      <LandingHeader
        docsLink="https://www.linode.com/docs/platform/stackscripts"
        entity="StackScript"
        onButtonClick={goToCreateStackScript}
        removeCrumbX={1}
        title="StackScripts"
      />
      <Grid className="m0" container>
        {_loading ? (
          <CircleProgress />
        ) : (
          <Grid className="p0" xs={12}>
            <StackScriptPanel
              history={history}
              location={history.location}
              publicImages={imagesData}
              queryString={history.location.search}
            />
          </Grid>
        )}
      </Grid>
    </React.Fragment>
  );
};

export default StackScriptsLanding;
