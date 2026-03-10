import { core } from '@rogonion/js-json';
import { FieldGroupProperties } from '@core';

/**
 * Callback for the Map function, called for each field in a metadata model.
 * Use to modify fields/group.
 *
 * @param fieldGroup - The current Field/Group property being processed.
 *
 * @returns A tuple where:
 *  1. The first element is the `fieldGroup`, modified or not.
 *  2. The second element is a boolean: `true` to skip processing the `fieldGroup`'s own fields if it is a group.
 */
export type MapCallback = (fieldGroup: core.JsonObject) => [modifiedFieldGroup: any, skipChildProcessing: boolean];

/**
 * Recursively modifies fields in a MetadataModel.
 * This function mutates the input group object.
 *
 * @param group - A metadata model (or a sub-group). Should be of type `core.JsonObject`.
 * @param callback - Called for each field in a metadata model.
 * @returns The modified group.
 */
export function Map(group: any, callback: MapCallback): any {
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

    const groupReadOrderOfFields = fieldGroupProp[FieldGroupProperties.GroupReadOrderOfFields] as string[] | undefined;
    if (!Array.isArray(groupReadOrderOfFields)) {
        return group;
    }

    for (const fgKeySuffix of groupReadOrderOfFields) {
        const fgProperty = groupFields[fgKeySuffix] as core.JsonObject;
        if (typeof fgProperty !== 'object' || fgProperty === null) {
            return group;
        }

        const [modifiedFieldGroup, skipFieldGroupPropertyFields] = callback(fgProperty);
        groupFields[fgKeySuffix] = modifiedFieldGroup;

        if (FieldGroupProperties.GroupFields in fgProperty && !skipFieldGroupPropertyFields) {
            groupFields[fgKeySuffix] = Map(fgProperty, callback);
        }
    }

    return fieldGroupProp;
}
