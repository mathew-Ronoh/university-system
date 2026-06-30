import EncryptedStorage from 'react-native-encrypted-storage';

export const getTokens = async () => {
  try {
    const accessToken = await EncryptedStorage.getItem('accessToken');
    const refreshToken = await EncryptedStorage.getItem('refreshToken');
    return { accessToken, refreshToken };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
};

export const setTokens = async (accessToken, refreshToken) => {
  try {
    await EncryptedStorage.setItem('accessToken', accessToken);
    await EncryptedStorage.setItem('refreshToken', refreshToken);
  } catch (e) {}
};

export const clearTokens = async () => {
  try {
    await EncryptedStorage.clear();
  } catch (e) {}
};

export const setUserData = async (user) => {
  try {
    await EncryptedStorage.setItem('userData', JSON.stringify(user));
  } catch (e) {}
};

export const getUserData = async () => {
  try {
    const data = await EncryptedStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const clearAll = async () => {
  try {
    await EncryptedStorage.clear();
  } catch (e) {}
};
