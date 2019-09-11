export interface APIError {
  field?: string;
  reason: string;
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
