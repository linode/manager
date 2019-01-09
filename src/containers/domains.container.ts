import { connect } from 'react-redux';
export interface Props {
  domainsData: Linode.Domain[];
  domainsLoading: boolean;
  domainsError?: Error;
}

export default connect((state: ApplicationState) => {
  return {
    domainsData: state.__resources.domains.entities,
    domainsLoading: false,
    domainsError: undefined,
  }
});
