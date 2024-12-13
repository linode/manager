import { Linode } from '../linodes';

export interface Tag {
  label: string;
}

export interface TagRequest {
  label: string;
  linodes?: number[];
}

export type TaggedObject = { type: 'linode'; data: Linode };
