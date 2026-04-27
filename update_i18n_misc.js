const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, 'lib', 'i18n');
const languages = ['en', 'as', 'mni', 'kha', 'brx'];

const updates = {
  dashboard: {
    thisWeek: {
      en: "this week",
      as: "এই সপ্তাহত",
      mni: "চয়োল অসিদা",
      kha: "mynta u taiew",
      brx: "बे सप्तायाव"
    }
  },
  alerts: {
    outbreak: {
      en: "Outbreak",
      as: "প্ৰাদুৰ্ভাৱ",
      mni: "থোকরকপা",
      kha: "Saphriang",
      brx: "गोसारनाय"
    },
    warning: {
      en: "Warning",
      as: "সতৰ্কবাণী",
      mni: "চেকশিনৱা",
      kha: "Maham",
      brx: "सांग्रांथि"
    },
    info: {
      en: "Information",
      as: "তথ্য",
      mni: "পাউ",
      kha: "Jingtip",
      brx: "खौरां"
    },
    prevention: {
      en: "Prevention",
      as: "প্ৰতিৰোধ",
      mni: "ঙাকথোকপা",
      kha: "Jingiada",
      brx: "होबथानाय"
    }
  },
  disease: {
    diarrhea: { en: "Diarrhea", as: "ডায়েৰিয়া", mni: "ডায়রিয়া", kha: "Suhtkpoh", brx: "डायरिया" },
    fever: { en: "Fever", as: "জ্বৰ", mni: "অশাবা", kha: "Khieshoh", brx: "गोजांनाय" },
    vomiting: { en: "Vomiting", as: "বমি", mni: "খাকপা", kha: "Pruid", brx: "गिखनाय" },
    stomach_pain: { en: "Stomach Pain", as: "পেটৰ বিষ", mni: "পুক নুংঙাইতবা", kha: "Pang kpoh", brx: "उदै सानाय" },
    nausea: { en: "Nausea", as: "বমি ভাৱ", mni: "খাকনিংবা", kha: "Pruid", brx: "गिख-गिख" },
    dehydration: { en: "Dehydration", as: "ডিহাইড্ৰেচন", mni: "ইশিং ৱাৎপা", kha: "Ring um", brx: "दै गैयै" },
    weakness: { en: "Weakness", as: "দুৰ্বলতা", mni: "শোনবা", kha: "Tlot", brx: "लोब-लोब" },
    headache: { en: "Headache", as: "মূৰৰ বিষ", mni: "কোক ঙাংবা", kha: "Pang khlieh", brx: "खरा सानाय" },
    cholera: { en: "Cholera", as: "কলেৰা", mni: "কোলেরা", kha: "Kholera", brx: "कलेरा" },
    typhoid: { en: "Typhoid", as: "টাইফয়ড", mni: "টাইফয়েড", kha: "Taiphod", brx: "टायफाइड" },
    dysentery: { en: "Dysentery", as: "গ্ৰহণী", mni: "ঈ চৎপা", kha: "Pruid snam", brx: "गिदिं-गिदिं" },
    hepatitis: { en: "Hepatitis", as: "হেপাটাইটিছ", mni: "হেপাটাইতিস", kha: "Hepataitis", brx: "हेपाटाइटिस" }
  }
};

languages.forEach(lang => {
  const filePath = path.join(i18nDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    data.dashboard = { ...data.dashboard, ...Object.fromEntries(Object.keys(updates.dashboard).map(k => [k, updates.dashboard[k][lang]])) };
    data.alerts = { ...data.alerts, ...Object.fromEntries(Object.keys(updates.alerts).map(k => [k, updates.alerts[k][lang]])) };
    data.disease = updates.disease ? Object.fromEntries(Object.keys(updates.disease).map(k => [k, updates.disease[k][lang]])) : {};
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}.json`);
  }
});
