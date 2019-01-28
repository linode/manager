import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface Props {
  domainsData: Linode.Domain[];
  domainsLoading: boolean;
  domainsError?: Error;
}

export default connect((state: ApplicationState) => {
  return {
    domainsData: state.__resources.domains.entities,
    domainsLoading: state.__resources.domains.loading,
    domainsError: state.__resources.domains.error
  };
});
