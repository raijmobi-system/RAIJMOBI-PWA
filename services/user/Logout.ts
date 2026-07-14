import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';


async function Logout() {
  await SecureStoragePlugin.remove({ key: 'access_token' });
  await SecureStoragePlugin.remove({ key: 'refresh_token' });
}