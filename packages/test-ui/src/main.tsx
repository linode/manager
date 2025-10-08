import { createRoot } from 'react-dom/client'
import { getProfile, type Profile, baseRequest } from '@linode/api-v4';
import { useEffect, useState } from 'react'
import { OAuthClient, AuthProvider } from '@linode/oauth'
import type { AxiosError } from 'axios';

const client = new OAuthClient({
  loginUrl: "https://login.linode.com",
  clientId: "9b424eef5e9a4fead2d9",
  callbackUrl: "http://localhost:3000/oauth/callback",
  onError(error) {
    console.error(error);
  }
});

baseRequest.interceptors.request.use((req) => {
  const token = client.getToken()
  req.headers.setAuthorization(token);
  return req;
});

baseRequest.interceptors.response.use(undefined, (error: AxiosError) => {
  if (error.status === 401) {
    client.login();
  }
});

function App() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  return (
    <p>Hello {profile?.username}</p>
  )
}

createRoot(document.getElementById('root')!).render(
  <AuthProvider client={client}>
    <App />
  </AuthProvider>
)
