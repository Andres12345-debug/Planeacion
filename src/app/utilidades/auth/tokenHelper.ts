const KEY = "TOKEN_AUTORIZACION";

export const tokenHelper = {
  get: (): string | null => sessionStorage.getItem(KEY),
  set: (token: string): void => sessionStorage.setItem(KEY, token),
  remove: (): void => sessionStorage.removeItem(KEY),
};
