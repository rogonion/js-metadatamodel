import { core, jsobject } from '@rogonion/js-json';

/**
 * A set of {@link core.JsonObject} properties where the key is the property and the value is the value to match.
 *
 * If map value is not of type {@link FieldGroupPropertiesFirstMatcher} or {@link FieldGroupPropertiesMatchingProps}, a deep equality check will be used to check if property matches.
 */
export type FieldGroupPropertiesMatch = { [key: string]: any };

/**
 * Checks if FieldGroupPropertiesMatch is not empty.
 * @param match The match object to check.
 * @returns `true` if map is not empty.
 */
export function isValid(match: FieldGroupPropertiesMatch | undefined): boolean {
    return core.IsPlainObject(match) && Object.keys(match).length > 0;
}

/**
 * For complex property matching logic.
 * Use for simple first match.
 */
export interface FieldGroupPropertiesFirstMatcher {
    /**
     * Return `true` for first property match.
     * @param fieldGroupPropertyValue The value of the property from the field group.
     * @param fieldGroup The entire field group object.
     */
    FirstMatch(fieldGroupPropertyValue: any, fieldGroup: core.JsonObject): boolean;
}

/**
 * Returns true to indicate if property in fieldGroup matches entry in FieldGroupPropertiesMatch.
 *
 * Check if {@link FieldGroupPropertiesMatch} is valid beforehand using {@link isValid}.
 * @param match The match configuration.
 * @param fieldGroup The field group object to check against.
 */
export function firstMatch(match: FieldGroupPropertiesMatch, fieldGroup: core.JsonObject): boolean {
    for (const fieldGroupPropertyKey in match) {
        if (Object.prototype.hasOwnProperty.call(match, fieldGroupPropertyKey)) {
            const valueToMatch = match[fieldGroupPropertyKey];
            const fieldGroupProp = fieldGroup[fieldGroupPropertyKey];

            if (valueToMatch && typeof valueToMatch.FirstMatch === 'function') {
                if ((valueToMatch as FieldGroupPropertiesFirstMatcher).FirstMatch(fieldGroupProp, fieldGroup)) {
                    return true;
                }
            } else {
                if (new jsobject.AreEqual().AreEqual(fieldGroupProp, valueToMatch)) return true;
            }
        }
    }
    return false;
}

/**
 * For complex property matching logic.
 * Use if you want to retrieve the set of props that satisfied the match.
 */
export interface FieldGroupPropertiesMatchingProps {
    /**
     * Return set of properties that match.
     * @param fieldGroupPropertyValue The value of the property from the field group.
     * @param fieldGroup The entire field group object.
     */
    MatchingProps(fieldGroupPropertyValue: any, fieldGroup: core.JsonObject): core.JsonObject;
}

/**
 * Returns the set of properties in fieldGroup that satisfied the match.
 *
 * Check if {@link FieldGroupPropertiesMatch} is valid beforehand using {@link isValid}.
 * @param match The match configuration.
 * @param fieldGroup The field group object to check against.
 */
export function MatchingProps(match: FieldGroupPropertiesMatch, fieldGroup: core.JsonObject): core.JsonObject {
    const matchingPropsResult: core.JsonObject = {};

    for (const fieldGroupPropertyKey in match) {
        if (Object.prototype.hasOwnProperty.call(match, fieldGroupPropertyKey)) {
            const valueToMatch = match[fieldGroupPropertyKey];
            const fieldGroupProp = fieldGroup[fieldGroupPropertyKey];

            if (valueToMatch && typeof valueToMatch.MatchingProps === 'function') {
                const res = (valueToMatch as FieldGroupPropertiesMatchingProps).MatchingProps(
                    fieldGroupProp,
                    fieldGroup
                );
                if (Object.keys(res).length > 0) {
                    Object.assign(matchingPropsResult, res);
                }
            } else {
                if (new jsobject.AreEqual().AreEqual(fieldGroupProp, valueToMatch))
                    matchingPropsResult[fieldGroupPropertyKey] = fieldGroupProp;
            }
        }
    }

    return matchingPropsResult;
}
