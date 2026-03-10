import type { core, path } from '@rogonion/js-json';
import { CoreErrorCodes, type MetadataModelGroupReadOrderOfFields } from './core';
import { FieldGroupProperties } from './field_group_properties';

/**
 * Converts the input to a JsonObject.
 * @param v The value to convert.
 * @returns A JsonObject.
 * @throws If the value is not a valid object.
 */
export function AsJsonObject(v: any): core.JsonObject {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        return v as core.JsonObject;
    }
    throw new Error(CoreErrorCodes.ArgumentInvalid);
}

/**
 * Converts the input to a JsonArray.
 * @param v The value to convert.
 * @returns A JsonArray.
 * @throws If the value is not an array.
 */
export function AsJsonArray(v: any): core.JsonArray {
    if (Array.isArray(v)) {
        return v as core.JsonArray;
    }
    throw new Error(CoreErrorCodes.ArgumentInvalid);
}

/**
 * Converts the input to a JSONPath string.
 * @param v The value to convert.
 * @returns A JSONPath string.
 * @throws If the value is not a string.
 */
export function AsJSONPath(v: any): path.JSONPath {
    if (typeof v === 'string') {
        return v as path.JSONPath;
    }
    throw new Error(CoreErrorCodes.ArgumentInvalid);
}

/**
 * Converts the input to MetadataModelGroupReadOrderOfFields.
 * @param v The value to convert.
 * @returns The read order of fields.
 * @throws If the value is not a valid array of strings.
 */
export function AsGroupReadOrderOfFields(v: any): MetadataModelGroupReadOrderOfFields {
    if (Array.isArray(v)) {
        const res: MetadataModelGroupReadOrderOfFields = [];
        for (const item of v) {
            if (typeof item === 'string') {
                res.push(item);
            } else {
                throw new Error(`gReadOrderOfField is not string: ${CoreErrorCodes.ArgumentInvalid}`);
            }
        }
        return res;
    }
    throw new Error(CoreErrorCodes.ArgumentInvalid);
}

/**
 * Retrieves the group read order of fields.
 * @param fg The field group.
 * @returns The read order of fields.
 * @throws If the field group is invalid or doesn't contain the property.
 */
export function GetGroupReadOrderOfFields(fg: any): MetadataModelGroupReadOrderOfFields {
    const fgProperty = AsJsonObject(fg);
    if (fgProperty && FieldGroupProperties.GroupReadOrderOfFields in fgProperty) {
        return AsGroupReadOrderOfFields(fgProperty[FieldGroupProperties.GroupReadOrderOfFields]);
    }
    throw new Error(CoreErrorCodes.ArgumentInvalid);
}

/**
 * Retrieves the group fields.
 * @param fg The field group.
 * @returns The fields of the group.
 * @throws If the field group is invalid.
 */
export function GetGroupFields(fg: any): core.JsonObject {
    let fgProperty: core.JsonObject;
    try {
        fgProperty = AsJsonObject(fg);
    } catch (e) {
        throw new Error(`fg: ${(e as Error).message}`);
    }

    if (!(FieldGroupProperties.GroupFields in fgProperty)) {
        throw new Error(`gFields: property not found`);
    }

    let gFields: core.JsonArray;
    try {
        gFields = AsJsonArray(fgProperty[FieldGroupProperties.GroupFields]);
    } catch (e) {
        throw new Error(`gFields: ${(e as Error).message}`);
    }

    if (gFields.length === 0) {
        throw new Error('gFields is empty');
    }

    try {
        return AsJsonObject(gFields[0]);
    } catch (e) {
        throw new Error(`gFields[0]: ${(e as Error).message}`);
    }
}

/**
 * Checks if the input is a group (has GroupReadOrderOfFields and GroupFields).
 * @param f The object to check.
 * @returns True if it is a field group.
 */
export function IsFieldAGroup(f: any): boolean {
    try {
        GetGroupReadOrderOfFields(f);
        GetGroupFields(f);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Merges the right JsonObject into the left JsonObject.
 * @param left The destination object.
 * @param right The source object.
 */
export function MergeRightJsonObjectIntoLeft(left: core.JsonObject, right: core.JsonObject): void {
    if (left) {
        Object.assign(left, right);
    }
}

/**
 * Checks if the field group contains nested group fields.
 * @param fg The field group to check.
 * @returns True if it contains nested groups.
 */
export function DoesFieldGroupFieldsContainNestedGroupFields(fg: any): boolean {
    try {
        const groupFields = GetGroupFields(fg);
        const groupReadOrderOfFields = GetGroupReadOrderOfFields(fg);
        for (const fgJsonPathKeySuffix of groupReadOrderOfFields) {
            try {
                GetGroupReadOrderOfFields(groupFields[fgJsonPathKeySuffix]);
                return true;
            } catch (e) {
                // Not a group, continue
            }
        }
    } catch (e) {
        // Not a group or invalid structure
    }
    return false;
}

/**
 * Retrieves the maximum no of columns/sets of columns that can be used to represent a field/group in a flat 2D table.
 *
 * The value will only be extracted if fg is valid and if it contains GroupFields then each of them does not contain nested GroupFields.
 *
 * @returns The maximum number. If value is less than 0, it means the field/group cannot be represented.
 * @throws Error if fg and its properties are not valid structure-wise.
 */
export function GetMaximumFlatNoOfColumns(fg: any): number {
    let fgViewMaxNoOfValuesInSeparateColumns = -1;
    try {
        const fgProperty = AsJsonObject(fg);
        if (fgProperty[FieldGroupProperties.ViewValuesInSeparateColumns] === true) {
            try {
                const fgFields = GetGroupFields(fg);
                for (const key in fgFields) {
                    if (Object.prototype.hasOwnProperty.call(fgFields, key)) {
                        if (IsFieldAGroup(fgFields[key])) {
                            return -1;
                        }
                    }
                }
            } catch (e) {
                // It's ok if it doesn't have group fields.
            }

            const v = fgProperty[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns];
            if (v !== undefined) {
                const num = Number(v);
                if (!isNaN(num)) {
                    fgViewMaxNoOfValuesInSeparateColumns = Math.trunc(num);
                } else {
                    throw new Error('Could not convert ViewMaxNoOfValuesInSeparateColumns to number');
                }
            }
        }
    } catch (e) {
        if (e instanceof Error) {
            throw e;
        }
        throw new Error(String(e));
    }

    return fgViewMaxNoOfValuesInSeparateColumns;
}

/**
 * Checks if the key suffix matches any of the values.
 * @param keyToCheck The string to check.
 * @param valuesToMatch The suffixes to match against.
 * @returns True if a match is found.
 */
export function IfKeySuffixMatchesValues(keyToCheck: string, valuesToMatch: string[]): boolean {
    return valuesToMatch.some((value) => keyToCheck.endsWith(value));
}

/**
 * Checks if the input is a field (has FieldDataType and FieldUI).
 * @param f The object to check.
 * @returns True if it is a field.
 */
export function IsFieldAField(f: any): boolean {
    try {
        const field = AsJsonObject(f);
        return (
            typeof field[FieldGroupProperties.FieldDataType] === 'string' &&
            typeof field[FieldGroupProperties.FieldUI] === 'string'
        );
    } catch (e) {
        // Not a valid object.
    }
    return false;
}

/**
 * Retrieves the field group name.
 * @param fg The field group.
 * @param defaultValue A default value to return if no name is found.
 * @returns The name of the field group.
 */
export function GetFieldGroupName(fg: any, defaultValue: string): string {
    try {
        const fieldGroup = AsJsonObject(fg);
        const fieldGroupName = fieldGroup[FieldGroupProperties.Name];
        if (typeof fieldGroupName === 'string' && fieldGroupName.length > 0) {
            return fieldGroupName;
        }

        const fieldGroupKey = fieldGroup[FieldGroupProperties.JsonPathKey];
        if (typeof fieldGroupKey === 'string' && fieldGroupKey.length > 0) {
            const fieldGroupKeyParts = fieldGroupKey.split('.');
            if (fieldGroupKeyParts.length > 0) {
                return fieldGroupKeyParts[fieldGroupKeyParts.length - 1];
            }
        }
    } catch (e) {
        // ignore and fall through to default
    }

    return defaultValue && defaultValue.length > 0 ? defaultValue : '#unnamed';
}

/**
 * Retrieves the suffix of the field group JSON path key.
 * @param fg The field group.
 * @returns The suffix of the JSON path key.
 */
export function GetFieldGroupJsonPathKeySuffix(fg: any): string {
    try {
        const fieldGroup = AsJsonObject(fg);
        const fieldGroupKey = AsJSONPath(fieldGroup[FieldGroupProperties.JsonPathKey]);
        const parts = fieldGroupKey.split('.');
        if (parts.length > 0) {
            return parts[parts.length - 1];
        }
    } catch (e) {
        // ignore
    }
    return '';
}
