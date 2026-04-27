const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, 'lib', 'i18n');
const languages = ['en', 'as', 'mni', 'kha', 'brx'];

const updates = {
  dashboard: {
    goodMorning: {
      en: "Good Morning!",
      as: "সুপ্ৰভাত!",
      mni: "অয়ুক্কী খুরুমজরি!",
      kha: "Kumno shibun step!",
      brx: "मोजां फुं!"
    },
    goodAfternoon: {
      en: "Good Afternoon!",
      as: "শুভ দুপৰীয়া!",
      mni: "নুমিদাংৱাইরুমগী খুরুমজরি!",
      kha: "Kumno sngi!",
      brx: "मोजां सानजौफु!"
    },
    goodEvening: {
      en: "Good Evening!",
      as: "শুভ সন্ধ্যা!",
      mni: "নুমিদাংগী খুরুমজরি!",
      kha: "Kumno janmiet!",
      brx: "मोजां बेलासि!"
    }
  }
};

languages.forEach(lang => {
  const filePath = path.join(i18nDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.dashboard) {
      data.dashboard.goodMorning = updates.dashboard.goodMorning[lang];
      data.dashboard.goodAfternoon = updates.dashboard.goodAfternoon[lang];
      data.dashboard.goodEvening = updates.dashboard.goodEvening[lang];
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated greetings in ${lang}.json`);
  }
});
