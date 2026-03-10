import { MetadataModelError } from '@core';
import { core, path } from '@rogonion/js-json';
import { FilterConditionProps, FilterConditions, type FilterContext } from './core';

/**
 * Checks if a text condition is met.
 * @param ctx
 * @param _fieldGroupJsonPathKey
 * @param filterCondition
 * @param valueFound
 * @param filterValue
 * @returns
 */
export function isTextConditionTrue(
    ctx: FilterContext,
    _fieldGroupJsonPathKey: path.JSONPath,
    filterCondition: string,
    valueFound: any,
    filterValue: core.JsonObject
): boolean {
    if (valueFound === undefined || valueFound === null || typeof valueFound !== 'string') {
        return false;
    }

    let caseInsensitive = false;
    if (
        FilterConditionProps.CaseInsensitive in filterValue &&
        typeof filterValue[FilterConditionProps.CaseInsensitive] === 'boolean'
    ) {
        caseInsensitive = filterValue[FilterConditionProps.CaseInsensitive] as boolean;
    }

    const valueToCompare: string[] = [];

    if (FilterConditionProps.Value in filterValue) {
        const val = filterValue[FilterConditionProps.Value];
        if (typeof val === 'string') {
            valueToCompare.push(caseInsensitive ? val.toLowerCase() : val);
        } else {
            if (ctx.isErrorsSilenced()) {
                return false;
            }
            throw new MetadataModelError(`filter condition property '${FilterConditionProps.Value}' is not a string`);
        }
    } else if (FilterConditionProps.Values in filterValue) {
        const vals = filterValue[FilterConditionProps.Values];
        if (Array.isArray(vals)) {
            for (const v of vals) {
                if (typeof v === 'string') {
                    valueToCompare.push(caseInsensitive ? v.toLowerCase() : v);
                } else {
                    if (ctx.isErrorsSilenced()) {
                        return false;
                    }
                    throw new MetadataModelError(
                        `an element in filter condition property '${FilterConditionProps.Values}' is not a string`
                    );
                }
            }
        } else {
            if (ctx.isErrorsSilenced()) {
                return false;
            }
            throw new MetadataModelError(`filter condition property '${FilterConditionProps.Values}' is not an array`);
        }
    } else {
        if (ctx.isErrorsSilenced()) {
            return false;
        }
        throw new MetadataModelError(`filter condition property '${FilterConditionProps.Value}' not found`);
    }

    const valueFoundString = caseInsensitive ? (valueFound as string).toLowerCase() : (valueFound as string);

    for (const value of valueToCompare) {
        switch (filterCondition) {
            case FilterConditions.EqualTo:
                if (valueFoundString === value) return true;
                break;
            case FilterConditions.BeginsWith:
                if (valueFoundString.startsWith(value)) return true;
                break;
            case FilterConditions.EndsWith:
                if (valueFoundString.endsWith(value)) return true;
                break;
            case FilterConditions.Contains:
                if (valueFoundString.includes(value)) return true;
                break;
            default:
                if (ctx.isErrorsSilenced()) return false;
                throw new MetadataModelError(`Unsupported filter condition '${filterCondition}'`);
        }
    }

    return false;
}
