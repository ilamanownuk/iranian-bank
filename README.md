# @ilamanownuk/iranian-bank

کتابخانهٔ بانک‌های ایران — اعتبارسنجی شبا/IBAN، تشخیص کارت بانکی، تبدیل شبا ↔ شماره حساب، رجیستری بانک‌ها، و همگام‌سازی فیلدهای فرم.

**بدون وابستگی به UI خاص** — لایهٔ core در Node.js و مرورگر کار می‌کند؛ لایه‌های React اختیاری و headless هستند.

---

## فهرست

- [نصب](#نصب)
- [نقطه‌های ورود (Entry Points)](#نقطه‌های-ورود-entry-points)
- [معماری لایه‌ها](#معماری-لایه‌ها)
- [لایه Core](#لایه-core)
  - [نرمال‌سازی](#۱-نرمال‌سازی)
  - [اعتبارسنجی و تبدیل شبا](#۲-اعتبارسنجی-و-تبدیل-شبا)
  - [تشخیص بانک](#۳-تشخیص-بانک)
  - [همگام‌سازی فیلدها](#۴-همگام‌سازی-فیلدها-syncbankshebaandaccount)
  - [اعتبارسنجی ترمینال/حساب بانکی](#۵-اعتبارسنجی-ترمینالحساب-بانکی)
  - [لوگو و تم رنگی](#۶-لوگو-و-تم-رنگی)
  - [رجیستری بانک‌ها](#۷-رجیستری-بانک‌ها)
- [لایه React (headless)](#لایه-react-headless)
  - [useBankSync](#usebanksync)
  - [BankLogo](#banklogo)
- [لایه React Hook Form](#لایه-react-hook-form)
  - [مسیرهای سفارشی فیلد](#مسیرهای-سفارشی-فیلد)
  - [مسیرهای پیش‌فرض](#مسیرهای-پیش‌فرض)
  - [فرم کامل نمونه](#فرم-کامل-نمونه)
- [مرجع API](#مرجع-api)
- [محدودیت‌ها](#محدودیت‌ها)
- [توسعه](#توسعه)
- [لایسنس](#لایسنس)

---

## نصب

```bash
npm install @ilamanownuk/iranian-bank
# یا
pnpm add @ilamanownuk/iranian-bank
# یا
yarn add @ilamanownuk/iranian-bank
```

### وابستگی‌های هم‌نسخه (Peer Dependencies)

| پکیج | برای چه importی لازم است |
|------|--------------------------|
| `react >= 18` | `@ilamanownuk/iranian-bank/react` و `/react-rhf` |
| `react-hook-form >= 7` | فقط `@ilamanownuk/iranian-bank/react-rhf` (اختیاری) |

اگر فقط از **core** استفاده می‌کنید (مثلاً در بک‌اند NestJS)، نیازی به نصب React نیست.

---

## نقطه‌های ورود (Entry Points)

| Import | توضیح |
|--------|--------|
| `@ilamanownuk/iranian-bank` | منطق خالص — بدون React |
| `@ilamanownuk/iranian-bank/react` | هوک `useBankSync` + کامپوننت `BankLogo` |
| `@ilamanownuk/iranian-bank/react-rhf` | یکپارچه‌سازی با `react-hook-form` |

هر سه نقطه ورود از **ESM** و **CommonJS** پشتیبانی می‌کنند و فایل `.d.ts` دارند.

---

## معماری لایه‌ها

```
@ilamanownuk/iranian-bank           ← Core (Node + Browser)
@ilamanownuk/iranian-bank/react     ← React headless
@ilamanownuk/iranian-bank/react-rhf ← react-hook-form
```

| لایه | شامل UI آماده؟ | مناسب برای |
|------|----------------|------------|
| Core | خیر | API، بک‌اند، Vue/Angular، اسکریپت |
| React | فقط `BankLogo` ساده | فرم‌های سفارشی با state خودتان |
| React RHF | خیر | فرم‌های react-hook-form با path دلخواه |

---

## لایه Core

```ts
import {
  // نرمال‌سازی
  normalizeDigits,
  normalizeSheba,
  normalizeCardNumber,
  formatShebaDisplay,
  separateCardNumber,
  detectBankInputKind,
  // شبا
  validateIranSheba,
  extractShebaBankCode,
  accountNumberToSheba,
  shebaToAccountNumber,
  // تشخیص بانک
  getBankTypeByCard,
  getBankTypeBySheba,
  getBankDetails,
  getBankId,
  getShebaCodeByBankType,
  resolveBankIdentity,
  resolveShebaBankCode,
  getBankByCard,
  getBankBySheba,
  getBankLogoPayload,
  getBankLogoByCard,
  getBankLogoBySheba,
  getBankThemeCode,
  getIranianBankSelectOptions,
  // همگام‌سازی
  syncBankShebaAndAccount,
  validateBankTerminalInput,
  // رجیستری
  IRANIAN_BANKS,
  bank_types_details,
  BANK_ID_BY_ENUM,
  BANK_TYPES_ENUM,
  // لوگو
  bankLogoUrl,
  BANK_LOGO_FILES,
  resolveLogoUrl,
} from "@ilamanownuk/iranian-bank";
```

### ۱. نرمال‌سازی

ورودی کاربر (فارسی، عربی، فاصله، خط تیره) را یکدست می‌کند.

```ts
import { normalizeDigits, normalizeSheba, normalizeCardNumber, formatShebaDisplay, separateCardNumber } from "@ilamanownuk/iranian-bank";

// ارقام فارسی/عربی → لاتین
normalizeDigits("۱۲۳۴-۵۶۷۸"); // "12345678"

// شبا → فرمت استاندارد IR + 24 رقم
normalizeSheba("ir12 3456 7890 1234 5678 9012 3456 7890 12");
// "IR12345678901234567890123456789012" (اگر 24 رقم باشد)

// کارت → فقط رقم
normalizeCardNumber("6037-9912-3456-7890"); // "6037991234567890"

// نمایش شبا با فاصله (برای UI)
formatShebaDisplay("IR760170000000123456789001");
// "IR76 0017 0000 0012 3456 7890 01"

// کارت ۱۶ رقمی → ۴-۴-۴-۴
separateCardNumber("6037991234567890"); // "6037-9912-3456-7890"

// تشخیص نوع ورودی
detectBankInputKind("IR760170000000123456789001"); // "sheba"
detectBankInputKind("1234567890");               // "account"
```

### ۲. اعتبارسنجی و تبدیل شبا

الگوریتم **MOD-97** استاندارد IBAN ایران.

```ts
import {
  validateIranSheba,
  accountNumberToSheba,
  shebaToAccountNumber,
  extractShebaBankCode,
} from "@ilamanownuk/iranian-bank";

// ساخت شبا از شماره حساب + کد بانک (۳ رقمی)
const sheba = accountNumberToSheba("1234567890", "017"); // بانک ملی
validateIranSheba(sheba); // true

// استخراج شماره حساب از شبا
shebaToAccountNumber(sheba); // "1234567890"

// کد بانک از شبا (موقعیت ۵–۷ در BBAN)
extractShebaBankCode(sheba); // "017"
```

**مثال در API بک‌اند (NestJS / Express):**

```ts
@Post("validate-iban")
validate(@Body() body: { iban: string }) {
  const normalized = normalizeSheba(body.iban);
  if (!validateIranSheba(normalized)) {
    throw new BadRequestException("شماره شبا معتبر نیست");
  }
  const bank = getBankTypeBySheba(normalized);
  return { ok: true, bank: getBankDetails(bank).faName };
}
```

### ۳. تشخیص بانک

اولویت در `resolveBankIdentity`: **کارت > شبا > bankType دستی**

```ts
import {
  getBankTypeByCard,
  getBankTypeBySheba,
  resolveBankIdentity,
  getBankByCard,
  BANK_TYPES_ENUM,
} from "@ilamanownuk/iranian-bank";

// از کارت ۱۶ رقمی
getBankTypeByCard("6037991234567890"); // BANK_TYPES_ENUM.MELLI

// از شبا
getBankTypeBySheba("IR760170000000123456789001"); // BANK_TYPES_ENUM.MELLI

// هویت کامل (بانک + لوگو + تم + کد شبا)
const identity = resolveBankIdentity({ cardNumber: "6037991234567890" });
console.log(identity.details.faName);  // "ملی"
console.log(identity.bankId);          // "melli"
console.log(identity.logo.logoUrl);      // URL لوگو
console.log(identity.logo.theme.light);  // رنگ تم کارت

// برچسب نمایشی کارت (برای لیست ترمینال‌ها)
getBankByCard("6037991234567890"); // "ملی (7890)"
```

### ۴. همگام‌سازی فیلدها (`syncBankShebaAndAccount`)

قلب کتابخانه برای فرم‌های بانکی. ورودی:

```ts
type SyncBankFieldsInput = {
  sheba?: string | null;
  account?: string | null;
  cardNumber?: string | null;
  bankType?: BANK_TYPES_ENUM | null;
};
```

خروجی:

```ts
type SyncBankFieldsResult = {
  sheba: string;
  account: string;
  shebaCode: string | null;
  bankType: BANK_TYPES_ENUM;
  bankId: BankId;
  shebaValid: boolean;
  error?: string; // پیام خطای فارسی
};
```

#### سناریو ۱ — کاربر شبا وارد می‌کند

```ts
syncBankShebaAndAccount({ sheba: "IR760170000000123456789001" });
// → account پر می‌شود، bankType از کد شبا، shebaValid: true
```

#### سناریو ۲ — کاربر شماره حساب + بانک انتخاب می‌کند

```ts
syncBankShebaAndAccount({
  account: "1234567890",
  bankType: BANK_TYPES_ENUM.MELLI,
});
// → sheba ساخته می‌شود، shebaValid: true
```

#### سناریو ۳ — کاربر شماره حساب بدون انتخاب بانک

```ts
syncBankShebaAndAccount({ account: "1234567890" });
// → error: "برای تبدیل شماره حساب به شبا، کارت بانکی یا انتخاب بانک الزامی است"
```

#### سناریو ۴ — کاربر کارت وارد می‌کند (بانک از prefix تشخیص داده می‌شود)

```ts
syncBankShebaAndAccount({
  account: "1234567890",
  cardNumber: "6037991234567890",
});
// → bankType = MELLI، sheba ساخته می‌شود
```

#### سناریو ۵ — شبای نامعتبر

```ts
syncBankShebaAndAccount({ sheba: "IR000000000000000000000000" });
// → shebaValid: false، error: "شماره شبا معتبر نیست"
```

### ۵. اعتبارسنجی ترمینال/حساب بانکی

برای فرم «حداقل یکی از کارت / شبا / حساب+بانک»:

```ts
import { validateBankTerminalInput } from "@ilamanownuk/iranian-bank";

// ✅ کارت ۱۶ رقمی
validateBankTerminalInput({ cardNumber: "6037991234567890" });
// { ok: true, synced: {...}, card: "6037991234567890" }

// ✅ شبای معتبر
validateBankTerminalInput({ sheba: "IR76..." });

// ✅ حساب + بانک
validateBankTerminalInput({
  account: "1234567890",
  bankType: BANK_TYPES_ENUM.MELLI,
});

// ❌ خالی
validateBankTerminalInput({});
// { ok: false, message: "حداقل یکی از کارت بانکی، شبای معتبر، یا شماره حساب همراه بانک را وارد کنید" }
```

### ۶. لوگو و تم رنگی

لوگوها از CDN عمومی [ir-banks/logos](https://github.com/ir-banks/logos) بارگذاری می‌شوند (`logoUrl`).

```ts
import { getBankLogoPayload, getBankThemeCode, bankLogoUrl, resolveLogoUrl } from "@ilamanownuk/iranian-bank";

const logo = getBankLogoPayload(BANK_TYPES_ENUM.MELLI);
logo.logoUrl;  // "https://ir-banks.github.io/logos/banks/Melli.svg"
logo.label;    // "ملی"
logo.theme;    // { light: "#E8D9A0", dark: "#4A3F1F" }

// رنگ پس‌زمینه کارت در حالت light/dark
getBankThemeCode(logo, "light");

// URL مستقیم
bankLogoUrl("Melli.svg");
resolveLogoUrl("melli");
```

### ۷. رجیستری بانک‌ها

```ts
import { IRANIAN_BANKS, getIranianBankSelectOptions, getBankDetails } from "@ilamanownuk/iranian-bank";

// لیست کامل
IRANIAN_BANKS.forEach((b) => {
  console.log(b.faName, b.shebaCode, b.cardPrefixes);
});

// برای dropdown/select
const options = getIranianBankSelectOptions();
// [{ id, bankType, bankId, name, shebaCode, logoUrl }, ...]

// جزئیات یک بانک
getBankDetails(BANK_TYPES_ENUM.SAMAN);
```

**بانک‌های پشتیبانی‌شده (نمونه):**

| نام فارسی | `BankId` | کد شبا | پیشوند کارت (نمونه) |
|-----------|----------|--------|---------------------|
| ملی | `melli` | 017 | 603799 |
| تجارت | `tejarat` | 018 | 627353 |
| ملت | `mellat` | 012 | 610433 |
| صادرات | `saderat` | 019 | 603769 |
| سامان | `saman` | 056 | 621986 |
| پاسارگاد | `pasargad` | 057 | 502229 |
| بلو بانک | `blu` | *(ندارد)* | 62198619 |

لیست کامل در `IRANIAN_BANKS` موجود است.

---

## لایه React (headless)

```bash
# react باید نصب باشد
npm install react
```

```tsx
import { useBankSync, BankLogo } from "@ilamanownuk/iranian-bank/react";
import { resolveBankIdentity, BANK_TYPES_ENUM } from "@ilamanownuk/iranian-bank";
```

### `useBankSync`

State داخلی برای sheba / account / card / bankType + همگام‌سازی خودکار.

```tsx
function BankForm() {
  const {
    state,           // { sheba, account, cardNumber, bankType }
    synced,          // نتیجه syncBankShebaAndAccount
    formattedSheba,  // شبا با فاصله برای نمایش
    bankDetails,     // جزئیات بانک انتخاب‌شده
    bankId,          // "melli" | "mellat" | ...
    setSheba,
    setAccount,
    setCardNumber,
    setBankType,
    shebaStatus,     // null | "valid" | "invalid"
  } = useBankSync({
    sheba: "",
    account: "",
    bankType: BANK_TYPES_ENUM.NONE,
  });

  return (
    <div>
      <label>شماره شبا</label>
      <input
        value={state.sheba}
        onChange={(e) => setSheba(e.target.value)}
      />
      {shebaStatus() === "valid" && <span className="text-green-600">شبا معتبر است</span>}
      {shebaStatus() === "invalid" && <span className="text-red-600">شبا نامعتبر است</span>}

      <label>شماره حساب</label>
      <input
        value={state.account}
        onChange={(e) => setAccount(e.target.value)}
      />

      <label>شماره کارت</label>
      <input
        value={state.cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        maxLength={19}
      />

      <select
        value={state.bankType}
        onChange={(e) => setBankType(Number(e.target.value) as BANK_TYPES_ENUM)}
      >
        <option value={BANK_TYPES_ENUM.NONE}>انتخاب بانک</option>
        {/* ... */}
      </select>

      {synced.error && <p role="alert">{synced.error}</p>}
    </div>
  );
}
```

**رفتار setterها:** وقتی `setSheba` / `setAccount` / `setCardNumber` / `setBankType` صدا زده می‌شود، فیلدهای وابسته به‌صورت خودکار پر می‌شوند (مثلاً با تغییر حساب + بانک، شبا ساخته می‌شود).

### `BankLogo`

کامپوننت headless — پیش‌فرض `<img>`؛ برای Next.js از `renderImage` استفاده کنید.

#### حالت ۱ — `<img>` ساده

```tsx
import { BankLogo } from "@ilamanownuk/iranian-bank/react";
import { resolveBankIdentity } from "@ilamanownuk/iranian-bank";

const identity = resolveBankIdentity({ cardNumber: "6037991234567890" });

<BankLogo bank={identity} size={48} className="rounded-full" />;
```

#### حالت ۲ — Next.js `Image`

```tsx
import Image from "next/image";
import { BankLogo } from "@ilamanownuk/iranian-bank/react";

<BankLogo
  bank={identity}
  size={40}
  renderImage={({ src, alt, size, className }) => (
    <Image src={src} alt={alt} width={size} height={size} className={className} />
  )}
/>;
```

> برای دامنهٔ `ir-banks.github.io` در `next.config` باید `images.remotePatterns` تنظیم شود.

#### حالت ۳ — props جداگانه

```tsx
<BankLogo logo={identity.logo} size={32} alt="بانک ملی" />
<BankLogo details={identity.details} size={32} />
```

---

## لایه React Hook Form

```bash
npm install react-hook-form
```

```ts
import { useBankShebaAccountSync, DEFAULT_BANK_FIELD_PATHS } from "@ilamanownuk/iranian-bank/react-rhf";
```

### مسیرهای سفارشی فیلد

برای هر ساختار فرم، pathها را generic تعریف کنید:

```tsx
import { useForm } from "react-hook-form";
import { useBankShebaAccountSync } from "@ilamanownuk/iranian-bank/react-rhf";
import type { BankSelectOption } from "@ilamanownuk/iranian-bank";

type PaymentForm = {
  iban: string;
  accountNo: string;
  cardNo: string;
  bank: BankSelectOption | null;
};

function PaymentFormFields() {
  const methods = useForm<PaymentForm>({
    defaultValues: { iban: "", accountNo: "", cardNo: "", bank: null },
  });

  const {
    onShebaChange,
    onAccountChange,
    onBankSelect,
    onCardComplete,
    shebaStatus,
    formatShebaOnBlur,
    bankOptions,
  } = useBankShebaAccountSync(methods, {
    sheba: "iban",
    account: "accountNo",
    card: "cardNo",
    selectedBank: "bank",
  });

  return (
    <>
      <input
        {...methods.register("iban")}
        onChange={(e) => onShebaChange(e.target.value)}
        onBlur={formatShebaOnBlur}
      />
      {shebaStatus(methods.watch("iban")) === "invalid" && <span>شبا نامعتبر</span>}

      <input
        {...methods.register("accountNo")}
        onChange={(e) => onAccountChange(e.target.value)}
      />

      <input
        {...methods.register("cardNo")}
        onBlur={onCardComplete}
      />

      <select onChange={(e) => {
        const opt = bankOptions.find((o) => o.id === e.target.value) ?? null;
        onBankSelect(opt);
      }}>
        {bankOptions.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </>
  );
}
```

### مسیرهای پیش‌فرض

برای فرم‌هایی با ساختار `extra.*` (رایج در نرم‌افزارهای حسابداری فارسی):

```ts
import { DEFAULT_BANK_FIELD_PATHS, useBankShebaAccountSync } from "@ilamanownuk/iranian-bank/react-rhf";

// معادل:
// sheba:        "extra.bankShebaNumber"
// account:      "extra.bankAccountNumber"
// card:         "extra.bankCardNumber"
// selectedBank: "selectedBank"

useBankShebaAccountSync(methods, DEFAULT_BANK_FIELD_PATHS);
```

### فرم کامل نمونه

```tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import {
  useBankShebaAccountSync,
  DEFAULT_BANK_FIELD_PATHS,
  type DefaultBankFormFields,
} from "@ilamanownuk/iranian-bank/react-rhf";
import { BankLogo } from "@ilamanownuk/iranian-bank/react";
import { resolveBankIdentity } from "@ilamanownuk/iranian-bank";

type FormValues = DefaultBankFormFields;

export function TerminalBankForm() {
  const methods = useForm<FormValues>({
    defaultValues: {
      extra: { bankShebaNumber: "", bankAccountNumber: "", bankCardNumber: "" },
      selectedBank: null,
    },
  });

  const {
    onShebaChange,
    onAccountChange,
    onBankSelect,
    onCardComplete,
    shebaStatus,
    formatShebaOnBlur,
    bankOptions,
  } = useBankShebaAccountSync(methods, DEFAULT_BANK_FIELD_PATHS);

  const card = methods.watch("extra.bankCardNumber");
  const identity = card?.length >= 16 ? resolveBankIdentity({ cardNumber: card }) : null;

  return (
    <FormProvider {...methods}>
      <form>
        {identity && <BankLogo bank={identity} size={40} />}

        <input
          placeholder="شماره شبا"
          {...methods.register("extra.bankShebaNumber")}
          onChange={(e) => onShebaChange(e.target.value)}
          onBlur={formatShebaOnBlur}
        />

        <input
          placeholder="شماره حساب"
          {...methods.register("extra.bankAccountNumber")}
          onChange={(e) => onAccountChange(e.target.value)}
        />

        <input
          placeholder="شماره کارت"
          {...methods.register("extra.bankCardNumber")}
          onBlur={onCardComplete}
        />

        <select
          onChange={(e) => {
            const bank = bankOptions.find((b) => b.id === e.target.value) ?? null;
            onBankSelect(bank);
          }}
        >
          <option value="">انتخاب بانک</option>
          {bankOptions.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </form>
    </FormProvider>
  );
}
```

### خروجی‌های `useBankShebaAccountSync`

| متد / مقدار | کاربرد |
|-------------|--------|
| `onShebaChange(value)` | تغییر شبا → sync حساب و بانک |
| `onAccountChange(value)` | تغییر حساب → sync شبا (اگر بانک مشخص باشد) |
| `onBankSelect(bank)` | انتخاب بانک از dropdown |
| `onCardComplete()` | بعد از blur کارت — تشخیص بانک و sync |
| `shebaStatus(sheba?)` | `null` \| `"valid"` \| `"invalid"` |
| `formatShebaOnBlur()` | فرمت شبا با فاصله هنگام blur |
| `bankOptions` | لیست بانک‌ها برای select |
| `paths` | همان pathهایی که دادید |

---

## مرجع API

### تایپ‌های مهم

| تایپ | توضیح |
|------|--------|
| `BANK_TYPES_ENUM` | enum عددی بانک‌ها (سازگاری با کد قدیمی) |
| `BankId` | شناسه رشته‌ای پایدار (`"melli"`, `"mellat"`, …) |
| `BankTypeDetails` | نام فارسی، کد شبا، prefix کارت، logoUrl |
| `BankIdentityResult` | نتیجه `resolveBankIdentity` |
| `SyncBankFieldsResult` | نتیجه همگام‌سازی |
| `BankSelectOption` | آیتم dropdown بانک |
| `BankLogoPayload` | لوگو + label + تم رنگی |
| `BankFieldPaths<T>` | مسیرهای generic برای react-hook-form |

### جدول توابع Core

| تابع | ورودی | خروجی |
|------|--------|--------|
| `validateIranSheba` | شبا | `boolean` |
| `accountNumberToSheba` | حساب + کد بانک | شبا یا `null` |
| `shebaToAccountNumber` | شبا | حساب یا `null` |
| `getBankTypeByCard` | کارت | `BANK_TYPES_ENUM` |
| `getBankTypeBySheba` | شبا | `BANK_TYPES_ENUM` |
| `syncBankShebaAndAccount` | شیء ۴ فیلدی | `SyncBankFieldsResult` |
| `validateBankTerminalInput` | شیء + card | `{ ok, ... }` |
| `resolveBankIdentity` | card/sheba/type | `BankIdentityResult` |
| `getIranianBankSelectOptions` | — | `BankSelectOption[]` |

---

## محدودیت‌ها

- **بلو بانک** کد شبا در رجیستری ندارد — فقط از prefix کارت (`62198619`) تشخیص داده می‌شود.
- **لوگوها** از CDN خارجی بارگذاری می‌شوند؛ برخی بانک‌های کوچک ممکن است لوگو نداشته باشند.
- دادهٔ prefix کارت بر اساس منابع عمومی/بانک مرکزی است — همیشه شبا را با `validateIranSheba` چک کنید.
- این پکیج **UI آماده** (input، select، modal) ندارد — فقط منطق و hook.

---

## توسعه

```bash
git clone https://github.com/ilamanownuk/iranian-bank.git
cd iranian-bank
pnpm install
pnpm build
pnpm test
```

انتشار:

```bash
npm login
npm publish --access public
```

---

## لایسنس

MIT © [ilamanownuk](https://github.com/ilamanownuk)
