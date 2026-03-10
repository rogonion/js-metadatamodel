import { core, path } from '@rogonion/js-json';
import { type FieldGroupPropertiesMatch, firstMatch, isValid } from '@core';
import { FieldColumnPosition, type FieldColumnPositions, type RepositionFieldColumns } from './core';

/**
 * ColumnField represents a single field (column) extracted from the metadata model.
 */
export class ColumnField {
    private _FieldColumnPosition: FieldColumnPosition = new FieldColumnPosition();
    public get FieldColumnPosition(): FieldColumnPosition {
        return this._FieldColumnPosition;
    }
    public set FieldColumnPosition(value: FieldColumnPosition) {
        this._FieldColumnPosition = value;
    }

    /**
     * Property field metadata model property.
     */
    private _Property: core.JsonObject = {};
    public get Property(): core.JsonObject {
        return this._Property;
    }
    public set Property(value: core.JsonObject) {
        this._Property = value;
    }

    /**
     * Schema Only set if Extraction.schema is set.
     */
    private _Schema: any = null;
    public get Schema(): any {
        return this._Schema;
    }
    public set Schema(value: any) {
        this._Schema = value;
    }

    /**
     * IndexInOriginalReadOrderOfColumnFields original index of field as it was being Extraction.Extract.
     */
    private _IndexInOriginalReadOrderOfColumnFields: number = 0;
    public get IndexInOriginalReadOrderOfColumnFields(): number {
        return this._IndexInOriginalReadOrderOfColumnFields;
    }
    public set IndexInOriginalReadOrderOfColumnFields(value: number) {
        this._IndexInOriginalReadOrderOfColumnFields = value;
    }

    /**
     * IndexInRepositionedColumnFields new index of field after ColumnFields.Reposition.
     */
    private _IndexInRepositionedColumnFields: number = 0;
    public get IndexInRepositionedColumnFields(): number {
        return this._IndexInRepositionedColumnFields;
    }
    public set IndexInRepositionedColumnFields(value: number) {
        this._IndexInRepositionedColumnFields = value;
    }

    /**
     * Skip field. Set using ColumnFields.Skip.
     */
    private _Skip: boolean = false;
    public get Skip(): boolean {
        return this._Skip;
    }
    public set Skip(value: boolean) {
        this._Skip = value;
    }

    /**
     * IndexInUnskippedColumnFields new index of field after ColumnFields.Skip.
     */
    private _IndexInUnskippedColumnFields: number = 0;
    public get IndexInUnskippedColumnFields(): number {
        return this._IndexInUnskippedColumnFields;
    }
    public set IndexInUnskippedColumnFields(value: number) {
        this._IndexInUnskippedColumnFields = value;
    }

    public toJSON(): object {
        return {
            FieldColumnPosition: this.FieldColumnPosition,
            Property: this.Property,
            Schema: this.Schema,
            IndexInOriginalReadOrderOfColumnFields: this.IndexInOriginalReadOrderOfColumnFields,
            IndexInRepositionedColumnFields: this.IndexInRepositionedColumnFields,
            Skip: this.Skip,
            IndexInUnskippedColumnFields: this.IndexInUnskippedColumnFields
        };
    }

    public static fromJSON(json: any): ColumnField {
        let data: any = json;
        if (typeof json === 'string') {
            data = JSON.parse(json);
        }

        const instance = new ColumnField();
        if (data.FieldColumnPosition) {
            instance.FieldColumnPosition = FieldColumnPosition.fromJSON(data.FieldColumnPosition);
        }
        if (data.Property) instance.Property = data.Property;
        if (data.Schema) instance.Schema = data.Schema;
        if (data.IndexInOriginalReadOrderOfColumnFields !== undefined)
            instance.IndexInOriginalReadOrderOfColumnFields = data.IndexInOriginalReadOrderOfColumnFields;
        if (data.IndexInRepositionedColumnFields !== undefined)
            instance.IndexInRepositionedColumnFields = data.IndexInRepositionedColumnFields;
        if (data.Skip !== undefined) instance.Skip = data.Skip;
        if (data.IndexInUnskippedColumnFields !== undefined)
            instance.IndexInUnskippedColumnFields = data.IndexInUnskippedColumnFields;
        return instance;
    }
}

/**
 * Fields is a map of JSON paths to ColumnField pointers.
 */
export type Fields = { [key: path.JSONPath]: ColumnField };

/**
 * FieldsToSkip is a set of JSON paths representing fields that should be skipped.
 */
export type FieldsToSkip = { [key: path.JSONPath]: boolean };

/**
 * FieldToSkip returns a value used in the FieldsToSkip set.
 */
export function FieldToSkip(): boolean {
    return true;
}

/**
 * ColumnFields represents the metadata model fields as columns in a table.
 */
export class ColumnFields {
    /**
     * Fields store field information.
     */
    private _Fields: Fields = {};
    public get Fields(): Fields {
        return this._Fields;
    }
    public set Fields(value: Fields) {
        this._Fields = value;
    }

    /**
     * OriginalReadOrderOfColumnFields store order of Fields as per read order of metadata model tree.
     */
    private _OriginalReadOrderOfColumnFields: FieldColumnPositions = [];
    public get OriginalReadOrderOfColumnFields(): FieldColumnPositions {
        return this._OriginalReadOrderOfColumnFields;
    }
    public set OriginalReadOrderOfColumnFields(value: FieldColumnPositions) {
        this._OriginalReadOrderOfColumnFields = value;
    }

    /**
     * Derived from OriginalReadOrderOfColumnFields
     *
     * The value stored at each index is the actual index in the OriginalReadOrderOfColumnFields.
     *
     * Its size MUST be equal to OriginalReadOrderOfColumnFields.
     */
    private _RepositionedReadOrderOfColumnFields: number[] = [];
    public get RepositionedReadOrderOfColumnFields(): number[] {
        return this._RepositionedReadOrderOfColumnFields;
    }
    public set RepositionedReadOrderOfColumnFields(value: number[]) {
        this._RepositionedReadOrderOfColumnFields = value;
    }

    /**
     * Derived from RepositionedReadOrderOfColumnFields
     *
     * The value stored at each index is the actual index in the OriginalReadOrderOfColumnFields.
     *
     * Its size may not be equal to OriginalReadOrderOfColumnFields.
     */
    private _UnskippedReadOrderOfColumnFields: number[] = [];
    public get UnskippedReadOrderOfColumnFields(): number[] {
        return this._UnskippedReadOrderOfColumnFields;
    }
    public set UnskippedReadOrderOfColumnFields(value: number[]) {
        this._UnskippedReadOrderOfColumnFields = value;
    }

    /**
     * FieldsToSkip
     */
    private _FieldsToSkip: FieldsToSkip = {};
    public get FieldsToSkip(): FieldsToSkip {
        return this._FieldsToSkip;
    }
    public set FieldsToSkip(value: FieldsToSkip) {
        this._FieldsToSkip = value;
    }

    /**
     * RepositionFieldColumns for repositioning OriginalReadOrderOfColumnFields to RepositionedReadOrderOfColumnFields.
     */
    private _RepositionFieldColumns: RepositionFieldColumns = [];
    public get RepositionFieldColumns(): RepositionFieldColumns {
        return this._RepositionFieldColumns;
    }
    public set RepositionFieldColumns(value: RepositionFieldColumns) {
        this._RepositionFieldColumns = value;
    }

    public toJSON(): object {
        return {
            Fields: this.Fields,
            OriginalReadOrderOfColumnFields: this.OriginalReadOrderOfColumnFields,
            RepositionedReadOrderOfColumnFields: this.RepositionedReadOrderOfColumnFields,
            UnskippedReadOrderOfColumnFields: this.UnskippedReadOrderOfColumnFields,
            FieldsToSkip: this.FieldsToSkip,
            RepositionFieldColumns: this.RepositionFieldColumns
        };
    }

    public static fromJSON(json: any): ColumnFields {
        let data: any = json;
        if (typeof json === 'string') {
            data = JSON.parse(json);
        }
        const instance = new ColumnFields();
        if (data.Fields) {
            instance.Fields = {};
            for (const key in data.Fields) {
                if (Object.prototype.hasOwnProperty.call(data.Fields, key)) {
                    instance.Fields[key] = ColumnField.fromJSON(data.Fields[key]);
                }
            }
        }
        if (data.OriginalReadOrderOfColumnFields) {
            instance.OriginalReadOrderOfColumnFields = data.OriginalReadOrderOfColumnFields.map((item: any) =>
                FieldColumnPosition.fromJSON(item)
            );
        }
        if (data.RepositionedReadOrderOfColumnFields)
            instance.RepositionedReadOrderOfColumnFields = data.RepositionedReadOrderOfColumnFields;
        if (data.UnskippedReadOrderOfColumnFields)
            instance.UnskippedReadOrderOfColumnFields = data.UnskippedReadOrderOfColumnFields;
        if (data.FieldsToSkip) instance.FieldsToSkip = data.FieldsToSkip;
        if (data.RepositionFieldColumns) {
            instance.RepositionFieldColumns = data.RepositionFieldColumns.map((item: any) =>
                FieldColumnPosition.fromJSON(item)
            );
        }
        return instance;
    }

    /**
     * GetColumnFieldByIndexInUnskippedReadOrder retrieves a ColumnField by its index in the unskipped read order.
     */
    public GetColumnFieldByIndexInUnskippedReadOrder(index: number): ColumnField | null {
        if (index >= 0 && index < this.UnskippedReadOrderOfColumnFields.length) {
            return this.GetColumnFieldByIndexInOriginalReadOrder(this.UnskippedReadOrderOfColumnFields[index]);
        }
        return null;
    }

    /**
     * GetColumnFieldByIndexInRepositionedReadOrder retrieves a ColumnField by its index in the repositioned read order.
     */
    public GetColumnFieldByIndexInRepositionedReadOrder(index: number): ColumnField | null {
        if (index >= 0 && index < this.RepositionedReadOrderOfColumnFields.length) {
            return this.GetColumnFieldByIndexInOriginalReadOrder(this.RepositionedReadOrderOfColumnFields[index]);
        }
        return null;
    }

    /**
     * GetColumnFieldByIndexInOriginalReadOrder retrieves a ColumnField by its index in the original extraction order.
     */
    public GetColumnFieldByIndexInOriginalReadOrder(index: number): ColumnField | null {
        if (index >= 0 && index < this.OriginalReadOrderOfColumnFields.length) {
            return this.GetColumnFieldByFieldGroupJsonPathKey(this.OriginalReadOrderOfColumnFields[index].toString());
        }
        return null;
    }

    /**
     * GetColumnFieldByFieldGroupJsonPathKey retrieves a ColumnField by its JSON path key.
     */
    public GetColumnFieldByFieldGroupJsonPathKey(jsonPathKey: path.JSONPath): ColumnField | null {
        if (Object.prototype.hasOwnProperty.call(this.Fields, jsonPathKey)) {
            return this.Fields[jsonPathKey];
        }
        return null;
    }

    /**
     * Skip a field if skip.FirstMatch returns `true` or add.FirstMatch returns `false`.
     *
     * Call after ColumnFields.Reposition.
     *
     * Populates ColumnFields.UnskippedReadOrderOfColumnFields.
     *
     * Updates ColumnField.IndexInUnskippedColumnFields.
     */
    public Skip(skip: FieldGroupPropertiesMatch | undefined, add: FieldGroupPropertiesMatch | undefined): void {
        this.FieldsToSkip = {};
        this.UnskippedReadOrderOfColumnFields = [];

        for (const originalIndex of this.RepositionedReadOrderOfColumnFields) {
            const field = this.GetColumnFieldByIndexInOriginalReadOrder(originalIndex);
            if (field) {
                field.Skip = false;
                if (isValid(skip)) {
                    if (firstMatch(skip!, field.Property)) {
                        field.Skip = true;
                    }
                }
                if (isValid(add)) {
                    if (!firstMatch(add!, field.Property)) {
                        field.Skip = true;
                    }
                }

                if (field.Skip) {
                    this.FieldsToSkip[field.FieldColumnPosition.toString()] = FieldToSkip();
                    field.IndexInUnskippedColumnFields = -1;
                } else {
                    this.UnskippedReadOrderOfColumnFields.push(originalIndex);
                    field.IndexInUnskippedColumnFields = this.UnskippedReadOrderOfColumnFields.length - 1;
                }
            }
        }
    }

    /**
     * Reposition reorganizes ColumnFields.RepositionedReadOrderOfColumnFields based on ColumnFields.RepositionFieldColumns information.
     *
     * Only call this method after Extraction.Extract has been run successfully.
     *
     * Populates ColumnFields.RepositionedReadOrderOfColumnFields.
     *
     * Updates ColumnField.IndexInRepositionedColumnFields.
     */
    public Reposition(): void {
        const totalNoOfFields = this.RepositionedReadOrderOfColumnFields.length;

        for (const newPosition of this.RepositionFieldColumns) {
            const destinationField = this.Fields[newPosition.toString()];
            if (destinationField) {
                let sourceIndex = -1;
                let destinationIndex = -1;

                for (let cIndex = 0; cIndex < this.RepositionedReadOrderOfColumnFields.length; cIndex++) {
                    const cValue = this.RepositionedReadOrderOfColumnFields[cIndex];
                    if (cValue === destinationField.IndexInOriginalReadOrderOfColumnFields) {
                        if (newPosition.FieldGroupPositionBefore || cIndex >= totalNoOfFields - 1) {
                            destinationIndex = cIndex;
                        } else {
                            destinationIndex = cIndex + 1;
                        }
                    } else {
                        if (cValue === newPosition.SourceIndex) {
                            sourceIndex = cIndex;
                        }
                    }

                    if (destinationIndex >= 0 && sourceIndex >= 0) {
                        break;
                    }
                }

                if (destinationIndex >= 0 && sourceIndex >= 0 && destinationIndex !== sourceIndex) {
                    let arr = this.RepositionedReadOrderOfColumnFields;
                    arr = [...arr.slice(0, sourceIndex), ...arr.slice(sourceIndex + 1)];
                    arr = [...arr.slice(0, destinationIndex), newPosition.SourceIndex, ...arr.slice(destinationIndex)];
                    this.RepositionedReadOrderOfColumnFields = arr;
                }
            }
        }

        for (let indexOfField = 0; indexOfField < this.OriginalReadOrderOfColumnFields.length; indexOfField++) {
            const jsonPathKey = this.OriginalReadOrderOfColumnFields[indexOfField].toString();
            const columnField = this.GetColumnFieldByFieldGroupJsonPathKey(jsonPathKey);
            if (columnField) {
                for (let readIndex = 0; readIndex < this.RepositionedReadOrderOfColumnFields.length; readIndex++) {
                    const indexOfFieldInReadOrder = this.RepositionedReadOrderOfColumnFields[readIndex];
                    if (indexOfFieldInReadOrder === indexOfField) {
                        columnField.IndexInRepositionedColumnFields = readIndex;
                    }
                }
            }
        }
    }
}
