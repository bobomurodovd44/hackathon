export interface StorageService {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

export class LocalStorageService implements StorageService {
  get(key: string) {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  set(key: string, value: string) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(e);
    }
  }
}

export type SupportedLang = 'ru' | 'uz';

export class I18nService {
  private storage: StorageService;
  private currentLang: SupportedLang = 'ru';
  
  constructor(storage: StorageService) {
    this.storage = storage;
    const saved = this.storage.get('i18n_lang') as SupportedLang;
    if (saved === 'ru' || saved === 'uz') {
      this.currentLang = saved;
    }
  }

  getLang(): SupportedLang {
    return this.currentLang;
  }

  setLang(lang: SupportedLang) {
    this.currentLang = lang;
    this.storage.set('i18n_lang', lang);
  }
}

export const i18nService = new I18nService(new LocalStorageService());
