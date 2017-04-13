import { thunkFetchFile } from './apiActionReducerGenerator';

export function addTicketAttachment(id, attachment) {
  const data = new FormData();
  data.append('file', attachment);
  return thunkFetchFile.post(`/support/tickets/${id}/attachments`, data, null);
}
