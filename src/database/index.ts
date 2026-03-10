/**
 * Package database can be used to work with data whose metadata model represents a relational database structure.
 *
 * The following Field/Group properties are important:
 * - {@link core.FieldGroupProperties.DatabaseTableCollectionUid}
 * - {@link core.FieldGroupProperties.DatabaseJoinDepth}
 * - {@link core.FieldGroupProperties.DatabaseTableCollectionName}
 * - {@link core.FieldGroupProperties.DatabaseFieldColumnName}
 *
 * # Usage
 *
 * ## GetColumnFields
 *
 * Module can be used to extract database field(s) information into {@link ColumnFields}.
 *
 * To begin using the module:
 *
 * 1. Create a new instance of the {@link GetColumnFields} class.
 *
 * The following parameters can be set:
 * - TableCollectionUID - Set using {@link GetColumnFields.TableCollectionUID}.
 * - JoinDepth - Set using {@link GetColumnFields.JoinDepth}.
 * - TableCollectionName - Set using {@link GetColumnFields.TableCollectionName}.
 * - Skip - Set using {@link GetColumnFields.Skip}.
 * - Add - Set using {@link GetColumnFields.Add}.
 *
 * 2. Extract the database fields using {@link GetColumnFields.Get}.
 *
 * You can identify the target Table Collection in two ways:
 * - **By Unique ID**: Use `TableCollectionUID`. This is the most precise method if your metadata model assigns unique IDs to collections.
 * - **By Name & Join Depth**: Use `TableCollectionName` AND `JoinDepth`. This is useful when IDs are not available or when traversing a join hierarchy where the same table name might appear at different depths.
 *
 * Example:
 *
 * ```typescript
 * import { core } from '@rogonion/js-json';
 * import { GetColumnFields, ColumnFields } from '@database';
 *
 * // Set metadata model
 * let metadataModel: core.JsonObject = {};
 *
 * const gcf = new GetColumnFields();
 *
 * // Option A: Set by UID
 * gcf.TableCollectionUID = "_12xoP1y";
 * // Option B: Set by Name and Depth
 * // gcf.JoinDepth = 1;
 * // gcf.TableCollectionName = "User";
 *
 * const columnFields = gcf.Get(metadataModel);
 * ```
 *
 * ## FieldValue
 *
 * Module can be used to {@link FieldValue.Get}, {@link FieldValue.Set}, and {@link FieldValue.Delete} value(s) in an sourceData using metadata model and its database properties.
 *
 * Example:
 *
 * ```typescript
 * import { core, jsobject, schema } from '@rogonion/js-json';
 * import { GetColumnFields, FieldValue, ColumnFields } from '@database';
 *
 * class Product {
 *     ID: number[] = [1];
 *     Name: string[] = [];
 *     Price: number[] = [];
 * }
 *
 * // Set Product schema. Useful for instantiating nested collections
 * let sch: schema.Schema;
 *
 * // Source object
 * const product = new Product();
 *
 * // source data to manipulate
 * const sourceData = new jsobject.JSObject();
 * sourceData.Source = product;
 * sourceData.Schema = sch;
 *
 * // Set product metadata model
 * let productMetadataModel: core.JsonObject = {};
 *
 * const gcf = new GetColumnFields();
 * gcf.JoinDepth = 0;
 * gcf.TableCollectionName = "Product";
 * const columnFields = gcf.Get(productMetadataModel);
 *
 * // Module to perform get,set, or delete
 * const fieldValue = new FieldValue(sourceData, columnFields);
 *
 * // Get value of column `ID`
 * // Returns number of results found (number)
 * const noOfResults = fieldValue.Get("ID", "", []);
 *
 * // Set value for column `Name`
 * const noOfModifications = fieldValue.Set("Name", "Twinkies", "", []);
 *
 * // Delete value for column `Price`
 * const noOfModificationsDelete = fieldValue.Delete("Price", "", []);
 * ```
 *
 * @packageDocumentation
 */
export * from './core';
export * from './field_value';
export * from './get_column_fields';
