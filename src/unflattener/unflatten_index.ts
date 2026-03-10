import type { FlattenedRow } from '@flattener';
import { core, path, schema } from '@rogonion/js-json';

/**
 * Handles the generation of unique keys (signatures) for rows based on primary key columns.
 */
export class Signature {
    private _Converter: schema.Conversion = new schema.Conversion();
    public set Converter(value: schema.Conversion) {
        this._Converter = value;
    }

    private _SignatureSchema: schema.DynamicSchemaNode = Object.assign(new schema.DynamicSchemaNode(), {
        Kind: schema.DataKind.String,
        TypeOf: 'string'
    });
    public set SignatureSchema(value: schema.DynamicSchemaNode) {
        this._SignatureSchema = value;
    }

    private _JoinSymbol: string = '|';
    public set JoinSymbol(value: string) {
        this._JoinSymbol = value;
    }

    /**
     * Creates a deterministic unique key for a set of columns (the PKs).
     *
     * It uses the {@link Signature._JoinSymbol} separator to prevent concatenation collisions.
     * @param row
     * @param readOrderOfRow
     */
    public GenerateSignature(row: FlattenedRow, readOrderOfRow: number[]): string {
        // Optimization: Singleton groups (no PK) always return empty string
        if (readOrderOfRow.length === 0) {
            return '';
        }

        const parts: string[] = [];

        for (const colIdx of readOrderOfRow) {
            // 1. Safety Checks
            if (colIdx >= row.length) {
                parts.push('nil');
                continue;
            }

            const val = row[colIdx];
            if (val === null || val === undefined) {
                parts.push('nil');
                continue;
            }

            // 2. Fast Path (Primitives)
            if (typeof val === 'string') {
                parts.push(val);
                continue;
            }
            if (typeof val === 'number' || typeof val === 'bigint') {
                parts.push(val.toString());
                continue;
            }
            if (typeof val === 'boolean') {
                parts.push(val ? 't' : 'f');
                continue;
            }

            // 3. Converter
            try {
                const convertedVal = this._Converter.ConvertNode(val, this._SignatureSchema);
                if (convertedVal !== null && convertedVal !== undefined) {
                    parts.push(String(convertedVal));
                    continue;
                }
            } catch (e) {
                // ignore
            }

            // 4. Fallback
            parts.push(String(val));
        }

        return parts.join(this._JoinSymbol);
    }
}

/**
 * Represents a specific instance of an element (e.g., "Employee #1").
 */
export class GroupIndexNode {
    private _JsonPath: path.JSONPath = '';
    public get JsonPath(): path.JSONPath {
        return this._JsonPath;
    }
    public set JsonPath(value: path.JSONPath) {
        this._JsonPath = value;
    }

    /**
     * The resolved index of THIS node int its parent's list.
     */
    private _MyIndex: number = 0;
    public get MyIndex(): number {
        return this._MyIndex;
    }
    public set MyIndex(value: number) {
        this._MyIndex = value;
    }

    /**
     * Nested groups belonging to this instance.
     *
     * Key is the group suffix (e.g., "Address", "Profile").
     */
    private _Groups: GroupIndexNodeGroups = {};
    public get Groups(): GroupIndexNodeGroups {
        return this._Groups;
    }
    public set Groups(value: GroupIndexNodeGroups) {
        this._Groups = value;
    }

    /**
     * Retrieves or creates a child {@link GroupCollection} for a specific nested group suffix.
     * @param suffix
     */
    public GetOrCreateGroup(suffix: string): GroupCollection {
        if (suffix in this.Groups) {
            return this.Groups[suffix];
        }

        const newGroupCollection = new GroupCollection();
        newGroupCollection.NextIndex = 0;
        newGroupCollection.Instances = {};
        this.Groups[suffix] = newGroupCollection;

        return newGroupCollection;
    }

    public toJSON() {
        return {
            JsonPath: this.JsonPath,
            MyIndex: this.MyIndex,
            Groups: this.Groups
        };
    }

    public static fromJSON(json: any): GroupIndexNode {
        let data: any = json;
        if (typeof json === 'string') {
            data = JSON.parse(json);
        }
        const instance = new GroupIndexNode();
        if (data.JsonPath) {
            instance.JsonPath = data.JsonPath;
        }
        if (core.IsNumber(data.MyIndex)) {
            instance.MyIndex = data.MyIndex;
        }
        if (data.Groups) {
            instance.Groups = data.Groups;
        }
        return instance;
    }
}

/**
 * A map of nested group collections.
 */
export type GroupIndexNodeGroups = { [key: string]: GroupCollection };

/**
 * Represents a list of child nodes of a specific type
 * (e.g., The list of Addresses belonging to Emplyee #1).
 *
 * It holds the state required to append new items to this specific list.
 */
export class GroupCollection {
    /**
     * The Counter: Tracks the next available index for this list.
     */
    private _NextIndex: number = 0;
    public get NextIndex(): number {
        return this._NextIndex;
    }
    public set NextIndex(value: number) {
        this._NextIndex = value;
    }

    /**
     * The Registry: Hash map of current elements.
     *
     * Key is the unique signature (Primary Key).
     */
    private _Instances: GroupCollectionInstances = {};
    public get Instances(): GroupCollectionInstances {
        return this._Instances;
    }
    public set Instances(value: GroupCollectionInstances) {
        this._Instances = value;
    }

    /**
     * Retrieves or creates a {@link GroupIndexNode} for a given signature (Primary Key).
     * @param signature
     * @param jsonPath
     */
    public GetOrCreateInstance(signature: string, jsonPath: path.JSONPath): [GroupIndexNode, number] {
        if (signature in this.Instances) {
            const instance = this.Instances[signature];
            return [instance, instance.MyIndex];
        }

        const newIdx = this.NextIndex;
        const newNode = new GroupIndexNode();
        newNode.JsonPath = jsonPath;
        newNode.MyIndex = newIdx;
        this.Instances[signature] = newNode;
        this.NextIndex++;
        return [newNode, newIdx];
    }

    public toJSON() {
        return {
            NextIndex: this.NextIndex,
            Instances: this.Instances
        };
    }

    public static fromJSON(json: any): GroupCollection {
        let data: any = json;
        if (typeof json === 'string') {
            data = JSON.parse(json);
        }
        const instance = new GroupCollection();
        if (core.IsNumber(data.NextIndex)) {
            instance.NextIndex = data.NextIndex;
        }
        if (data.Instances) {
            instance.Instances = data.Instances;
        }
        return instance;
    }
}

/**
 * Map of group instances keyed by their signature.
 */
export type GroupCollectionInstances = { [key: string]: GroupIndexNode };
