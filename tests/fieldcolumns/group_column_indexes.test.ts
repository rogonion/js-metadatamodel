import { describe, it, expect } from 'vitest';
import { Extraction, GroupsColumnsIndexesRetrieval, GroupColumnIndexes } from '@fieldcolumns';
import { FieldGroupProperties } from '@core';
import { TestData } from '@internal';
import { ProductMetadataModel, EmployeeMetadataModel, CompanyMetadataModel } from '../metadata_models';
import { core } from '@rogonion/js-json';
import { Map } from '@iter';

class GroupsColumnsIndexesRetrievalData extends TestData {
    MetadataModel: core.JsonObject = {};
    ExpectedOk: boolean = true;
    ExpectedIndexes: GroupColumnIndexes | undefined;
}

describe('GroupsColumnsIndexesRetrieval Get', () => {
    const testDataList: GroupsColumnsIndexesRetrievalData[] = [];

    // Case 1: Product metadata model
    {
        const data = new GroupsColumnsIndexesRetrievalData();
        data.TestTitle = 'Product Metadata Model - Default Keys';
        data.MetadataModel = ProductMetadataModel();
        data.ExpectedOk = true;

        const expected = new GroupColumnIndexes();
        expected.Primary = [0];
        expected.All = [0, 1, 2];
        data.ExpectedIndexes = expected;

        testDataList.push(data);
    }

    // Case 2: Company metadata model
    {
        const data = new GroupsColumnsIndexesRetrievalData();
        data.TestTitle = 'Company Metadata Model - Default Keys';
        data.MetadataModel = CompanyMetadataModel();
        data.ExpectedOk = true;

        const expected = new GroupColumnIndexes();
        expected.Primary = [0];
        expected.All = [0];
        data.ExpectedIndexes = expected;

        testDataList.push(data);
    }

    // Case 3: Employee metadata model
    {
        const employeeMetadataModel = Map(EmployeeMetadataModel(), (group) => {
            if (group[FieldGroupProperties.Name] === 'UserProfile') {
                group[FieldGroupProperties.IsPrimaryKey] = true;
                return [group, false];
            }
            return [group, true];
        }) as core.JsonObject;

        const data = new GroupsColumnsIndexesRetrievalData();
        data.TestTitle = "Employee Metadata Model - Nested Group 'UserProfile' as Primary Key";
        data.MetadataModel = employeeMetadataModel;
        data.ExpectedOk = true;

        const expected = new GroupColumnIndexes();
        expected.Primary = [0, 1];
        expected.All = [0, 6];
        data.ExpectedIndexes = expected;

        testDataList.push(data);
    }

    it.each(testDataList)('$TestTitle', (data) => {
        // 1. Extract ColumnFields first (dependency)
        const extractor = new Extraction(data.MetadataModel);
        const columnFields = extractor.Extract();
        columnFields.Reposition();
        columnFields.Skip({}, {});

        // 2. Run Retrieval
        const retriever = new GroupsColumnsIndexesRetrieval(columnFields);
        let indexes: GroupColumnIndexes | undefined;

        try {
            indexes = retriever.Get(data.MetadataModel);
            if (data.ExpectedOk) {
                expect(indexes).toBeDefined();
                expect(JSON.parse(JSON.stringify(indexes))).toEqual(JSON.parse(JSON.stringify(data.ExpectedIndexes)));
            }
        } catch (e) {
            expect(data.ExpectedOk).toBe(false);
        }
    });
});
