/**
 * Date & Time Utilities for NESA Exam Builder
 * Provides HTML Date/Time selection, current date defaults, and automatic duration calculation.
 */

export function getCurrentDateISO(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateToDisplay(isoDateStr: string): string {
  if (!isoDateStr) return '';
  // If already in DD/MM/YYYY format or non-ISO format
  if (isoDateStr.includes('/')) return isoDateStr;
  const parts = isoDateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return isoDateStr;
}

export function parseDisplayToISO(displayStr: string): string {
  if (!displayStr) return getCurrentDateISO();
  if (displayStr.includes('-') && displayStr.length === 10) return displayStr;
  const parts = displayStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return getCurrentDateISO();
}

export function format12Hour(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const formattedMinutes = String(m).padStart(2, '0');
  return `${h}:${formattedMinutes} ${ampm}`;
}

export function calculateDurationFromTimes(startTime24: string, endTime24: string): string {
  if (!startTime24 || !endTime24) return '';

  const [startH, startM] = startTime24.split(':').map(n => parseInt(n, 10));
  const [endH, endM] = endTime24.split(':').map(n => parseInt(n, 10));

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return '';

  let startTotalMins = startH * 60 + startM;
  let endTotalMins = endH * 60 + endM;

  if (endTotalMins < startTotalMins) {
    endTotalMins += 24 * 60; // Next day
  }

  const diffMins = endTotalMins - startTotalMins;
  if (diffMins <= 0) return '0 MINS';

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (hours > 0 && mins === 0) {
    return `${hours} HOUR${hours > 1 ? 'S' : ''}`;
  }
  if (hours === 0 && mins > 0) {
    return `${mins} MINS`;
  }
  return `${hours} HOUR${hours > 1 ? 'S' : ''} ${mins} MINS`;
}
