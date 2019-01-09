import { connect } from 'react-redux';
import { CloneRequest, CloneResponse, createLinode, CreateLinodeRequest, CreateLinodeResponse, deleteLinode, DeleteRequest, getLinode, getLinodesPage, GetOneRequest, GetOneResponse, GetPageRequest, GetPageResponse, requestAllLinodes, updateLinode, UpdateRequest, UpdateResponse } from 'src/store/linodes/linodes.requests';

export interface LinodeRequests {
  createLinode: (p: CreateLinodeRequest) => Promise<CreateLinodeResponse>,
  deleteLinode: (p: DeleteRequest) => Promise<{}>,
  getLinodes: (p: GetPageRequest) => Promise<GetPageResponse>,
  getLinode: (p: GetOneRequest) => Promise<GetOneResponse>,
  updateLinode: (p: Partial<UpdateRequest>) => Promise<UpdateResponse>,
  cloneLinode: (p: CloneRequest) => Promise<CloneResponse>,
  getAllLinodes: () => Promise<Linode.Linode[]>,
}

export default connect(undefined, {
  createLinode,
  deleteLinode,
  getLinodes: getLinodesPage,
  getLinode,
  updateLinode,
  getAllLinodes: requestAllLinodes,
});
