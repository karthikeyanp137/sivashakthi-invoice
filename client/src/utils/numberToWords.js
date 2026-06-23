// Frontend version of number-to-words in Indian format.

const ONE_TO_NINETEEN = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen"
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety"
];

function twoDigitToWords(num) {
  if (num === 0) return "";
  if (num < 20) return ONE_TO_NINETEEN[num];
  const tens = Math.floor(num / 10);
  const ones = num % 10;
  return `${TENS[tens]}${ones ? " " + ONE_TO_NINETEEN[ones] : ""}`;
}

function threeDigitToWords(num) {
  const hundreds = Math.floor(num / 100);
  const rest = num % 100;
  let str = "";
  if (hundreds > 0) {
    str += ONE_TO_NINETEEN[hundreds] + " Hundred";
    if (rest > 0) str += " and ";
  }
  if (rest > 0) {
    str += twoDigitToWords(rest);
  }
  return str;
}

export function numberToIndianCurrencyWords(amount) {
  const num = Math.round(Number(amount || 0));

  if (num === 0) {
    return "Rupees Zero Only";
  }

  let n = num;

  const crores = Math.floor(n / 10000000);
  n = n % 10000000;
  const lakhs = Math.floor(n / 100000);
  n = n % 100000;
  const thousands = Math.floor(n / 1000);
  n = n % 1000;
  const hundredsAndBelow = n;

  let words = "";

  if (crores > 0) {
    words += `${twoDigitToWords(crores)} Crore `;
  }
  if (lakhs > 0) {
    words += `${twoDigitToWords(lakhs)} Lakh `;
  }
  if (thousands > 0) {
    words += `${twoDigitToWords(thousands)} Thousand `;
  }
  if (hundredsAndBelow > 0) {
    words += threeDigitToWords(hundredsAndBelow) + " ";
  }

  words = words.trim();

  return `Rupees ${words} Only`;
}

