/**
 * Package unflattener provides functionality to convert a 2D array/slice (FlattenedTable) back into a slice of complex objects based on a Metadata Model.
 *
 * It acts as the inverse of the `flattener` package. It reconstructs the hierarchical structure from flat data by using Primary Keys (defined in the Metadata Model) to group related rows together.
 *
 * It can perform the following tasks:
 * - Reconstruct nested objects and arrays from a flat table.
 * - Handle one-to-many relationships by grouping rows that share the same parent key.
 * - Handle pivoted columns (horizontal expansion) by mapping them back to their array representation.
 * - Write the reconstructed objects into a destination {@link jsobject.JSObject}.
 *
 * # Usage
 *
 * ## Initialization
 *
 * 1. Create a new instance of the {@link Unflattener} using its constructor. You also need a {@link Signature} generator which handles key creation.
 *
 * ```typescript
 * import { core, jsobject } from '@rogonion/js-json';
 * import { Unflattener, Signature } from '@unflattener';
 *
 * // ... load metadata model
 * let metadataModel: core.JsonObject = {};
 * const signature = new Signature();
 * const unflattener = new Unflattener(metadataModel, signature);
 * ```
 *
 * 2. Prepare the destination object. This should be an array of your target type.
 *
 * ```typescript
 * const destObj = new jsobject.JSObject();
 * destObj.Source = []; // or new MyStruct[]
 * unflattener.Destination = destObj;
 * ```
 *
 * ## Unflattening Data
 *
 * 1. Prepare your source data as a `FlattenedTable` (a `any[][]`).
 *
 * 2. Call `Unflatten`.
 *
 * ```typescript
 * // sourceTable is any[][]
 * unflattener.Unflatten(sourceTable);
 *
 * // destObj.Source now contains the reconstructed object graph.
 * ```
 *
 * @packageDocumentation
 */
export * from './core';
export * from './unflatten_index';
export * from './unflatten';
