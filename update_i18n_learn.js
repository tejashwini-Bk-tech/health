const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, 'lib', 'i18n');
const languages = ['en', 'as', 'mni', 'kha', 'brx'];

const updates = {
  learn: {
    title: {
      en: "Health Education",
      as: "স্বাস্থ্য শিক্ষা",
      mni: "হকশেলগী মতাংদা তমশিঞ্জবা",
      kha: "Jingnang ka Koit ka Khiah",
      brx: "सावस्रि सोलोंथाइ"
    },
    subtitle: {
      en: "Learn how to protect yourself and your community",
      as: "নিজকে আৰু আপোনাৰ সম্প্ৰদায়ক কেনেদৰে সুৰক্ষিত কৰিব লাগে শিকক",
      mni: "ইশাবু অমসুং খুন্নাইবু করম্না ঙাকথোক্কদগে হায়বা তমশিঞ্জবিয়ু",
      kha: "Hikai kumno ban yada ïalade bad ka shnong jong phi",
      brx: "गावनो गाव आरो समाजखौ रैखा खालाम"
    },
    allTips: {
      en: "All Tips",
      as: "সকলো পৰামৰ্শ",
      mni: "পরামশ পুম্নমক",
      kha: "Ki Jinghikai Baroh",
      brx: "गासैबो सुबुं सोलोंथाइ"
    },
    waterSafety: {
      en: "Water Safety",
      as: "পানীৰ সুৰক্ষা",
      mni: "ইশিংগী চেকশিন-থৌরাং",
      kha: "Jingkoit ka Um",
      brx: "दैनि रैखाथि"
    },
    hygiene: {
      en: "Hygiene",
      as: "পৰিষ্কাৰ-পৰিচ্ছন্নতা",
      mni: "লু-নান্না লৈবা",
      kha: "Jingkhuid Jingsuba",
      brx: "साखोन-सिखोन"
    },
    prevention: {
      en: "Prevention",
      as: "প্ৰতিৰোধ",
      mni: "ঙাকথোকপা",
      kha: "Jingiada",
      brx: "होबथानाय"
    },
    treatment: {
      en: "Treatment",
      as: "চিকিৎসা",
      mni: "লায়েংবা",
      kha: "Jingsumar",
      brx: "फाहामथाइ"
    },
    tipOfTheDay: {
      en: "TIP OF THE DAY",
      as: "আজিৰ পৰামৰ্শ",
      mni: "ঙসিগী পরামশ",
      kha: "JINGHIKAI MYNTA KA SNGI",
      brx: "दिनैनि सुबुं सोलोंथाइ"
    },
    boilWaterTitle: {
      en: "Boil Your Water",
      as: "আপোনাৰ পানী উতলাওক",
      mni: "ইশিং শাউহনবিয়ু",
      kha: "Pynshet ia ka Um",
      brx: "दैखौ फुदुं"
    },
    boilWaterDesc: {
      en: "Always boil drinking water for at least 1 minute to kill harmful bacteria and parasites that cause waterborne diseases.",
      as: "পানীৰ পৰা হোৱা ৰোগ সৃষ্টিকাৰী ক্ষতিকাৰক বেক্টেৰিয়া আৰু পৰজীৱী ধ্বংস কৰিবলৈ খোৱাপানী সদায় কমেও ১ মিনিট উতলাওক।",
      mni: "ইশিংদগী থোকপা লায়না কায়হন্নবা অমসুং বেক্টেরিয়া হাৎনবা থক্নবা ইশিং য়ামদ্রবদা মিনট ১ শাউহনবিয়ু।",
      kha: "Barobor pynshet ia ka um dih palat 1 minit ban pyniap ia ki khniang ba pynpang shhi um.",
      brx: "दैजों गोसारनाय बेरामनि बेक्टेरिया फोथैनायनि थाखाय लोंनाय दैखौ खमैबो 1 मिनिट फुदुं।"
    },
    quickFacts: {
      en: "Quick Facts",
      as: "দ্ৰুত তথ্য",
      mni: "অথুবা ৱারোল",
      kha: "Ki Jingkheiñ Khuid",
      brx: "गोख्रै खौरां"
    },
    healthTips: {
      en: "Health Tips",
      as: "স্বাস্থ্যৰ পৰামৰ্শ",
      mni: "হকশেলগী পরামশ",
      kha: "Ki Jinghikai Koit Khiah",
      brx: "सावस्रि सोलोंथाइ"
    },
    emergencyContact: {
      en: "Emergency Contact",
      as: "জৰুৰীকালীন যোগাযোগ",
      mni: "খুন্দাক্কী পাউ ফাওনফম",
      kha: "Kumno ban iakynduh",
      brx: "गोख्रै खौरां"
    },
    emergencyDesc: {
      en: "If you experience severe symptoms, contact the health center immediately.",
      as: "যদি আপুনি গুৰুতৰ লক্ষণ অনুভৱ কৰে, তেন্তে লগে লগে স্বাস্থ্য কেন্দ্ৰৰ সৈতে যোগাযোগ কৰক।",
      mni: "করিগুম্বা অদোমদা অকনবা লক্ষণ লৈরবদি থুনা হকশেল কেন্দ্রদা পাউ ফাওনবিয়ু।",
      kha: "Lada ioh ki dak pang shyrkhei, pyntip mardor sha jaka sumar ba jan.",
      brx: "जुदि नोंथांआव गोब्राब नेरसोन नुजादों, अब्ला गोख्रै सावस्रि केन्द्रजों खौरां खालाम।"
    },
    callCenter: {
      en: "Call Health Center",
      as: "স্বাস্থ্য কেন্দ্ৰলৈ কল কৰক",
      mni: "হকশেল কেন্দ্রদা কোল তৌবিয়ু",
      kha: "Kylli sha jaka sumar",
      brx: "सावस्रि केन्द्रजों फोन खालाम"
    },
    remember: {
      en: "Remember",
      as: "মনত ৰাখিব",
      mni: "নিংশিংবিয়ু",
      kha: "Kynmaw",
      brx: "गोसोआव लाखि"
    },
    rememberDesc: {
      en: "Prevention is better than cure. Share this information with your family and neighbors to keep everyone safe.",
      as: "প্ৰতিৰোধ চিকিৎসাতকৈ শ্ৰেষ্ঠ। সকলোকে সুৰক্ষিত ৰাখিবলৈ এই তথ্যখিনি আপোনাৰ পৰিয়াল আৰু চুবুৰীয়াৰ সৈতে শ্বেয়াৰ কৰক।",
      mni: "ঙাকথোকপনা লায়েংবদগী হেন্না ফৈ। পুম্নমকপু ঙাকথোকনবা ৱারোল অসি ইমুং-মনুং অমসুং য়ুমলোননবাশিংদা পাউদমবিয়ু।",
      kha: "Jingiada ka kham bha ban ia ka jingsumar. Sam ia kane ka jingtip.",
      brx: "होबथानाया फाहामथाइनि आरो मोजां। बयखौबो रैखा खालामनो बे खौरांखौ नखर आरो गामिनि सुबुंफोरजों रान।"
    },
    close: {
      en: "Close",
      as: "বন্ধ কৰক",
      mni: "থিংবা",
      kha: "Khang",
      brx: "बन्द"
    },
    shareTip: {
      en: "Share Tip",
      as: "পৰামৰ্শ শ্বেয়াৰ কৰক",
      mni: "পরামশ শিয়র তৌবিয়ু",
      kha: "Sam ia ka jinghikai",
      brx: "सोलोंथाइ रान"
    }
  }
};

languages.forEach(lang => {
  const filePath = path.join(i18nDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // update learn keys completely
    data.learn = { ...(data.learn || {}), ...updates.learn };
    for (const [key, value] of Object.entries(updates.learn)) {
      data.learn[key] = value[lang];
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated learn in ${lang}.json`);
  }
});
