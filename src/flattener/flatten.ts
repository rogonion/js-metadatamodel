import { FlattenErrorCodes } from './core';
import {
    AsJsonObject,
    AsJSONPath,
    GetGroupFields,
    GetGroupReadOrderOfFields,
    IsFieldAGroup,
    DoesFieldGroupFieldsContainNestedGroupFields,
    GetMaximumFlatNoOfColumns,
    FieldGroupProperties,
    JsonPathToValue,
    MetadataModelError
} from '@core';
import { ColumnFields, FieldColumnPosition, Extraction } from '@fieldcolumns';
import { core, jsobject, path } from '@rogonion/js-json';

/**
 * Flattener converts a deeply nested mix of associative collections (like an array of objects) into a 2 dimension linear collection (like a 2D array).
 */
export class FLattener {
    private _MetadataModel: core.JsonObject = {};
    public set MetadataModel(value: core.JsonObject) {
        this._MetadataModel = value;
    }

    /**
     * Extracted fields as table columns from metadataModel.
     */
    // @ts-expect-error TS2564
    private _ColumnFields: ColumnFields;
    public set ColumnFields(value: ColumnFields) {
        this._ColumnFields = value;
    }

    /**
     * Individual associative collection object to convert to a 2D array. Result appended to {@link Flattener._CurrentSourceObjectResult}.
     */
    // @ts-expect-error TS2564
    private _CurrentSourceObject: jsobject.JSObject;
    public set CurrentSourceObject(value: jsobject.JSObject) {
        this._CurrentSourceObject = value;
    }

    /**
     * Determines how {@link FLattener._CurrentSourceObject} will be processed.
     *
     * If `true`, object to flatten is assumed to be a collection of associative collections (maps and classes) thus each at the top-level will be loaded into {@link Flattener._CurrentSourceObject} for flattening individually.
     */
    private _currentSourceObjectIsALinearCollection: boolean = false;

    /**
     * Holds the current result of flattening the {@link Flattener._CurrentSourceObject}.
     */
    private _CurrentSourceObjectResult: FlattenedTable = [];
    public get CurrentSourceObjectResult(): FlattenedTable {
        return this._CurrentSourceObjectResult;
    }

    /**
     * Data (tree of fields/groups) to use when converting the {@link Flattener._CurrentSourceObject}.
     */
    private _fieldGroupConversion: RecursiveIndexTree = new RecursiveIndexTree();

    constructor(metadataModel: core.JsonObject) {
        this.MetadataModel = metadataModel;
    }

    /**
     * Generates a tree of the source object with the necessary data required to perform the conversion at each recursive step.
     *
     * Ignores if a field needs to be skipped or reordered to ensure proper merging of FlattenedTable generated at each recursive step.
     * @param group
     * @param groupJsonPathKey
     * @throws {MetadataModelError}
     */
    private recursiveInitRecursiveIndexTree(group: any, groupJsonPathKey: path.JSONPath): RecursiveIndexTree {
        let fieldGroupProp: core.JsonObject | undefined;
        try {
            fieldGroupProp = AsJsonObject(group);
        } catch (err) {
            throw Object.assign(new MetadataModelError('group not JsonObject', err as Error), {
                Data: { Group: group }
            });
        }
        if (!fieldGroupProp) {
            throw Object.assign(new MetadataModelError('group not JsonObject'), { Data: { Group: group } });
        }

        let groupFields: Record<string, any> | undefined;
        try {
            groupFields = GetGroupFields(fieldGroupProp);
        } catch (err) {
            throw Object.assign(new MetadataModelError('get group fields failed', err as Error), {
                Data: { Group: group }
            });
        }
        if (!groupFields) {
            throw Object.assign(new MetadataModelError('get group fields failed'), { Data: { Group: group } });
        }

        let groupReadOrderOfFields: string[] | undefined;
        try {
            groupReadOrderOfFields = GetGroupReadOrderOfFields(fieldGroupProp);
        } catch (err) {
            throw Object.assign(new MetadataModelError('get group read order of fields failed', err as Error), {
                Data: { Group: group }
            });
        }
        if (!groupReadOrderOfFields) {
            throw Object.assign(new MetadataModelError('get group read order of fields failed'), {
                Data: { Group: group }
            });
        }

        const groupIndexTree = new RecursiveIndexTree();
        groupIndexTree.FieldColumnPosition = new FieldColumnPosition();
        groupIndexTree.FieldColumnPosition.FieldGroupJsonPathKey = groupJsonPathKey;
        groupIndexTree.GroupFields = [];

        for (const fgKeySuffix of groupReadOrderOfFields) {
            let fgProperty: core.JsonObject | undefined;
            try {
                fgProperty = AsJsonObject(groupFields[fgKeySuffix]);
            } catch (err) {
                throw Object.assign(
                    new MetadataModelError(`get field with suffix key '${fgKeySuffix}' failed`, err as Error),
                    { Data: { Group: group } }
                );
            }
            if (!fgProperty) {
                throw Object.assign(new MetadataModelError(`get field with suffix key '${fgKeySuffix}' failed`), {
                    Data: { Group: group }
                });
            }

            let fgJsonPathKey: path.JSONPath | undefined;
            try {
                fgJsonPathKey = AsJSONPath(fgProperty[FieldGroupProperties.JsonPathKey]);
            } catch (err) {
                throw Object.assign(
                    new MetadataModelError(
                        `get FieldGroupProperties.JsonPathKey for field with suffix key '${fgKeySuffix}' failed`,
                        err as Error
                    ),
                    { Data: { Group: group } }
                );
            }
            if (!fgJsonPathKey) {
                throw Object.assign(
                    new MetadataModelError(
                        `get FieldGroupProperties.JsonPathKey for field with suffix key '${fgKeySuffix}' failed`
                    ),
                    { Data: { Group: group } }
                );
            }

            let processAsField = true;

            if (IsFieldAGroup(fgProperty)) {
                const extractAsSingleField = fgProperty[FieldGroupProperties.GroupExtractAsSingleField] === true;
                if (extractAsSingleField) {
                    processAsField = true;
                } else {
                    processAsField = false;

                    if (!DoesFieldGroupFieldsContainNestedGroupFields(fgProperty)) {
                        const fgViewMaxNoOfValuesInSeparateColumns = GetMaximumFlatNoOfColumns(fgProperty);
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
                                        let nFgProperty: core.JsonObject | undefined;
                                        try {
                                            nFgProperty = AsJsonObject(fgGroupFields[nFgKeySuffix]);
                                        } catch (err) {}
                                        if (nFgProperty) {
                                            let nJsonPathKey: path.JSONPath | undefined;
                                            try {
                                                nJsonPathKey = AsJSONPath(
                                                    nFgProperty[FieldGroupProperties.JsonPathKey]
                                                );
                                            } catch (err) {}

                                            if (nJsonPathKey) {
                                                const fieldColumnPosition = new FieldColumnPosition();
                                                fieldColumnPosition.FieldGroupJsonPathKey = nJsonPathKey;
                                                fieldColumnPosition.GroupViewParentJsonPathKey = fgJsonPathKey;
                                                fieldColumnPosition.GroupViewInSeparateColumns = true;
                                                fieldColumnPosition.GroupViewValuesInSeparateColumnsHeaderIndex =
                                                    columnIndex;
                                                fieldColumnPosition.FieldJsonPathKeySuffix = nFgKeySuffix;

                                                const field = this._ColumnFields.Fields[fieldColumnPosition.toString()];
                                                if (field && !field.Skip) {
                                                    const newFieldConversion = new RecursiveIndexTree();
                                                    newFieldConversion.FieldColumnPosition = fieldColumnPosition;
                                                    groupIndexTree.GroupFields.push(newFieldConversion);
                                                }
                                            }
                                        }
                                    }
                                }
                                continue;
                            }
                        }
                    }

                    try {
                        const fgGroupConversion = this.recursiveInitRecursiveIndexTree(fgProperty, fgJsonPathKey);
                        groupIndexTree.GroupFields.push(fgGroupConversion);
                    } catch (err: any) {
                        if (err.message !== FlattenErrorCodes.NoGroupFields) {
                            throw err;
                        }
                    }
                    continue;
                }
            }

            if (processAsField) {
                const fgViewMaxNoOfValuesInSeparateColumns = GetMaximumFlatNoOfColumns(fgProperty);
                if (fgViewMaxNoOfValuesInSeparateColumns > 0) {
                    for (let columnIndex = 0; columnIndex < fgViewMaxNoOfValuesInSeparateColumns; columnIndex++) {
                        const fcp = new FieldColumnPosition();
                        fcp.FieldGroupJsonPathKey = fgJsonPathKey;
                        fcp.FieldViewInSeparateColumns = true;
                        fcp.FieldViewValuesInSeparateColumnsHeaderIndex = columnIndex;

                        const field = this._ColumnFields.Fields[fcp.toString()];
                        if (field && !field.Skip) {
                            const newFieldConversion = new RecursiveIndexTree();
                            newFieldConversion.FieldColumnPosition = fcp;
                            groupIndexTree.GroupFields.push(newFieldConversion);
                        }
                    }
                    continue;
                }

                const field = this._ColumnFields.Fields[fgJsonPathKey];
                if (field && !field.Skip) {
                    const newFieldConversion = new RecursiveIndexTree();
                    newFieldConversion.FieldColumnPosition = new FieldColumnPosition();
                    newFieldConversion.FieldColumnPosition.FieldGroupJsonPathKey = fgJsonPathKey;
                    groupIndexTree.GroupFields.push(newFieldConversion);
                }
            }
        }

        if (groupIndexTree.GroupFields.length === 0) {
            throw Object.assign(new MetadataModelError(FlattenErrorCodes.NoGroupFields), { Data: { Group: group } });
        }

        return groupIndexTree;
    }

    /**
     * Clears internal state, allowing the {@link Flattener} to be re-used for a new batch of data without carrying over previous results.
     */
    public Reset() {
        this._CurrentSourceObjectResult = [];
    }

    /**
     * Processes the {@link sourceObject} and populates the internal {@link FLattener._CurrentSourceObjectResult}.
     *
     * Once the process is successful, you can call {@link Flattener.CurrentSourceObjectResult} to retrieve the {@link FlattenedTable} or {@link Flattener.WriteToDestination}.
     *
     * For preset {@link FLattener._ColumnFields}, ensure {@link ColumnFields._UnskippedReadOrderOfColumnFields} is set.
     * @param sourceObject
     * @throws {MetadataModelError}
     */
    public Flatten(sourceObject: jsobject.JSObject) {
        const source = sourceObject.Source;
        this._currentSourceObjectIsALinearCollection = Array.isArray(source);

        if (!this._ColumnFields) {
            try {
                const extraction = new Extraction(this._MetadataModel);
                const columnFields = extraction.Extract();
                columnFields.Reposition();
                columnFields.Skip(undefined, undefined);
                this._ColumnFields = columnFields;
            } catch (err) {
                throw new MetadataModelError('extract default columnFields failed', err as Error);
            }
        }

        if (!this._fieldGroupConversion || this._fieldGroupConversion.GroupFields.length === 0) {
            this._fieldGroupConversion = this.recursiveInitRecursiveIndexTree(
                this._MetadataModel,
                path.JsonpathKeyRoot
            );
        }

        if (this._currentSourceObjectIsALinearCollection) {
            sourceObject.ForEach(
                path.JsonpathKeyRoot +
                    path.JsonpathDotNotation +
                    path.JsonpathLeftBracket +
                    path.JsonpathKeyIndexAll +
                    path.JsonpathRightBracket,
                (_: path.RecursiveDescentSegment, value: any) => {
                    this._CurrentSourceObject = new jsobject.JSObject();
                    this._CurrentSourceObject.Source = value;
                    const resultTable = this.recursiveConvert(this._fieldGroupConversion, [], []);
                    this._CurrentSourceObjectResult.push(...resultTable);
                    return false;
                }
            );
        } else {
            this._CurrentSourceObject = sourceObject;
            const resultTable = this.recursiveConvert(this._fieldGroupConversion, [], []);
            this._CurrentSourceObjectResult.push(...resultTable);
        }
    }

    /**
     * Merges a single cell value (which is an array) into all existing rows.
     *
     * If the cell value is meant to explode rows
     * (e.g if the cell itself contains multiple items that should be separate rows),
     * logic differs, but based on your "normalizeToSlice" we treat the cell as 1 unit of data for that column.
     * @param rows
     * @param cellValue
     */
    private mergeCellValueIntoRows(rows: FlattenedTable, cellValue: any): FlattenedTable {
        const newRows: FlattenedTable = new Array(rows.length);
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const newRow = new Array(row.length + 1);
            for (let j = 0; j < row.length; j++) {
                newRow[j] = row[j];
            }
            newRow[row.length] = cellValue;
            newRows[i] = newRow;
        }
        return newRows;
    }

    /**
     * Enforces the rule that every cell value is an array.
     * @param fieldData
     */
    private getCellValueFromFieldData(fieldData: any): any {
        if (fieldData === undefined || fieldData === null) {
            return DefaultEmptyColumn();
        }
        if (Array.isArray(fieldData)) {
            return fieldData;
        }
        return [fieldData];
    }

    /**
     * Helper to copy the table structure.
     * @param source
     */
    private copyTable(source: FlattenedTable): FlattenedTable {
        if (source.length === 0) {
            return [];
        }
        const newTable = new Array(source.length);
        for (let i = 0; i < source.length; i++) {
            const row = source[i];
            const newRow = new Array(row.length);
            for (let j = 0; j < row.length; j++) {
                newRow[j] = row[j];
            }
            newTable[i] = newRow;
        }
        return newTable;
    }

    /**
     * Takes the current table state and returns the mutated table.
     * @param groupConversion
     * @param linearCollectionIndexes
     * @param incomingRows
     */
    private recursiveConvert(
        groupConversion: RecursiveIndexTree,
        linearCollectionIndexes: number[],
        incomingRows: FlattenedTable
    ): FlattenedTable {
        let currentRows = this.copyTable(incomingRows);

        if (currentRows.length === 0) {
            currentRows = [[]];
        }

        for (const fgConversion of groupConversion.GroupFields) {
            let fieldData = DefaultEmptyColumn();

            const jsonPath = new JsonPathToValue().Get(
                fgConversion.FieldColumnPosition.toString(),
                linearCollectionIndexes
            );
            if (jsonPath) {
                const noOfResults = this._CurrentSourceObject.Get(jsonPath);
                if (noOfResults > 0) {
                    fieldData = this._CurrentSourceObject.ValueFound;
                }
            }

            if (fgConversion.GroupFields.length > 0) {
                if (Array.isArray(fieldData)) {
                    let collectedBranchResults: FlattenedTable = [];
                    for (let i = 0; i < fieldData.length; i++) {
                        const branchInput = this.copyTable(currentRows);
                        const branchResult = this.recursiveConvert(
                            fgConversion,
                            [...linearCollectionIndexes, i],
                            branchInput
                        );
                        collectedBranchResults = collectedBranchResults.concat(branchResult);
                    }
                    currentRows = collectedBranchResults;
                    continue;
                }

                currentRows = this.recursiveConvert(fgConversion, [...linearCollectionIndexes, 0], currentRows);
                continue;
            }

            const cellValue = this.getCellValueFromFieldData(fieldData);
            currentRows = this.mergeCellValueIntoRows(currentRows, cellValue);
        }

        return currentRows;
    }

    /**
     * Writes current {@link FLattener._CurrentSourceObjectResult} to {@link destination}.
     * @param destination
     * @throws {MetadataModelError}
     */
    public WriteToDestination(destination: jsobject.JSObject) {
        if (this.CurrentSourceObjectResult.length === 0) {
            return;
        }

        let readOrder: number[] = [];
        if (this._ColumnFields) {
            readOrder = this._ColumnFields.UnskippedReadOrderOfColumnFields;
        } else {
            if (this.CurrentSourceObjectResult.length > 0) {
                const cols = this.CurrentSourceObjectResult[0].length;
                readOrder = new Array(cols);
                for (let i = 0; i < cols; i++) {
                    readOrder[i] = i;
                }
            }
        }

        for (let rowIndex = 0; rowIndex < this.CurrentSourceObjectResult.length; rowIndex++) {
            const row = this.CurrentSourceObjectResult[rowIndex];
            for (let destColIndex = 0; destColIndex < readOrder.length; destColIndex++) {
                const sourceColIndex = readOrder[destColIndex];

                if (sourceColIndex < 0 || sourceColIndex >= row.length) {
                    throw Object.assign(new MetadataModelError(`source column index ${sourceColIndex} out of bounds`), {
                        Data: { RowIndex: rowIndex, RowLength: row.length }
                    });
                }

                const cellValue = row[sourceColIndex];
                const targetPath = `$[${rowIndex}][${destColIndex}]`;

                try {
                    destination.Set(targetPath, cellValue);
                } catch (err) {
                    throw new MetadataModelError(`write failed at row ${rowIndex} col ${destColIndex}`, err as Error);
                }
            }
        }
    }
}

/**
 * Represents a single row in a table.
 *
 * The {@link Flattener} will attempt to enforce that each cell (column in row) is an array for uniformity.
 *
 * Default, empty, or uninitialized cells are represented as an empty arry of type any (any[]).
 */
export type FlattenedRow = any[];

/**
 * Represents a 2D linear collection.
 *
 * This is the result flattening an object.
 */
export type FlattenedTable = FlattenedRow[];

/**
 * Represents a tree of field/groups to read for Flattener.
 */
export class RecursiveIndexTree {
    // @ts-expect-error TS2564
    private _FieldColumnPosition: FieldColumnPosition;
    public get FieldColumnPosition(): FieldColumnPosition {
        return this._FieldColumnPosition;
    }
    public set FieldColumnPosition(value: FieldColumnPosition) {
        this._FieldColumnPosition = value;
    }

    private _GroupFields: RecursiveIndexTree[] = [];
    public get GroupFields(): RecursiveIndexTree[] {
        return this._GroupFields;
    }
    public set GroupFields(value: RecursiveIndexTree[]) {
        this._GroupFields = value;
    }

    public toJSON() {
        return {
            FieldColumnPosition: this.FieldColumnPosition,
            GroupFields: this.GroupFields
        };
    }

    public static fromJSON(json: any): RecursiveIndexTree {
        let data: any = json;
        if (typeof json === 'string') {
            data = JSON.parse(json);
        }
        const instance = new RecursiveIndexTree();
        if (data.FieldColumnPosition) {
            instance.FieldColumnPosition = FieldColumnPosition.fromJSON(data.FieldColumnPosition);
        }
        if (data.GroupFields) {
            instance.GroupFields = data.GroupFields.map((item: any) => RecursiveIndexTree.fromJSON(item));
        }
        return instance;
    }
}

/**
 * Represents an empty column (any[])
 * @returns
 */
export const DefaultEmptyColumn = () => [];
