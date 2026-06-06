// Formatting helpers built on the language's predefined Intl objects, so dates
// and prices are displayed consistently and localised across the panel.

// Reuse a single Intl.NumberFormat instance (Spanish euro currency).
const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

// Format a numeric price as euros, e.g. 12.5 -> "12,50 €".
export const formatPrice = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? currencyFormatter.format(number) : '—';
};

// Reuse a single Intl.DateTimeFormat instance (long, readable date).
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

// Format an ISO date string as a readable date, e.g. "06 de junio de 2026".
export const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
};

// Average of a numeric array using Array.prototype.reduce; 0 for an empty list.
export const average = (numbers) =>
  numbers.length === 0
    ? 0
    : numbers.reduce((sum, n) => sum + Number(n), 0) / numbers.length;
