import { MetadataModelError, FieldDatetimeFormats } from '@core';
import { core, path } from '@rogonion/js-json';
import { FilterConditionProps, FilterConditions, type FilterContext } from './core';

export function isTimestampConditionTrue(
    ctx: FilterContext,
    _fieldGroupJsonPathKey: path.JSONPath,
    filterCondition: string,
    valueFound: any,
    filterValue: core.JsonObject
): boolean {
    if (valueFound === undefined || valueFound === null) {
        return false;
    }

    let dateTimeFormat: string;
    if (
        FilterConditionProps.DateTimeFormat in filterValue &&
        core.IsString(filterValue[FilterConditionProps.DateTimeFormat])
    ) {
        dateTimeFormat = filterValue[FilterConditionProps.DateTimeFormat] as string;
    } else {
        if (ctx.isErrorsSilenced()) {
            return false;
        }
        if (!(FilterConditionProps.DateTimeFormat in filterValue)) {
            throw new MetadataModelError(
                `filter condition property '${FilterConditionProps.DateTimeFormat}' not found`
            );
        }
        throw new MetadataModelError(
            `filter condition property '${FilterConditionProps.DateTimeFormat}' is not a string`
        );
    }

    const valueToCompare: Date[] = [];

    const parseDate = (val: any): Date => {
        if (val instanceof Date) return val;
        if (core.IsString(val)) {
            const d = new Date(val);
            if (isNaN(d.getTime())) {
                throw new Error(`Error parsing filter condition value \`${val}\` to time`);
            }
            return d;
        }
        throw new Error(`filter condition property value to be Date or string`);
    };

    try {
        if (FilterConditionProps.Value in filterValue) {
            const val = filterValue[FilterConditionProps.Value];
            valueToCompare.push(parseDate(val));
        } else if (FilterConditionProps.Values in filterValue) {
            const vals = filterValue[FilterConditionProps.Values];
            if (Array.isArray(vals)) {
                for (const v of vals) {
                    valueToCompare.push(parseDate(v));
                }
            } else {
                throw new Error(`filter condition property '${FilterConditionProps.Values}' is not an array`);
            }
        } else {
            throw new Error(`filter condition property '${FilterConditionProps.Value}' not found`);
        }
    } catch (err) {
        if (ctx.isErrorsSilenced()) return false;
        throw new MetadataModelError(err instanceof Error ? err.message : String(err));
    }

    let valueFoundTime: Date;
    try {
        valueFoundTime = parseDate(valueFound);
    } catch (err) {
        return false;
    }

    const vfYear = valueFoundTime.getFullYear();
    const vfMonth = valueFoundTime.getMonth() + 1;
    const vfDay = valueFoundTime.getDate();
    const vfHour = valueFoundTime.getHours();
    const vfMinute = valueFoundTime.getMinutes();

    for (const value of valueToCompare) {
        const fvYear = value.getFullYear();
        const fvMonth = value.getMonth() + 1;
        const fvDay = value.getDate();
        const fvHour = value.getHours();
        const fvMinute = value.getMinutes();

        switch (filterCondition) {
            case FilterConditions.GreaterThan:
                switch (dateTimeFormat) {
                    case FieldDatetimeFormats.YYYYMMDDHHMM:
                        if (vfYear > fvYear) return true;
                        if (vfYear === fvYear) {
                            if (vfMonth > fvMonth) return true;
                            if (vfMonth === fvMonth) {
                                if (vfDay > fvDay) return true;
                                if (vfDay === fvDay) {
                                    if (vfHour > fvHour) return true;
                                    if (vfHour === fvHour) {
                                        if (vfMinute > fvMinute) return true;
                                    }
                                }
                            }
                        }
                        break;
                    case FieldDatetimeFormats.YYYYMMDD:
                        if (vfYear > fvYear) return true;
                        if (vfYear === fvYear) {
                            if (vfMonth > fvMonth) return true;
                            if (vfMonth === fvMonth) {
                                if (vfDay > fvDay) return true;
                            }
                        }
                        break;
                    case FieldDatetimeFormats.YYYYMM:
                        if (vfYear > fvYear) return true;
                        if (vfYear === fvYear) {
                            if (vfMonth > fvMonth) return true;
                        }
                        break;
                    case FieldDatetimeFormats.HHMM:
                        if (vfHour > fvHour) return true;
                        if (vfHour === fvHour) {
                            if (vfMinute > fvMinute) return true;
                        }
                        break;
                    case FieldDatetimeFormats.YYYY:
                        if (vfYear > fvYear) return true;
                        break;
                    case FieldDatetimeFormats.MM:
                        if (vfMonth > fvMonth) return true;
                        break;
                }
                break;
            case FilterConditions.LessThan:
                switch (dateTimeFormat) {
                    case FieldDatetimeFormats.YYYYMMDDHHMM:
                        if (vfYear < fvYear) return true;
                        if (vfYear === fvYear) {
                            if (vfMonth < fvMonth) return true;
                            if (vfMonth === fvMonth) {
                                if (vfDay < fvDay) return true;
                                if (vfDay === fvDay) {
                                    if (vfHour < fvHour) return true;
                                    if (vfHour === fvHour) {
                                        if (vfMinute < fvMinute) return true;
                                    }
                                }
                            }
                        }
                        break;
                    case FieldDatetimeFormats.YYYYMMDD:
                        if (vfYear < fvYear) return true;
                        if (vfYear === fvYear) {
                            if (vfMonth < fvMonth) return true;
                            if (vfMonth === fvMonth) {
                                if (vfDay < fvDay) return true;
                            }
                        }
                        break;
                    case FieldDatetimeFormats.YYYYMM:
                        if (vfYear < fvYear) return true;
                        if (vfYear === fvYear) {
                            if (vfMonth < fvMonth) return true;
                        }
                        break;
                    case FieldDatetimeFormats.HHMM:
                        if (vfHour < fvHour) return true;
                        if (vfHour === fvHour) {
                            if (vfMinute < fvMinute) return true;
                        }
                        break;
                    case FieldDatetimeFormats.YYYY:
                        if (vfYear < fvYear) return true;
                        break;
                    case FieldDatetimeFormats.MM:
                        if (vfMonth < fvMonth) return true;
                        break;
                }
                break;
            case FilterConditions.EqualTo:
                switch (dateTimeFormat) {
                    case FieldDatetimeFormats.YYYYMMDDHHMM:
                        if (
                            vfYear === fvYear &&
                            vfMonth === fvMonth &&
                            vfDay === fvDay &&
                            vfHour === fvHour &&
                            vfMinute === fvMinute
                        )
                            return true;
                        break;
                    case FieldDatetimeFormats.YYYYMMDD:
                        if (vfYear === fvYear && vfMonth === fvMonth && vfDay === fvDay) return true;
                        break;
                    case FieldDatetimeFormats.YYYYMM:
                        if (vfYear === fvYear && vfMonth === fvMonth) return true;
                        break;
                    case FieldDatetimeFormats.HHMM:
                        if (vfHour === fvHour && vfMinute === fvMinute) return true;
                        break;
                    case FieldDatetimeFormats.YYYY:
                        if (vfYear === fvYear) return true;
                        break;
                    case FieldDatetimeFormats.MM:
                        if (vfMonth === fvMonth) return true;
                        break;
                }
                break;
            default:
                if (ctx.isErrorsSilenced()) return false;
                throw new MetadataModelError(`Unsupported filter condition '${filterCondition}'`);
        }
    }

    return false;
}
