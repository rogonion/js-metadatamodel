import { core } from '@rogonion/js-json';
import { FieldGroupProperties } from '@core';

/**
 * Callback for the Filter function, called for each field in a metadata model.
 *
 * @param fieldGroup - The current Field/Group property being processed.
 * @returns A tuple where:
 *  - The first element is a boolean: `false` to signal the fieldGroup should be removed.
 *  - The second element is a boolean: `true` to skip processing the fields of this fieldGroup (if it's a group).
 */
export type FilterCallback = (fieldGroup: core.JsonObject) => [retain: boolean, skipChildProcessing: boolean];

/**
 * Recursively removes fields in a MetadataModel based on a callback function.
 * This function mutates the input group object.
 *
 * @param group - The metadata model (or a sub-group) to filter. Should be a JsonObject.
 * @param callback - The function to call for each field/group to determine if it should be kept.
 * @returns The filtered group.
 */
export function Filter(group: any, callback: FilterCallback): any {
    if (typeof group !== 'object' || group === null || Array.isArray(group)) {
        return group;
    }

    const fieldGroupProp = group as core.JsonObject;

    const groupFieldsCollection = fieldGroupProp[FieldGroupProperties.GroupFields] as core.JsonArray | undefined;
    if (!Array.isArray(groupFieldsCollection) || groupFieldsCollection.length === 0) {
        return group;
    }

    const groupFields = groupFieldsCollection[0] as core.JsonObject | undefined;
    if (typeof groupFields !== 'object' || groupFields === null) {
        return group;
    }

    const groupReadOrderOfFields = fieldGroupProp[FieldGroupProperties.GroupReadOrderOfFields] as
        | (string | null)[]
        | undefined;
    if (!Array.isArray(groupReadOrderOfFields)) {
        return group;
    }

    for (let i = 0; i < groupReadOrderOfFields.length; i++) {
        const fgKeySuffix = groupReadOrderOfFields[i];
        if (!fgKeySuffix) continue;

        const fgProperty = groupFields[fgKeySuffix] as core.JsonObject | undefined;
        if (typeof fgProperty !== 'object' || fgProperty === null) {
            return group;
        }

        const [retainFieldGroup, skipFieldGroupPropertyFields] = callback(fgProperty);

        if (!retainFieldGroup) {
            groupReadOrderOfFields[i] = null; // Mark for removal
            delete groupFields[fgKeySuffix];
        } else if (FieldGroupProperties.GroupFields in fgProperty && !skipFieldGroupPropertyFields) {
            groupFields[fgKeySuffix] = Filter(fgProperty, callback);
        }
    }

    fieldGroupProp[FieldGroupProperties.GroupReadOrderOfFields] = groupReadOrderOfFields.filter(
        (field) => field !== null
    );

    return fieldGroupProp;
}
