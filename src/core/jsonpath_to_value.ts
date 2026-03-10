import { path, core } from '@rogonion/js-json';
import { ArrayPathPlaceholder, ArrayPathRegex, CoreErrorCodes, GroupFieldsRegex } from './core';
import { FieldGroupProperties } from './field_group_properties';

/**
 * Retrieves the actual path.JSONPath to target value in a source object.
 *
 * It can do the following:
 *  - Remove GroupFields from path.JSONPath.
 *  - Replace ArrayPathPlaceholder with actual array index.
 *
 * @example
 * ```
 * // Instantiate the JsonPathToValue
 * const converter = new JsonPathToValue();
 * // Retrieve path.JSONPath
 * const finalPath = converter.get('$.GroupFields[*].name',); // returns '$.name'
 * ```
 */
export class JsonPathToValue {
    /**
     * Remove GroupFields from path.JSONPath.
     */
    private _removeGroupFields: boolean = false;

    /**
     * If source of value is NOT an array or slice, the first pair of GroupJsonPathPrefix is removed as the source is assumed to be an associative collection.
     */
    private _sourceOfValueIsAnArray: boolean = false;

    /**
     * Replace ArrayPathPlaceholder wildcard with an actual array index.
     */
    private _replaceArrayPathPlaceholderWithActualIndexes: boolean = false;

    /**
     * Creates an instance of JsonPathToValue.
     *
     * By default:
     * - `replaceArrayPathPlaceholderWithActualIndexes` is `true`.
     * - `removeGroupFields` is `true`.
     */
    constructor() {
        this._replaceArrayPathPlaceholderWithActualIndexes = true;
        this._removeGroupFields = true;
    }

    /**
     * Remove GroupFields from path.JSONPath.
     */
    public get RemoveGroupFields(): boolean {
        return this._removeGroupFields;
    }
    public set RemoveGroupFields(value: boolean) {
        this._removeGroupFields = value;
    }

    /**
     * If source of value is NOT an array or slice, the first pair of GroupJsonPathPrefix is removed as the source is assumed to be an associative collection.
     */
    public get SourceOfValueIsAnArray(): boolean {
        return this._sourceOfValueIsAnArray;
    }
    public set SourceOfValueIsAnArray(value: boolean) {
        this._sourceOfValueIsAnArray = value;
    }

    /**
     * Replace ArrayPathPlaceholder wildcard with an actual array index.
     */
    public get ReplaceArrayPathPlaceholderWithActualIndexes(): boolean {
        return this._replaceArrayPathPlaceholderWithActualIndexes;
    }
    public set ReplaceArrayPathPlaceholderWithActualIndexes(value: boolean) {
        this._replaceArrayPathPlaceholderWithActualIndexes = value;
    }

    /**
     * Constructs the final JSONPath.
     * @param jsonPathKey - From property `FieldGroupJsonPathKey` in metadata model field/group.
     * @param arrayIndexes - Set of actual indexes of arrays or slice to replace `ArrayPathPlaceholder` in `path.JSONPath` in order. If empty, it will default to `0` for each placeholder.
     * @returns The processed JSONPath.
     * @throws {core.JsonError} if path still contains placeholders after processing.
     */
    public Get(jsonPathKey: path.JSONPath, arrayIndexes: number[] = []): path.JSONPath {
        let jsonPathKeyStr = jsonPathKey;

        if (this._removeGroupFields) {
            const replacement = this._sourceOfValueIsAnArray
                ? path.JsonpathDotNotation + FieldGroupProperties.GroupFields
                : path.JsonpathDotNotation + FieldGroupProperties.GroupFields + ArrayPathPlaceholder;
            jsonPathKeyStr = jsonPathKeyStr.replace(replacement, '');
            jsonPathKeyStr = jsonPathKeyStr.replace(new RegExp(GroupFieldsRegex.source, 'g'), '');
        }

        if (this._replaceArrayPathPlaceholderWithActualIndexes || arrayIndexes.length > 0) {
            const placeholdersCount = (jsonPathKeyStr.match(new RegExp(ArrayPathRegex.source, 'g')) || []).length;
            const indexes = arrayIndexes.length > 0 ? arrayIndexes : new Array(placeholdersCount).fill(0);

            for (const index of indexes) {
                jsonPathKeyStr = jsonPathKeyStr.replace(
                    ArrayPathPlaceholder,
                    `${path.JsonpathLeftBracket}${index}${path.JsonpathRightBracket}`
                );
            }

            if (jsonPathKeyStr.includes(ArrayPathPlaceholder)) {
                throw new core.JsonError(CoreErrorCodes.SchemaPathError, undefined, 'JsonPathToValue.get');
            }
        }

        return jsonPathKeyStr;
    }
}
