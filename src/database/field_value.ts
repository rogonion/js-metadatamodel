import { jsobject, core, path } from '@rogonion/js-json';
import { JsonPathToValue, MetadataModelError, FieldGroupProperties, AsJSONPath } from '@core';
import { DatabaseErrorCodes } from './core';
import type { ColumnFields } from './get_column_fields';

export class FieldValue {
    /**
     * Use to get, set, and delete values in source.
     */
    // @ts-expect-error TS2564
    private _SourceData: jsobject.JSObject;
    public set SourceData(value: jsobject.JSObject | any) {
        if (value instanceof jsobject.JSObject) {
            this._SourceData = value;
            this._ObjectSourceIsAnArray = core.IsArray(value.Source);
        } else {
            this._SourceData = Object.assign(new jsobject.JSObject(), { Source: value });
            this._ObjectSourceIsAnArray = core.IsArray(value);
        }
    }

    /**
     * To be set when {@link FieldValue.SourceData} is called.
     */
    private _ObjectSourceIsAnArray: boolean = false;
    public set ObjectSoruceIsAnArray(value: boolean) {
        this._ObjectSourceIsAnArray = value;
    }

    /**
     * Extracted database fields. Refer to {@link GetColumnFields}.
     */
    // @ts-expect-error TS2564
    private _ColumnFields: ColumnFields;
    public set ColumnFields(value: ColumnFields) {
        this._ColumnFields = value;
    }

    constructor(sourceData: jsobject.JSObject | any, columnFields?: ColumnFields) {
        this.SourceData = sourceData;
        if (columnFields) this.ColumnFields = columnFields;
    }

    /**
     * Retrieves value(s).
     * @param columnFieldName Required. Will match core.DatabaseFieldColumnName field property.
     * @param suffixJsonPath Additional path.JSONPath segment to append to core.FieldGroupJsonPathKey.
     * @param arrayIndexes Replace core.ArrayPathPlaceholder in path.JSONPath from core.FieldGroupJsonPathKey with a specific set of array indexes.
     * @returns No of results found.
     */
    public Get(columnFieldName: string, suffixJsonPath: path.JSONPath = '', arrayIndexes: number[] = []): number {
        const jsonPathKey = this.getJsonPathToValue(columnFieldName, suffixJsonPath, arrayIndexes);
        return this._SourceData.Get(jsonPathKey);
    }

    /**
     * Returns the value found.
     */
    public GetValueFound(): any {
        return this._SourceData.ValueFound;
    }

    /**
     * Inserts or updates value(s).
     * @param columnFieldName Required. Will match core.DatabaseFieldColumnName field property.
     * @param valueToSet Value to be inserted.
     * @param suffixJsonPath Additional path.JSONPath segment to append to core.FieldGroupJsonPathKey.
     * @param arrayIndexes Replace core.ArrayPathPlaceholder in path.JSONPath from core.FieldGroupJsonPathKey with a specific set of array indexes.
     */
    public Set(
        columnFieldName: string,
        valueToSet: any,
        suffixJsonPath: path.JSONPath = '',
        arrayIndexes: number[] = []
    ): number {
        const jsonPathKey = this.getJsonPathToValue(columnFieldName, suffixJsonPath, arrayIndexes);

        if (core.IsArray(valueToSet)) {
            return this._SourceData.Set(jsonPathKey, valueToSet);
        }
        return this._SourceData.Set(jsonPathKey, [valueToSet]);
    }

    /**
     * Removes value(s).
     * @param columnFieldName Required. Will match core.DatabaseFieldColumnName field property.
     * @param suffixJsonPath Additional path.JSONPath segment to append to core.FieldGroupJsonPathKey. Should NOT begin with path.JsonpathDotNotation.
     * @param arrayIndexes Replace core.ArrayPathPlaceholder in path.JSONPath from core.FieldGroupJsonPathKey with a specific set of array indexes.
     */
    public Delete(columnFieldName: string, suffixJsonPath: path.JSONPath = '', arrayIndexes: number[] = []): number {
        const jsonPathKey = this.getJsonPathToValue(columnFieldName, suffixJsonPath, arrayIndexes);
        return this._SourceData.Delete(jsonPathKey);
    }

    private getJsonPathToValue(
        columnFieldName: string,
        suffixJsonPath: path.JSONPath,
        arrayIndexes: number[]
    ): path.JSONPath {
        if (!columnFieldName || columnFieldName.length === 0) {
            throw new MetadataModelError('column field name is empty', undefined, DatabaseErrorCodes.FieldValueError);
        }

        if (!this._ColumnFields) {
            throw new MetadataModelError('column fields is nil', undefined, DatabaseErrorCodes.FieldValueError);
        }

        const columnField = this._ColumnFields.Fields[columnFieldName];
        if (!columnField) {
            throw new MetadataModelError(
                `Field with ${FieldGroupProperties.DatabaseFieldColumnName} '${columnFieldName}' not found`,
                undefined,
                DatabaseErrorCodes.FieldValueError
            );
        }

        let jsonPathKey: path.JSONPath;
        try {
            jsonPathKey = AsJSONPath(columnField[FieldGroupProperties.JsonPathKey]);
        } catch (e) {
            throw new MetadataModelError('AsJSONPath failed', e as Error, DatabaseErrorCodes.FieldValueError);
        }

        const converter = new JsonPathToValue();
        converter.SourceOfValueIsAnArray = this._ObjectSourceIsAnArray;
        converter.RemoveGroupFields = true;

        let fullPath = jsonPathKey;
        if (suffixJsonPath && suffixJsonPath.length > 0) {
            fullPath += path.JsonpathDotNotation + suffixJsonPath;
        }

        try {
            return converter.Get(fullPath, arrayIndexes);
        } catch (e) {
            throw new MetadataModelError('Get JsonPathToValue failed', e as Error, DatabaseErrorCodes.FieldValueError);
        }
    }
}
