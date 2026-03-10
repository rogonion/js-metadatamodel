import { FieldTypes, MetadataModelError } from '@core';
import { core, jsobject, path, schema } from '@rogonion/js-json';
import { FilterConditionProps, FilterConditions, type FilterContext, QueryConditionProps } from './core';
import { isNumberConditionTrue } from './filter_number';
import { isTextConditionTrue } from './filter_text';
import { isTimestampConditionTrue } from './filter_timestamp';

/**
 * dispatches the condition check to the appropriate type-specific function.
 * @param ctx
 * @param fieldGroupJsonPathKey
 * @param filterCondition
 * @param valueFound
 * @param filterValue
 * @returns
 */
export function isConditionTrue(
    ctx: FilterContext,
    fieldGroupJsonPathKey: path.JSONPath,
    filterCondition: string,
    valueFound: any,
    filterValue: core.JsonObject
): boolean {
    switch (filterCondition) {
        case FilterConditions.NoOfEntriesGreaterThan:
        case FilterConditions.NoOfEntriesLessThan:
        case FilterConditions.NoOfEntriesEqualTo:
            return isNumberOfEntriesConditionTrue(ctx, fieldGroupJsonPathKey, filterCondition, valueFound, filterValue);
        default: {
            let assumedFieldType: string;
            if (
                FilterConditionProps.AssumedFieldType in filterValue &&
                typeof filterValue[FilterConditionProps.AssumedFieldType] === 'string'
            ) {
                assumedFieldType = filterValue[FilterConditionProps.AssumedFieldType] as string;
            } else {
                if (ctx.isErrorsSilenced()) {
                    return false;
                }
                if (!(FilterConditionProps.AssumedFieldType in filterValue)) {
                    throw new MetadataModelError(
                        `filter condition property '${FilterConditionProps.AssumedFieldType}' not found`
                    );
                }
                throw new MetadataModelError(
                    `filter condition property '${FilterConditionProps.AssumedFieldType}' is not a string`
                );
            }

            if (Array.isArray(valueFound)) {
                for (const vFound of valueFound) {
                    let conditionTrue = false;
                    try {
                        switch (assumedFieldType) {
                            case FieldTypes.Text:
                                conditionTrue = isTextConditionTrue(
                                    ctx,
                                    fieldGroupJsonPathKey,
                                    filterCondition,
                                    vFound,
                                    filterValue
                                );
                                break;
                            case FieldTypes.Number:
                                conditionTrue = isNumberConditionTrue(
                                    ctx,
                                    fieldGroupJsonPathKey,
                                    filterCondition,
                                    vFound,
                                    filterValue
                                );
                                break;
                            case FieldTypes.Timestamp:
                                conditionTrue = isTimestampConditionTrue(
                                    ctx,
                                    fieldGroupJsonPathKey,
                                    filterCondition,
                                    vFound,
                                    filterValue
                                );
                                break;
                            default:
                                conditionTrue = isDefaultEqualTrue(
                                    ctx,
                                    fieldGroupJsonPathKey,
                                    filterCondition,
                                    vFound,
                                    filterValue
                                );
                        }
                    } catch (err) {
                        if (ctx.isErrorsSilenced()) {
                            return false;
                        }
                        throw err;
                    }

                    if (conditionTrue) {
                        return true;
                    }
                }
                return false;
            } else {
                switch (assumedFieldType) {
                    case FieldTypes.Text:
                        return isTextConditionTrue(
                            ctx,
                            fieldGroupJsonPathKey,
                            filterCondition,
                            valueFound,
                            filterValue
                        );
                    case FieldTypes.Number:
                        return isNumberConditionTrue(
                            ctx,
                            fieldGroupJsonPathKey,
                            filterCondition,
                            valueFound,
                            filterValue
                        );
                    case FieldTypes.Timestamp:
                        return isTimestampConditionTrue(
                            ctx,
                            fieldGroupJsonPathKey,
                            filterCondition,
                            valueFound,
                            filterValue
                        );
                    default:
                        return isDefaultEqualTrue(ctx, fieldGroupJsonPathKey, filterCondition, valueFound, filterValue);
                }
            }
        }
    }
}

/**
 * checks conditions related to the number of entries in a collection.
 * @param ctx
 * @param _fieldGroupJsonPathKey
 * @param filterCondition
 * @param valueFound
 * @param filterValue
 * @returns
 */
export function isNumberOfEntriesConditionTrue(
    ctx: FilterContext,
    _fieldGroupJsonPathKey: path.JSONPath,
    filterCondition: string,
    valueFound: any,
    filterValue: core.JsonObject
): boolean {
    if (valueFound === undefined || valueFound === null) {
        return false;
    }

    if (!Array.isArray(valueFound)) {
        return false;
    }
    const valueFoundLen = valueFound.length;

    const valueToCompare: number[] = [];
    const conversion = new schema.Conversion();
    const intSchema = new schema.DynamicSchemaNode({ Kind: schema.DataKind.Number });

    if (FilterConditionProps.Value in filterValue) {
        const val = filterValue[FilterConditionProps.Value];
        if (typeof val === 'number') {
            valueToCompare.push(val);
        } else {
            try {
                const converted = conversion.Convert(val, intSchema);
                valueToCompare.push(converted as number);
            } catch (err) {
                if (ctx.isErrorsSilenced()) {
                    return false;
                }
                throw new MetadataModelError(
                    `convert filterConditionValue to int failed: ${err instanceof Error ? err.message : String(err)}`
                );
            }
        }
    } else if (FilterConditionProps.Values in filterValue) {
        const vals = filterValue[FilterConditionProps.Values];
        if (Array.isArray(vals)) {
            for (const v of vals) {
                if (typeof v === 'number') {
                    valueToCompare.push(v);
                } else {
                    try {
                        const converted = conversion.Convert(v, intSchema);
                        valueToCompare.push(converted as number);
                    } catch (err) {
                        if (ctx.isErrorsSilenced()) {
                            return false;
                        }
                        throw new MetadataModelError(
                            `convert filterConditionValue element to int failed: ${
                                err instanceof Error ? err.message : String(err)
                            }`
                        );
                    }
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

    for (const value of valueToCompare) {
        switch (filterCondition) {
            case FilterConditions.NoOfEntriesEqualTo:
                if (value === valueFoundLen) {
                    return true;
                }
                break;
            case FilterConditions.NoOfEntriesGreaterThan:
                if (valueFoundLen > value) {
                    return true;
                }
                break;
            case FilterConditions.NoOfEntriesLessThan:
                if (valueFoundLen < value) {
                    return true;
                }
                break;
            default:
                if (ctx.isErrorsSilenced()) {
                    return false;
                }
                throw new MetadataModelError(`Unsupported filter condition '${filterCondition}'`);
        }
    }
    return false;
}

/**
 * Checks for equality using {@link jsobject.AreEqual}.
 * @param ctx
 * @param _fieldGroupJsonPathKey
 * @param filterCondition
 * @param valueFound
 * @param filterValue
 * @returns
 */
export function isDefaultEqualTrue(
    ctx: FilterContext,
    _fieldGroupJsonPathKey: path.JSONPath,
    filterCondition: string,
    valueFound: any,
    filterValue: core.JsonObject
): boolean {
    if (valueFound === undefined || valueFound === null) {
        return false;
    }

    let valueToCompare: any[] = [];
    if (QueryConditionProps.Value in filterValue) {
        valueToCompare.push(filterValue[QueryConditionProps.Value]);
    } else if (FilterConditionProps.Values in filterValue) {
        const vals = filterValue[FilterConditionProps.Values];
        if (Array.isArray(vals)) {
            valueToCompare = vals;
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
        throw new MetadataModelError(
            `filter condition property '${FilterConditionProps.Value}' or '${FilterConditionProps.Values}' not found`
        );
    }

    switch (filterCondition) {
        case FilterConditions.EqualTo:
            for (const value of valueToCompare) {
                if (new jsobject.AreEqual().AreEqual(value, valueFound)) {
                    return true;
                }
            }
            return false;
        default:
            if (ctx.isErrorsSilenced()) {
                return false;
            }
            throw new MetadataModelError(`Unsupported filter condition '${filterCondition}'`);
    }
}
