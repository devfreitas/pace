export const parseTimeToSeconds = (timeStr: string) => {
  if (!timeStr) return 0;

  if (!timeStr.includes(':')) {
    const num = parseInt(timeStr, 10);
    if (isNaN(num)) return 0;
    const str = num.toString();
    if (str.length <= 2) {
      return parseInt(str, 10);
    } else {
      const secStr = str.slice(-2);
      const minStr = str.slice(0, -2);
      const m = parseInt(minStr, 10);
      const s = parseInt(secStr, 10);
      return (isNaN(m) ? 0 : m * 60) + (isNaN(s) ? 0 : s);
    }
  }

  const parts = timeStr.split(':');
  const min = parseInt(parts[0] || '0', 10);
  const sec = parts.length > 1 ? parseInt(parts[1] || '0', 10) : 0;
  return (isNaN(min) ? 0 : min * 60) + (isNaN(sec) ? 0 : sec);
};

export const formatSecondsToTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const sanitizeTimeInput = (text: string) => {
  let cleaned = text.replace(/[^\d:]/g, '');
  const parts = cleaned.split(':');
  if (parts.length > 2) {
    cleaned = parts[0] + ':' + parts.slice(1).join('').slice(0, 2);
  } else if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + ':' + parts[1].slice(0, 2);
  }
  return cleaned;
};

export const formatOnBlur = (text: string) => {
  const secs = parseTimeToSeconds(text);
  return formatSecondsToTime(secs);
};
