import {DateTime} from "luxon";
import dayjs, {Dayjs} from "dayjs";


//daysJs



export const getDayJs = (date: Date = new Date()) => {
    return dayjs(date);
}

export const getDayJsToDate = (date: Dayjs) => {
    return dayjs().toDate();
}


export const getCurrentDate = () => {
    return dayjs().format('DD-MM-YY');
}

export const getDateFormat = (date = new Date()) => {
    return dayjs(date).format('YYYY-MM-DD');
}

export const getDateFromString = (date : string, format = 'YYYY-MM-DD') => {
    return dayjs(date, format);
}


export const getDateMonth = (date: Date) => {
    return dayjs(date).format('DD MMM');
}

export const getDateMonthTime = (date: Date = new Date()) => {
    return dayjs(date).format('DD MMM YY, hh:mm A');
}

export const getDateMedJs = (seconds: number) => {
    return dayjs(seconds * 1000).format('DD MMM YY, hh:mm A');
}

export const getDateJsIdFormat = (date: Date) => {
    return dayjs(date).format('DD MMM YY, hh:mm A');
}

export const getTimeJs = (date: Date) => {
    return dayjs(date).format('hh:mm A');
}


// dates

export const getDateToEpoch = (date: Date): number => {
    return date.valueOf();
}

export const getISODate = (seconds: number): Date => {
    return new Date(seconds * 1000)
}


export const getDate = (date: Date): string => {
    return DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
}

/**
 * {@link DateTime.toLocaleString} format like 'Oct 14, 1983, 9:30 AM'. Only 12-hour if the locale is.
 */
export const getDateMed = (seconds: number): string => {
    return DateTime.fromISO(getISODate(seconds).toISOString()).toLocaleString(DateTime.TIME_SIMPLE)
}


export const getTime = (seconds: number): string => {
    return DateTime.fromISO(getISODate(seconds).toISOString()).toLocaleString(DateTime.TIME_SIMPLE)
}


export const getDateFromISO = (isoTime: string): string => {
    return DateTime.fromISO(isoTime).toLocaleString(DateTime.DATE_MED)
}


export const getTimeFromISO = (isoTime: string): string => {
    return DateTime.fromISO(isoTime).toLocaleString(DateTime.TIME_SIMPLE)
}


export const getTimeSecFromISO = (isoTime: string): string => {
    return DateTime.fromISO(isoTime).toLocaleString(DateTime.TIME_WITH_SECONDS)
}


export const getDateTimeSecFromISO = (isoTime: string): string => {
    return DateTime.fromISO(isoTime).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
}







//local storage

// export const setStorage = (key: string, val: any) => {
//     localStorage.setItem(key, JSON.stringify(val));
// }

// export const getStorage = (key: string) => {
//     let val = localStorage.getItem(key);
//     return val ? JSON.parse(val) : val;
// }

// export const clearStorage = () => localStorage.clear();





//sort


export const sortBy2Key = (array: any[], key: string, subKey: string) => {
    return array.sort((function (a, b) {
        //@ts-ignore
        return (b[key][subKey] - a[key][subKey])
    }));
}


export const sortByKey = (array: any[], key: string) => {
    return array.sort((function (a, b) {
        //@ts-ignore
        return (b[key] - a[key])
    }));
}


export const sortByKeyDate = (array: any[], key: string) => {

    return array.sort((function (a, b) {
        //@ts-ignore
        return (new Date(b[key]) - new Date(a[key]))
    }));
}

export const JSONCopy = (Obj: any) => {
    return JSON.parse(JSON.stringify(Obj));
};


export const insertAtIndex = <T>(arr: T[], index: number, element: T): T[] => {
    if (index < 0 || index > arr.length) {
        throw new Error("Index out of bounds");
    }

    const newArr = [...arr]; // Create a copy to avoid modifying the original array

    newArr.splice(index, 0, element); // Use splice to insert the element

    return newArr;
}

/**
 * Custom development warning function (clone of console.warn)
 * @param message Primary message to display
 * @param optionalParams Additional parameters to log
 */
export const devWarn = (message?: any, ...optionalParams: any[]): void => {
    console.warn(message, ...optionalParams);
};
