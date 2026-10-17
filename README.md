# 🚀 مولينكس — تعلّم البرمجة والأمن السيبراني بالعربية

منصة عربية تفاعلية لتعلّم البرمجة والأمن السيبراني.

## المميزات

- 📚 دروس تفاعلية بالعربية
- 🤖 معلم ذكي (5 مزودين مجانيين)
- 💻 محرر كود حقيقي (Monaco)
- ⚡ تنفيذ فوري للكود
- 🎯 اختبارات تكيّفية
- 🏆 نظام XP وشارات
- 📱 بوت تيليجرام

## التشغيل السريع

```bash
pnpm install
cd apps/telegram-bot && python3 -m venv .venv && source .venv/bin/activate && pip install -e . && cd ../..
docker compose up -d postgres redis
pnpm db:generate && pnpm db:migrate && pnpm seed
pnpm dev
