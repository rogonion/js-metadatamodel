/**
 * Package fieldcolumns can be used to extract fields in a metadata model into a structure that resembles columns in a table.
 *
 * It can perform the following tasks:
 * - Extracts field properties into an ordered slice of fields, resembling columns in a table -> {@link ColumnFields}.
 * - Set the new read order of column fields after repositioning -> {@link ColumnFields.Reposition}.
 * - Set column fields to skip based on {@link core.FieldGroupPropertiesMatch} -> {@link ColumnFields.Skip}.
 *
 * # Usage
 *
 * ## Extraction
 *
 * Module can be used to recursively extract fields in a metadata model into {@link ColumnFields}.
 *
 * 1. Create a new instance of the {@link Extraction} class.
 *
 * The following parameters can be set:
 * - Schema - Set using {@link Extraction.Schema}.
 * - Skip - Set using {@link Extraction.Skip}.
 * - Add - Set using {@link Extraction.Add}.
 *
 * 2. Begin field data extraction using {@link Extraction.Extract}.
 *
 * ```typescript
 * import { core } from '@rogonion/js-json';
 * import { Extraction, ColumnFields } from '@fieldcolumns';
 *
 * // Set metadata model
 * let metadataModel: core.JsonObject = {};
 *
 * const fcExtraction = new Extraction(metadataModel);
 * const columnFields = fcExtraction.Extract();
 * ```
 *
 * ## ColumnFields.Reposition
 *
 * After extracting metadata model fields into {@link ColumnFields}, you can reposition them based on the {@link ColumnFields.RepositionFieldColumns} information set during {@link Extraction.Extract}.
 *
 * 1. Call {@link ColumnFields.Reposition} to update the {@link ColumnFields.RepositionedReadOrderOfColumnFields}.
 *
 * ```typescript
 * columnFields.Reposition();
 * ```
 *
 * ## ColumnFields.Skip
 *
 * Set the {@link ColumnField.Skip} of each {@link ColumnFields.Fields}.
 *
 * Useful for automated skips of processing fields if they match {@link core.FieldGroupPropertiesMatch}.
 *
 * ```typescript
 * import { FieldGroupPropertiesMatch } from '@core';
 *
 * // if field property does not match, skip it
 * let add: FieldGroupPropertiesMatch;
 *
 * // if a field property match, skip
 * let skip: FieldGroupPropertiesMatch;
 *
 * columnFields.Skip(skip, add);
 * ```
 *
 * @packageDocumentation
 */
export * from './column_fields';
export * from './core';
export * from './group_column_indexes';
export * from './utils';
export * from './extraction';
