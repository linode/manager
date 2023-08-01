import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LandingHeader from 'src/components/LandingHeader/LandingHeader';

const VPC_CREATE_ROUTE = 'vpc/create';

const VPCLanding = () => {
  const history = useHistory();

  const createVPC = () => {
    history.push(VPC_CREATE_ROUTE);
  };

  return (
    <>
      <DocumentTitleSegment segment="VPC" />
      <LandingHeader
        createButtonText={'Create VPC'}
        docsLabel="Docs"
        docsLink="" // TODO: VPC -  Add docs link
        onButtonClick={createVPC}
        title="Virtual Private Cloud (VPC)"
      />
      TODO: VPC M3-6733 Add VPC Landing page (PR #9467)
    </>
  );
};

export default VPCLanding;
