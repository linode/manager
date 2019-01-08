import { connect } from 'react-redux';
import { CloneRequest, CloneResponse, createLinode, CreateRequest, CreateResponse, deleteLinode, DeleteRequest, DeleteResponse, getLinode, getLinodesPage, GetOneRequest, GetOneResponse, GetPageRequest, GetPageResponse, requestAllLinodes, updateLinode, UpdateRequest, UpdateResponse } from 'src/store/linodes/linodes.requests';

export interface LinodeRequests {
  createLinode: (p: CreateRequest) => Promise<CreateResponse>,
  deleteLinode: (p: DeleteRequest) => Promise<DeleteResponse>,
  getLinodes: (p: GetPageRequest) => Promise<GetPageResponse>,
  getLinode: (p: GetOneRequest) => Promise<GetOneResponse>,
  updateLinode: (p: Partial<UpdateRequest>) => Promise<UpdateResponse>,
  cloneLinode: (p: CloneRequest) => Promise<CloneResponse>,
  getAllLinodes: () => Promise<Linode.Linode[]>,
}

export default connect(undefined, {
  createLinode: createLinode.request,
  deleteLinode: deleteLinode.request,
  getLinodes: getLinodesPage.request,
  getLinode: getLinode.request,
  updateLinode: updateLinode.request,
  getAllLinodes: requestAllLinodes,
});
