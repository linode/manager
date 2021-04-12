import * as React from 'react';
import { matchPath, RouteComponentProps, withRouter } from 'react-router-dom';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList from 'src/components/TabLinkList';

type CombinedProps = RouteComponentProps<{}>;

interface ImageDrawerState {
  imageID?: string;
  label?: string;
  description?: string;
  selectedDisk: string | null;
  selectedLinode?: number;
}

const CreateImageTab = React.lazy(() => import('./CreateImageTab'));
const ImageUpload = React.lazy(() => import('../ImageUpload'));

export const ImageCreate: React.FC<CombinedProps> = (props) => {
  const [route, setRoute] = React.useState<string>('');

  const tabs = [
    /* NB: These must correspond to the routes, inside the Switch */
    {
      title: 'Create Image',
      routeName: `${props.match.url}/create-image`,
    },
    {
      title: 'Upload Image',
      routeName: `${props.match.url}/upload-image`,
    },
  ];

  React.useEffect(() => {
    setRoute(props.location.pathname.replace('/create/', ''));
  }, [route, props.location.pathname]);

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const navToURL = (index: number) => {
    setRoute(props.location.pathname.replace('/create/', ''));
    props.history.push(tabs[index].routeName);
  };

  // Logic for <CreateImageTab /> props
  const defaultCreateTabState = {
    label: '',
    description: '',
    selectedDisk: null,
  };

  const [createTabState, setCreateTabState] = React.useState<ImageDrawerState>(
    defaultCreateTabState
  );

  const changeSelectedLinode = (linodeId: number | null) => {
    setCreateTabState((prevCreateTabState) => ({
      ...prevCreateTabState,
      selectedDisk: null,
      selectedLinode: linodeId ?? undefined,
    }));
  };

  const changeSelectedDisk = (disk: string | null) => {
    setCreateTabState((prevCreateTabState) => ({
      ...prevCreateTabState,
      selectedDisk: disk,
    }));
  };

  const setLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setCreateTabState((prevCreateTabState) => ({
      ...prevCreateTabState,
      label: value,
    }));
  };

  const setDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCreateTabState((prevCreateTabState) => ({
      ...prevCreateTabState,
      description: value,
    }));
  };

  return (
    <>
      <DocumentTitleSegment segment="Create Image" />
      <Tabs
        index={Math.max(
          tabs.findIndex((tab) => matches(tab.routeName)),
          0
        )}
        onChange={navToURL}
      >
        <TabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <CreateImageTab
                label={createTabState.label}
                description={createTabState.description}
                selectedDisk={createTabState.selectedDisk}
                selectedLinode={createTabState.selectedLinode || null}
                imageID={createTabState.imageID}
                changeDisk={changeSelectedDisk}
                changeLinode={changeSelectedLinode}
                changeLabel={setLabel}
                changeDescription={setDescription}
              />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <ImageUpload />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
};

export default withRouter(ImageCreate);
