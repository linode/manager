export interface APIError {
  field?: string;
  reason: string;
}

export interface APIWarning {
  title: string;
  detail: string;
}

export interface ConfigOverride {
  baseURL?: string;
}

export interface ResourcePage<T> {
  data: T[];
  page: number;
  pages: number;
  results: number;
}

// Credit: https://stackoverflow.com/a/47914643
//
// Allows consumer to apply Partial to each key in a nested interface.
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
