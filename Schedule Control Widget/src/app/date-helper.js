export const getFromToDateObj = (from, to) => {
    return {from: getUtc(from), to: getUtc(to)}
};
const getTodayPeriod = () => {
    let curDate = getUtc(new Date());
    return getFromToDateObj(curDate, curDate)
};
const getYesterdayPeriod = () => {
    let currDate = getUtc(new Date());
    let yestDate = new Date(currDate.setDate(currDate.getDate() - 1));
    return getFromToDateObj(yestDate, yestDate);
};

const getCurrWeekPeriod = () => {
    let currDate = getUtc(new Date());
    let first = new Date(currDate.setDate(currDate.getDate() - currDate.getDay() + (currDate.getDay() === 0 ? -6 : 1)));
    let last = new Date(currDate.setDate(currDate.getDate() + 6));
    return getFromToDateObj(first, last)
};
export const getUtc = (date) => {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
};


export const periodsData = [
    {label: "Сегодня", getPeriod: getTodayPeriod, key: "Сегодня"},
    {label: "Вчера", getPeriod: getYesterdayPeriod, key: "Вчера"},
    {label: "Эта неделя", getPeriod: getCurrWeekPeriod, key: "Эта неделя"}
];
export const getDateLabel = (fromDate, toDate) => {
    return `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`
};
export const getPeriodsArray = (periodsLabels) => {
    return periodsLabels.map(periodLabel => {
        const periodFromData = periodsData.filter(period => period.label === periodLabel)[0];
        if (periodFromData) {
            return periodFromData
        }
        const fromTo = periodLabel.split('-').map(splitDatePart => {
            const dateComponents = splitDatePart.trim().split('.');
            return new Date(`${dateComponents[2]}-${dateComponents[1]}-${dateComponents[0]}`)
        });
        return {label: periodLabel,getPeriod:()=>getFromToDateObj(fromTo[0],fromTo[1])}

    })
};
