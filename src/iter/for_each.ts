import { core } from '@rogonion/js-json';
import { FieldGroupProperties } from '@core';

/**
 * Callback for the ForEach function, called for each field in a metadata model.
 *
 * @param fieldGroup - The current Field/Group property being processed.
 *
 * @returns A tuple where:
 *  1. `true` to signal the loop should be terminated for the current group and its children.
 *  2. `true` to skip processing the `fieldGroup`'s own fields if it is a group.
 */
export type ForEachCallback = (fieldGroup: core.JsonObject) => [terminate: boolean, skipChildProcessing: boolean];

/**
 * Recursively loops through fields in a metadata model.
 *
 * @param group - The metadata model (or a sub-group) to iterate over. Should be a `JsonObject`.
 * @param callback - The function to call for each field in the metadata model.
 */
export function ForEach(group: any, callback: ForEachCallback): void {
    if (typeof group !== 'object' || group === null || Array.isArray(group)) {
        return;
    }

    const fieldGroupProp = group as core.JsonObject;

    const groupFieldsCollection = fieldGroupProp[FieldGroupProperties.GroupFields] as core.JsonArray | undefined;
    if (!Array.isArray(groupFieldsCollection) || groupFieldsCollection.length === 0) {
        return;
    }

    const groupFields = groupFieldsCollection[0] as core.JsonObject | undefined;
    if (typeof groupFields !== 'object' || groupFields === null) {
        return;
    }

    const groupReadOrderOfFields = fieldGroupProp[FieldGroupProperties.GroupReadOrderOfFields] as string[] | undefined;
    if (!Array.isArray(groupReadOrderOfFields)) {
        return;
    }

    for (const fgKeySuffix of groupReadOrderOfFields) {
        const fgProperty = groupFields[fgKeySuffix] as core.JsonObject | undefined;
        if (typeof fgProperty !== 'object' || fgProperty === null) {
            return;
        }

        const [terminateLoop, skipFieldGroupPropertyFields] = callback(fgProperty);
        if (terminateLoop) {
            return;
        }

        if (FieldGroupProperties.GroupFields in fgProperty && !skipFieldGroupPropertyFields) {
            ForEach(fgProperty, callback);
        }
    }
}
