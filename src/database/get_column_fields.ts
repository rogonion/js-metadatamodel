import { DatabaseErrorCodes } from './core';
import {
    type FieldGroupPropertiesMatch,
    type MetadataModelGroupReadOrderOfFields,
    FieldGroupProperties,
    firstMatch,
    IsFieldAGroup,
    MetadataModelError
} from '@core';
import { ForEach } from '@iter';
import { core, schema } from '@rogonion/js-json';

export class GetColumnFields {
    // @ts-expect-error TS2564
    private _ColumnFields: ColumnFields;
    public get ColumnFields(): ColumnFields {
        return this._ColumnFields;
    }

    private _TableCollectionUID: string | undefined;
    public set TableCollectionUID(value: string) {
        this._TableCollectionUID = value;
        this._isTableCollectionUIDValid = core.IsString(value) && value.length > 0;
    }
    private _isTableCollectionUIDValid: boolean = false;

    private _JoinDepth: number | undefined;
    public set JoinDepth(value: number) {
        this._JoinDepth = value;
        this._isJoinDepthValid = core.IsNumber(value);
    }
    private _isJoinDepthValid: boolean = false;

    private _TableCollectionName: string | undefined;
    public set TableCollectionName(value: string) {
        this._TableCollectionName = value;
        this._isTableCollectionNameValid = core.IsString(value) && value.length > 0;
    }
    private _isTableCollectionNameValid: boolean = false;

    private _Skip: FieldGroupPropertiesMatch | undefined;
    public set Skip(value: FieldGroupPropertiesMatch) {
        this._Skip = value;
    }

    private _Add: FieldGroupPropertiesMatch | undefined;
    public set Add(value: FieldGroupPropertiesMatch) {
        this._Add = value;
    }

    private _DefaultConverter: schema.DefaultConverter = new schema.Conversion();
    public set DefaultConverter(value: schema.DefaultConverter) {
        this._DefaultConverter = value;
    }

    /**
     * Extract database fields.
     * @param metadataModel
     */
    public Get(metadataModel: any): ColumnFields {
        if (!this._isTableCollectionUIDValid && (!this._isJoinDepthValid || !this._isTableCollectionNameValid)) {
            throw new MetadataModelError(
                'tableCollectionUID or joinDepth and tableCollectionName is required',
                undefined,
                DatabaseErrorCodes.GetColumnFieldsError
            );
        }

        this._ColumnFields = new ColumnFields();

        let forEachError: Error | undefined;
        ForEach(metadataModel, (fieldGroup: core.JsonObject) => {
            if (
                (core.IsDefined(this._Skip) && firstMatch(this._Skip, fieldGroup)) ||
                (core.IsDefined(this._Add) && !firstMatch(this._Add, fieldGroup))
            ) {
                return [false, false];
            }

            if (this._isTableCollectionUIDValid) {
                const uid = fieldGroup[FieldGroupProperties.DatabaseTableCollectionUid];
                if (uid !== this._TableCollectionUID) {
                    return [false, true];
                }
            } else if (this._isJoinDepthValid && this._isTableCollectionNameValid) {
                if (fieldGroup[FieldGroupProperties.DatabaseJoinDepth] === undefined) {
                    return [false, true];
                }

                let joinDepth = 0;
                try {
                    joinDepth = this._DefaultConverter.Convert(
                        fieldGroup[FieldGroupProperties.DatabaseJoinDepth],
                        Object.assign(new schema.DynamicSchemaNode(), { Kind: schema.DataKind.Number })
                    );
                } catch (e) {
                    forEachError = new MetadataModelError(
                        `convert joinDepth to number failed`,
                        e as Error,
                        DatabaseErrorCodes.GetColumnFieldsError
                    );
                    return [true, true];
                }

                const tableCollectionName = fieldGroup[FieldGroupProperties.DatabaseTableCollectionName];
                if (!core.IsString(tableCollectionName)) {
                    return [false, true];
                }

                if (tableCollectionName !== this._TableCollectionName || joinDepth !== this._JoinDepth) {
                    return [false, true];
                }
            } else {
                return [false, false];
            }

            if (IsFieldAGroup(fieldGroup)) {
                return [false, false];
            }

            const fieldColumnName = fieldGroup[FieldGroupProperties.DatabaseFieldColumnName];
            if (core.IsString(fieldColumnName) && fieldColumnName.length > 0) {
                if (this._ColumnFields.Fields[fieldColumnName]) {
                    forEachError = new MetadataModelError(
                        `duplicate fieldColumnName '${fieldColumnName}' found`,
                        undefined,
                        DatabaseErrorCodes.GetColumnFieldsError
                    );
                    return [true, true];
                }

                const newField = structuredClone(fieldGroup);
                this._ColumnFields.ColumnFieldsReadOrder.push(fieldColumnName);
                this._ColumnFields.Fields[fieldColumnName] = newField;
                return [false, false];
            } else {
                forEachError = new MetadataModelError(
                    `field column name not found in field group property`,
                    undefined,
                    DatabaseErrorCodes.GetColumnFieldsError
                );
                return [true, true];
            }
        });

        if (forEachError) {
            throw forEachError;
        }

        return this._ColumnFields;
    }
}

export class ColumnFields {
    /**
     * Read order of columns/fields.
     */
    private _ColumnFieldsReadOrder: MetadataModelGroupReadOrderOfFields = [];
    public set ColumnFieldsReadOrder(value: MetadataModelGroupReadOrderOfFields) {
        this._ColumnFieldsReadOrder = value;
    }
    public get ColumnFieldsReadOrder(): MetadataModelGroupReadOrderOfFields {
        return this._ColumnFieldsReadOrder;
    }

    /**
     * A map of database columns/fields properties from metadata model.
     */
    private _Fields: ColumnFieldsFields = {};
    public set Fields(value: ColumnFieldsFields) {
        this._Fields = value;
    }
    public get Fields(): ColumnFieldsFields {
        return this._Fields;
    }

    public toJSON(): core.JsonObject {
        return {
            ColumnFieldsReadOrder: this.ColumnFieldsReadOrder,
            Fields: this.Fields
        };
    }

    public static fromJSON(json: string | object) {
        let data: any = json;
        if (typeof json === 'string') {
            data = JSON.parse(json);
        }
        const instance = new ColumnFields();
        if (data.ColumnFieldsReadOrder) {
            instance.ColumnFieldsReadOrder = data.ColumnFieldsReadOrder;
        }
        if (data.Fields) {
            instance.Fields = data.Fields;
        }
        return instance;
    }
}

/**
 * A map of database columns/fields properties from metadata model.
 *
 * Key is the {@link FieldGroupProperties.JsonPathKey} suffix.
 */
export type ColumnFieldsFields = {
    [key: string]: core.JsonObject;
};
