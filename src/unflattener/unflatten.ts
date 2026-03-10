import {
    ColumnFields,
    FieldColumnPosition,
    GroupColumnIndexes,
    Extraction,
    GroupsColumnsIndexesRetrieval
} from '@fieldcolumns';
import type { FlattenedRow, FlattenedTable } from '@flattener';
import { core, jsobject, path } from '@rogonion/js-json';
import { GroupCollection, Signature } from './unflatten_index';
import {
    AsJSONPath,
    DoesFieldGroupFieldsContainNestedGroupFields,
    FieldGroupProperties,
    GetGroupFields,
    GetGroupReadOrderOfFields,
    GetMaximumFlatNoOfColumns,
    IsFieldAGroup,
    JsonPathToValue,
    MetadataModelError
} from '@core';
import { UnflattenErrorCodes } from './core';

/**
 * Converts a 2 dinmension linear collection (like a 2D array) into a deeply nested mix of associative collections (like an array of objects).
 */
export class Unflattener {
    // @ts-expect-error TS2564
    private _MetadataModel: core.JsonObject;
    public set MetadataModel(value: core.JsonObject) {
        this._MetadataModel = value;
    }

    /**
     * Extracted fields as table columns from {@link Unflattener._MetadataModel}.
     */
    // @ts-expect-error TS2564
    private _ColumnFields: ColumnFields;
    public set ColumnFields(value: ColumnFields) {
        this._ColumnFields = value;
    }

    /**
     * Retrieved from {@link Unflattener._ColumnFields}.
     *
     * The current read order of columns as it is in the currentSourceRow.
     */
    // @ts-expect-error TS6133
    private _CurrentReadOrderOfFields: number[] = [];
    public set CurrentReadOrderOfFields(value: number[]) {
        this._CurrentReadOrderOfFields = value;
    }

    /**
     * Current row being processed.
     */
    private _CurrentSourceRow: FlattenedRow = [];
    public set CurrentSourceRow(value: FlattenedRow) {
        this._CurrentSourceRow = value;
    }

    /**
     * Where to write current source object.
     */
    // @ts-expect-error TS2564
    private _Destination: jsobject.JSObject;
    public set Destination(value: jsobject.JSObject) {
        this._Destination = value;
    }

    /**
     * Used as index key based on primary key values.
     */
    // @ts-expect-error TS2564
    private _Signature: Signature;
    public set Signature(value: Signature) {
        this._Signature = value;
    }

    /**
     * Tree tracking the indexes at each level.
     *
     * Makes it possible to stream read current source object via {@link Unflattener.Unflatten}.
     */
    // @ts-expect-error TS2564
    private _index: GroupCollection;

    /**
     * data (tree of fields/groups) to use when converting the current source object.
     */
    // @ts-expect-error TS2564
    private _recursiveIndexTree: RecursiveGroupIndexTree;

    constructor(metadataModel: core.JsonObject, signature: Signature) {
        this.MetadataModel = metadataModel;
        this.Signature = signature;
    }

    /**
     *
     * @param group
     * @param groupJsonPathKey
     * @throws {MetadataModelError}
     */
    private recursiveInitGroupIndexTree(group: any, groupJsonPathKey: path.JSONPath): RecursiveGroupIndexTree {
        if (!core.IsObject(group)) {
            throw Object.assign(new MetadataModelError(`${UnflattenErrorCodes.UnflattenError} group not JsonObject`), {
                Data: { Group: group }
            });
        }

        const groupFields = GetGroupFields(group);
        const groupReadOrderOfFields = GetGroupReadOrderOfFields(group);

        const groupIndexTree = new RecursiveGroupIndexTree();
        groupIndexTree.FieldColumnPosition = new FieldColumnPosition();
        groupIndexTree.FieldColumnPosition.FieldGroupJsonPathKey = groupJsonPathKey;
        groupIndexTree.GroupFields = [];

        const groupsColumnsIndexesRetrieval = new GroupsColumnsIndexesRetrieval(this._ColumnFields);
        groupIndexTree.GroupColumnIndexes = groupsColumnsIndexesRetrieval.Get(group);

        for (const fgKeySuffix of groupReadOrderOfFields) {
            const fgProperty = groupFields[fgKeySuffix];
            const fgJsonPathKey = AsJSONPath(fgProperty[FieldGroupProperties.JsonPathKey]);

            if (IsFieldAGroup(fgProperty)) {
                const extractAsSingleField = fgProperty[FieldGroupProperties.GroupExtractAsSingleField];
                if (extractAsSingleField === true) {
                    continue;
                }

                if (!DoesFieldGroupFieldsContainNestedGroupFields(fgProperty)) {
                    const fgViewMaxNoOfValuesInSeparateColumns = GetMaximumFlatNoOfColumns(fgProperty);
                    if (fgViewMaxNoOfValuesInSeparateColumns > 0) {
                        try {
                            GetGroupFields(fgProperty);
                            GetGroupReadOrderOfFields(fgProperty);
                            continue;
                        } catch (e) {
                            // ignore
                        }
                    }
                }

                try {
                    const value = this.recursiveInitGroupIndexTree(fgProperty, fgJsonPathKey);
                    value.Suffix = fgKeySuffix;
                    groupIndexTree.GroupFields.push(value);
                } catch (e) {
                    if (e instanceof Error && e.message.includes(UnflattenErrorCodes.NoGroupFields)) {
                        continue;
                    }
                    throw e;
                }
            }
        }
        return groupIndexTree;
    }

    /**
     *
     * @param source
     * @throws {MetadataModelError}
     */
    public Unflatten(source: FlattenedTable) {
        if (!this._ColumnFields) {
            const extraction = new Extraction(this._MetadataModel);
            this._ColumnFields = extraction.Extract();
            this._ColumnFields.Reposition();
            this._ColumnFields.Skip(undefined, undefined);
        }

        if (!this._recursiveIndexTree) {
            this._recursiveIndexTree = this.recursiveInitGroupIndexTree(this._MetadataModel, path.JsonpathKeyRoot);
        }

        if (!this._index) {
            this._index = new GroupCollection();
            this._index.Instances = {};
        }

        for (const row of source) {
            this._CurrentSourceRow = row;
            this.recursiveConvert(this._recursiveIndexTree, this._index, []);
        }
    }

    /**
     *
     * @param groupIndexTree
     * @param parentCollection
     * @param linearCollectionIndexes
     * @throws {MetadataModelError}
     */
    private recursiveConvert(
        groupIndexTree: RecursiveGroupIndexTree,
        parentCollection: GroupCollection,
        linearCollectionIndexes: number[]
    ) {
        // 1. Identify Instance (Signature)
        let pkColumns: number[] = [];
        if (groupIndexTree.GroupColumnIndexes) {
            if (groupIndexTree.GroupColumnIndexes.Primary && groupIndexTree.GroupColumnIndexes.Primary.length > 0) {
                pkColumns = groupIndexTree.GroupColumnIndexes.Primary;
            } else {
                pkColumns = groupIndexTree.GroupColumnIndexes.All;
            }
        }

        const signature = this._Signature.GenerateSignature(this._CurrentSourceRow, pkColumns);

        // 2. Get/Create Instance
        const [node, instanceIndex] = parentCollection.GetOrCreateInstance(
            signature,
            groupIndexTree.FieldColumnPosition.FieldGroupJsonPathKey
        );

        const currentPathIndexes = [...linearCollectionIndexes, instanceIndex];

        // 3. Write Fields
        if (groupIndexTree.GroupColumnIndexes) {
            for (const colIndex of groupIndexTree.GroupColumnIndexes.All) {
                if (colIndex >= this._CurrentSourceRow.length) {
                    continue;
                }
                const val = this._CurrentSourceRow[colIndex];

                if (val === undefined || val === null) {
                    continue;
                }

                const colField = this._ColumnFields.GetColumnFieldByIndexInUnskippedReadOrder(colIndex);
                if (!colField) {
                    continue;
                }

                const targetPath = Object.assign(new JsonPathToValue(), { SourceOfValueIsAnArray: true }).Get(
                    colField.FieldColumnPosition.toString(),
                    currentPathIndexes
                );
                const targetPathSuffixIsLinearCollection = targetPath.trim().endsWith(path.JsonpathRightBracket);

                let valueToWrite = val;
                if (!Array.isArray(valueToWrite)) {
                    if (!targetPathSuffixIsLinearCollection) {
                        valueToWrite = [valueToWrite];
                    }
                } else {
                    if (targetPathSuffixIsLinearCollection) {
                        valueToWrite = valueToWrite[0];
                    }
                }

                this._Destination.Set(targetPath, valueToWrite);
            }
        }

        // 4. Recurse
        for (const childTree of groupIndexTree.GroupFields) {
            const childCollection = node.GetOrCreateGroup(childTree.Suffix);
            this.recursiveConvert(childTree, childCollection, currentPathIndexes);
        }
    }
}

/**
 * Represents a tree of field/groups to read for {@link Unflattener}.
 */
export class RecursiveGroupIndexTree {
    private _FieldColumnPosition: FieldColumnPosition = new FieldColumnPosition();
    public get FieldColumnPosition(): FieldColumnPosition {
        return this._FieldColumnPosition;
    }
    public set FieldColumnPosition(value: FieldColumnPosition) {
        this._FieldColumnPosition = value;
    }

    private _GroupColumnIndexes: GroupColumnIndexes = new GroupColumnIndexes();
    public get GroupColumnIndexes(): GroupColumnIndexes {
        return this._GroupColumnIndexes;
    }
    public set GroupColumnIndexes(value: GroupColumnIndexes) {
        this._GroupColumnIndexes = value;
    }

    private _GroupFields: RecursiveGroupIndexTree[] = [];
    public get GroupFields(): RecursiveGroupIndexTree[] {
        return this._GroupFields;
    }
    public set GroupFields(value: RecursiveGroupIndexTree[]) {
        this._GroupFields = value;
    }

    private _Suffix: string = '';
    public get Suffix(): string {
        return this._Suffix;
    }
    public set Suffix(value: string) {
        this._Suffix = value;
    }

    public toJSON() {
        return {
            FieldColumnPosition: this.FieldColumnPosition,
            GroupColumnIndexes: this.GroupColumnIndexes,
            GroupFields: this.GroupFields,
            Suffix: this.Suffix
        };
    }

    public static fromJSON(json: any): RecursiveGroupIndexTree {
        let data: any = json;
        if (typeof json === 'string') {
            data = JSON.parse(json);
        }
        const instance = new RecursiveGroupIndexTree();
        if (data.FieldColumnPosition) {
            instance.FieldColumnPosition = data.FieldColumnPosition;
        }
        if (data.GroupColumnIndexes) {
            instance.GroupColumnIndexes = data.GroupColumnIndexes;
        }
        if (core.IsArray(data.GroupFields)) {
            instance.GroupFields = data.GroupFields.map((item: any) => RecursiveGroupIndexTree.fromJSON(item));
        }
        if (data.Suffix) {
            instance.Suffix = data.Suffix;
        }
        return instance;
    }
}
