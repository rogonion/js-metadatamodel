import {
    //@ts-expect-error T6133
    type MetadataModelError,
    AsJSONPath,
    AsJsonObject,
    GetGroupFields,
    GetGroupReadOrderOfFields,
    IsFieldAGroup,
    DoesFieldGroupFieldsContainNestedGroupFields,
    GetMaximumFlatNoOfColumns,
    FieldGroupProperties
} from '@core';
import { ColumnFields } from './column_fields';
import { FieldColumnPosition } from './core';
import { core } from '@rogonion/js-json';

export class GroupsColumnsIndexesRetrieval {
    private _columnFields: ColumnFields = new ColumnFields();
    public set columnFields(value: ColumnFields) {
        this._columnFields = value;
    }

    private _primary: number[] = [];

    private _all: number[] = [];

    constructor(columnFields: ColumnFields) {
        this.columnFields = columnFields;
    }

    /**
     *
     * @param fieldColumnPosition
     * @param isPrimary
     * @param isAll
     * @throws {MetadataModelError}
     */
    private appendFieldColumnsIndex(fieldColumnPosition: FieldColumnPosition, isPrimary: boolean, isAll: boolean) {
        const columnField = this._columnFields.GetColumnFieldByFieldGroupJsonPathKey(fieldColumnPosition.toString());
        if (columnField) {
            if (isAll) {
                this._all.push(columnField.IndexInUnskippedColumnFields);
            }
            if (isPrimary) {
                this._primary.push(columnField.IndexInUnskippedColumnFields);
            }
        } else {
            throw new Error(`column '${fieldColumnPosition.toString()}' not found in columnFields`);
        }
    }

    /**
     * Retrieves the column indexes (Primary and All) for a specific group within a metadata model.
     * @param group
     * @throws {MetadataModelError}
     */
    public Get(group: core.JsonObject): GroupColumnIndexes {
        this._primary = [];
        this._all = [];

        const groupFields = GetGroupFields(group);
        if (!groupFields) {
            throw new Error('get group fields failed');
        }

        const groupReadOrderOfFields = GetGroupReadOrderOfFields(group);
        if (!groupReadOrderOfFields) {
            throw new Error('get group read order of fields failed');
        }

        for (const fgKeySuffix of groupReadOrderOfFields) {
            const fgProperty = AsJsonObject(groupFields[fgKeySuffix]);

            let isPrimary = false;
            if (fgProperty[FieldGroupProperties.IsPrimaryKey] === true) {
                isPrimary = true;
            }

            const fgJsonPathKey = AsJSONPath(fgProperty[FieldGroupProperties.JsonPathKey]);
            if (!fgJsonPathKey) {
                throw new Error(`get FieldGroupJsonPathKey for field with suffix key '${fgKeySuffix}' failed`);
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
                                        try {
                                            const nFgProperty = AsJsonObject(fgGroupFields[nFgKeySuffix]);
                                            const nJsonPathKey = AsJSONPath(
                                                nFgProperty[FieldGroupProperties.JsonPathKey]
                                            );
                                            if (nJsonPathKey) {
                                                const fcp = new FieldColumnPosition();
                                                fcp.FieldGroupJsonPathKey = nJsonPathKey;
                                                fcp.GroupViewParentJsonPathKey = fgJsonPathKey;
                                                fcp.GroupViewInSeparateColumns = true;
                                                fcp.GroupViewValuesInSeparateColumnsHeaderIndex = columnIndex;
                                                fcp.FieldJsonPathKeySuffix = nFgKeySuffix;

                                                this.appendFieldColumnsIndex(fcp, isPrimary, true);
                                            }
                                        } catch {}
                                    }
                                }
                                continue;
                            }
                        }
                    }

                    if (isPrimary) {
                        this.recursiveSetPrimaryKeysFromGroupFields(fgProperty);
                    }
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
                        const fcp = new FieldColumnPosition();
                        fcp.FieldGroupJsonPathKey = fgJsonPathKey;
                        fcp.FieldViewInSeparateColumns = true;
                        fcp.FieldViewValuesInSeparateColumnsHeaderIndex = columnIndex;

                        this.appendFieldColumnsIndex(fcp, isPrimary, true);
                    }
                    continue;
                }

                const fcp = new FieldColumnPosition();
                fcp.FieldGroupJsonPathKey = fgJsonPathKey;
                this.appendFieldColumnsIndex(fcp, isPrimary, true);
            }
        }

        const result = new GroupColumnIndexes();
        result.Primary = this._primary;
        result.All = this._all;
        return result;
    }

    /**
     *
     * @param group
     * @throws {MetadataModelError}
     */
    private recursiveSetPrimaryKeysFromGroupFields(group: core.JsonObject) {
        const groupFields = GetGroupFields(group);
        if (!groupFields) {
            throw new Error('get group fields failed');
        }

        const groupReadOrderOfFields = GetGroupReadOrderOfFields(group);
        if (!groupReadOrderOfFields) {
            throw new Error('get group read order of fields failed');
        }

        for (const fgKeySuffix of groupReadOrderOfFields) {
            const fgProperty = AsJsonObject(groupFields[fgKeySuffix]);

            const fgJsonPathKey = AsJSONPath(fgProperty[FieldGroupProperties.JsonPathKey]);
            if (!fgJsonPathKey) {
                throw new Error(`get FieldGroupJsonPathKey for field with suffix key '${fgKeySuffix}' failed`);
            }

            if (fgProperty[FieldGroupProperties.IsPrimaryKey] !== true) {
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
                                        try {
                                            const nFgProperty = AsJsonObject(fgGroupFields[nFgKeySuffix]);
                                            const nJsonPathKey = AsJSONPath(
                                                nFgProperty[FieldGroupProperties.JsonPathKey]
                                            );
                                            if (nJsonPathKey) {
                                                const fcp = new FieldColumnPosition();
                                                fcp.FieldGroupJsonPathKey = nJsonPathKey;
                                                fcp.GroupViewParentJsonPathKey = fgJsonPathKey;
                                                fcp.GroupViewInSeparateColumns = true;
                                                fcp.GroupViewValuesInSeparateColumnsHeaderIndex = columnIndex;
                                                fcp.FieldJsonPathKeySuffix = nFgKeySuffix;

                                                this.appendFieldColumnsIndex(fcp, true, false);
                                            }
                                        } catch {}
                                    }
                                }
                                continue;
                            }
                        }
                    }

                    this.recursiveSetPrimaryKeysFromGroupFields(fgProperty);
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
                        const fcp = new FieldColumnPosition();
                        fcp.FieldGroupJsonPathKey = fgJsonPathKey;
                        fcp.FieldViewInSeparateColumns = true;
                        fcp.FieldViewValuesInSeparateColumnsHeaderIndex = columnIndex;

                        this.appendFieldColumnsIndex(fcp, true, false);
                    }
                    continue;
                }

                const fcp = new FieldColumnPosition();
                fcp.FieldGroupJsonPathKey = fgJsonPathKey;
                this.appendFieldColumnsIndex(fcp, true, false);
            }
        }
    }
}

/**
 * Fast lookup index to quickly identify which columns to read at current group.
 */
export class GroupColumnIndexes {
    private _Primary: number[] = [];
    public get Primary(): number[] {
        return this._Primary;
    }
    public set Primary(value: number[]) {
        this._Primary = value;
    }

    private _All: number[] = [];
    public get All(): number[] {
        return this._All;
    }
    public set All(value: number[]) {
        this._All = value;
    }

    public toJSON(): object {
        return {
            Primary: this.Primary,
            All: this.All
        };
    }

    public static fromJSON(json: any): GroupColumnIndexes {
        let data: any = json;
        if (typeof json === 'string') {
            data = JSON.parse(json);
        }
        const instance = new GroupColumnIndexes();
        if (data.Primary) instance.Primary = data.Primary;
        if (data.All) instance.All = data.All;
        return instance;
    }
}
