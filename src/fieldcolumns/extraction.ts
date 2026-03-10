import { core, schema } from '@rogonion/js-json';
import { ColumnFields, ColumnField } from './column_fields';
import {
    type FieldGroupPropertiesMatch,
    //@ts-expect-error T6133
    type MetadataModelError,
    AsJsonObject,
    GetGroupFields,
    GetGroupReadOrderOfFields,
    AsJSONPath,
    IsFieldAGroup,
    DoesFieldGroupFieldsContainNestedGroupFields,
    GetMaximumFlatNoOfColumns,
    MergeRightJsonObjectIntoLeft,
    FieldGroupProperties,
    ArrayPathRegex,
    GetFieldGroupName,
    JsonPathToValue,
    isValid,
    MatchingProps
} from '@core';
import { FieldColumnPosition } from './core';
import { ExtractFieldColumnPosition } from './utils';

/**
 *
 */
export class Extraction {
    private _metadataModel: core.JsonObject;
    public set MetadataModel(value: core.JsonObject) {
        this._metadataModel = value;
    }

    private _schema: schema.Schema | undefined;
    public set Schema(value: schema.Schema | undefined) {
        this._schema = value;
    }

    private _columnFields: ColumnFields = new ColumnFields();
    public get ColumnFields(): ColumnFields {
        return this._columnFields;
    }

    private _skip: FieldGroupPropertiesMatch | undefined;
    public set Skip(value: FieldGroupPropertiesMatch) {
        this._skip = value;
    }

    private _add: FieldGroupPropertiesMatch | undefined;
    public set Add(value: FieldGroupPropertiesMatch) {
        this._add = value;
    }

    constructor(metadataModel: core.JsonObject) {
        this._metadataModel = metadataModel;
    }

    /**
     * For field with core.FieldGroupViewValuesInSeparateColumns property:
     * 1. Set core.FieldViewValuesInSeparateColumnsHeaderIndex in flat view columns.
     * 2. Add core.FieldViewValuesInSeparateColumnsHeaderIndex to core.FieldGroupName.
     */
    private addFlatColumnContext(field: core.JsonObject, columnIndex: number) {
        field[FieldGroupProperties.FieldViewValuesInSeparateColumnsHeaderIndex] = columnIndex;

        const fgHeaderFormat = field[FieldGroupProperties.FieldViewValuesInSeparateColumnsHeaderFormat] as string;
        if (fgHeaderFormat) {
            field[FieldGroupProperties.Name] = fgHeaderFormat.replace(ArrayPathRegex, `${columnIndex + 1}`);
        } else {
            field[FieldGroupProperties.Name] = `${GetFieldGroupName(field, '')} ${columnIndex + 1}`;
        }
    }

    /**
     * 1. Deep copy field to not affect original field inside metadata model.
     * 2. Append matchingGroupProperties to new field.
     * @param original
     * @param matchingGroupProperties
     * @throws {MetadataModelError}
     */
    private createNewField(original: core.JsonObject, matchingGroupProperties: core.JsonObject): core.JsonObject {
        const newField = structuredClone(original);
        if (matchingGroupProperties) {
            MergeRightJsonObjectIntoLeft(newField, matchingGroupProperties);
        }
        return newField;
    }

    /**
     * Add {@link field} to {@link Extraction._columnFields} at {@link fieldColumnPosition}.
     * @param field
     * @param fieldColumnPosition
     */
    private appendField(field: core.JsonObject, fieldColumnPosition: FieldColumnPosition) {
        const newFieldColumn = new ColumnField();
        newFieldColumn.FieldColumnPosition = fieldColumnPosition;
        newFieldColumn.Property = field;
        newFieldColumn.IndexInOriginalReadOrderOfColumnFields =
            this._columnFields.OriginalReadOrderOfColumnFields.length;
        newFieldColumn.IndexInRepositionedColumnFields = -1;
        newFieldColumn.IndexInUnskippedColumnFields = -1;

        if (this._schema) {
            const jsonPathToValue = new JsonPathToValue().Get(fieldColumnPosition.FieldGroupJsonPathKey);
            if (jsonPathToValue) {
                const fieldSchema = schema.GetSchemaAtPath(jsonPathToValue, this._schema);
                if (fieldSchema) {
                    newFieldColumn.Schema = fieldSchema;
                }
            }
        }

        this._columnFields.Fields[fieldColumnPosition.toString()] = newFieldColumn;
        this._columnFields.OriginalReadOrderOfColumnFields.push(fieldColumnPosition);
        this._columnFields.RepositionedReadOrderOfColumnFields.push(
            newFieldColumn.IndexInOriginalReadOrderOfColumnFields
        );
    }

    /**
     * Set after call to {@link Extraction.appendField} for the same field.
     * @param value
     */
    private setRepositionForFieldColumn(value: FieldColumnPosition) {
        value.SourceIndex = this._columnFields.OriginalReadOrderOfColumnFields.length - 1;
        this._columnFields.RepositionFieldColumns.push(FieldColumnPosition.fromJSON(value));
    }

    /**
     *
     * @param group
     * @param matchingGroupProperties
     * @param nextGroupFieldPosition
     * @throws {MetadataModelError}
     */
    private recursiveExtract(
        group: any,
        matchingGroupProperties: core.JsonObject,
        nextGroupFieldPosition: FieldColumnPosition | undefined
    ) {
        const fieldGroupProp = AsJsonObject(group);

        const groupFields = GetGroupFields(fieldGroupProp);
        if (!groupFields) {
            return;
        }

        const groupReadOrderOfFields = GetGroupReadOrderOfFields(fieldGroupProp);
        if (!groupReadOrderOfFields) {
            return;
        }

        for (const fgKeySuffix of groupReadOrderOfFields) {
            const fgProperty = AsJsonObject(groupFields[fgKeySuffix]);

            let fgMatchingProperties: core.JsonObject = {};
            if (matchingGroupProperties) {
                fgMatchingProperties = structuredClone(matchingGroupProperties);
            }

            if (this._add && isValid(this._add)) {
                const matchingProps = MatchingProps(this._add, fgProperty);
                if (matchingProps && Object.keys(matchingProps).length > 0) {
                    MergeRightJsonObjectIntoLeft(fgMatchingProperties, matchingProps);
                }
            }
            if (this._skip && isValid(this._skip)) {
                const matchingProps = MatchingProps(this._skip, fgProperty);
                if (matchingProps && Object.keys(matchingProps).length > 0) {
                    MergeRightJsonObjectIntoLeft(fgMatchingProperties, matchingProps);
                }
            }

            let nextFieldGroupPosition = ExtractFieldColumnPosition(fgProperty);
            if (!nextFieldGroupPosition) {
                nextFieldGroupPosition = nextGroupFieldPosition;
            }

            const fgJsonPathKey = AsJSONPath(fgProperty[FieldGroupProperties.JsonPathKey]);
            if (!fgJsonPathKey) {
                continue;
            }

            let processAsField = false;

            if (IsFieldAGroup(fgProperty)) {
                const extractAsSingleField = fgProperty[FieldGroupProperties.GroupExtractAsSingleField];
                if (core.IsBoolean(extractAsSingleField) && extractAsSingleField) {
                    processAsField = true;
                } else {
                    if (!DoesFieldGroupFieldsContainNestedGroupFields(fgProperty)) {
                        let fgViewMaxNoOfValuesInSeparateColumns = 0;
                        try {
                            fgViewMaxNoOfValuesInSeparateColumns = GetMaximumFlatNoOfColumns(fgProperty);
                        } catch {}

                        if (fgViewMaxNoOfValuesInSeparateColumns > 0) {
                            const fgGroupFields = GetGroupFields(fgProperty);
                            const fgGroupReadOrderOfFields = GetGroupReadOrderOfFields(fgProperty);
                            if (fgGroupFields && fgGroupReadOrderOfFields) {
                                for (
                                    let columnIndex = 0;
                                    columnIndex < fgViewMaxNoOfValuesInSeparateColumns;
                                    columnIndex++
                                ) {
                                    for (const nFgKeySuffix of fgGroupReadOrderOfFields) {
                                        const value = AsJsonObject(fgGroupFields[nFgKeySuffix]);
                                        const newField = this.createNewField(value, fgMatchingProperties);
                                        this.addFlatColumnContext(newField, columnIndex);
                                        const jsonPathKey = AsJSONPath(newField[FieldGroupProperties.JsonPathKey]);
                                        if (!jsonPathKey) continue;

                                        const fcp = new FieldColumnPosition();
                                        fcp.FieldGroupJsonPathKey = jsonPathKey;
                                        fcp.GroupViewInSeparateColumns = true;
                                        fcp.GroupViewValuesInSeparateColumnsHeaderIndex = columnIndex;
                                        fcp.GroupViewParentJsonPathKey = fgJsonPathKey;
                                        fcp.FieldJsonPathKeySuffix = nFgKeySuffix;

                                        this.appendField(newField, fcp);

                                        if (nextFieldGroupPosition) {
                                            this.setRepositionForFieldColumn(nextFieldGroupPosition);
                                            nextFieldGroupPosition.FieldGroupJsonPathKey = jsonPathKey;
                                            nextFieldGroupPosition.GroupViewInSeparateColumns = true;
                                            nextFieldGroupPosition.GroupViewValuesInSeparateColumnsHeaderIndex =
                                                columnIndex;
                                            nextFieldGroupPosition.GroupViewParentJsonPathKey = fgJsonPathKey;
                                            nextFieldGroupPosition.FieldJsonPathKeySuffix = nFgKeySuffix;
                                            nextFieldGroupPosition.FieldGroupPositionBefore = false;
                                        }
                                    }
                                }
                                continue;
                            }
                        }
                    }

                    this.recursiveExtract(fgProperty, fgMatchingProperties, nextFieldGroupPosition);
                    continue;
                }
            } else {
                processAsField = true;
            }

            if (processAsField) {
                let fgViewMaxNoOfValuesInSeparateColumns = 0;
                try {
                    fgViewMaxNoOfValuesInSeparateColumns = GetMaximumFlatNoOfColumns(fgProperty);
                } catch {}

                if (fgViewMaxNoOfValuesInSeparateColumns > 0) {
                    for (let columnIndex = 0; columnIndex < fgViewMaxNoOfValuesInSeparateColumns; columnIndex++) {
                        const newField = this.createNewField(fgProperty, fgMatchingProperties);
                        this.addFlatColumnContext(newField, columnIndex);

                        const fcp = new FieldColumnPosition();
                        fcp.FieldGroupJsonPathKey = fgJsonPathKey;
                        fcp.FieldViewInSeparateColumns = true;
                        fcp.FieldViewValuesInSeparateColumnsHeaderIndex = columnIndex;

                        this.appendField(newField, fcp);

                        if (nextFieldGroupPosition) {
                            this.setRepositionForFieldColumn(nextFieldGroupPosition);
                            nextFieldGroupPosition.FieldGroupJsonPathKey = fgJsonPathKey;
                            nextFieldGroupPosition.FieldViewInSeparateColumns = true;
                            nextFieldGroupPosition.FieldViewValuesInSeparateColumnsHeaderIndex = columnIndex;
                            nextFieldGroupPosition.FieldGroupPositionBefore = false;
                        }
                    }
                    continue;
                }

                const newField = this.createNewField(fgProperty, fgMatchingProperties);
                const fcp = new FieldColumnPosition();
                fcp.FieldGroupJsonPathKey = fgJsonPathKey;
                this.appendField(newField, fcp);

                if (nextFieldGroupPosition) {
                    this.setRepositionForFieldColumn(nextFieldGroupPosition);
                    nextFieldGroupPosition.FieldGroupJsonPathKey = fgJsonPathKey;
                    nextFieldGroupPosition.FieldViewInSeparateColumns = false;
                    nextFieldGroupPosition.FieldViewValuesInSeparateColumnsHeaderIndex = 0;
                    nextFieldGroupPosition.FieldGroupPositionBefore = false;
                }
            }
        }
    }

    /**
     * Recursively goes through {@link Extraction._metadataModel} in order and populates {@link Extraction._columnFields}.
     * @throws {MetadataModelError}
     */
    public Extract(): ColumnFields {
        this._columnFields = new ColumnFields();
        this.recursiveExtract(this._metadataModel, {}, undefined);
        return this._columnFields;
    }
}
