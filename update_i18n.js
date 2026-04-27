const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, 'lib', 'i18n');
const languages = ['en', 'as', 'mni', 'kha', 'brx'];

const updates = {
  report: {
    title: {
      en: "What would you like to report?",
      as: "আপুনি কি ৰিপোৰ্ট কৰিব বিচাৰে?",
      mni: "অদোম্না করি পাউদম পিনিংলি?",
      kha: "Kumno phin pynmih?",
      brx: "नोंथांआ मा खौरां होनो सानदों?"
    },
    subtitle: {
      en: "Select the type of report you want to submit",
      as: "আপুনি দাখিল কৰিব বিচৰা ৰিপোৰ্টৰ প্ৰকাৰ বাছনি কৰক",
      mni: "অদোম্না পিনিংলিবা পাউদম পরিং খনবিয়ু",
      kha: "Jied ia ka jingujor jong phi",
      brx: "नोंथांनि खौरांनि रोखोमखौ सायख"
    },
    healthSymptoms: {
      en: "Health Symptoms",
      as: "স্বাস্থ্যৰ লক্ষণসমূহ",
      mni: "হকশেলগী লক্ষণসমূহ",
      kha: "Ki Dak Pang",
      brx: "सावस्रिनि नेरसोन"
    },
    healthDesc: {
      en: "Report sickness, fever, or other symptoms in your family.",
      as: "আপোনাৰ পৰিয়ালত ৰোগ, জ্বৰ বা আন লক্ষণসমূহৰ ৰিপোৰ্ট কৰক।",
      mni: "অদোমগী ইমুং-মনুংদা অনা-লায়না, অশাবা, নত্রগা অতৈ লক্ষণসমূহ পাউদমবিয়ু।",
      kha: "Ujor pang bad kumta ter ter ha iing phi.",
      brx: "नोंथांनि नखराव बेराम, गोजांनाय, एबा गुबुन नेरसोननि खौरां हो।"
    },
    waterIssue: {
      en: "Water Issue",
      as: "পানীৰ সমস্যা",
      mni: "ইশিংগী খুদোংচাদবা",
      kha: "Jingeh um",
      brx: "दैनि जेंना"
    },
    waterDesc: {
      en: "Report contaminated water, bad smell, or dried up sources.",
      as: "দূষিত পানী, বেয়া গোন্ধ, বা শুকাই যোৱা উৎসৰ ৰিপোৰ্ট কৰক।",
      mni: "অদুকতবা ইশিং, মনম ফাংবা, নত্রগা কংখ্রবা হৌরকফম পাউদমবিয়ু।",
      kha: "Ujor ha kaba iadei bad ka um jakhlia bad kumta.",
      brx: "गाज्रि दै, गाज्रि मोनामनाय, एबा गोरा दैनि फुंखानि खौरां हो।"
    },
    symptomsTitle: {
      en: "What symptoms are you experiencing?",
      as: "আপুনি কি কি লক্ষণ অনুভৱ কৰিছে?",
      mni: "অদোমদা করি করি লক্ষণ লৈরি?",
      kha: "Ki dak pang aiu phi ioh?",
      brx: "नोंथांआव मा नेरसोन नुजादों?"
    },
    selectAll: {
      en: "Select all that apply",
      as: "প্ৰযোজ্য সকলো বাছনি কৰক",
      mni: "চুনবা পুম্নমক খনবিয়ু",
      kha: "Jied ia ki ba iadei",
      brx: "गासैबो सायख"
    },
    waterSourceTitle: {
      en: "Where does this water come from?",
      as: "এই পানী ক'ৰ পৰা আহে?",
      mni: "ইশিং অসি কদাইদগী লাকপগে?",
      kha: "Nangno wan kane ka um?",
      brx: "बे दैआ बबेनिफ्राय फैयो?"
    },
    waterSourceSub: {
      en: "Select the source of the water",
      as: "পানীৰ উৎস বাছনি কৰক",
      mni: "ইশিংগী হৌরকফম খনবিয়ু",
      kha: "Jied tdem um",
      brx: "दैनि फुंखाखौ सायख"
    },
    severityTitle: {
      en: "How severe are your symptoms?",
      as: "আপোনাৰ লক্ষণসমূহ কিমান গুৰুতৰ?",
      mni: "লক্ষণসমূহ কয়া য়াম্না অকনবগে?",
      kha: "Katno khia ki dak pang?",
      brx: "नेरसोनफोरा बेसेबां गोब्राब?"
    },
    severitySub: {
      en: "This helps us prioritize your report",
      as: "ইয়াই আপোনাৰ ৰিপোৰ্টক অগ্ৰাধিকাৰ দিয়াত সহায় কৰে",
      mni: "অসিনা পাউদম থুংহনবদা মতেং পাংই",
      kha: "Kane kan iarap kumno ban leh",
      brx: "बेयो खौरां थाब मावफुंनायाव हेफाजाब होगोन"
    },
    isWaterSafe: {
      en: "Is this water safe to use?",
      as: "এই পানী ব্যৱহাৰৰ বাবে সুৰক্ষিতনে?",
      mni: "ইশিং অসি শিজিন্ননবা চুন্না লৈরিব্রা?",
      kha: "Hato lah ban pyndonkam ia ka um?",
      brx: "बे दैखौ बाहायनो मोजां ना?"
    },
    safeWaterVal: {
      en: "Safe to Drink",
      as: "খোৱাৰ বাবে সুৰক্ষিত",
      mni: "থক্নবা চুন্না লৈরে",
      kha: "Sngewbha ban dih",
      brx: "लोंनो मोजां"
    },
    unsafeWaterVal: {
      en: "Contaminated / Unsafe",
      as: "দূষিত / অসুৰক্ষিত",
      mni: "অদুকতবা / চুন্দবা",
      kha: "Ka um jakhlia",
      brx: "गाज्रि / खैफोद गोनां"
    },
    locationTitle: {
      en: "Where are you located?",
      as: "আপুনি ক'ত অৱস্থিত?",
      mni: "অদোম কদাইদা লৈরি?",
      kha: "Phi shong hangno?",
      brx: "नोंथांनि जायगाया बबेयाव?"
    },
    locationSub: {
      en: "Select your village",
      as: "আপোনাৰ গাঁও বাছনি কৰক",
      mni: "অদোমগী খুঞ্জা খনবিয়ু",
      kha: "Jied ka shnong jong phi",
      brx: "नोंथांनि गामिखौ सायख"
    },
    reviewTitle: {
      en: "Review Your Report",
      as: "আপোনাৰ ৰিপোৰ্ট পুনৰীক্ষণ কৰক",
      mni: "অদোমগী পাউদম অমুক হন্না য়েংবিয়ু",
      kha: "Peit biang ka jingujor",
      brx: "नोंथांनि खौरां नायफिन"
    },
    reviewSub: {
      en: "Please confirm the details below",
      as: "অনুগ্ৰহ কৰি তলৰ বিৱৰণ নিশ্চিত কৰক",
      mni: "মখাগী ৱারোলশিং অসি শোয়দ্রে মিকপ থোকপিয়ু",
      kha: "Pynskhem ki jingbatai harum",
      brx: "गाहायनि रोखायै रोखा खालाम"
    },
    back: {
      en: "Back",
      as: "উভতি যাওক",
      mni: "হনবা",
      kha: "Kynran",
      brx: "उन"
    },
    continue: {
      en: "Continue",
      as: "আগবাঢ়ক",
      mni: "মখা চত্থবা",
      kha: "Pynbteng",
      brx: "सालाय लां"
    },
    submitParams: {
      en: "Submit Report",
      as: "ৰিপোৰ্ট দাখিল কৰক",
      mni: "পাউদম থাজিনবিয়ু",
      kha: "Phah Ujor",
      brx: "खौरां थिसन"
    }
  }
};

languages.forEach(lang => {
  const filePath = path.join(i18nDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Add additional report keys
    if (!data.report) data.report = {};
    for (const [key, value] of Object.entries(updates.report)) {
      data.report[key] = value[lang];
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}.json`);
  }
});
