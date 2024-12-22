import { randomBytes } from "crypto";

// Add days to given days, require days.
export const addDate = (days, date = new Date) => {
    let result = new Date(date);
    result.setDate(date.getDate() + days)
    return result;
}

// return formatted date eg. "01-01-2023"
export function formattedDate(d = new Date) {
    return [d.getDate(), d.getMonth()+1, d.getFullYear()]
        .map(n => n < 10 ? `0${n}` : `${n}`).join('-');
}

export const generateSecretToken = () => {
    let secretRefresh = randomBytes(16).toString("hex");
    return secretRefresh;
}