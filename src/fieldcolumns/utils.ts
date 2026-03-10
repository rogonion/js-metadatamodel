import {
    AsJSONPath,
    GetFieldGroupName,
    GetGroupFields,
    GetGroupReadOrderOfFields,
    IsFieldAGroup,
    MergeRightJsonObjectIntoLeft,
    DoesFieldGroupFieldsContainNestedGroupFields,
    type FieldGroupPropertiesMatch,
    GetMaximumFlatNoOfColumns,
    AsJsonObject,
    MatchingProps,
    JsonPathToValue,
    FieldGroupProperties,
    ArrayPathRegex
} from '@core';
import { path, schema, core } from '@rogonion/js-json';
import { ColumnField, ColumnFields } from './column_fields';
import { FieldColumnPosition } from './core';
import { ForEach } from '@iter';

/**
 * getFieldColumnsFromMetadataModel used to test field extraction.
 */
export function getFieldColumnsFromMetadataModel(
    metadataModel: core.JsonObject,
    sch: schema.Schema,
    matchingProps?: FieldGroupPropertiesMatch
): ColumnFields {
    const columnFields = new ColumnFields();
    let currentFieldIndex = 0;

    ForEach(metadataModel, (fieldGroup: core.JsonObject): [boolean, boolean] => {
        let jsonPathKey: path.JSONPath;
        try {
            jsonPathKey = AsJSONPath(fieldGroup[FieldGroupProperties.JsonPathKey]);
            if (!jsonPathKey) {
                return [false, false];
            }
        } catch (e) {
            return [false, false];
        }

        let processAsField = true;
        if (IsFieldAGroup(fieldGroup)) {
            const groupProcessAsSingleField = fieldGroup[FieldGroupProperties.GroupExtractAsSingleField];
            if (!core.IsBoolean(groupProcessAsSingleField) || !groupProcessAsSingleField) {
                processAsField = false;

                let fgViewMaxNoOfValuesInSeparateColumns = 0;
                try {
                    fgViewMaxNoOfValuesInSeparateColumns = GetMaximumFlatNoOfColumns(fieldGroup);
                } catch (e) {}

                if (fgViewMaxNoOfValuesInSeparateColumns > 0) {
                    if (!DoesFieldGroupFieldsContainNestedGroupFields(fieldGroup)) {
                        const fgGroupFields = GetGroupFields(fieldGroup);
                        const fgGroupReadOrderOfFields = GetGroupReadOrderOfFields(fieldGroup);
                        if (fgGroupFields && fgGroupReadOrderOfFields) {
                            for (
                                let columnIndex = 0;
                                columnIndex < fgViewMaxNoOfValuesInSeparateColumns;
                                columnIndex++
                            ) {
                                for (const nFgKeySuffix of fgGroupReadOrderOfFields) {
                                    try {
                                        const value = AsJsonObject(fgGroupFields[nFgKeySuffix]);
                                        const newField = structuredClone(value);
                                        const nJsonPathKey = AsJSONPath(newField[FieldGroupProperties.JsonPathKey]);
                                        if (nJsonPathKey) {
                                            if (core.IsDefined(matchingProps)) {
                                                const mp = MatchingProps(matchingProps, newField);
                                                if (Object.keys(mp).length > 0) {
                                                    MergeRightJsonObjectIntoLeft(newField, mp);
                                                }
                                            }
                                            newField[FieldGroupProperties.FieldViewValuesInSeparateColumnsHeaderIndex] =
                                                columnIndex;

                                            const fgHeaderFormat = newField[
                                                FieldGroupProperties.FieldViewValuesInSeparateColumnsHeaderFormat
                                            ] as string;
                                            if (fgHeaderFormat) {
                                                newField[FieldGroupProperties.Name] = fgHeaderFormat.replace(
                                                    ArrayPathRegex,
                                                    `${columnIndex + 1}`
                                                );
                                            } else {
                                                newField[FieldGroupProperties.Name] =
                                                    `${GetFieldGroupName(newField, '')} ${columnIndex + 1}`;
                                            }

                                            const fieldColumnPosition = new FieldColumnPosition();
                                            fieldColumnPosition.FieldGroupJsonPathKey = nJsonPathKey;
                                            fieldColumnPosition.GroupViewInSeparateColumns = true;
                                            fieldColumnPosition.GroupViewValuesInSeparateColumnsHeaderIndex =
                                                columnIndex;
                                            fieldColumnPosition.GroupViewParentJsonPathKey = jsonPathKey;
                                            fieldColumnPosition.FieldJsonPathKeySuffix = nFgKeySuffix;

                                            const columnField = new ColumnField();
                                            columnField.FieldColumnPosition = fieldColumnPosition;
                                            columnField.Property = newField;
                                            columnField.IndexInOriginalReadOrderOfColumnFields =
                                                columnFields.OriginalReadOrderOfColumnFields.length;
                                            columnField.IndexInRepositionedColumnFields = -1;
                                            columnField.IndexInUnskippedColumnFields = -1;

                                            columnFields.Fields[fieldColumnPosition.toString()] = columnField;
                                            columnFields.OriginalReadOrderOfColumnFields.push(fieldColumnPosition);

                                            const pathToSchema = new JsonPathToValue().Get(nJsonPathKey);
                                            if (pathToSchema) {
                                                const fieldGroupSchema = schema.GetSchemaAtPath(pathToSchema, sch);
                                                if (fieldGroupSchema) {
                                                    columnFields.Fields[fieldColumnPosition.toString()].Schema =
                                                        fieldGroupSchema;
                                                }
                                            }

                                            columnFields.RepositionedReadOrderOfColumnFields.push(currentFieldIndex);
                                            currentFieldIndex++;
                                        }
                                    } catch (e) {}
                                }
                            }
                            return [false, true];
                        }
                    }
                }
            }
        }

        if (processAsField) {
            let fgViewMaxNoOfValuesInSeparateColumns: number = -1;
            try {
                fgViewMaxNoOfValuesInSeparateColumns = GetMaximumFlatNoOfColumns(fieldGroup);
            } catch (e) {}
            if (fgViewMaxNoOfValuesInSeparateColumns > 0) {
                for (let columnIndex = 0; columnIndex < fgViewMaxNoOfValuesInSeparateColumns; columnIndex++) {
                    const newField = structuredClone(fieldGroup);
                    newField[FieldGroupProperties.FieldViewValuesInSeparateColumnsHeaderIndex] = columnIndex;

                    const fgHeaderFormat = newField[
                        FieldGroupProperties.FieldViewValuesInSeparateColumnsHeaderFormat
                    ] as string;
                    if (fgHeaderFormat) {
                        newField[FieldGroupProperties.Name] = fgHeaderFormat.replace(
                            ArrayPathRegex,
                            `${columnIndex + 1}`
                        );
                    } else {
                        newField[FieldGroupProperties.Name] = `${GetFieldGroupName(newField, '')} ${columnIndex + 1}`;
                    }

                    const fieldColumnPosition = new FieldColumnPosition();
                    fieldColumnPosition.FieldGroupJsonPathKey = jsonPathKey;
                    fieldColumnPosition.FieldViewInSeparateColumns = true;
                    fieldColumnPosition.FieldViewValuesInSeparateColumnsHeaderIndex = columnIndex;

                    const columnField = new ColumnField();
                    columnField.FieldColumnPosition = fieldColumnPosition;
                    columnField.Property = newField;
                    columnField.IndexInOriginalReadOrderOfColumnFields =
                        columnFields.OriginalReadOrderOfColumnFields.length;
                    columnField.IndexInRepositionedColumnFields = -1;
                    columnField.IndexInUnskippedColumnFields = -1;

                    columnFields.Fields[fieldColumnPosition.toString()] = columnField;
                    columnFields.OriginalReadOrderOfColumnFields.push(fieldColumnPosition);

                    const pathToSchema = new JsonPathToValue().Get(jsonPathKey);
                    if (pathToSchema) {
                        const fieldGroupSchema = schema.GetSchemaAtPath(pathToSchema, sch);
                        if (fieldGroupSchema) {
                            columnFields.Fields[fieldColumnPosition.toString()].Schema = fieldGroupSchema;
                        }
                    }

                    columnFields.RepositionedReadOrderOfColumnFields.push(currentFieldIndex);
                    currentFieldIndex++;
                }
            } else {
                const fieldColumnPosition = new FieldColumnPosition();
                fieldColumnPosition.FieldGroupJsonPathKey = jsonPathKey;

                const newField = structuredClone(fieldGroup);

                const columnField = new ColumnField();
                columnField.FieldColumnPosition = fieldColumnPosition;
                columnField.Property = newField;
                columnField.IndexInOriginalReadOrderOfColumnFields =
                    columnFields.OriginalReadOrderOfColumnFields.length;
                columnField.IndexInRepositionedColumnFields = -1;
                columnField.IndexInUnskippedColumnFields = -1;

                columnFields.Fields[fieldColumnPosition.toString()] = columnField;
                columnFields.OriginalReadOrderOfColumnFields.push(fieldColumnPosition);

                const pathToSchema = new JsonPathToValue().Get(jsonPathKey);
                if (pathToSchema) {
                    const fieldGroupSchema = schema.GetSchemaAtPath(pathToSchema, sch);
                    if (fieldGroupSchema) {
                        columnFields.Fields[fieldColumnPosition.toString()].Schema = fieldGroupSchema;
                    }
                }

                columnFields.RepositionedReadOrderOfColumnFields.push(currentFieldIndex);
                currentFieldIndex++;
            }
        }

        return [false, false];
    });

    return columnFields;
}

/**
 * ExtractFieldColumnPosition extracts the FieldColumnPosition from a field's properties.
 */
export function ExtractFieldColumnPosition(field: core.JsonObject): FieldColumnPosition | undefined {
    try {
        const value = AsJsonObject(field[FieldGroupProperties.FieldColumnPosition]);
        const fieldGroupJsonPathKey = AsJSONPath(value[FieldGroupProperties.JsonPathKey]);
        if (fieldGroupJsonPathKey) {
            const fieldColumnPosition = new FieldColumnPosition();
            fieldColumnPosition.FieldGroupJsonPathKey = fieldGroupJsonPathKey;

            if (core.IsBoolean(value[FieldGroupProperties.PositionBefore])) {
                fieldColumnPosition.FieldGroupPositionBefore = value[FieldGroupProperties.PositionBefore];
            }

            const chi = value[FieldGroupProperties.FieldViewValuesInSeparateColumnsHeaderIndex];
            if (core.IsDefined(chi)) {
                const columnHeaderIndex = Number(chi);
                if (columnHeaderIndex !== null) {
                    fieldColumnPosition.FieldViewValuesInSeparateColumnsHeaderIndex = columnHeaderIndex;
                }
            }

            return fieldColumnPosition;
        }
    } catch (e) {
        return undefined;
    }

    return undefined;
}
