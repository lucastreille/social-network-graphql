export const getToken = (): string | null => {
    return localStorage.getItem('token');
  };
  
  export const setToken = (token: string, userId: string): void => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
  };
  
  export const removeToken = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };
  
  export const getUserId = (): string | null => {
    return localStorage.getItem('userId');
  };
  