import * as React from 'react';
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { NavTab, NavTabs } from 'src/components/NavTabs/NavTabs';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

type CombinedProps = RouteComponentProps<{}>;

const CreateImageTab = React.lazy(() => import('./CreateImageTab'));
const ImageUpload = React.lazy(() => import('../ImageUpload'));

export const ImageCreate: React.FC<CombinedProps> = (props) => {
  const { location } = useHistory<any>();

  const [label, setLabel] = React.useState<string>(
    location?.state ? location.state.imageLabel : ''
  );
  const [description, setDescription] = React.useState<string>(
    location?.state ? location.state.imageDescription : ''
  );
  const [isCloudInit, setIsCloudInit] = React.useState<boolean>(false);

  const handleSetLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLabel(value);
  };

  const handleSetDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDescription(value);
  };

  const tabs: NavTab[] = [
    {
      render: (
        <CreateImageTab
          changeDescription={handleSetDescription}
          changeIsCloudInit={() => setIsCloudInit(!isCloudInit)}
          changeLabel={handleSetLabel}
          description={description}
          isCloudInit={isCloudInit}
          label={label}
        />
      ),
      routeName: `${props.match.url}/disk`,
      title: 'Capture Image',
    },
    {
      render: (
        <ImageUpload
          changeDescription={handleSetDescription}
          changeIsCloudInit={() => setIsCloudInit(!isCloudInit)}
          changeLabel={handleSetLabel}
          description={description}
          isCloudInit={isCloudInit}
          label={label}
        />
      ),
      routeName: `${props.match.url}/upload`,
      title: 'Upload Image',
    },
  ];

  return (
    <>
      <DocumentTitleSegment segment="Create Image" />
      <React.Suspense fallback={<SuspenseLoader />}>
        <NavTabs tabs={tabs} />
      </React.Suspense>
    </>
  );
};

export default withRouter(ImageCreate);
