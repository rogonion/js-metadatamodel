/**
 * Package flattener provides functionality to convert deeply nested data structures into flat 2D tables based on a Metadata Model.
 *
 * It acts as a "Projection" engine, mapping complex hierarchical data (like JSON or nested objects) into a linear format suitable for CSV exports, data analysis, or grid views.
 *
 * It can perform the following tasks:
 * - Recursively flatten nested objects and arrays into a 2D `FlattenedTable`.
 * - Handle one-to-many relationships by generating Cartesian products (row explosion).
 * - Handle specific fields by pivoting them into horizontal columns (horizontal expansion).
 * - Write the flattened results into a destination {@link jsobject.JSObject} using schema-based type conversion.
 * - Support batch processing via the {@link FLattener.Reset} method.
 *
 * # Usage
 *
 * ## Initialization
 *
 * 1. Create a new instance of the Flattener using its constructor, providing the Metadata Model that defines the structure.
 *
 * ```typescript
 * import { core, jsobject } from '@rogonion/js-json';
 * import { FLattener } from '@flattener';
 *
 * // ... load metadata model
 * let metadataModel: core.JsonObject = {};
 * const flattener = new FLattener(metadataModel);
 * ```
 *
 * 2. Optionally, configure column behavior (skipping/reordering) by setting the `ColumnFields` property.
 *
 * ```typescript
 * import { ColumnFields } from '@fieldcolumns';
 *
 * let columnFields: ColumnFields;
 * // ... initialize columnFields ...
 * flattener.ColumnFields = columnFields;
 * ```
 *
 * ## Flattening Data
 *
 * Use `Flatten` to process a source object. This method appends the results to the Flattener's internal state, allowing for batch accumulation.
 *
 * ```typescript
 * let sourceData: any; // e.g. {} or []
 * const sourceObj = new jsobject.JSObject();
 * sourceObj.Source = sourceData;
 *
 * flattener.Flatten(sourceObj);
 * ```
 *
 * ## Retrieving Results
 *
 * There are two ways to retrieve the flattened data:
 *
 * 1. **Direct Access:** Use `CurrentSourceObjectResult` to get the raw `FlattenedTable` (an `any[][]`).
 *
 * ```typescript
 * const table = flattener.CurrentSourceObjectResult;
 * ```
 *
 * 2. **Write to Destination:** Use `WriteToDestination` to map the results into a target {@link jsobject.JSObject}. This applies column reordering/skipping defined in `ColumnFields`.
 *
 * ```typescript
 * // Destination could be a 2D array, a CSV writer wrapper, etc.
 * const destObj = new jsobject.JSObject();
 * destObj.Source = [];
 * flattener.WriteToDestination(destObj);
 * ```
 *
 * ## Batch Processing
 *
 * To process large datasets in chunks, use the `Reset` method to clear the internal state without re-allocating the Flattener.
 *
 * ```typescript
 * for (const batch of hugeDataset) {
 *     const sourceObj = new jsobject.JSObject();
 *     sourceObj.Source = batch;
 *     flattener.Flatten(sourceObj);
 *
 *     // Process the current batch results
 *     const batchResult = flattener.CurrentSourceObjectResult;
 *
 *     flattener.Reset(); // Clear internal table for next batch
 * }
 * ```
 *
 * @packageDocumentation
 */
export * from './core';
export * from './flatten';
