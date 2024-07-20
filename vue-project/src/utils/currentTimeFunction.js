export default function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  const pad = (value, length = 2) => {
    const strValue = String(value);
    return strValue.padStart(length, '0');
  };

  const dateString = `${year}-${pad(month)}-${pad(day)}`;
  const timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
  const offsetMinutes = now.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
  const offsetMinutesString = pad(Math.abs(offsetMinutes) % 60);
  const offsetString = `${offsetMinutes < 0 ? '+' : '-'}${pad(offsetHours)}:${offsetMinutesString}`;

  return `${dateString} ${timeString}${offsetString}`;
}
