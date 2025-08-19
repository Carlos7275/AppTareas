export const formatDateTimeLocal = (date?: string) => {
  if (!date) return "";
  const d = new Date(date);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
