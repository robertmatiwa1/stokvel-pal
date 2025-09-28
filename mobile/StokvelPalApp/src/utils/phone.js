import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function toE164(inputDigits) {
  if (!inputDigits) return null;
  let number = inputDigits;
  if (number.startsWith('0')) number = '+27' + number.slice(1);
  else if (!number.startsWith('+')) {
    if (number.startsWith('27')) number = '+' + number;
    else number = '+27' + number;
  }
  const parsed = parsePhoneNumberFromString(number);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number;
}
