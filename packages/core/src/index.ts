// ═══════════════════════════════════════════════════════════
// SM-2 — نظام المراجعة المتباعدة
// ═══════════════════════════════════════════════════════════

export type Grade = "again" | "hard" | "good" | "easy";

export interface Card {
  id: string;
  ease: number;
  interval: number;
  reps: number;
  due: number;
}

const DAY = 86_400_000;

export const newCard = (id: string, now = Date.now()): Card => ({
  id,
  ease: 2.5,
  interval: 0,
  reps: 0,
  due: now,
});

export function review(card: Card, grade: Grade, now = Date.now()): Card {
  const q = { again: 1, hard: 3, good: 4, easy: 5 }[grade];

  if (q < 3) {
    return { ...card, reps: 0, interval: 1, due: now + DAY };
  }

  const ease = Math.max(1.3, card.ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  const reps = card.reps + 1;
  const base = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(card.interval * ease);
  const interval =
    grade === "hard"
      ? Math.max(1, Math.round(base * 0.8))
      : grade === "easy"
      ? Math.round(base * 1.3)
      : base;

  return { id: card.id, ease, reps, interval, due: now + interval * DAY };
}

// ═══════════════════════════════════════════════════════════
// BKT — Bayesian Knowledge Tracing
// ═══════════════════════════════════════════════════════════

export interface BKT {
  pKnow: number;
  pLearn: number;
  pGuess: number;
  pSlip: number;
}

export const bktDefault: BKT = {
  pKnow: 0.1,
  pLearn: 0.3,
  pGuess: 0.2,
  pSlip: 0.1,
};

export function bktUpdate(s: BKT, correct: boolean): BKT {
  const { pKnow: k, pGuess: g, pSlip: sl, pLearn: l } = s;

  const post = correct
    ? (k * (1 - sl)) / (k * (1 - sl) + (1 - k) * g)
    : (k * sl) / (k * sl + (1 - k) * (1 - g));

  return { ...s, pKnow: post + (1 - post) * l };
}

// ═══════════════════════════════════════════════════════════
// Lessons — الدروس
// ═══════════════════════════════════════════════════════════

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  body: string;
  starter: string;
  language: "javascript" | "python";
  goal: string;
  category?: string;
}

export const lessons: Lesson[] = [
  // ─── أساسيات البرمجة ───
  {
    id: "variables",
    title: "المتغيرات",
    language: "javascript",
    summary: "خزّن القيم وأعد استخدامها.",
    body: "المتغير اسم يشير إلى قيمة. استخدم const للقيم الثابتة وlet للقيم التي تتغير.",
    starter: `const name = "مولينكس";
let count = 1;
count = count + 1;
console.log(name, count);`,
    goal: "اطبع اسمك وعمرك باستخدام متغيرين.",
    category: "basics",
  },
  {
    id: "functions",
    title: "الدوال",
    language: "javascript",
    summary: "اجمع الخطوات المتكررة في دالة.",
    body: "الدالة تأخذ مدخلات وتُرجع ناتجاً. سمّها باسم يصف ما تفعله.",
    starter: `function square(n) {
  return n * n;
}
console.log(square(4));`,
    goal: "اكتب دالة double تُرجع ضعف الرقم.",
    category: "functions",
  },
  {
    id: "loops",
    title: "الحلقات",
    language: "python",
    summary: "كرّر العمل دون نسخ الكود.",
    body: "for تمر على عناصر مجموعة. range(n) تعطيك الأرقام من 0 إلى n-1.",
    starter: `for i in range(3):
    print(i)`,
    goal: "اطبع جدول ضرب العدد 3 حتى 10.",
    category: "basics",
  },
  {
    id: "arrays",
    title: "المصفوفات",
    language: "javascript",
    summary: "خزّن عدة قيم في متغير واحد.",
    body: "المصفوفة قائمة مرتبة. الوصول بالموقع يبدأ من 0.",
    starter: `const fruits = ["تفاح", "موز", "عنب"];
console.log(fruits[0]);
fruits.push("برتقال");
console.log(fruits.length);`,
    goal: "أنشئ مصفوفة بأسماء 3 أصدقاء واطبعها معكوسة.",
    category: "data-structures",
  },
  {
    id: "objects",
    title: "الكائنات",
    language: "javascript",
    summary: "اجمع بيانات مترابطة معاً.",
    body: "الكائن يخزن أزواج مفتاح-قيمة.",
    starter: `const user = { name: "سارة", age: 22 };
console.log(user.name);
user.age = 23;
console.log(user);`,
    goal: "أنشئ كائناً لكتاب فيه title و author و year.",
    category: "data-structures",
  },
  {
    id: "conditionals",
    title: "الشرطية",
    language: "javascript",
    summary: "اتخذ قرارات في الكود.",
    body: "if/else إذا كان شرط صحيحاً.",
    starter: `const age = 18;
if (age >= 18) console.log("بالغ");
else console.log("قاصر");`,
    goal: "اكتب if/else يتحقق من الرقم: موجب، سالب، صفر.",
    category: "basics",
  },
  {
    id: "strings",
    title: "النصوص",
    language: "python",
    summary: "تعامل مع النصوص بمرونة.",
    body: "النص سلسلة حروف. طرق .upper(), .split(), .replace().",
    starter: `s = "hello world"
print(s.upper())
print(s.split())
print(s.replace("world", "مولينكس"))`,
    goal: "اقلب نصاً واطبعه (hello → olleh).",
    category: "basics",
  },
  {
    id: "dicts",
    title: "القواميس",
    language: "python",
    summary: "خزّن أزواج مفتاح-قيمة.",
    body: "dict في Python مثل كائن JavaScript.",
    starter: `d = {"name": "أحمد", "age": 25}
print(d["name"])
d["city"] = "الرياض"
print(d)`,
    goal: "احسب تكرار كل كلمة في جملة.",
    category: "data-structures",
  },
  {
    id: "try-except",
    title: "معالجة الأخطاء",
    language: "python",
    summary: "لا تدع الأخطاء تسقط برنامجك.",
    body: "try/except يلتقط الأخطاء.",
    starter: `try:
    n = int("abc")
except ValueError as e:
    print("خطأ:", e)`,
    goal: "اطلب رقماً وأعد المحاولة حتى يدخل المستخدم رقماً صحيحاً.",
    category: "python",
  },
  {
    id: "classes",
    title: "الأصناف",
    language: "python",
    summary: "أنشئ أنواعاً خاصة بك.",
    body: "الصنف قالب لإنشاء كائنات.",
    starter: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    def greet(self):
        return f"مرحباً، أنا {self.name}"

p = Person("هدى", 20)
print(p.greet())`,
    goal: "أنشئ صنف BankAccount مع deposit/withdraw و balance.",
    category: "oop",
  },
  {
    id: "map-filter",
    title: "map و filter",
    language: "javascript",
    summary: "حوّل وفلتر المصفوفات.",
    body: "map تُحول كل عنصر. filter تُبقي ما يحقق شرطاً.",
    starter: `const nums = [1, 2, 3, 4, 5];
const doubled = nums.map(n => n * 2);
const evens = nums.filter(n => n % 2 === 0);
console.log(doubled, evens);`,
    goal: "استخرج الأسماء الطويلة من مصفوفة أسماء.",
    category: "data-structures",
  },
  {
    id: "closures",
    title: "الإغلاقات",
    language: "javascript",
    summary: "دالة تتذكر بيئتها.",
    body: "الإغلاق = دالة + المتغيرات التي تصل إليها.",
    starter: `function counter() {
  let n = 0;
  return () => ++n;
}
const c = counter();
console.log(c(), c(), c());`,
    goal: "أنشئ دالة makeMultiplier(x) تُرجع دالة تضرب في x.",
    category: "functions",
  },

  // ─── أمن سيبراني ───
  {
    id: "sec-hash-intro",
    title: "ما هو الـ Hash؟",
    language: "python",
    summary: "دالة تُحوّل أي بيانات لبصمة.",
    body: "الـ Hash دالة أحادية الاتجاه: نفس المدخل = نفس البصمة، لا يمكن عكسها.",
    starter: `import hashlib
for s in ["hello", "hello", "world"]:
    print(s, hashlib.sha256(s.encode()).hexdigest()[:16])`,
    goal: "لاحظ أن hello مرتين تعطي نفس الـ hash، وworld مختلف.",
    category: "sec-hashing",
  },
  {
    id: "sec-hash-salt",
    title: "الملح (Salt)",
    language: "python",
    summary: "أضف عشوائية لكل كلمة مرور.",
    body: "Salt بيانات عشوائية تُضاف قبل الـ hash. يمنع هجمات Rainbow Tables.",
    starter: `import hashlib, os
salt = os.urandom(16)
h = hashlib.sha256(salt + b"password").hexdigest()
print("Salt:", salt.hex()[:16])
print("Hash:", h[:16])`,
    goal: "احسب hash لكلمتين متطابقتين بـ salts مختلفة.",
    category: "sec-hashing",
  },
  {
    id: "sec-hash-hmac",
    title: "HMAC للتحقق",
    language: "python",
    summary: "تحقق من سلامة الرسائل بمفتاح سري.",
    body: "HMAC = Hash + مفتاح سري. أساس توقيع APIs.",
    starter: `import hmac, hashlib
key = b"shared-secret"
msg = b"amount=100"
tag = hmac.new(key, msg, hashlib.sha256).hexdigest()
print("Tag:", tag[:16])
print("Valid:", hmac.compare_digest(tag, hmac.new(key, msg, hashlib.sha256).hexdigest()))`,
    goal: "استخدم hmac.compare_digest لا == — اشرح لماذا.",
    category: "sec-hashing",
  },
  {
    id: "sec-web-sqli",
    title: "منع SQL Injection",
    language: "python",
    summary: "استخدم parameterized queries دائماً.",
    body: "دمج النصوص في SQL = ثغرة. الحل: parameterized queries.",
    starter: `import sqlite3
c = sqlite3.connect(":memory:").cursor()
c.execute("CREATE TABLE u(id INT)")
c.execute("INSERT INTO u VALUES (1)")
safe = c.execute("SELECT * FROM u WHERE id = ?", ("1 OR 1=1",)).fetchall()
print("آمن:", safe)`,
    goal: "اشرح لماذا parameterized queries تحل المشكلة.",
    category: "sec-web",
  },
  {
    id: "sec-web-xss",
    title: "منع XSS",
    language: "javascript",
    summary: "لا تُدرج مدخلات المستخدم في HTML.",
    body: "XSS = حقن JavaScript. الحل: تهريب أو textContent.",
    starter: `const userInput = "<img src=x onerror=alert(1)>";
const safe = userInput.replace(/[<>]/g, "");
console.log("آمن:", safe);`,
    goal: "استخدم textContent لحقن تعليق المستخدم بشكل آمن.",
    category: "sec-web",
  },
  {
    id: "sec-crypto-symmetric",
    title: "التشفير المتماثل",
    language: "python",
    summary: "نفس المفتاح للتشفير وفك التشفير.",
    body: "التشفير المتماثل يستخدم مفتاحاً واحداً. سريع لكن يحتاج قناة آمنة.",
    starter: `from cryptography.fernet import Fernet
key = Fernet.generate_key()
f = Fernet(key)
token = f.encrypt(b"رسالة سرية")
print("Encrypted:", token[:40])
print("Decrypted:", f.decrypt(token))`,
    goal: "شغّل الكود، ثم استخدم نفس المفتاح لفك رسالة أخرى.",
    category: "sec-crypto",
  },
  {
    id: "sec-auth-mfa",
    title: "MFA",
    language: "python",
    summary: "شيئان مختلفان أفضل من واحد.",
    body: "شيء تعرفه + شيء تملكه + شيء أنت عليه.",
    starter: `factors = [
    ("تعرفه", ["كلمة المرور", "PIN"]),
    ("تملكه", ["هاتف", "مفتاح USB"]),
    ("أنت", ["بصمة", "وجه"]),
]
for f, examples in factors:
    print(f + ": " + ", ".join(examples))`,
    goal: "اشرح: هل كلمة مرور + سؤال أمني MFA حقيقي؟",
    category: "sec-auth",
  },
  {
    id: "sec-cia",
    title: "ثلاثية CIA",
    language: "python",
    summary: "السرية، السلامة، التوفر.",
    body: "Confidentiality + Integrity + Availability.",
    starter: `threats = {
    "تسريب بيانات": "C",
    "تعديل تقرير": "I",
    "DDoS": "A",
    "Ransomware": "A + C",
}
for t, c in threats.items():
    print(t + " → " + c)`,
    goal: "صنّف 10 هجمات حسب CIA.",
    category: "sec-basics",
  },
  {
    id: "sec-forensic-log",
    title: "تحليل السجلات",
    language: "python",
    summary: "السجلات تحكي القصة.",
    body: "ابحث عن: 401/403 متكررة، IPs غير معتادة.",
    starter: `from collections import Counter
log = ["10.0.0.5 401", "10.0.0.5 401", "10.0.0.5 401", "10.0.0.9 200"]
fails = Counter()
for line in log:
    ip, code = line.split()
    if code == "401": fails[ip] += 1
for ip, n in fails.most_common():
    print("🚨 " + ip + ": " + str(n) + " محاولة فاشلة")`,
    goal: "اكتشف IPs تحاول 403 أكثر من 5 مرات.",
    category: "sec-forensics",
  },
];
