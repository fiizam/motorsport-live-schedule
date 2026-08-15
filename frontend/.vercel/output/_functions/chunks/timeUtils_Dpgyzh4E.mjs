//#region src/utils/timeUtils.ts
/**
* Core time utility handling secure timezone conversions 
* from ISO 8601 timestamps to the user's local timezone, specifically Asia/Jakarta (WIB).
*/
var TIMEZONE = "Asia/Jakarta";
var LOCALE = "en-GB";
function parseISODate(isoString) {
	if (!isoString) throw new Error("Missing ISO date string from provider.");
	const date = new Date(isoString);
	if (Number.isNaN(date.getTime())) throw new Error(`Invalid ISO date string provided: ${isoString}`);
	return date;
}
function formatEventDay(isoString) {
	const date = parseISODate(isoString);
	return new Intl.DateTimeFormat(LOCALE, {
		timeZone: TIMEZONE,
		day: "2-digit"
	}).format(date);
}
function formatEventMonth(isoString) {
	const date = parseISODate(isoString);
	return new Intl.DateTimeFormat(LOCALE, {
		timeZone: TIMEZONE,
		month: "short"
	}).format(date);
}
function formatEventWeekday(isoString) {
	const date = parseISODate(isoString);
	return new Intl.DateTimeFormat(LOCALE, {
		timeZone: TIMEZONE,
		weekday: "long"
	}).format(date);
}
function formatEventTime(isoString) {
	const date = parseISODate(isoString);
	return new Intl.DateTimeFormat(LOCALE, {
		timeZone: TIMEZONE,
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	}).format(date);
}
function formatEventDateShort(isoString) {
	const date = parseISODate(isoString);
	return new Intl.DateTimeFormat(LOCALE, {
		timeZone: TIMEZONE,
		day: "2-digit",
		month: "short"
	}).format(date);
}
function formatRaceWeekendRange(sessions) {
	if (!sessions || sessions.length === 0) return "TBD";
	const sorted = [...sessions].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
	const firstSession = parseISODate(sorted[0].startDate);
	const lastSession = parseISODate(sorted[sorted.length - 1].startDate);
	const formatterDay = new Intl.DateTimeFormat(LOCALE, {
		timeZone: TIMEZONE,
		day: "numeric"
	});
	const formatterMonthLong = new Intl.DateTimeFormat(LOCALE, {
		timeZone: TIMEZONE,
		month: "long"
	});
	const formatterMonthShort = new Intl.DateTimeFormat(LOCALE, {
		timeZone: TIMEZONE,
		month: "short"
	});
	const firstDay = formatterDay.format(firstSession);
	const lastDay = formatterDay.format(lastSession);
	const lastMonth = formatterMonthLong.format(lastSession);
	const firstMonthShort = formatterMonthShort.format(firstSession);
	if (firstMonthShort === formatterMonthShort.format(lastSession)) return `${firstDay}-${lastDay} ${lastMonth}`;
	else return `${firstDay} ${firstMonthShort} - ${lastDay} ${lastMonth}`;
}
//#endregion
export { formatEventWeekday as a, formatEventTime as i, formatEventDay as n, formatRaceWeekendRange as o, formatEventMonth as r, formatEventDateShort as t };
