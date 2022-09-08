import * as React from 'react';
import { VncScreen } from 'react-vnc';
import { getLishSchemeAndHostname, resizeViewPort } from './lishUtils';
import { Linode } from '@linode/api-v4';
import ErrorState from 'src/components/ErrorState';
import CircleProgress from 'src/components/CircleProgress';

interface Props {
  token: string;
  linode: Linode;
}

const Glish = (props: Props) => {
  const { token, linode } = props;
  const region = linode.region;

  React.useEffect(() => {
    resizeViewPort(1080, 840);
  }, []);

  const powered = true;

  if (!region || !token) {
    return <ErrorState errorText="Unable to connect to Glish" />;
  }

  if (!powered) {
    return <ErrorState errorText="Please power on your Linode to use Glish" />;
  }

  return (
    <VncScreen
      url={`${getLishSchemeAndHostname(region)}:8080/${token}`}
      loadingUI={<CircleProgress />}
      showDotCursor
      resizeSession
    />
  );
};

export default Glish;
