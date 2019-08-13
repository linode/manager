export interface APIError {
  field?: string;
  reason: string;
}

export interface ConfigOverride {
  baseURL?: string;
}