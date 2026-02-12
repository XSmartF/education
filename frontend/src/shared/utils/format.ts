const byteFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const moneyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export const formatBytes = (value: number) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${byteFormatter.format(value / 1024)} KB`;
  return `${byteFormatter.format(value / (1024 * 1024))} MB`;
};

export const formatDateTime = (value: string | number | Date) =>
  dateTimeFormatter.format(new Date(value));

export const formatMoney = (value: number) => moneyFormatter.format(value);
