import Cookies from 'js-cookie'

export const cookieStorage = {
  getItem: (key: string) => Cookies.get(key),
  setItem: (key: string, value: any) => Cookies.set(key, value, { expires: 7, path: '/' }),
  removeItem: (key: string) => Cookies.remove(key)
}
