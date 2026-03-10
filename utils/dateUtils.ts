import { Timestamp } from 'firebase/firestore';

type FirebaseTimestamp = { toDate: () => Date };
type DateInput = FirebaseTimestamp | Date | string | number | null | undefined;

const toDate = (value: DateInput): Date | null => {
  if (!value) return null;
  if (typeof value === 'object' && 'toDate' in value) return value.toDate();
  return new Date(value as string | number | Date);
};

export const timeAgo = (value: DateInput): string => {
  const date = toDate(value);
  if (!date || isNaN(date.getTime())) return '';

  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
};

export const formatDate = (value: DateInput, locale = 'en-US'): string => {
  const date = toDate(value);
  if (!date || isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (value: DateInput, locale = 'en-US'): string => {
  const date = toDate(value);
  if (!date || isNaN(date.getTime())) return '';
  return date.toLocaleString(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};
