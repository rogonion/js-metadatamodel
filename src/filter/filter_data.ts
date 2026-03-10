import { core, jsobject, path } from '@rogonion/js-json';
import { JsonPathToValue, MetadataModelError } from '@core';
import {
    DefaultFilterProcessors,
    type FilterProcessors,
    type FilterContext,
    QueryConditionProps,
    QuerySectionTypes,
    GetQuerySectionTypeLogicalOperator,
    LogicalOperatorValues,
    type SupportedLogicalOperator
} from './core';

export class DataFilter implements FilterContext {
    /**
     * Used in looping through values using {@link jsobject.JSObject.ForEach}.
     */
    // @ts-expect-error TS2564
    private _SourceData: jsobject.JSObject;
    public set SourceData(value: jsobject.JSObject | any) {
        this._SourceData =
            value instanceof jsobject.JSObject ? value : Object.assign(new jsobject.JSObject(), { Source: value });
    }

    /**
     * Used by {@link DataFilter.GetFieldGroupByJsonPathKey}.
     */
    // @ts-expect-error TS2564
    private _MetadataModelObject: jsobject.JSObject;
    public set MetadataModelObject(value: jsobject.JSObject | any) {
        this._MetadataModelObject =
            value instanceof jsobject.JSObject ? value : Object.assign(new jsobject.JSObject(), { Source: value });
    }

    /**
     * Set of functions to process filter conditions by unique filter key.
     */
    // @ts-expect-error TS2564
    private _DefaultFilterProcessors: FilterProcessors;
    public set DefaultFilterProcessors(value: FilterProcessors) {
        this._DefaultFilterProcessors = value;
    }

    /**
     * Set the root source data within {@link DataFilter._SourceData} for filtering against sub-set of {@link DataFilter._SourceData}.
     *
     * Example: `$.GroupFields[*].Address`
     */
    private _RootJsonPathKey: path.JSONPath = path.JsonpathKeyRoot;
    public set RootJsonPathKey(value: path.JSONPath) {
        this._RootJsonPathKey = value;
    }

    /**
     * Must match {@link DataFilter._RootJsonPathKey} e.g., `$[2].Address`
     *
     * Combined with {@link DataFilter._RootJsonPathKey}, this means filter conditions will be executed against array found at path in {@link DataFilter._SourceData}.
     */
    private _RootJsonPathToValue: path.JSONPath = path.JsonpathKeyRoot;
    public set RootJsonPathToValue(value: path.JSONPath) {
        this._RootJsonPathToValue = value;
    }

    /**
     * If set to `true`, errors the module throws directly will default to the current context condition being `false`.
     *
     */
    private _SilenceAllErrors: boolean = true;
    public set SilenceAllErrors(value: boolean) {
        this._SilenceAllErrors = value;
    }

    constructor(sourceData: jsobject.JSObject | any, metadataModelObject: jsobject.JSObject | any) {
        this.SourceData = sourceData;
        this.MetadataModelObject = metadataModelObject;
        this.DefaultFilterProcessors = DefaultFilterProcessors();
    }

    public getFieldGroupByJsonPathKey(jsonPath: path.JSONPath): core.JsonObject {
        const jsonPathToValue = Object.assign(new JsonPathToValue(), { RemoveGroupFields: false }).Get(
            jsonPath,
            undefined
        );
        const noOfResults = this._MetadataModelObject.Get(jsonPathToValue);
        if (noOfResults === 0) {
            throw new MetadataModelError('get field/group failed');
        }
        const val = this._MetadataModelObject.ValueFound;
        if (!core.IsPlainObject(val)) {
            throw new MetadataModelError('value found not JsonObject');
        }
        return val as core.JsonObject;
    }

    public isErrorsSilenced(): boolean {
        return this._SilenceAllErrors;
    }

    public filter(
        queryCondition: core.JsonObject,
        rootJsonPathKey: path.JSONPath = path.JsonpathKeyRoot,
        rootJsonPathToValue: path.JSONPath = path.JsonpathKeyRoot
    ): number[] {
        this._RootJsonPathKey = rootJsonPathKey || path.JsonpathKeyRoot;
        this._RootJsonPathToValue = rootJsonPathToValue || path.JsonpathKeyRoot;

        const noOfResults = this._SourceData.Get(this._RootJsonPathToValue);
        if (noOfResults === 0) {
            if (this._SilenceAllErrors) return [];
            throw new MetadataModelError('get root value yielded 0 results');
        }

        const rootValue = this._SourceData.ValueFound;
        if (!Array.isArray(rootValue)) {
            if (this._SilenceAllErrors) return [];
            throw new MetadataModelError('root value should be array');
        }

        const filterExcludeIndexes: number[] = [];
        const rootObj = Object.assign(new jsobject.JSObject(), { Source: rootValue });
        const arrayPathPlaceholder = path.JsonpathLeftBracket + path.JsonpathKeyIndexAll + path.JsonpathRightBracket;
        const iteratePath = path.JsonpathKeyRoot + arrayPathPlaceholder;

        rootObj.ForEach(iteratePath, (jsonPath: path.RecursiveDescentSegment, value: any) => {
            if (Object.keys(queryCondition).length === 0) {
                return false;
            }

            const lastPathSegment = jsonPath[jsonPath.length - 1];
            if (!core.IsNumber(lastPathSegment.Index)) {
                if (this._SilenceAllErrors) return false;
                throw Object.assign(new MetadataModelError('in root value loop, last path segment is not an index'), {
                    Data: { Path: jsonPath }
                });
            }

            try {
                const ok = this.isQueryConditionTrue(queryCondition, value, jsonPath);
                if (!ok) {
                    filterExcludeIndexes.push(lastPathSegment.Index);
                }
            } catch (err) {
                if (this._SilenceAllErrors) return false;
                throw err;
            }

            return false;
        });

        return filterExcludeIndexes;
    }

    private isQueryConditionTrue(
        queryCondition: core.JsonObject,
        currentValue: any,
        jsonPath: path.RecursiveDescentSegment
    ): boolean {
        const queryConditionType = queryCondition[QueryConditionProps.Type];
        if (!core.IsString(queryConditionType)) {
            return this.returnErrorOrFalse(
                Object.assign(new MetadataModelError(`Key '${QueryConditionProps.Type}' is not valid`), {
                    Data: { QueryCondition: queryCondition }
                })
            );
        }

        switch (queryConditionType) {
            case QuerySectionTypes.LogicalOperator:
                return this.isRecursiveLogicalOperatorTrue(queryCondition, currentValue, jsonPath);
            case QuerySectionTypes.FieldGroup:
                return this.isRecursiveFieldGroupTrue(queryCondition, currentValue, jsonPath);
            default:
                return this.returnErrorOrFalse(
                    Object.assign(new MetadataModelError(`Unknown query condition type: ${queryConditionType}`), {
                        Data: { QueryCondition: queryCondition }
                    })
                );
        }
    }

    private isRecursiveLogicalOperatorTrue(
        queryCondition: core.JsonObject,
        currentValue: any,
        jsonPath: path.RecursiveDescentSegment
    ): boolean {
        let negate = false;
        if (typeof queryCondition[QueryConditionProps.Negate] === 'boolean') {
            negate = queryCondition[QueryConditionProps.Negate] as boolean;
        }

        let logicalOperator: SupportedLogicalOperator;
        try {
            logicalOperator = GetQuerySectionTypeLogicalOperator(queryCondition);
        } catch (err) {
            return this.returnErrorOrFalse(err instanceof Error ? err : new Error(String(err)));
        }

        const conditions = queryCondition[QueryConditionProps.Value];
        if (!Array.isArray(conditions)) {
            return this.returnErrorOrFalse(
                Object.assign(new MetadataModelError(`Key '${QueryConditionProps.Value}' is not valid`), {
                    Data: { QueryCondition: queryCondition }
                })
            );
        }

        const conditionsResults: boolean[] = [];
        for (const condition of conditions) {
            if (!core.IsPlainObject(condition)) {
                return this.returnErrorOrFalse(
                    Object.assign(new MetadataModelError('condition not JsonObject'), {
                        Data: { QueryCondition: queryCondition }
                    })
                );
            }

            let conditionTrue = false;
            try {
                conditionTrue = this.isQueryConditionTrue(condition as core.JsonObject, currentValue, jsonPath);
            } catch (err) {
                return this.returnErrorOrFalse(err instanceof Error ? err : new Error(String(err)));
            }

            if (conditionTrue) {
                if (logicalOperator === LogicalOperatorValues.Or) {
                    return !negate;
                }
            } else {
                if (logicalOperator === LogicalOperatorValues.And) {
                    return negate;
                }
            }
            conditionsResults.push(conditionTrue);
        }

        if (logicalOperator === LogicalOperatorValues.Or) {
            const containsTrue = conditionsResults.includes(true);
            return negate ? !containsTrue : containsTrue;
        } else {
            const containsFalse = conditionsResults.includes(false);
            return negate ? containsFalse : !containsFalse;
        }
    }

    private isRecursiveFieldGroupTrue(
        queryCondition: core.JsonObject,
        currentValue: any,
        jsonPath: path.RecursiveDescentSegment
    ): boolean {
        let negate = false;
        if (typeof queryCondition[QueryConditionProps.Negate] === 'boolean') {
            negate = queryCondition[QueryConditionProps.Negate] as boolean;
        }

        let logicalOperator: SupportedLogicalOperator;
        try {
            logicalOperator = GetQuerySectionTypeLogicalOperator(queryCondition);
        } catch (err) {
            return this.returnErrorOrFalse(err instanceof Error ? err : new Error(String(err)));
        }

        const conditions = queryCondition[QueryConditionProps.Value];
        if (!core.IsPlainObject(conditions)) {
            return this.returnErrorOrFalse(
                Object.assign(new MetadataModelError(`Key '${QueryConditionProps.Value}' is not valid`), {
                    Data: { QueryCondition: queryCondition }
                })
            );
        }

        const conditionsResults: boolean[] = [];
        for (const [jsonPathKey, condition] of Object.entries(conditions as core.JsonObject)) {
            if (!core.IsPlainObject(condition)) {
                return this.returnErrorOrFalse(
                    Object.assign(new MetadataModelError('condition not JsonObject'), {
                        Data: { QueryCondition: queryCondition }
                    })
                );
            }

            let conditionTrue = false;
            try {
                conditionTrue = this.isFieldGroupConditionTrue(
                    jsonPathKey,
                    condition as core.JsonObject,
                    currentValue,
                    jsonPath
                );
            } catch (err) {
                return this.returnErrorOrFalse(err instanceof Error ? err : new Error(String(err)));
            }

            if (!conditionTrue) {
                if (logicalOperator === LogicalOperatorValues.And) {
                    return negate;
                }
            }
            conditionsResults.push(conditionTrue);
        }

        if (logicalOperator === LogicalOperatorValues.Or) {
            const containsTrue = conditionsResults.includes(true);
            return negate ? !containsTrue : containsTrue;
        } else {
            const containsFalse = conditionsResults.includes(false);
            return negate ? containsFalse : !containsFalse;
        }
    }

    private isFieldGroupConditionTrue(
        jsonPathKey: path.JSONPath,
        queryCondition: core.JsonObject,
        currentValue: any,
        _jsonPath: path.RecursiveDescentSegment
    ): boolean {
        if (Object.keys(queryCondition).length === 0) {
            return this.returnErrorOrFalse(
                Object.assign(new MetadataModelError('Query condition is empty'), {
                    Data: { QueryCondition: queryCondition }
                })
            );
        }

        const currentJsonPathKey = jsonPathKey.replace(this._RootJsonPathKey, path.JsonpathKeyRoot);
        const currentJsonPathToValue = Object.assign(new JsonPathToValue(), {
            ReplaceArrayPathPlaceholderWithActualIndexes: false
        }).Get(currentJsonPathKey, undefined);

        let orConditionTrue = false;
        Object.assign(new jsobject.JSObject(), { Source: currentValue }).ForEach(
            currentJsonPathToValue,
            (_jsonPath: path.RecursiveDescentSegment, value: any) => {
                let andConditionTrue = true;
                for (const [filterConditionKey, filterConditionData] of Object.entries(queryCondition)) {
                    if (!core.IsPlainObject(filterConditionData)) {
                        if (this._SilenceAllErrors) continue;
                        throw Object.assign(new MetadataModelError('filterConditionData not JsonObject'), {
                            Data: { QueryCondition: queryCondition }
                        });
                    }

                    if (filterConditionKey in this._DefaultFilterProcessors) {
                        const conditionTrue = this._DefaultFilterProcessors[filterConditionKey](
                            this,
                            currentJsonPathKey,
                            filterConditionKey,
                            value,
                            filterConditionData
                        );
                        if (!conditionTrue) {
                            andConditionTrue = false;
                            break;
                        }
                    } else {
                        if (this._SilenceAllErrors) continue;
                        throw Object.assign(
                            new MetadataModelError(
                                `filterConditionData not JsonObject or processor not found for ${filterConditionKey}`
                            ),
                            { Data: { QueryCondition: queryCondition } }
                        );
                    }
                }
                if (andConditionTrue) {
                    orConditionTrue = true;
                    return true; // Stop loop
                }
                return false;
            }
        );

        return orConditionTrue;
    }

    private returnErrorOrFalse(err: Error): boolean {
        if (this._SilenceAllErrors) {
            return false;
        }
        throw err;
    }
}
