/** Level overview shown on the course map. */
export interface LevelInfo {
  tag: { bn: string; en: string }
  goal: { bn: string; en: string }
}

export const LEVELS: Record<string, LevelInfo> = {
  A1: { tag: { bn: 'আবেদনের ন্যূনতম শর্ত', en: 'Minimum requirement' }, goal: { bn: 'Goethe-Zertifikat A1', en: 'Goethe-Zertifikat A1' } },
  A2: { tag: { bn: 'বাড়তি পয়েন্টের জন্য', en: 'For extra points' }, goal: { bn: '~১৩০০ শব্দ · Goethe-Zertifikat A2', en: '~1,300 words · Goethe-Zertifikat A2' } },
  B1: { tag: { bn: 'বাড়তি পয়েন্টের জন্য', en: 'For extra points' }, goal: { bn: '~২৪০০ শব্দ · Goethe-Zertifikat B1', en: '~2,400 words · Goethe-Zertifikat B1' } },
}
export const LEVEL_ORDER = ['A1', 'A2', 'B1'] as const

export const UNIT_TITLES: Record<string, { de: string; bn: string; en: string }> = {
  'A1-0': { de: 'Start hier: Laute, Buchstaben, Zahlen', bn: 'শুরু এখানে: শব্দ, বর্ণ ও সংখ্যা (ঐচ্ছিক)', en: 'Start here: sounds, letters and numbers (optional)' },
  'A1-1': { de: 'Hallo!', bn: 'পরিচয় ও অভিবাদন', en: 'Introductions and greetings' },
  'A1-2': { de: 'Alphabet und Zahlen', bn: 'বর্ণমালা ও সংখ্যা', en: 'Alphabet and numbers' },
  'A1-3': { de: 'Familie', bn: 'পরিবার ও পেশা', en: 'Family and jobs' },
  'A1-4': { de: 'Essen und Einkaufen', bn: 'খাওয়া ও কেনাকাটা', en: 'Food and shopping' },
  'A1-5': { de: 'Zeit und Alltag', bn: 'সময় ও প্রতিদিনের জীবন', en: 'Time and daily life' },
  'A1-6': { de: 'Wohnen', bn: 'বাসস্থান', en: 'Housing' },
  'A1-7': { de: 'Stadt und Verkehr', bn: 'শহর ও যাতায়াত', en: 'City and getting around' },
  'A1-8': { de: 'Freizeit und Verabredungen', bn: 'অবসর ও দেখা-সাক্ষাৎ', en: 'Free time and meeting up' },
  'A1-9': { de: 'Kleidung und Wetter', bn: 'পোশাক, আবহাওয়া ও তারিখ', en: 'Clothes, weather and dates' },
  'A1-10': { de: 'Körper und Gesundheit', bn: 'শরীর ও স্বাস্থ্য', en: 'Body and health' },
  'A2-1': { de: 'Vergangenes erzählen', bn: 'অতীতের কথা বলা (Perfekt)', en: 'Talking about the past (Perfekt)' },
  'A2-2': { de: 'Im Büro', bn: 'অফিসের কাজ (Dativ, höflich fragen, weil)', en: 'Office work (dative, polite questions, weil)' },
  'A2-3': { de: 'Reisen planen', bn: 'ভ্রমণের পরিকল্পনা (Wechselpräpositionen, Vergleiche)', en: 'Planning a trip (two-way prepositions, comparisons)' },
  'A2-4': { de: 'Gesundheit', bn: 'স্বাস্থ্য ও ডাক্তার (reflexive Verben, dass)', en: 'Health and the doctor (reflexive verbs, dass)' },
  'A2-5': { de: 'Wohnungssuche', bn: 'বাসা খোঁজা (Adjektive, Relativsätze)', en: 'Finding a flat (adjectives, relative clauses)' },
  'A2-6': { de: 'Feste feiern', bn: 'উৎসব ও নিমন্ত্রণ (obwohl, Konjunktiv II)', en: 'Celebrations and invitations (obwohl, Konjunktiv II)' },
  'A2-7': { de: 'Medien', bn: 'মিডিয়া ও প্রযুক্তি (Passiv, je … desto)', en: 'Media and technology (passive, je … desto)' },
  'A2-8': { de: 'Lernen', bn: 'শেখা ও পরীক্ষা (zu + Infinitiv, um … zu)', en: 'Learning and exams (zu + infinitive, um … zu)' },
  'A2-9': { de: 'Natur und Wetter', bn: 'প্রকৃতি, আবহাওয়া ও পরিবেশ', en: 'Nature, weather and environment' },
  'A2-10': { de: 'Ämter', bn: 'অফিস-আদালত (Anmeldung, Bank, Briefe)', en: 'Offices and authorities (registration, bank, letters)' },
  'A2-11': { de: 'Freunde', bn: 'বন্ধুত্ব (Adjektive, sondern)', en: 'Friendship (adjectives, sondern)' },
  'A2-12': { de: 'Pläne', bn: 'ভবিষ্যৎ পরিকল্পনা ও A2 রিভিউ', en: 'Future plans and A2 review' },
  'B1-1': { de: 'Die Bewerbung', bn: 'চাকরির আবেদন ও ইন্টারভিউ', en: 'Job applications and interviews' },
  'B1-2': { de: 'Bei der Behörde', bn: 'অফিস-আদালত (Passiv, Konjunktiv II Vergangenheit)', en: 'Authorities (passive, past Konjunktiv II)' },
  'B1-3': { de: 'Umwelt', bn: 'পরিবেশ ও আলোচনা (zwar … aber, je … desto)', en: 'Environment and discussion (zwar … aber, je … desto)' },
  'B1-4': { de: 'Bildung', bn: 'শিক্ষা ব্যবস্থা ও উচ্চশিক্ষা', en: 'The education system and higher education' },
  'B1-5': { de: 'Technik', bn: 'প্রযুক্তি, KI ও ডেটা-নিরাপত্তা', en: 'Technology, AI and data security' },
  'B1-6': { de: 'Meinungen', bn: 'মতামত, যুক্তি ও তর্ক', en: 'Opinions, arguments and debate' },
  'B1-7': { de: 'Arbeitswelt', bn: 'কর্মজীবন, কনফ্লিক্ট ও ছুটি', en: 'Working life, conflict and leave' },
  'B1-8': { de: 'Gesellschaft', bn: 'সমাজ, পরিবার ও প্রতিবেশী', en: 'Society, family and neighbours' },
  'B1-9': { de: 'Konsum', bn: 'টাকা, বিজ্ঞাপন ও ভোক্তার অধিকার', en: 'Money, advertising and consumer rights' },
  'B1-10': { de: 'Geschichte', bn: 'জার্মানির ইতিহাস, EU ও অভিবাসন', en: 'German history, the EU and migration' },
  'B1-11': { de: 'Kultur', bn: 'উৎসব, খাবার ও সংস্কৃতির পার্থক্য', en: 'Festivals, food and cultural differences' },
  'B1-12': { de: 'Zukunft', bn: 'ভবিষ্যৎ, নাগরিকত্ব ও B1 পরীক্ষা', en: 'Future, citizenship and the B1 exam' },
}
