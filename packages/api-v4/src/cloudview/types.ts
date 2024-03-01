export interface Namespace {
  id: number;
  label: string;
  region: string;
  type: string;
  urls: {
    ingest: string;
    read: string;
    agent_install: string;
  };
  created: string;
  updated: string;
}

export interface NamespaceApiKey {
  active_keys: {
    api_key: string;
    expiry: string;
  }[];
}
export interface CreateNameSpacePayload {
  label: string | null;
  region: string | null;
  type: string | null;
}
