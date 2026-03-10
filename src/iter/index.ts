/**
 * Package iter provides higher order functions like Filter, ForEach, and Map against a metadata model.
 *
 * It allows you to traverse, transform, and filter the hierarchical structure of a metadata model.
 * This is essential for dynamic processing of metadata where the structure might be deep and recursive.
 *
 * Key features:
 * - **Filter**: Recursively removes fields in a MetadataModel based on a callback.
 * - **Map**: Recursively modifies fields in a MetadataModel.
 * - **ForEach**: Recursively loops through fields in a MetadataModel.
 *
 * # Core Concepts
 *
 * - **{@link FilterCallback}**: The function signature used to determine if a field should be retained or removed.
 * - **{@link MapCallback}**: The function signature used to transform a field.
 * - **{@link ForEachCallback}**: The function signature used to iterate over fields.
 *
 * # Usage
 *
 * ## Filter
 *
 * Filter recursively removes fields in a MetadataModel based on a callback.
 *
 * @example
 * ```typescript
 * import { Filter } from '@iter';
 * import { FieldGroupProperties } from '@core';
 * import { core } from '@rogonion/js-json';
 *
 * const sourceMetadataModel: core.JsonObject = { ... };
 *
 * const updatedMetadataModel = Filter(sourceMetadataModel, (fieldGroup: core.JsonObject) => {
 *     const fieldGroupName = fieldGroup[FieldGroupProperties.Name] as string;
 *     if (fieldGroupName && fieldGroupName.endsWith("Name")) {
 *         return [false, false];
 *     }
 *     return [true, false];
 * });
 * ```
 *
 * ## Map
 *
 * Map recursively modifies fields in a MetadataModel.
 *
 * @example
 * ```typescript
 * import { Map } from '@iter';
 * import { FieldGroupProperties } from '@core';
 * import { core } from '@rogonion/js-json';
 *
 * const sourceMetadataModel: core.JsonObject = { ... };
 *
 * const updatedMetadataModel = Map(sourceMetadataModel, (fieldGroup: core.JsonObject) => {
 *     const fieldGroupName = fieldGroup[FieldGroupProperties.Name] as string;
 *     if (fieldGroupName && fieldGroupName.endsWith("Code")) {
 *         fieldGroup[FieldGroupProperties.Name] = fieldGroupName + " Found";
 *     }
 *     return [fieldGroup, false];
 * });
 * ```
 *
 * ## ForEach
 *
 * ForEach recursively loops through fields in a MetadataModel.
 *
 * @example
 * ```typescript
 * import { ForEach } from '@iter';
 * import { core } from '@rogonion/js-json';
 *
 * const sourceMetadataModel: core.JsonObject = { ... };
 * let noOfIterations = 0;
 *
 * ForEach(sourceMetadataModel, (fieldGroup: core.JsonObject) => {
 *     noOfIterations++;
 *     return [false, false];
 * });
 * ```
 *
 * @packageDocumentation
 */
export * from './filter';
export * from './map';
export * from './for_each';
