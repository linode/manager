import { fetchFile } from '../fetch';


export function addTicketAttachment(id, attachment) {
  const data = new FormData();
  data.append('file', attachment);
  return fetchFile.post(`/support/tickets/${id}/attachments`, data, null);
}
