import { connect } from 'react-redux';
import { CloneRequest, CloneResponse, CreateRequest, CreateResponse, DeleteRequest, DeleteResponse, GetOneRequest, GetOneResponse, GetPageRequest, GetPageResponse, requestCreateLinode, requestDeleteLinode, requestGetLinodesPage, requestGetOneLinode, requestUpdateLinode, UpdateRequest, UpdateResponse, requestAllLinodes } from 'src/store/linodes/linodes.requests';

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
  createLinode: requestCreateLinode,
  deleteLinode: requestDeleteLinode,
  getLinodes: requestGetLinodesPage,
  getLinode: requestGetOneLinode,
  updateLinode: requestUpdateLinode,
  getAllLinodes: requestAllLinodes,
});
