import * as Yup from 'yup';

export const createSupportTicketSchema = Yup.object({
  summary: Yup.string()
    .required('Summary is required')
    .min(1, 'Summary must be between 1 and 64 characters.')
    .max(64, 'Summary must be between 1 and 64 characters.')
    .trim(),
  description: Yup.string()
    .required('Description is required')
    .min(1, 'Description must be between 1 and 64,000 characters.')
    .max(64000, 'Description must be between 1 and 64,000 characters.')
    .trim(),
  domain_id: Yup.number(),
  linode_id: Yup.number(),
  longviewclient_id: Yup.number(),
  nodebalancer_id: Yup.number(),
  volume_id: Yup.number(),
});