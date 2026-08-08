const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'data/jobs.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const translations = {
  "job-001": { title_en: "Media Communication Intern (Hybrid - Up to 15,000,000 VND)", company_en: "Media X Group JSC (Impersonation Sign)" },
  "job-008": { title_en: "Hiring Warehouse Staff (Salary 9,800,000 VND)", company_en: "Personal Account (Dung Ha - Freelance Recruiter)" },
  "job-009": { title_en: "Work From Home: Garment Label Cutting (Viet Tien Impersonation)", company_en: "Viet Tien Garment Outsourcing (Fake Message)" },
  "job-010": { title_en: "Hiring HCMC Cinema Staff (25k-35k/hr)", company_en: "HCMC Cinema Recruitment (Fake Fanpage)" },
  "job-002": { title_en: "Multi-Task Marketing Staff (Unlimited Income)", company_en: "AMRITA (Ngoc Lan Huong)" },
  "job-003": { title_en: "FPT Software Hiring Junior – Fresher – OJT – Intern", company_en: "FPT Software HCM (Verified Official)" },
  "job-011": { title_en: "IT Recruitment: .NET / BA / Manual QC / Angular / Java", company_en: "Saigon Technology (Verified Official)" },
  "job-004": { title_en: "Hiring Novel Typing Collaborator (35k-100k/page)", company_en: "CTV5555 (Bot Spammer Crowd Seeding Network)" },
  "job-005": { title_en: "Telegram Task Scam: Forced to Pay 35 Million 'Account Activation Fee'", company_en: "Telegram Scam Script (Wrong Transfer Description Excuse)" }
};

data.forEach(c => {
  c.jobs.forEach(j => {
    if (translations[j.id]) {
      j.title_en = translations[j.id].title_en;
      j.company_en = translations[j.id].company_en;
    }
  });
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log("jobs.json updated successfully.");
