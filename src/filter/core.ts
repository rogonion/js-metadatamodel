import { core, path } from '@rogonion/js-json';
import { MetadataModelError } from '@core';
import { isConditionTrue } from './filter_condition_true';

/**
 * FilterContext represents the current module processing the query.
 */
export interface FilterContext {
    /** getFieldGroupByJsonPathKey retrieves field/group properties at path. */
    getFieldGroupByJsonPathKey(path: path.JSONPath): core.JsonObject;

    /** isErrorsSilenced if set to `true`, errors encountered default to the current context condition being `false`. */
    isErrorsSilenced(): boolean;
}

/**
 * ConditionTrue
 *
 * @param ctx - Current module processing the filter query.
 * @param fieldGroupJsonPathKey - Current core.FieldGroupJsonPathKey for field/group in metadata model. Can be used to fetch the field/group properties using ctx.
 * @param filterCondition - the filter condition key that caused the function to be called.
 * @param valueFound - the value to execute the filter against.
 * @param filterValue - the filter condition value.
 */
export type ConditionTrue = (
    ctx: FilterContext,
    fieldGroupJsonPathKey: path.JSONPath,
    filterCondition: string,
    valueFound: any,
    filterValue: core.JsonObject
) => boolean;

/**
 * FilterProcessors represents a map of filter condition processors.
 * The key being a unique FilterCondition like FilterConditionNoOfEntriesGreaterThan and the value being a function that returns whether condition is true.
 */
export type FilterProcessors = {
    [key: string]: ConditionTrue;
};

/** Constants for filter condition properties. */
export const FilterConditionProps = {
    Value: 'Value',
    Values: 'Values',
    DateTimeFormat: 'DateTimeFormat',
    CaseInsensitive: 'CaseInsensitive',
    AssumedFieldType: 'AssumedFieldType'
} as const;
export type FilterConditionProp = (typeof FilterConditionProps)[keyof typeof FilterConditionProps];

/** Constants for query condition properties. */
export const QueryConditionProps = {
    Type: 'Type',
    Negate: 'Negate',
    Value: 'Value'
} as const;
export type QueryConditionProp = (typeof QueryConditionProps)[keyof typeof QueryConditionProps];

/** The "Type" property in the query module. */
export const QuerySectionTypes = {
    LogicalOperator: 'LogicalOperator',
    FieldGroup: 'FieldGroup'
} as const;
export type QuerySectionType = (typeof QuerySectionTypes)[keyof typeof QuerySectionTypes];

/** Constants for logical operators. */
export const LogicalOperatorValues = {
    And: 'And',
    Or: 'Or'
} as const;
export type LogicalOperatorValue = (typeof LogicalOperatorValues)[keyof typeof LogicalOperatorValues];

/** LogicalOperators returns a list of supported logical operators. */
export const SupportedLogicalOperators = [LogicalOperatorValues.And, LogicalOperatorValues.Or] as const;
export type SupportedLogicalOperator = (typeof SupportedLogicalOperators)[number];

/** GetQuerySectionTypeLogicalOperator retrieves the logical operator from the query condition. */
export function GetQuerySectionTypeLogicalOperator(queryCondition: core.JsonObject): SupportedLogicalOperator {
    const key = 'LogicalOperator';
    const logicalOperator = queryCondition[key];

    if (typeof logicalOperator === 'string') {
        if (!(SupportedLogicalOperators as readonly string[]).includes(logicalOperator)) {
            throw new MetadataModelError(`invalid logical operator value '${logicalOperator}'`);
        }
        return logicalOperator as SupportedLogicalOperator;
    } else {
        return LogicalOperatorValues.And;
    }
}

/** Filter query conditions */
export const FilterConditions = {
    NoOfEntriesGreaterThan: 'NoOfEntriesGreaterThan',
    NoOfEntriesLessThan: 'NoOfEntriesLessThan',
    NoOfEntriesEqualTo: 'NoOfEntriesEqualTo',
    GreaterThan: 'GreaterThan',
    LessThan: 'LessThan',
    EqualTo: 'EqualTo',
    BeginsWith: 'BeginsWith',
    EndsWith: 'EndsWith',
    Contains: 'Contains'
} as const;
export type FilterCondition = (typeof FilterConditions)[keyof typeof FilterConditions];

/** DefaultFilterProcessors returns a set of filter processors built on assumption of json-like data. */
export function DefaultFilterProcessors(): FilterProcessors {
    return {
        [FilterConditions.NoOfEntriesGreaterThan]: isConditionTrue,
        [FilterConditions.NoOfEntriesLessThan]: isConditionTrue,
        [FilterConditions.NoOfEntriesEqualTo]: isConditionTrue,
        [FilterConditions.GreaterThan]: isConditionTrue,
        [FilterConditions.LessThan]: isConditionTrue,
        [FilterConditions.EqualTo]: isConditionTrue,
        [FilterConditions.BeginsWith]: isConditionTrue,
        [FilterConditions.EndsWith]: isConditionTrue,
        [FilterConditions.Contains]: isConditionTrue
    };
}

/**
 * Filterable represents a unique filter condition.
 * Should serve as the base for building custom filter processing tools.
 */
export interface Filterable {
    /** UniqueKey represents a unique filter condition key in a system. */
    getUniqueKey(): string;
}
