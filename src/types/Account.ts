namespace Linode {
  export interface User {
    username: string;
    email: string;
    restricted: boolean;
    gravatarUrl?: string;
  }
}
