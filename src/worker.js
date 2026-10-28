const API = (token) => "https://api.telegram.org/bot" + token + "/";
const LOCATIONS = [
  { name: "سوق واقف", clue: "ممرات ضيقة وروائح العود والتوابل وأصوات الباعة." },
  { name: "كتارا", clue: "مكان يجمع الفن والثقافة والبحر في مساحة واحدة." },
  { name: "مشيرب", clue: "عمارة حديثة بتفاصيل تستلهم قلب المدينة القديم." },
  { name: "كورنيش الدوحة", clue: "أفق المدينة ينعكس على الماء، والناس تمشي قرب الخليج." },
  { name: "متحف الفن الإسلامي", clue: "مبنى هندسي بارز تحيط به إطلالة مفتوحة على المدينة." },
  { name: "اللؤلؤة", clue: "مراسي يخوت ومقاهٍ وواجهات بحرية راقية." },
  { name: "مطار حمد الدولي", clue: "حقائب، بوابات سفر، وإعلانات رحلات لا تتوقف." },
  { name: "سوق الذهب", clue: "واجهات لامعة ومحلات صغيرة وحركة لا تهدأ." },
  { name: "مجلس قطري", clue: "قهوة عربية وحديث هادئ وضيافة لها أصولها." },
  { name: "استراحة برية", clue: "ليل هادئ، رمال، وشاي على الجمر بعيداً عن الزحام." },
  { name: "ميناء الدوحة القديم", clue: "قوارب ملوّنة وممشى ومبانٍ تراثية قرب البحر." },
  { name: "مكتبة قطر الوطنية", clue: "رفوف واسعة ومساحات للقراءة والبحث." },
  { name: "حديقة الأكسجين", clue: "مسارات خضراء وظلال وممرات للمشي." },
  { name: "استاد لوسيل", clue: "مدرجات ضخمة وليالٍ تشتعل فيها الهتافات." },
  { name: "محمية طبيعية", clue: "طيور وماء ونباتات، والهدوء جزء من المكان." }
];
const SCENES = [
  "وصل ظرف بلا اسم إلى طاولة المجلس. داخله صورة ممزقة وموعد مكتوب بالحبر الأزرق.",
  "انقطعت الإضاءة لثوانٍ. حين عادت، اختفت بطاقة الدخول من جيب أحد الموجودين.",
  "وصلت رسالة صوتية قصيرة: «لا تثق بأول شخص يسألك عن المكان».",
  "أحد الحاضرين يعرف تفصيلاً لم يُذكر أمام المجموعة. من أين عرفه؟",
  "تبدّل ترتيب المقاعد قبل بداية الاجتماع، وبقي مقعد واحد خالياً.",
  "رُصد اتصال غريب قبل دقائق من بدء المهمة. صاحب الهاتف ينكر أنه اتصل بأحد."
];
const MISSIONS = [
  "حاول أن تجعل شخصين يختلفان على تفصيل صغير دون أن تلفت الانتباه.",
  "اسأل سؤالاً يبدو عابراً، لكن لا تكرر السؤال نفسه.",
  "أجب عن الأسئلة بثقة، ولا تكن أول من يتكلم في كل مرة.",
  "اذكر تفصيلاً حسياً عن المكان من غير أن تسميه مباشرة.",
  "غيّر الموضوع مرة واحدة بطريقة طبيعية."
];
const PHOTO_QUERIES = {
  "سوق واقف": "Souq Waqif Doha Qatar",
  "كتارا": "Katara Cultural Village Doha Qatar",
  "مشيرب": "Msheireb Downtown Doha Qatar",
  "كورنيش الدوحة": "Doha Corniche Qatar",
  "متحف الفن الإسلامي": "Museum of Islamic Art Doha Qatar",
  "اللؤلؤة": "The Pearl Qatar Doha",
  "مطار حمد الدولي": "Hamad International Airport Qatar",
  "سوق الذهب": "Gold Souq Doha Qatar",
  "مجلس قطري": "Qatari majlis traditional interior",
  "استراحة برية": "Qatar desert camp dunes photography",
  "ميناء الدوحة القديم": "Old Doha Port Qatar",
  "مكتبة قطر الوطنية": "Qatar National Library building",
  "حديقة الأكسجين": "Oxygen Park Education City Qatar",
  "استاد لوسيل": "Lusail Stadium Qatar",
  "محمية طبيعية": "Qatar nature reserve mangroves"
};

async function tg(env, method, body) {
  const response = await fetch(API(env.BOT_TOKEN) + method, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!data.ok) console.error("Telegram API error", method, data.description);
  return data;
}
async function say(env, chatId, text, extra = {}) {
  return tg(env, "sendMessage", { chat_id: chatId, text, ...extra });
}
async function answerCallback(env, id, text) {
  return tg(env, "answerCallbackQuery", { callback_query_id: id, text });
}
function mention(user) {
  return user.username ? "@" + user.username : (user.first_name || "لاعب");
}
function commandName(text = "") {
  return text.trim().split(/\s+/)[0].split("@")[0].toLowerCase();
}
async function getRoom(env, chatId) {
  return env.DB.prepare("SELECT * FROM rooms WHERE chat_id = ?").bind(String(chatId)).first();
}
async function getPlayers(env, chatId) {
  const result = await env.DB.prepare("SELECT * FROM players WHERE chat_id = ? ORDER BY joined_at ASC").bind(String(chatId)).all();
  return result.results || [];
}
async function removeVotes(env, chatId) {
  await env.DB.prepare("DELETE FROM votes WHERE chat_id = ?").bind(String(chatId)).run();
}
async function resetRoom(env, chatId) {
  await env.DB.prepare("DELETE FROM votes WHERE chat_id = ?").bind(String(chatId)).run();
  await env.DB.prepare("DELETE FROM players WHERE chat_id = ?").bind(String(chatId)).run();
  await env.DB.prepare("DELETE FROM rooms WHERE chat_id = ?").bind(String(chatId)).run();
}
function isGroup(message) {
  return message.chat && (message.chat.type === "group" || message.chat.type === "supergroup");
}
async function handleMessage(env, message) {
  const text = message.text || "";
  const cmd = commandName(text);
  const chatId = String(message.chat.id);
  const user = message.from || {};
  const userId = String(user.id);

  if (cmd === "/guess" && !isGroup(message)) {
    const guess = text.replace(/^\/guess(?:@\w+)?\s*/i, "").trim();
    const room = await env.DB.prepare("SELECT * FROM rooms WHERE spy_player_id=? AND status='guessing' ORDER BY created_at DESC LIMIT 1").bind(userId).first();
    if (!room) return say(env, chatId, "ما عندك تخمين مفتوح حالياً. لازم ينكشف دورك أولاً حتى تحصل على فرصة أخيرة.");
    if (!guess) return say(env, chatId, "اكتب تخمينك بعد الأمر، مثال: /guess سوق واقف");
    const normalize = value => String(value).replace(/[\u064B-\u065F\u0670]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, " ").trim().toLowerCase();
    const correct = normalize(guess) === normalize(room.location);
    await env.DB.prepare("UPDATE rooms SET status='ended' WHERE chat_id=?").bind(room.chat_id).run();
    await say(env, room.chat_id, correct
      ? "🕶️ الجاسوس خطف الفوز في اللحظة الأخيرة! خمن الموقع الصحيح: " + room.location + ".\nملف 017 أُغلق."
      : "🛡️ حتى بعد انكشافه، أخفق الجاسوس في التخمين. الفريق يفوز!\nالموقع الصحيح: " + room.location + ".\nملف 017 أُغلق.");
    return say(env, chatId, correct ? "إجابة صحيحة. فزت بالملف." : "تخمين غير صحيح. انتهت فرصتك.");
  }

  if (cmd === "/start") {
    return say(env, chatId,
      "حيّاك الله في «ظلّ الدوحة» — لعبة شكّ وتحقيق ومهمات سرّية.\n\n" +
      "أضفني إلى مجموعتك، ثم استخدم /newgame لفتح ملف جديد.\n" +
      "قبل اللعب، افتح محادثتي الخاصة واضغط Start حتى أقدر أرسل لك دورك سرّاً.\n\n" +
      "الأوامر: /help"
    );
  }
  if (cmd === "/help") {
    return say(env, chatId,
      "🕵️ ظلّ الدوحة | دليل سريع\n\n" +
      "/newgame — فتح ملف في المجموعة\n/join — الانضمام للمهمة\n/begin — بدء الجولة (4 لاعبين على الأقل)\n/players — قائمة المشاركين\n/vote — فتح التصويت بعد النقاش\n/endgame — إغلاق الملف\n/photo — صورة فوتوغرافية حقيقية للموقع\n\n" +
      "كل اللاعبين يعرفون الموقع السري ما عدا الجاسوس. اسألوا بعض أسئلة غير مباشرة، ثم صوّتوا على الشخص الذي تشكون فيه. الجاسوس يفوز إذا بقي مجهولاً أو خمن الموقع بشكل صحيح.\n\n" +
      "مهم: لازم كل لاعب يفتح البوت بالخاص ويضغط /start قبل توزيع الأدوار."
    );
  }
  if (!isGroup(message)) {
    if (cmd === "/photo") return sendRealPhoto(env, chatId, null);
    return say(env, chatId, "هلا والله! افتح المجموعة وابدأ بـ /newgame، ولا تنسَ تضغط /start هنا عشان توصلك بطاقتك السرّية.");
  }

  if (cmd === "/newgame") {
    const existing = await getRoom(env, chatId);
    if (existing && existing.status !== "closed") {
      return say(env, chatId, "فيه ملف مفتوح بالفعل. خلّصوا الجولة أو استخدموا /endgame أول.");
    }
    await resetRoom(env, chatId);
    await env.DB.prepare("INSERT INTO rooms (chat_id, title, host_id, status, round, created_at) VALUES (?, ?, ?, 'waiting', 1, ?)")
      .bind(chatId, message.chat.title || "المجموعة", userId, Date.now()).run();
    const keyboard = { inline_keyboard: [[{ text: "🕵️ انضم للمهمة", callback_data: "join" }]] };
    return say(env, chatId,
      "╭━━━ ملف رقم 017 ━━━╮\n«ظلّ الدوحة»\n╰━━━━━━━━━━━━━━╯\n\n" +
      "ورد بلاغ عن تسريب معلومة من اجتماع مغلق. أحد الموجودين ليس كما يدّعي.\n\n" +
      "اجمعوا الفريق بالضغط على زر الانضمام أو باستخدام /join. تحتاجون 4 لاعبين على الأقل.\n" +
      "قبل البداية: كل لاعب يفتح البوت بالخاص ويضغط /start.",
      { reply_markup: keyboard }
    );
  }
  if (cmd === "/join") return joinPlayer(env, chatId, user);
  if (cmd === "/players") {
    const players = await getPlayers(env, chatId);
    if (!players.length) return say(env, chatId, "ما فيه أحد انضم للملف للحين. استخدموا /join.");
    return say(env, chatId, "👥 فريق الملف:\n" + players.map((p, i) => (i + 1) + ". " + p.first_name + (p.alive ? "" : " — خرج من الجولة")).join("\n"));
  }
  if (cmd === "/begin") return beginGame(env, chatId);
  if (cmd === "/vote") return openVote(env, chatId);
  if (cmd === "/endgame") {
    const room = await getRoom(env, chatId);
    if (!room) return say(env, chatId, "ما فيه ملف مفتوح.");
    await resetRoom(env, chatId);
    return say(env, chatId, "تم إغلاق الملف. تُحفظ الأسرار داخل اللعبة فقط — نلتقي في القضية القادمة.");
  }
  if (cmd === "/photo") return sendRealPhoto(env, chatId, await getRoom(env, chatId));
  return null;
}
async function joinPlayer(env, chatId, user) {
  const room = await getRoom(env, chatId);
  if (!room || room.status !== "waiting") return say(env, chatId, "ما فيه ملف ينتظر لاعبين. افتحوا ملفاً جديداً بـ /newgame.");
  const userId = String(user.id);
  const existing = await env.DB.prepare("SELECT user_id FROM players WHERE chat_id = ? AND user_id = ?").bind(chatId, userId).first();
  if (existing) return say(env, chatId, "أنت مسجل معنا بالفعل يا " + mention(user) + ".");
  await env.DB.prepare("INSERT INTO players (chat_id, user_id, username, first_name, joined_at, role, alive) VALUES (?, ?, ?, ?, ?, 'pending', 1)")
    .bind(chatId, userId, user.username || "", user.first_name || "لاعب", Date.now()).run();
  const players = await getPlayers(env, chatId);
  return say(env, chatId, "تم تسجيل " + mention(user) + " في الملف. عدد الفريق: " + players.length + " لاعب.");
}
async function beginGame(env, chatId) {
  const room = await getRoom(env, chatId);
  if (!room || room.status !== "waiting") return say(env, chatId, "افتحوا ملفاً جديداً أولاً بـ /newgame.");
  const players = await getPlayers(env, chatId);
  if (players.length < 4) return say(env, chatId, "نحتاج 4 لاعبين على الأقل عشان تبدأ اللعبة. الموجودون: " + players.length + ".");
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const spy = players[Math.floor(Math.random() * players.length)];
  const scene = SCENES[Math.floor(Math.random() * SCENES.length)];
  const mission = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
  await env.DB.prepare("UPDATE rooms SET status='playing', location=?, spy_player_id=?, scene=?, mission=? WHERE chat_id=?")
    .bind(location.name, spy.user_id, scene, mission, chatId).run();
  for (const player of players) {
    const isSpy = player.user_id === spy.user_id;
    const privateText = isSpy
      ? "🕶️ بطاقتك السرّية\nأنت الجاسوس. لا تعرف الموقع. استنتج المكان من كلام الآخرين، واندسّ بينهم من غير ما تنكشف.\n\nمهمتك الخاصة: " + mission + "\n\nتقدر تفوز إذا لم يصوت عليك الفريق، أو إذا خمنت الموقع الصحيح عند نهاية الجولة."
      : "🪪 بطاقتك السرّية\nالموقع: " + location.name + "\n\nوصف الملف: " + location.clue + "\n\nمهمتك الخاصة: " + mission + "\n\nلا تذكر اسم الموقع مباشرة. اسأل أسئلة ذكية واكشف الجاسوس.";
    const dm = await say(env, player.user_id, privateText);
    if (!dm || !dm.ok) {
      await say(env, chatId, "تنبيه: تعذر إرسال بطاقة أحد اللاعبين بالخاص. على كل لاعب فتح البوت والضغط /start، ثم أعيدوا فتح ملف جديد.");
      await resetRoom(env, chatId);
      return;
    }
  }
  return say(env, chatId,
    "🔒 أُغلق الظرف وبدأت المهمة.\n\n" + scene + "\n\n" +
    "عندكم 5 دقائق للنقاش. لا تذكروا الموقع صراحة. اسألوا عن تفاصيل التجربة، لا عن الاسم.\n" +
    "بعد النقاش استخدموا /vote لبدء التصويت. الجاسوس، لا تتسرع."
  );
}
async function openVote(env, chatId) {
  const room = await getRoom(env, chatId);
  if (!room || room.status !== "playing") return say(env, chatId, "ما فيه جولة نشطة للتصويت.");
  const players = (await getPlayers(env, chatId)).filter(p => p.alive);
  if (players.length < 3) return say(env, chatId, "عدد اللاعبين ما يكفي للتصويت.");
  await removeVotes(env, chatId);
  await env.DB.prepare("UPDATE rooms SET status='voting' WHERE chat_id=?").bind(chatId).run();
  const keyboard = { inline_keyboard: players.map(p => [{ text: "🔎 " + p.first_name, callback_data: "vote:" + p.user_id }]) };
  return say(env, chatId, "🗳️ لحظة الحسم. اختَر الشخص الذي تشك أنه الجاسوس. تصويتك سري:", { reply_markup: keyboard });
}
async function handleCallback(env, query) {
  const data = query.data || "";
  const message = query.message;
  if (!message) return answerCallback(env, query.id, "افتح اللعبة من المجموعة.");
  const chatId = String(message.chat.id);
  const user = query.from || {};
  if (data === "join") {
    await answerCallback(env, query.id, "تم فتح التسجيل");
    return joinPlayer(env, chatId, user);
  }
  if (data.startsWith("vote:")) {
    const room = await getRoom(env, chatId);
    if (!room || room.status !== "voting") return answerCallback(env, query.id, "التصويت غير مفتوح.");
    const target = data.slice(5);
    if (target === String(user.id)) return answerCallback(env, query.id, "ما تقدر تصوّت على نفسك.");
    const voter = await env.DB.prepare("SELECT user_id FROM players WHERE chat_id=? AND user_id=? AND alive=1").bind(chatId, String(user.id)).first();
    const accused = await env.DB.prepare("SELECT user_id FROM players WHERE chat_id=? AND user_id=? AND alive=1").bind(chatId, target).first();
    if (!voter || !accused) return answerCallback(env, query.id, "لازم تكون لاعباً مسجلاً.");
    await env.DB.prepare("INSERT INTO votes (chat_id, voter_id, target_id) VALUES (?, ?, ?) ON CONFLICT(chat_id, voter_id) DO UPDATE SET target_id=excluded.target_id")
      .bind(chatId, String(user.id), target).run();
    await answerCallback(env, query.id, "وصل صوتك بسرية.");
    const total = await env.DB.prepare("SELECT COUNT(*) AS n FROM players WHERE chat_id=? AND alive=1").bind(chatId).first();
    const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM votes WHERE chat_id=?").bind(chatId).first();
    if (count.n >= total.n) return resolveVote(env, chatId, room);
    return null;
  }
}
async function resolveVote(env, chatId, room) {
  const result = await env.DB.prepare("SELECT target_id, COUNT(*) AS n FROM votes WHERE chat_id=? GROUP BY target_id ORDER BY n DESC").bind(chatId).all();
  const rows = result.results || [];
  if (!rows.length) return;
  if (rows.length > 1 && rows[0].n === rows[1].n) {
    await env.DB.prepare("UPDATE rooms SET status='playing' WHERE chat_id=?").bind(chatId).run();
    await removeVotes(env, chatId);
    return say(env, chatId, "⚖️ تعادل في الأصوات. ما فيه إدانة هالجولة. خذوا دقيقة للنقاش ثم استخدموا /vote مرة ثانية.");
  }
  const accusedId = rows[0].target_id;
  const players = await getPlayers(env, chatId);
  const accused = players.find(p => p.user_id === accusedId);
  const spyCaught = accusedId === room.spy_player_id;
  await env.DB.prepare("UPDATE rooms SET status=? WHERE chat_id=?").bind(spyCaught ? "guessing" : "ended", chatId).run();
  const storyEnding = spyCaught
    ? "تم كشف الجاسوس. لكن الملف ما انتهى: عنده فرصة أخيرة يخمّن الموقع برسالة خاصة للبوت تبدأ بـ /guess ثم اسم المكان."
    : "اتهمتم الشخص الخطأ. الجاسوس أفلت من الرقابة وربح الجولة.";
  await say(env, chatId,
    "📁 نتيجة الملف 017\n\n" +
    (accused ? "المتهم: " + accused.first_name + "\n" : "") +
    "الأصوات: " + rows[0].n + "\n" +
    (spyCaught ? "النتيجة: تم كشف الجاسوس.\n" : "النتيجة: الجاسوس لم يُكشف.\n") +
    storyEnding + "\n\n" +
    "الموقع الحقيقي: " + room.location + "\n" +
    "الجاسوس كان: " + (players.find(p => p.user_id === room.spy_player_id)?.first_name || "غير معروف") +
    "\n\nابدؤوا قضية جديدة باستخدام /newgame."
  );
}
async function sendRealPhoto(env, chatId, room) {
  const location = room && room.location ? room.location : LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)].name;
  const query = PHOTO_QUERIES[location] || "Doha Qatar city photography";
  try {
    const url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=" +
      encodeURIComponent("filetype:bitmap " + query) +
      "&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1200&format=json&origin=*";
    const response = await fetch(url, { headers: { "User-Agent": "DalilSpyBot/1.0 (Telegram game; Wikimedia Commons photo search)" } });
    const data = await response.json();
    const pages = Object.values((data.query && data.query.pages) || {});
    const candidates = pages.filter(p => p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url && /\.(jpg|jpeg|png)$/i.test(p.imageinfo[0].url));
    if (!candidates.length) return say(env, chatId, "ما حصلت صورة مناسبة الحين. جرّب /photo بعد شوي. الصور هنا من أرشيف ويكيميديا كومنز، مو مولّدة بالذكاء الاصطناعي.");
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const info = chosen.imageinfo[0];
    const imageUrl = info.thumburl || info.url;
    const title = (chosen.title || "").replace(/^File:/, "").replace(/_/g, " ");
    const license = info.extmetadata && info.extmetadata.LicenseShortName && info.extmetadata.LicenseShortName.value || "Wikimedia Commons";
    return tg(env, "sendPhoto", {
      chat_id: chatId,
      photo: imageUrl,
      caption: "📷 صورة فوتوغرافية من ويكيميديا كومنز\nالمشهد: " + location + "\nالملف: " + title + "\nالترخيص: " + license + "\nالمصدر: Wikimedia Commons"
    });
  } catch (error) {
    console.error("Photo search failed", error);
    return say(env, chatId, "تعذّر جلب الصورة حالياً. تقدرون تواصلون اللعبة؛ الصور تُجلب من أرشيف فوتوغرافي حقيقي وليست مولّدة.");
  }
}
export default {
  async fetch(request, env) {
    if (request.method === "GET") return new Response("Dalil Spy Bot is online.", { status: 200 });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
    if (!env.BOT_TOKEN || !env.DB) return new Response("Missing BOT_TOKEN or DB binding", { status: 500 });
    if (env.WEBHOOK_SECRET) {
      const supplied = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
      if (supplied !== env.WEBHOOK_SECRET) return new Response("Unauthorized", { status: 401 });
    }
    let update;
    try { update = await request.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
    try {
      if (update.message) await handleMessage(env, update.message);
      else if (update.callback_query) await handleCallback(env, update.callback_query);
    } catch (error) {
      console.error("Update handler failed", error);
    }
    return new Response("ok", { status: 200 });
  }
};
