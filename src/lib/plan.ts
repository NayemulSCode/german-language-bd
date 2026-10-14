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
    planned: [['Vergangenes erzählen', 'অতীতের কথা বলা'], ['Im Büro', 'অফিসের কাজ'], ['Reisen planen', 'ভ্রমণের পরিকল্পনা'], ['Gesundheit', 'স্বাস্থ্য ও অ্যাপয়েন্টমেন্ট'], ['Wohnungssuche', 'বাসা খোঁজা'], ['Feste feiern', 'উৎসব'], ['Medien', 'মিডিয়া ও প্রযুক্তি'], ['Lernen', 'শেখা ও কোর্স'], ['Natur und Wetter', 'প্রকৃতি ও আবহাওয়া'], ['Ämter', 'অফিস-আদালত'], ['Freunde', 'বন্ধুত্ব'], ['Pläne', 'ভবিষ্যৎ পরিকল্পনা']],
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
  'A2-1': { de: 'Vergangenes erzählen', bn: 'অতীতের কথা বলা (Perfekt)' },
  'A2-2': { de: 'Im Büro', bn: 'অফিসের কাজ (Dativ, höflich fragen, weil)' },
  'A2-3': { de: 'Reisen planen', bn: 'ভ্রমণের পরিকল্পনা (Wechselpräpositionen, Vergleiche)' },
  'A2-4': { de: 'Gesundheit', bn: 'স্বাস্থ্য ও ডাক্তার (reflexive Verben, dass)' },
  'A2-5': { de: 'Wohnungssuche', bn: 'বাসা খোঁজা (Adjektive, Relativsätze)' },
  'A2-6': { de: 'Feste feiern', bn: 'উৎসব ও নিমন্ত্রণ (obwohl, Konjunktiv II)' },
  'A2-7': { de: 'Medien', bn: 'মিডিয়া ও প্রযুক্তি (Passiv, je … desto)' },
  'A2-8': { de: 'Lernen', bn: 'শেখা ও পরীক্ষা (zu + Infinitiv, um … zu)' },
  'A2-9': { de: 'Natur und Wetter', bn: 'প্রকৃতি, আবহাওয়া ও পরিবেশ' },
  'A2-10': { de: 'Ämter', bn: 'অফিস-আদালত (Anmeldung, Bank, Briefe)' },
  'A2-11': { de: 'Freunde', bn: 'বন্ধুত্ব (Adjektive, sondern)' },
  'A2-12': { de: 'Pläne', bn: 'ভবিষ্যৎ পরিকল্পনা ও A2 রিভিউ' },
  'B1-1': { de: 'Die Bewerbung', bn: 'চাকরির আবেদন ও ইন্টারভিউ' },
  'B1-2': { de: 'Bei der Behörde', bn: 'অফিস-আদালত (Passiv, Konjunktiv II Vergangenheit)' },
  'B1-3': { de: 'Umwelt', bn: 'পরিবেশ ও আলোচনা (zwar … aber, je … desto)' },
  'B1-4': { de: 'Bildung', bn: 'শিক্ষা ব্যবস্থা ও উচ্চশিক্ষা' },
  'B1-5': { de: 'Technik', bn: 'প্রযুক্তি, KI ও ডেটা-নিরাপত্তা' },
  'B1-6': { de: 'Meinungen', bn: 'মতামত, যুক্তি ও তর্ক' },
  'B1-7': { de: 'Arbeitswelt', bn: 'কর্মজীবন, কনফ্লিক্ট ও ছুটি' },
  'B1-8': { de: 'Gesellschaft', bn: 'সমাজ, পরিবার ও প্রতিবেশী' },
  'B1-9': { de: 'Konsum', bn: 'টাকা, বিজ্ঞাপন ও ভোক্তার অধিকার' },
  'B1-10': { de: 'Geschichte', bn: 'জার্মানির ইতিহাস, EU ও অভিবাসন' },
  'B1-11': { de: 'Kultur', bn: 'উৎসব, খাবার ও সংস্কৃতির পার্থক্য' },
  'B1-12': { de: 'Zukunft', bn: 'ভবিষ্যৎ, নাগরিকত্ব ও B1 পরীক্ষা' },
}
