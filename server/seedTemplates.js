import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Template from './Model/Template.js';
import { connectDB } from './config/db.js';

dotenv.config();

const templates = [
  // English
  { days_before: 30, language: "English", content: "Hello {name}! Just a friendly reminder that your special day is in 30 days on {date}. We're so excited to be a part of it! 📸" },
  { days_before: 30, language: "English", content: "Hi {name}! With 30 days to go until {date}, the countdown has officially begun! We can't wait to capture your beautiful moments. ✨" },
  { days_before: 15, language: "English", content: "Hey {name}! Just two weeks until your event on {date}! We're getting everything perfect for you. ✨" },
  { days_before: 15, language: "English", content: "Hi {name}, the excitement is building! Only 15 days left until we see you on {date}. Let the final countdown begin! ⏳" },
  { days_before: 7, language: "English", content: "Hi {name}, just one week until your event on {date}! We hope you're as excited as we are. See you soon! 🎉" },
  { days_before: 3, language: "English", content: "Hello {name}! We're just 3 days away from your event on {date}! We are so excited to be part of your special day. 📸" },
  { days_before: 1, language: "English", content: "Tomorrow is the day, {name}! We're all set for your event. Get a good night's rest, and we'll see you tomorrow! 💖" },

  // Hinglish
  { days_before: 30, language: "Hinglish", content: "Namaste {name}! Aapke event ({date}) mein sirf 30 din bache hai. Hum bahut excited hain! 📸" },
  { days_before: 30, language: "Hinglish", content: "Hi {name}! Countdown shuru ho gaya hai! Aapka special day ({date}) bas 30 din door hai. Can't wait! ✨" },
  { days_before: 15, language: "Hinglish", content: "Hi {name}! Sirf 2 hafte bache hai aapke event ({date}) ke liye! Hum sab taiyaari kar rahe hain. ✨" },
  { days_before: 15, language: "Hinglish", content: "Namaste {name}, excitement badh raha hai! {date} ko milne mein bas 15 din baaki hain. ⏳" },
  { days_before: 7, language: "Hinglish", content: "Hi {name}, bas ek hafta aur! Aapka event {date} ko hai. Get ready for some amazing pictures! 🎉" },
  { days_before: 3, language: "Hinglish", content: "Hello {name}! Aapke event ({date}) mein sirf 3 din baaki hain! Hum bahut utsaahit hain. 📸" },
  { days_before: 1, language: "Hinglish", content: "Kal aapka bada din hai, {name}! See you tomorrow, get some good sleep! 💖" },

  // Hindi
  { days_before: 30, language: "Hindi", content: "नमस्ते {name}! आपके विशेष दिन ({date}) में सिर्फ 30 दिन बचे हैं। हम इसका हिस्सा बनने के लिए बहुत उत्साहित हैं! 📸" },
  { days_before: 30, language: "Hindi", content: "प्रिय {name}, आपका बुकिंग कन्फर्म हो गया है। {date} के आपके कार्यक्रम के लिए हम बहुत उत्साहित हैं। ३० दिन शेष!" },
  { days_before: 15, language: "Hindi", content: "नमस्ते {name}, आपके कार्यक्रम ({date}) में अब केवल १५ दिन बचे हैं। आशा है आप भी उत्साहित होंगे! ✨" },
  { days_before: 15, language: "Hindi", content: "{name} जी, आपके खास दिन ({date}) की उलटी गिनती शुरू हो गई है! केवल १५ दिन शेष। ⏳" },
  { days_before: 7, language: "Hindi", content: "नमस्ते {name}, बस एक हफ्ता और! आपका कार्यक्रम {date} को है। कुछ अद्भुत तस्वीरों के लिए तैयार हो जाइए! 🎉" },
  { days_before: 3, language: "Hindi", content: "नमस्ते {name}, आपका इंतज़ार लगभग खत्म हुआ! {date} को आपके कार्यक्रम में बस ३ दिन बचे हैं। 📸" },
  { days_before: 1, language: "Hindi", content: "प्रिय {name}, कल आपका बड़ा दिन है! हम पूरी तरह से तैयार हैं। कल मिलते हैं! 💖" },

  // Bengali
  { days_before: 30, language: "Bengali", content: "নমস্কার {name}! আপনার বিশেষ দিন ({date}) আর মাত্র ৩০ দিন বাকি। আমরা এর অংশ হতে পেরে খুবই উত্তেজিত! 📸" },
  { days_before: 30, language: "Bengali", content: "প্রিয় {name}, আপনার অনুষ্ঠানের ({date}) জন্য আর মাত্র ৩০ দিন। আমরা আপনার সুন্দর মুহূর্তগুলো ক্যামেরাবন্দী করার জন্য অধীর আগ্রহে অপেক্ষা করছি। ✨" },
  { days_before: 15, language: "Bengali", content: "নমস্কার {name}, আপনার অনুষ্ঠানের ({date}) আর মাত্র ১৫ দিন বাকি। আশা করি আপনার প্রস্তুতি খুব ভালো চলছে! 📸" },
  { days_before: 15, language: "Bengali", content: "{name}, উত্তেজনার পারদ চড়ছে! আপনার বিশেষ দিন ({date}) আসতে আর মাত্র দুই সপ্তাহ। ⏳" },
  { days_before: 7, language: "Bengali", content: "নমস্কার {name}, আর মাত্র এক সপ্তাহ! আপনার অনুষ্ঠানটি {date}-এ। দারুন কিছু ছবির জন্য প্রস্তুত হন! 🎉" },
  { days_before: 3, language: "Bengali", content: "প্রিয় {name}, আপনার অনুষ্ঠানের জন্য আর মাত্র ৩ দিন বাকি। আমরা আপনার সাথে দেখা করার জন্য অপেক্ষা করছি! 💖" },
  { days_before: 1, language: "Bengali", content: "কাল সেই বিশেষ দিন, {name}! আপনার অনুষ্ঠানের জন্য আমরা সম্পূর্ণ প্রস্তুত। কাল দেখা হচ্ছে! 🎉" },

  // Gujarati
  { days_before: 30, language: "Gujarati", content: "નમસ્તે {name}! તમારા ખાસ દિવસ ({date}) માટે માત્ર ૩૦ દિવસ બાકી છે। અમે તેનો ભાગ બનવા માટે ખૂબ જ ઉત્સાહિત છીએ! 📸" },
  { days_before: 30, language: "Gujarati", content: "પ્રિય {name}, તમારા કાર્યક્રમ ({date}) માટે હવે માત્ર ૩૦ દિવસ બાકી છે। અમે તમારી સુંદર ક્ષણોને કેપ્ચર કરવા માટે ઉત્સુક છીએ। ✨" },
  { days_before: 15, language: "Gujarati", content: "નમસ્તે {name}, તમારા કાર્યક્રમ ({date}) માટે હવે માત્ર ૧૫ દિવસ બાકી છે। તૈયારીઓ જોરશોરથી ચાલી રહી હશે! 📸" },
  { days_before: 15, language: "Gujarati", content: "{name}, ઉત્સાહ વધી રહ્યો છે! તમારા ખાસ દિવસ ({date}) માટે માત્ર બે અઠવાડિયા બાકી છે। ⏳" },
  { days_before: 7, language: "Gujarati", content: "નમસ્તે {name}, માત્ર એક અઠવાડિયું બાકી! તમારો કાર્યક્રમ {date} ના રોજ છે। કેટલીક અદ્ભુત તસવીરો માટે તૈયાર રહો! 🎉" },
  { days_before: 3, language: "Gujarati", content: "નમસ્તે {name}, તમારો ઇંતેજાર હવે પૂરો થવાનો છે! {date} ના તમારા કાર્યક્રમ માટે માત્ર ૩ દિવસ બાકી છે। 💖" },
  { days_before: 1, language: "Gujarati", content: "કાલે તમારો મોટો દિવસ છે, {name}! અમે સંપૂર્ણપણે તૈયાર છીએ। કાલે મળીએ! 🎉" }
];

const seedData = async () => {
  try {
    await connectDB();
    console.log("Database connected. Starting seed process...");

    // Clear existing templates to prevent duplicates if run multiple times
    await Template.deleteMany({});
    console.log("Cleared existing templates.");

    // Insert the array of templates
    await Template.insertMany(templates);
    console.log("✓ Successfully seeded default multi-language templates into MongoDB!");

    process.exit(0);
  } catch (error) {
    console.error("✗ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();