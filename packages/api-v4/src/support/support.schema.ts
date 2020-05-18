import { number, object, string } from 'yup';

export const createSupportTicketSchema = object({
  summary: string()
    .required('Summary is required.')
    .min(1, 'Summary must be between 1 and 64 characters.')
    .max(64, 'Summary must be between 1 and 64 characters.')
    .trim(),
  description: string()
    .required('Description is required.')
    .min(1, 'Description must be between 1 and 64,000 characters.')
    .max(64000, 'Description must be between 1 and 64,000 characters.')
    .trim(),
  domain_id: number(),
  linode_id: number(),
  longviewclient_id: number(),
  nodebalancer_id: number(),
  volume_id: number()
});

export const createReplySchema = object({
  description: string()
    .required('Description is required.')
    .min(1, 'Description must be between 1 and 65,535 characters.')
    .max(65535, 'Description must be between 1 and 65,535 characters.')
    .trim()
});
