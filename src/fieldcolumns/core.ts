import { FieldGroupProperties } from '@core';
import { core, path } from '@rogonion/js-json';

/**
 * Represents the position and context of a field within the metadata model hierarchy.
 *
 * It tracks the JSON path, view settings (e.g., pivoting), and relative positioning.
 */
export class FieldColumnPosition {
    private _SourceIndex: number = 0;
    public set SourceIndex(value: number) {
        this._SourceIndex = value;
    }
    public get SourceIndex(): number {
        return this._SourceIndex;
    }

    private _FieldGroupJsonPathKey: path.JSONPath = '';
    public set FieldGroupJsonPathKey(value: path.JSONPath) {
        this._FieldGroupJsonPathKey = value;
    }
    public get FieldGroupJsonPathKey(): path.JSONPath {
        return this._FieldGroupJsonPathKey;
    }

    private _FieldViewInSeparateColumns: boolean = false;
    public set FieldViewInSeparateColumns(value: boolean) {
        this._FieldViewInSeparateColumns = value;
    }
    public get FieldViewInSeparateColumns(): boolean {
        return this._FieldViewInSeparateColumns;
    }

    /**
     * Indicates if individual entries in a single field should be viewed as separate columns.
     */
    private _FieldViewValuesInSeparateColumnsHeaderIndex: number = 0;
    public set FieldViewValuesInSeparateColumnsHeaderIndex(value: number) {
        this._FieldViewValuesInSeparateColumnsHeaderIndex = value;
    }
    public get FieldViewValuesInSeparateColumnsHeaderIndex(): number {
        return this._FieldViewValuesInSeparateColumnsHeaderIndex;
    }

    /**
     * For fields in 1D groups that should be viewed in separate columns.
     */
    private _GroupViewInSeparateColumns: boolean = false;
    public set GroupViewInSeparateColumns(value: boolean) {
        this._GroupViewInSeparateColumns = value;
    }
    public get GroupViewInSeparateColumns(): boolean {
        return this._GroupViewInSeparateColumns;
    }

    private _GroupViewValuesInSeparateColumnsHeaderIndex: number = 0;
    public set GroupViewValuesInSeparateColumnsHeaderIndex(value: number) {
        this._GroupViewValuesInSeparateColumnsHeaderIndex = value;
    }
    public get GroupViewValuesInSeparateColumnsHeaderIndex(): number {
        return this._GroupViewValuesInSeparateColumnsHeaderIndex;
    }

    private _GroupViewParentJsonPathKey: path.JSONPath = '';
    public set GroupViewParentJsonPathKey(value: path.JSONPath) {
        this._GroupViewParentJsonPathKey = value;
    }
    public get GroupViewParentJsonPathKey(): path.JSONPath {
        return this._GroupViewParentJsonPathKey;
    }

    private _FieldJsonPathKeySuffix: string = '';
    public set FieldJsonPathKeySuffix(value: string) {
        this._FieldJsonPathKeySuffix = value;
    }
    public get FieldJsonPathKeySuffix(): string {
        return this._FieldJsonPathKeySuffix;
    }

    private _FieldGroupPositionBefore: boolean = false;
    public set FieldGroupPositionBefore(value: boolean) {
        this._FieldGroupPositionBefore = value;
    }
    public get FieldGroupPositionBefore(): boolean {
        return this._FieldGroupPositionBefore;
    }

    public toJSON(): object {
        return {
            SourceIndex: this.SourceIndex,
            FieldGroupJsonPathKey: this.FieldGroupJsonPathKey,
            FieldViewInSeparateColumns: this.FieldViewInSeparateColumns,
            FieldViewValuesInSeparateColumnsHeaderIndex: this.FieldViewValuesInSeparateColumnsHeaderIndex,
            GroupViewInSeparateColumns: this.GroupViewInSeparateColumns,
            GroupViewValuesInSeparateColumnsHeaderIndex: this.GroupViewValuesInSeparateColumnsHeaderIndex,
            GroupViewParentJsonPathKey: this.GroupViewParentJsonPathKey,
            FieldJsonPathKeySuffix: this.FieldJsonPathKeySuffix,
            FieldGroupPositionBefore: this.FieldGroupPositionBefore
        };
    }

    public static fromJSON(json: any): FieldColumnPosition {
        let data: any = json;
        if (typeof json === 'string') {
            data = JSON.parse(json);
        }

        const instance = new FieldColumnPosition();
        if (core.IsDefined(data.SourceIndex)) instance.SourceIndex = data.SourceIndex;
        if (core.IsDefined(data.FieldGroupJsonPathKey)) instance.FieldGroupJsonPathKey = data.FieldGroupJsonPathKey;
        if (core.IsDefined(data.FieldViewInSeparateColumns))
            instance.FieldViewInSeparateColumns = data.FieldViewInSeparateColumns;
        if (core.IsDefined(data.FieldViewValuesInSeparateColumnsHeaderIndex))
            instance.FieldViewValuesInSeparateColumnsHeaderIndex = data.FieldViewValuesInSeparateColumnsHeaderIndex;
        if (core.IsDefined(data.GroupViewInSeparateColumns))
            instance.GroupViewInSeparateColumns = data.GroupViewInSeparateColumns;
        if (core.IsDefined(data.GroupViewValuesInSeparateColumnsHeaderIndex))
            instance.GroupViewValuesInSeparateColumnsHeaderIndex = data.GroupViewValuesInSeparateColumnsHeaderIndex;
        if (core.IsDefined(data.GroupViewParentJsonPathKey))
            instance.GroupViewParentJsonPathKey = data.GroupViewParentJsonPathKey;
        if (core.IsDefined(data.FieldJsonPathKeySuffix)) instance.FieldJsonPathKeySuffix = data.FieldJsonPathKeySuffix;
        if (core.IsDefined(data.FieldGroupPositionBefore))
            instance.FieldGroupPositionBefore = data.FieldGroupPositionBefore;
        return instance;
    }

    public toString(): string {
        if (this.GroupViewInSeparateColumns) {
            const suffix = this.FieldJsonPathKeySuffix
                ? `${path.JsonpathDotNotation}${this.FieldJsonPathKeySuffix}`
                : '';
            return `${this.GroupViewParentJsonPathKey}${path.JsonpathDotNotation}${FieldGroupProperties.GroupFields}${path.JsonpathLeftBracket}${this.GroupViewValuesInSeparateColumnsHeaderIndex}${path.JsonpathRightBracket}${suffix}`;
        }

        if (this.FieldViewInSeparateColumns) {
            return `${this.FieldGroupJsonPathKey}${path.JsonpathLeftBracket}${this.FieldViewValuesInSeparateColumnsHeaderIndex}${path.JsonpathRightBracket}`;
        }

        return this.FieldGroupJsonPathKey;
    }
}

/**
 * Array of FieldColumnPosition;
 */
export type FieldColumnPositions = FieldColumnPosition[];

/**
 * Array of FieldColumnPosition. Ensure entries are cloned.
 */
export type RepositionFieldColumns = FieldColumnPosition[];

export const FieldColumnsErrorCodes = {
    /**
     * Default error.
     */
    FieldColumnsError: 'field columns error'
} as const;
export type FieldColumnsErrorCode = (typeof FieldColumnsErrorCodes)[keyof typeof FieldColumnsErrorCodes];
