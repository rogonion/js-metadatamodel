/**
 * Package filter is for filtering through source data whose structure is defined by a metadata model.
 *
 * Designed to support both simple queries and deeply nested logical operator queries which are extensible and customizable.
 *
 * # Example Query Condition
 *
 * Below is an example query condition that is used to filter through data:
 *
 * ```json
 * {
 *   "Type": "LogicalOperator",
 *   "Negate": false,
 *   "LogicalOperator": "And",
 *   "Value": [
 *     {
 *       "Type": "LogicalOperator",
 *       "LogicalOperator": "Or",
 *       "Value": [
 *         {
 *           "Type": "FieldGroup",
 *           "Negate": false,
 *           "LogicalOperator": "And",
 *           "Value": {
 *             "$.GroupFields[*].Bio": {
 *               "EqualTo": {
 *                 "AssumedFieldType": "Any",
 *                 "Values": [
 *                   true,
 *                   "Yes"
 *                 ]
 *               }
 *             }
 *           }
 *         },
 *         {
 *           "Type": "FieldGroup",
 *           "Negate": false,
 *           "LogicalOperator": "And",
 *           "Value": {
 *             "$.GroupFields[*].Bio": {
 *               "EqualTo": {
 *                 "AssumedFieldType": "Text",
 *                 "Negate": true,
 *                 "Value": "no"
 *               }
 *             },
 *             "$.GroupFields[*].Occ": {
 *               "EqualTo": {
 *                 "AssumedFieldType": "Text",
 *                 "Negate": true,
 *                 "Value": "no"
 *               }
 *             }
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "Type": "FieldGroup",
 *       "Value": {
 *         "$.GroupFields[*].SiteAndGeoreferencing.GroupFields[*].Country": {
 *           "FullTextSearchQuery": {
 *             "AssumedFieldType": "Text",
 *             "Value": "Kenya",
 *             "ExactMatch": true
 *           }
 *         }
 *       }
 *     },
 *     {
 *       "Type": "FieldGroup",
 *       "Negate": false,
 *       "LogicalOperator": "And",
 *       "Value": {
 *         "$.GroupFields[*].SiteAndGeoreferencing.GroupFields[*].Sites.GroupFields[*].Coordinates.GroupFields[*].Latitude": {
 *           "GreaterThan": {
 *             "AssumedFieldType": "Number",
 *             "Value": 20.00
 *           },
 *           "LessThan": {
 *             "AssumedFieldType": "Number",
 *             "Value": 21.00
 *           }
 *         }
 *       }
 *     }
 *   ]
 * }
 * ```
 *
 * # Usage
 *
 * Example filtering data usage:
 *
 * ```typescript
 * import { DataFilter } from '@filter';
 * import { core, jsobject } from '@rogonion/js-json';
 *
 * // Set metadata model
 * const metadataModel: core.JsonObject = { ... };
 *
 * // Set source data
 * const sourceData = new jsobject.JSObject([]);
 *
 * // Set query condition
 * const queryCondition: core.JsonObject = { ... };
 *
 * // Set other properties using builder pattern setters or properties. Refer to DataFilter structure.
 * const filterData = new DataFilter(sourceData, metadataModel);
 *
 * const filterExcludeIndexes = filterData.filter(queryCondition, "", "");
 * ```
 *
 * @packageDocumentation
 */
export * from './core';
export * from './filter_data';
