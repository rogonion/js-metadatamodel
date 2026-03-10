import { TestData } from '@internal';
import { core, path } from '@rogonion/js-json';
import { describe, expect, it } from 'vitest';
import { Filter, type FilterCallback } from '@iter';
import { UserInformationMetadataModel } from './misc';
import { FieldGroupProperties, FieldTypes, FieldUIs, GroupJsonPathPrefix } from '@core';

class FilterData extends TestData {
    public MetadataModel: core.JsonObject = {};
    public Callback: FilterCallback = () => [true, false];
    public Expected: any;
}

const testData: FilterData[] = [
    // Test Case 1: No filter
    Object.assign(new FilterData(), {
        TestTitle: 'No filter (Keep everything)',
        MetadataModel: UserInformationMetadataModel(),
        Callback: () => [true, false],
        Expected: UserInformationMetadataModel()
    }),

    // Test Case 2: Remove fields ending with 'Name'
    Object.assign(new FilterData(), {
        TestTitle: "Remove fields whose suffix is 'Name'",
        MetadataModel: UserInformationMetadataModel(),
        Callback: (fieldGroup: core.JsonObject): [boolean, boolean] => {
            const fieldGroupName = fieldGroup[FieldGroupProperties.Name] as string;
            if (fieldGroupName && fieldGroupName.endsWith('Name')) {
                return [false, false];
            }
            return [true, false];
        },
        Expected: (() => {
            const fieldGroupJSONPathPrefixDepth0 = path.JsonpathKeyRoot + GroupJsonPathPrefix;
            return {
                [FieldGroupProperties.JsonPathKey]: path.JsonpathKeyRoot,
                [FieldGroupProperties.Name]: 'Root Group',
                [FieldGroupProperties.GroupFields]: [
                    {
                        ID: {
                            [FieldGroupProperties.JsonPathKey]: fieldGroupJSONPathPrefixDepth0 + 'ID',
                            [FieldGroupProperties.Name]: 'Primary ID',
                            [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                            [FieldGroupProperties.FieldUI]: FieldUIs.Text,
                            [FieldGroupProperties.IsPrimaryKey]: true
                        },
                        Details: {
                            [FieldGroupProperties.JsonPathKey]: fieldGroupJSONPathPrefixDepth0 + 'Details',
                            [FieldGroupProperties.Name]: 'Address Details',
                            [FieldGroupProperties.GroupFields]: (() => {
                                const fieldGroupJSONPathPrefixDepth1 =
                                    fieldGroupJSONPathPrefixDepth0 + 'Details' + GroupJsonPathPrefix;
                                return [
                                    {
                                        ZipCode: {
                                            [FieldGroupProperties.JsonPathKey]:
                                                fieldGroupJSONPathPrefixDepth1 + 'ZipCode',
                                            [FieldGroupProperties.Name]: 'Postal Code',
                                            [FieldGroupProperties.FieldDataType]: FieldTypes.Number,
                                            [FieldGroupProperties.FieldUI]: FieldUIs.Number,
                                            [FieldGroupProperties.DatabaseJoinDepth]: 1
                                        }
                                    }
                                ];
                            })(),
                            [FieldGroupProperties.GroupReadOrderOfFields]: ['ZipCode']
                        }
                    }
                ],
                [FieldGroupProperties.GroupReadOrderOfFields]: ['ID', 'Details']
            };
        })()
    }),

    // Test Case 3: Remove groups
    Object.assign(new FilterData(), {
        TestTitle: 'Remove fields with nested groups like ("Details")',
        MetadataModel: UserInformationMetadataModel(),
        Callback: (fieldGroup: core.JsonObject): [boolean, boolean] => {
            if (FieldGroupProperties.GroupFields in fieldGroup) {
                return [false, false];
            }
            return [true, false];
        },
        Expected: (() => {
            const fieldGroupJSONPathPrefixDepth0 = path.JsonpathKeyRoot + GroupJsonPathPrefix;
            return {
                [FieldGroupProperties.JsonPathKey]: path.JsonpathKeyRoot,
                [FieldGroupProperties.Name]: 'Root Group',
                [FieldGroupProperties.GroupFields]: [
                    {
                        ID: {
                            [FieldGroupProperties.JsonPathKey]: fieldGroupJSONPathPrefixDepth0 + 'ID',
                            [FieldGroupProperties.Name]: 'Primary ID',
                            [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                            [FieldGroupProperties.FieldUI]: FieldUIs.Text,
                            [FieldGroupProperties.IsPrimaryKey]: true
                        },
                        Name: {
                            [FieldGroupProperties.JsonPathKey]: fieldGroupJSONPathPrefixDepth0 + 'Name',
                            [FieldGroupProperties.Name]: 'User Name',
                            [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                            [FieldGroupProperties.FieldUI]: FieldUIs.Text
                        }
                    }
                ],
                [FieldGroupProperties.GroupReadOrderOfFields]: ['ID', 'Name']
            };
        })()
    })
];

describe('Iter Filter', () => {
    it.each(testData)('$TestTitle', (data) => {
        const res = Filter(data.MetadataModel, data.Callback);
        expect(res).toEqual(data.Expected);
    });
});
