import { path, core } from '@rogonion/js-json';
import { FieldGroupProperties } from './field_group_properties';

/**
 * Base error expected to be thrown by modules in/using this library.
 */
export class MetadataModelError extends Error {
    private _Data?: core.JsonObject;
    public get Data(): core.JsonObject | undefined {
        return this._Data;
    }
    public set Data(value: core.JsonObject | undefined) {
        this._Data = value;
    }

    constructor(message: string, cause?: Error, name?: string) {
        super(message, { cause });
        this.name = name || 'MetadataModelError';

        // Restore prototype chain for old environments
        Object.setPrototypeOf(this, MetadataModelError.prototype);
    }

    public static fromJSON(json: string | object): MetadataModelError {
        let data: any = json;
        if (typeof json === 'string') {
            data = JSON.parse(json);
        }

        let cause: Error | undefined;
        if (data.cause) {
            cause = new Error(data.cause.message || String(data.cause));
            if (data.cause.name) cause.name = data.cause.name;
            if (data.cause.stack) cause.stack = data.cause.stack;
        }

        const instance = new MetadataModelError(data.message || '', cause, data.name);
        if (data.Data) {
            instance.Data = data.Data;
        }
        if (data.stack) {
            instance.stack = data.stack;
        }
        return instance;
    }

    public toJSON(): object {
        return {
            name: this.name,
            message: this.message,
            stack: this.stack,
            cause: (this as any).cause,
            Data: this.Data
        };
    }
}

export const ArrayPathPlaceholder = path.JsonpathLeftBracket + path.JsonpathKeyIndexAll + path.JsonpathRightBracket;
export const GroupJsonPathPrefix =
    path.JsonpathDotNotation + FieldGroupProperties.GroupFields + ArrayPathPlaceholder + path.JsonpathDotNotation;

/**
 * For finding `[*]` in strings.
 */
export const ArrayPathRegex = /\[\*]/;

/**
 * For finding `GroupFields[*]` followed optionally by a dot.
 */
export const GroupFieldsPathRegex = /GroupFields\[\*](?:\.|)/;

/**
 * For finding `GroupFields` preceded optionally by a dot.
 */
export const GroupFieldsRegex = /(?:\.|)GroupFields/;

/**
 * For finding any character that is not alphanumeric.
 */
export const SpecialCharsRegex = /[^a-zA-Z0-9]+/;

/**
 * Represents type for GroupReadOrderOfFields property.
 */
export type MetadataModelGroupReadOrderOfFields = string[];

export const CoreErrorCodes = {
    /**
     * For when an argument is not valid for the current action.
     */
    ArgumentInvalid: 'argument invalid',
    /**
     * For when preparing {@link path.JSONPath} from metadata-model to value in object still contains {@link ArrayPathPlaceholder}.
     */
    SchemaPathError: 'path contains index placeholders'
} as const;
export type CoreErrorCode = (typeof CoreErrorCodes)[keyof typeof CoreErrorCodes];
