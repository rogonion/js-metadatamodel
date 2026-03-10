import { MetadataModelError } from '@core';
import { core, path, schema } from '@rogonion/js-json';
import { FilterConditionProps, FilterConditions, type FilterContext } from './core';

/**
 * Checks if a number condition is met.
 * @param ctx
 * @param _fieldGroupJsonPathKey
 * @param filterCondition
 * @param valueFound
 * @param filterValue
 * @returns
 */
export function isNumberConditionTrue(
    ctx: FilterContext,
    _fieldGroupJsonPathKey: path.JSONPath,
    filterCondition: string,
    valueFound: any,
    filterValue: core.JsonObject
): boolean {
    if (valueFound === undefined || valueFound === null) {
        return false;
    }

    const valueToCompare: number[] = [];
    const conversion = new schema.Conversion();
    const numberSchema = new schema.DynamicSchemaNode({ Kind: schema.DataKind.Number });

    if (FilterConditionProps.Value in filterValue) {
        const val = filterValue[FilterConditionProps.Value];
        if (core.IsNumber(val)) {
            valueToCompare.push(val);
        } else {
            try {
                const converted = conversion.Convert(val, numberSchema);
                valueToCompare.push(converted as number);
            } catch (err) {
                if (ctx.isErrorsSilenced()) {
                    return false;
                }
                throw new MetadataModelError(
                    `convert filterConditionValue to number failed: ${err instanceof Error ? err.message : String(err)}`
                );
            }
        }
    } else if (FilterConditionProps.Values in filterValue) {
        const vals = filterValue[FilterConditionProps.Values];
        if (Array.isArray(vals)) {
            for (const v of vals) {
                if (core.IsNumber(v)) {
                    valueToCompare.push(v);
                } else {
                    try {
                        const converted = conversion.Convert(v, numberSchema);
                        valueToCompare.push(converted as number);
                    } catch (err) {
                        if (ctx.isErrorsSilenced()) {
                            return false;
                        }
                        throw new MetadataModelError(
                            `convert filterConditionValue element to number failed: ${
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

    let valueFoundFloat: number;
    if (core.IsNumber(valueFound)) {
        valueFoundFloat = valueFound;
    } else {
        try {
            valueFoundFloat = conversion.Convert(valueFound, numberSchema) as number;
        } catch {
            return false;
        }
    }

    for (const value of valueToCompare) {
        switch (filterCondition) {
            case FilterConditions.EqualTo:
                if (valueFoundFloat === value) {
                    return true;
                }
                break;
            case FilterConditions.GreaterThan:
                if (valueFoundFloat > value) {
                    return true;
                }
                break;
            case FilterConditions.LessThan:
                if (valueFoundFloat < value) {
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
