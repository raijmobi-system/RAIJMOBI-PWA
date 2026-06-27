import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';


async function efetuarLogout() {
  await SecureStoragePlugin.remove({ key: 'access_token' });
  await SecureStoragePlugin.remove({ key: 'refresh_token' });
}