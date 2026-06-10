# @ilamanownuk/iranian-bank

Iranian banks registry, SHEBA/IBAN validation, bank card detection, and React form synchronization.

**No UI framework lock-in** — core works in Node.js and browsers; React layers are optional headless hooks.

## Install

```bash
npm install @ilamanownuk/iranian-bank
# or
pnpm add @ilamanownuk/iranian-bank
```

### Peer dependencies

| Package | Required for |
|---------|----------------|
| `react >= 18` | `@ilamanownuk/iranian-bank/react` and `/react-rhf` |
| `react-hook-form >= 7` | `@ilamanownuk/iranian-bank/react-rhf` (optional peer) |

## Entry points

| Import | Description |
|--------|-------------|
| `@ilamanownuk/iranian-bank` | Core — validation, registry, sync (no React) |
| `@ilamanownuk/iranian-bank/react` | Headless React hooks + `BankLogo` |
| `@ilamanownuk/iranian-bank/react-rhf` | `react-hook-form` integration with custom field paths |

## Core (Node / browser)

```ts
import {
  validateIranSheba,
  getBankTypeByCard,
  getBankTypeBySheba,
  accountNumberToSheba,
  shebaToAccountNumber,
  syncBankShebaAndAccount,
  resolveBankIdentity,
  BANK_TYPES_ENUM,
} from "@ilamanownuk/iranian-bank";

const sheba = accountNumberToSheba("1234567890", "017"); // Melli
if (!validateIranSheba(sheba)) throw new Error("Invalid IBAN");

const bank = getBankTypeByCard("6037991234567890"); // BANK_TYPES_ENUM.MELLI

const synced = syncBankShebaAndAccount({
  account: "1234567890",
  bankType: BANK_TYPES_ENUM.MELLI,
});
```

### Bank logos

Logos use the public [ir-banks/logos](https://github.com/ir-banks/logos) CDN (`logoUrl` on each bank). You can override with your own `image` when building custom UIs.

## React (headless)

```tsx
import { useBankSync } from "@ilamanownuk/iranian-bank/react";
import { BankLogo } from "@ilamanownuk/iranian-bank/react";

function MyForm() {
  const { state, synced, setSheba, setAccount, setBankType, shebaStatus } = useBankSync();

  return (
    <div>
      <input value={state.sheba} onChange={(e) => setSheba(e.target.value)} />
      <input value={state.account} onChange={(e) => setAccount(e.target.value)} />
      {shebaStatus() === "valid" && <span>Valid SHEBA</span>}
      {synced.error && <span>{synced.error}</span>}
    </div>
  );
}
```

### BankLogo with Next.js Image

```tsx
import Image from "next/image";
import { BankLogo } from "@ilamanownuk/iranian-bank/react";
import { resolveBankIdentity } from "@ilamanownuk/iranian-bank";

const identity = resolveBankIdentity({ cardNumber: "6037991234567890" });

<BankLogo
  bank={identity}
  size={40}
  renderImage={({ src, alt, size }) => (
    <Image src={src} alt={alt} width={size} height={size} />
  )}
/>
```

## React Hook Form

### Custom field paths (any project)

```ts
import { useForm } from "react-hook-form";
import { useBankShebaAccountSync } from "@ilamanownuk/iranian-bank/react-rhf";

type MyForm = {
  iban: string;
  accountNo: string;
  bank: { bankType: number; name: string } | null;
};

const methods = useForm<MyForm>();

const { onShebaChange, onAccountChange, onBankSelect, bankOptions } =
  useBankShebaAccountSync(methods, {
    sheba: "iban",
    account: "accountNo",
    selectedBank: "bank",
  });
```

### Default nested field paths

```ts
import { DEFAULT_BANK_FIELD_PATHS, useBankShebaAccountSync } from "@ilamanownuk/iranian-bank/react-rhf";

useBankShebaAccountSync(methods, DEFAULT_BANK_FIELD_PATHS);
// sheba: extra.bankShebaNumber
// account: extra.bankAccountNumber
// card: extra.bankCardNumber
// selectedBank: selectedBank
```

## API overview

### Validation & conversion

- `validateIranSheba(sheba)` — MOD-97 IBAN check
- `normalizeSheba`, `formatShebaDisplay`, `normalizeCardNumber`
- `accountNumberToSheba(account, bankCode)` / `shebaToAccountNumber(sheba)`
- `syncBankShebaAndAccount({ sheba, account, cardNumber, bankType })`

### Detection

- `getBankTypeByCard(card)` / `getBankTypeBySheba(sheba)`
- `resolveBankIdentity({ cardNumber, shebaNumber, bankType })`
- `getIranianBankSelectOptions()` — for bank selectors

### Types

- `BANK_TYPES_ENUM` — numeric enum (backward compatible)
- `BankId` — string id (`"melli"`, `"mellat"`, …)
- `BankSelectOption`, `SyncBankFieldsResult`, `BankLogoPayload`

## Limitations

- **Blu Bank** has no SHEBA code in registry — detection works via card prefix only.
- Logo URLs depend on [ir-banks.github.io](https://ir-banks.github.io/logos/banks/); some smaller banks may not have logos there.
- Card prefix data follows Central Bank / community sources; always validate SHEBA with `validateIranSheba`.

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## Publish

```bash
npm login
npm publish --access public
```

## License

MIT © ilamanownuk
