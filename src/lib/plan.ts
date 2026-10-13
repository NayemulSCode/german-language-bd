/** Level overview from the design. Only A1 has lessons so far; the other levels show their planned units. */
export interface LevelInfo {
  tag: string
  goal: string
  planned: [de: string, bn: string][]
}

export const LEVELS: Record<string, LevelInfo> = {
  A1: { tag: 'আবেদনের ন্যূনতম শর্ত', goal: 'Goethe-Zertifikat A1', planned: [] },
  A2: {
    tag: 'বাড়তি পয়েন্টের জন্য', goal: '~১৩০০ শব্দ · Goethe-Zertifikat A2',
    planned: [['Im Büro', 'অফিসের কাজ'], ['Reisen planen', 'ভ্রমণের পরিকল্পনা'], ['Gesundheit', 'স্বাস্থ্য ও অ্যাপয়েন্টমেন্ট'], ['Wohnungssuche', 'বাসা খোঁজা'], ['Feste feiern', 'উৎসব'], ['Medien', 'মিডিয়া ও প্রযুক্তি'], ['Lernen', 'শেখা ও কোর্স'], ['Kleidung', 'পোশাক'], ['Natur und Wetter', 'প্রকৃতি ও আবহাওয়া'], ['Ämter', 'অফিস-আদালত'], ['Freunde', 'বন্ধুত্ব'], ['Pläne', 'ভবিষ্যৎ পরিকল্পনা']],
  },
  B1: {
    tag: 'বাড়তি পয়েন্টের জন্য', goal: '~২৪০০ শব্দ · Goethe-Zertifikat B1',
    planned: [['Die Bewerbung', 'চাকরির আবেদন'], ['Bei der Behörde', 'Behörde-তে'], ['Umwelt', 'পরিবেশ'], ['Bildung', 'শিক্ষা ব্যবস্থা'], ['Technik', 'প্রযুক্তি'], ['Meinungen', 'মতামত দেওয়া'], ['Arbeitswelt', 'কর্মজীবন'], ['Gesellschaft', 'সমাজ'], ['Konsum', 'ভোগ ও অর্থ'], ['Geschichte', 'জার্মানির ইতিহাস'], ['Kultur', 'সংস্কৃতি'], ['Zukunft', 'ভবিষ্যৎ']],
  },
}
export const LEVEL_ORDER = ['A1', 'A2', 'B1'] as const

export const UNIT_TITLES: Record<string, { de: string; bn: string }> = {
  'A1-1': { de: 'Hallo!', bn: 'পরিচয় ও অভিবাদন' },
  'A1-2': { de: 'Alphabet und Zahlen', bn: 'বর্ণমালা ও সংখ্যা' },
  'A1-3': { de: 'Familie', bn: 'পরিবার ও পেশা' },
  'A1-4': { de: 'Essen und Einkaufen', bn: 'খাওয়া ও কেনাকাটা' },
  'A1-5': { de: 'Zeit und Alltag', bn: 'সময় ও প্রতিদিনের জীবন' },
  'A1-6': { de: 'Wohnen', bn: 'বাসস্থান' },
  'A1-7': { de: 'Stadt und Verkehr', bn: 'শহর ও যাতায়াত' },
  'A1-8': { de: 'Freizeit und Verabredungen', bn: 'অবসর ও দেখা-সাক্ষাৎ' },
  'A1-9': { de: 'Kleidung und Wetter', bn: 'পোশাক, আবহাওয়া ও তারিখ' },
  'A1-10': { de: 'Körper und Gesundheit', bn: 'শরীর ও স্বাস্থ্য' },
}
