import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import NavTabs, { NavTab } from 'src/components/NavTabs/NavTabs';
import SuspenseLoader from 'src/components/SuspenseLoader';

type CombinedProps = RouteComponentProps<{}>;

const CreateImageTab = React.lazy(() => import('./CreateImageTab'));
const ImageUpload = React.lazy(() => import('../ImageUpload'));

export const ImageCreate: React.FC<CombinedProps> = (props) => {
  const [label, setLabel] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');

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
      title: 'From Linode',
      routeName: `${props.match.url}/create-image`,
      render: (
        <CreateImageTab
          label={label}
          description={description}
          changeLabel={handleSetLabel}
          changeDescription={handleSetDescription}
        />
      ),
    },
    {
      title: 'From Uploaded Source',
      routeName: `${props.match.url}/upload-image`,
      render: <ImageUpload />,
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
