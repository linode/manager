import type { Image } from '../images';
import type { Linode } from '../linodes';

export interface Tag {
  label: string;
}

export interface TagRequest {
  label: string;
  linodes?: number[];
}

export type TaggedObject =
  | { data: Image; type: 'image' }
  | { data: Linode; type: 'linode' };
