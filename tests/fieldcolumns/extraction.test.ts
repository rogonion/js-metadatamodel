import { describe, it, expect } from 'vitest';
import {
    Extraction,
    ColumnFields,
    getFieldColumnsFromMetadataModel,
    FieldColumnPosition,
    type RepositionFieldColumns
} from '@fieldcolumns';
import {
    FieldGroupProperties,
    type FieldGroupPropertiesMatch,
    AsJSONPath,
    GetGroupFields,
    IsFieldAGroup,
    AsJsonObject,
    GetGroupReadOrderOfFields
} from '@core';
import { TestData } from '@internal';
import {
    UserMetadataModel,
    EmployeeMetadataModel,
    ProductMetadataModel,
    UserProfileMetadataModel
} from '../metadata_models';
import { UserSchema, EmployeeSchema, ProductSchema, UserProfileSchema } from '../schemas';
import { core, schema } from '@rogonion/js-json';
import { Map } from '@iter';

class ExtractionData extends TestData {
    MetadataModel: core.JsonObject = {};
    Schema: schema.Schema | undefined;
    NestedSkip?: FieldGroupPropertiesMatch;
    NestedAdd?: FieldGroupPropertiesMatch;
    ExpectedOk: boolean = true;
    ExpectedColumnFields: ColumnFields | undefined;
}

describe('FieldColumns Extraction', () => {
    const testDataList: ExtractionData[] = [];

    // 1. User Metadata Model
    {
        const metadataModel = UserMetadataModel();
        const sch = UserSchema();
        const columnFields = getFieldColumnsFromMetadataModel(metadataModel, sch);

        const data = new ExtractionData();
        data.TestTitle = 'User Metadata Model Extraction';
        data.MetadataModel = metadataModel;
        data.Schema = sch;
        data.ExpectedOk = true;
        data.ExpectedColumnFields = columnFields;
        testDataList.push(data);
    }

    // 2. Employee Metadata Model
    {
        const metadataModel = EmployeeMetadataModel();
        const sch = EmployeeSchema();
        const columnFields = getFieldColumnsFromMetadataModel(metadataModel, sch);

        const data = new ExtractionData();
        data.TestTitle = 'Employee Metadata Model Extraction';
        data.MetadataModel = metadataModel;
        data.Schema = sch;
        data.ExpectedOk = true;
        data.ExpectedColumnFields = columnFields;
        testDataList.push(data);
    }

    // 3. Product Metadata Model - Pivoted Name Column
    {
        const productMetadataModel = Map(ProductMetadataModel(), (group) => {
            if (group[FieldGroupProperties.Name] === 'Name') {
                group[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                group[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 3;
            }
            return [group, true];
        }) as core.JsonObject;
        const productSchema = ProductSchema();
        const productColumnFields = getFieldColumnsFromMetadataModel(productMetadataModel, productSchema);

        const data = new ExtractionData();
        data.TestTitle = `Product Metadata Model - Pivoted Name Column ('${FieldGroupProperties.ViewValuesInSeparateColumns}')`;
        data.MetadataModel = productMetadataModel;
        data.Schema = productSchema;
        data.ExpectedOk = true;
        data.ExpectedColumnFields = productColumnFields;
        testDataList.push(data);
    }

    // 4. Product Metadata Model - Reposition 'Price' after 'ID'
    {
        let productMetadataModel = ProductMetadataModel();
        productMetadataModel = Map(productMetadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'Name') {
                group[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                group[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 3;
            }
            return [group, true];
        }) as core.JsonObject;

        let idJsonPathKey: string = '';
        Map(productMetadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'ID') {
                const key = AsJSONPath(group[FieldGroupProperties.JsonPathKey]);
                if (key) idJsonPathKey = key;
            }
            return [group, true];
        });

        const repositionFieldColumns: RepositionFieldColumns = [];
        productMetadataModel = Map(productMetadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'Price' && idJsonPathKey) {
                group[FieldGroupProperties.FieldColumnPosition] = {
                    [FieldGroupProperties.JsonPathKey]: idJsonPathKey
                };
                const fcp = new FieldColumnPosition();
                fcp.SourceIndex = 4;
                fcp.FieldGroupJsonPathKey = idJsonPathKey;
                repositionFieldColumns.push(fcp);
            }
            return [group, true];
        }) as core.JsonObject;

        const productSchema = ProductSchema();
        const productColumnFields = getFieldColumnsFromMetadataModel(productMetadataModel, productSchema);
        productColumnFields.RepositionFieldColumns = repositionFieldColumns;

        const data = new ExtractionData();
        data.TestTitle = "Product Metadata Model - Reposition 'Price' after 'ID'";
        data.MetadataModel = productMetadataModel;
        data.Schema = productSchema;
        data.ExpectedOk = true;
        data.ExpectedColumnFields = productColumnFields;
        testDataList.push(data);
    }

    // 5. Product Metadata Model - Reposition 'Name' before 'ID'
    {
        let productMetadataModel = ProductMetadataModel();
        let idJsonPathKey: string = '';
        productMetadataModel = Map(productMetadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'ID') {
                const key = AsJSONPath(group[FieldGroupProperties.JsonPathKey]);
                if (key) idJsonPathKey = key;
            } else if (group[FieldGroupProperties.Name] === 'Name') {
                group[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                group[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 3;
            }
            return [group, true];
        }) as core.JsonObject;

        const repositionFieldColumns: RepositionFieldColumns = [];
        const priceAfterIDReposition = new FieldColumnPosition();
        priceAfterIDReposition.SourceIndex = 4;
        priceAfterIDReposition.FieldGroupJsonPathKey = idJsonPathKey;

        productMetadataModel = Map(productMetadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'Price' && idJsonPathKey) {
                group[FieldGroupProperties.FieldColumnPosition] = {
                    [FieldGroupProperties.JsonPathKey]: idJsonPathKey
                };
            }
            return [group, true];
        }) as core.JsonObject;

        productMetadataModel = Map(productMetadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'Name') {
                group[FieldGroupProperties.FieldColumnPosition] = {
                    [FieldGroupProperties.JsonPathKey]: idJsonPathKey,
                    [FieldGroupProperties.PositionBefore]: true
                };
                const jsonPathKey = AsJSONPath(group[FieldGroupProperties.JsonPathKey]);
                const maxCols = group[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] as number;

                if (jsonPathKey && maxCols) {
                    let currentIndex = 1;
                    let nextFCP = new FieldColumnPosition();
                    nextFCP.FieldGroupJsonPathKey = idJsonPathKey;
                    nextFCP.FieldGroupPositionBefore = true;

                    for (let i = 0; i < maxCols; i++) {
                        nextFCP.SourceIndex = currentIndex;
                        repositionFieldColumns.push(FieldColumnPosition.fromJSON(nextFCP));

                        nextFCP = new FieldColumnPosition();
                        nextFCP.FieldGroupJsonPathKey = jsonPathKey;
                        nextFCP.FieldViewInSeparateColumns = true;
                        nextFCP.FieldViewValuesInSeparateColumnsHeaderIndex = i;
                        currentIndex++;
                    }
                }
            }
            return [group, true];
        }) as core.JsonObject;
        repositionFieldColumns.push(priceAfterIDReposition);
        const productSchema = ProductSchema();
        const productColumnFields = getFieldColumnsFromMetadataModel(productMetadataModel, productSchema);
        productColumnFields.RepositionFieldColumns = repositionFieldColumns;

        const data = new ExtractionData();
        data.TestTitle = "Product Metadata Model - Reposition 'Name' before 'ID'";
        data.MetadataModel = productMetadataModel;
        data.Schema = productSchema;
        data.ExpectedOk = true;
        data.ExpectedColumnFields = productColumnFields;
        testDataList.push(data);
    }

    // 6. UserProfile Metadata Model - Pivot Address Group
    {
        const userProfileMetadataModel = Map(UserProfileMetadataModel(), (group) => {
            const jsonPathKey = AsJSONPath(group[FieldGroupProperties.JsonPathKey]);
            if (jsonPathKey && group[FieldGroupProperties.Name] === 'Address') {
                group[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                group[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 3;
                group[FieldGroupProperties.ViewDisable] = true;
            }
            return [group, true];
        }) as core.JsonObject;
        const userProfileSchema = UserProfileSchema();
        const userProfileColumnFields = getFieldColumnsFromMetadataModel(userProfileMetadataModel, userProfileSchema);

        const data = new ExtractionData();
        data.TestTitle = `UserProfile Metadata Model - Pivot Address Group ('${FieldGroupProperties.ViewValuesInSeparateColumns}')`;
        data.MetadataModel = userProfileMetadataModel;
        data.Schema = userProfileSchema;
        data.ExpectedOk = true;
        data.ExpectedColumnFields = userProfileColumnFields;
        testDataList.push(data);
    }

    // 8. UserProfile Metadata Model - Reposition 'Address' before 'Age'
    {
        let userProfileMetadataModel = UserProfileMetadataModel();
        userProfileMetadataModel = Map(userProfileMetadataModel, (group) => {
            const jsonPathKey = AsJSONPath(group[FieldGroupProperties.JsonPathKey]);
            if (jsonPathKey && group[FieldGroupProperties.Name] === 'Address') {
                group[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                group[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 3;
                group[FieldGroupProperties.ViewDisable] = true;
            }
            return [group, true];
        }) as core.JsonObject;

        const repositionFieldColumns: RepositionFieldColumns = [];
        let ageJsonPathKey: string = '';
        Map(userProfileMetadataModel, (group) => {
            const name = group[FieldGroupProperties.Name];
            const jsonPathKey = AsJSONPath(group[FieldGroupProperties.JsonPathKey]);
            if (name === 'Age' && jsonPathKey) {
                ageJsonPathKey = jsonPathKey;
            }
            return [group, true];
        });

        userProfileMetadataModel = Map(userProfileMetadataModel, (group) => {
            const name = group[FieldGroupProperties.Name];
            if (name === 'Address' && ageJsonPathKey) {
                group[FieldGroupProperties.FieldColumnPosition] = {
                    [FieldGroupProperties.JsonPathKey]: ageJsonPathKey,
                    [FieldGroupProperties.PositionBefore]: true
                };

                const fgGroupFields = GetGroupFields(group);
                const fgGroupReadOrderOfFields = GetGroupReadOrderOfFields(group);
                const maxCols = group[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] as number;
                const jsonPathKey = AsJSONPath(group[FieldGroupProperties.JsonPathKey]);

                if (fgGroupFields && fgGroupReadOrderOfFields && maxCols && jsonPathKey) {
                    let currentIndex = 2;
                    let nextFCP = new FieldColumnPosition();
                    nextFCP.FieldGroupJsonPathKey = ageJsonPathKey;
                    nextFCP.FieldGroupPositionBefore = true;

                    for (let i = 0; i < maxCols; i++) {
                        for (const suffix of fgGroupReadOrderOfFields) {
                            const nFieldGroup = AsJsonObject(fgGroupFields[suffix]);
                            const nJsonPathKey = AsJSONPath(nFieldGroup[FieldGroupProperties.JsonPathKey]);
                            if (nJsonPathKey) {
                                nextFCP.SourceIndex = currentIndex;
                                repositionFieldColumns.push(FieldColumnPosition.fromJSON(nextFCP));

                                nextFCP = new FieldColumnPosition();
                                nextFCP.FieldGroupJsonPathKey = nJsonPathKey;
                                nextFCP.GroupViewInSeparateColumns = true;
                                nextFCP.GroupViewValuesInSeparateColumnsHeaderIndex = i;
                                nextFCP.GroupViewParentJsonPathKey = jsonPathKey;
                                nextFCP.FieldJsonPathKeySuffix = suffix;
                            }
                            currentIndex++;
                        }
                    }
                }
            }
            return [group, true];
        }) as core.JsonObject;

        const userProfileSchema = UserProfileSchema();
        const userProfileColumnFields = getFieldColumnsFromMetadataModel(userProfileMetadataModel, userProfileSchema);
        userProfileColumnFields.RepositionFieldColumns = repositionFieldColumns;

        const data = new ExtractionData();
        data.TestTitle = "UserProfile Metadata Model - Reposition 'Address' before 'Age'";
        data.MetadataModel = userProfileMetadataModel;
        data.Schema = userProfileSchema;
        data.ExpectedOk = true;
        data.ExpectedColumnFields = userProfileColumnFields;
        testDataList.push(data);
    }

    it.each(testDataList)('$TestTitle', (data) => {
        const extractor = new Extraction(data.MetadataModel);
        if (data.Schema) extractor.Schema = data.Schema;
        if (data.NestedSkip) extractor.Skip = data.NestedSkip;
        if (data.NestedAdd) extractor.Add = data.NestedAdd;

        const columnFields = extractor.Extract();

        if (data.ExpectedOk) {
            expect(columnFields).toBeDefined();
        }

        expect(JSON.parse(JSON.stringify(columnFields))).toEqual(JSON.parse(JSON.stringify(data.ExpectedColumnFields)));
    });
});
