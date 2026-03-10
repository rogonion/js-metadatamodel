import { TestData } from '@internal';
import { core, path } from '@rogonion/js-json';
import { describe, expect, it } from 'vitest';
import { Map, type MapCallback } from '@iter';
import { UserInformationMetadataModel } from './misc';
import { FieldGroupProperties, FieldTypes, FieldUIs, GroupJsonPathPrefix } from '@core';

class MapData extends TestData {
    public MetadataModel: core.JsonObject = {};
    public Callback: MapCallback = (fg) => [fg, false];
    public Expected: any;
}

const testData: MapData[] = [
    // Case 1: No Mapping (Keep everything)
    Object.assign(new MapData(), {
        TestTitle: 'No Mapping (Keep everything)',
        MetadataModel: UserInformationMetadataModel(),
        Callback: (fieldGroup: core.JsonObject) => [fieldGroup, false],
        Expected: UserInformationMetadataModel()
    }),

    // Case 2: Append ' Found' to fields whose suffix is 'Name'
    Object.assign(new MapData(), {
        TestTitle: "Append ' Found' to fields whose suffix is 'Name'",
        MetadataModel: UserInformationMetadataModel(),
        Callback: (fieldGroup: core.JsonObject) => {
            const fieldGroupName = fieldGroup[FieldGroupProperties.Name] as string;
            if (fieldGroupName && fieldGroupName.endsWith('Name')) {
                fieldGroup[FieldGroupProperties.Name] = fieldGroupName + ' Found';
            }
            return [fieldGroup, false];
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
                            [FieldGroupProperties.Name]: 'User Name Found',
                            [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                            [FieldGroupProperties.FieldUI]: FieldUIs.Text
                        },
                        Details: {
                            [FieldGroupProperties.JsonPathKey]: fieldGroupJSONPathPrefixDepth0 + 'Details',
                            [FieldGroupProperties.Name]: 'Address Details',
                            [FieldGroupProperties.GroupFields]: (() => {
                                const fieldGroupJSONPathPrefixDepth1 =
                                    fieldGroupJSONPathPrefixDepth0 + 'Details' + GroupJsonPathPrefix;
                                return [
                                    {
                                        City: {
                                            [FieldGroupProperties.JsonPathKey]: fieldGroupJSONPathPrefixDepth1 + 'City',
                                            [FieldGroupProperties.Name]: 'City Name Found',
                                            [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                                            [FieldGroupProperties.FieldUI]: FieldUIs.Text,
                                            [FieldGroupProperties.DatabaseJoinDepth]: 1
                                        },
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
                            [FieldGroupProperties.GroupReadOrderOfFields]: ['City', 'ZipCode']
                        }
                    }
                ],
                [FieldGroupProperties.GroupReadOrderOfFields]: ['ID', 'Name', 'Details']
            };
        })()
    }),

    // Case 3: Append ' Found' to fields with nested groups like 'Details'
    Object.assign(new MapData(), {
        TestTitle: "Append ' Found' to fields with nested groups like 'Details'",
        MetadataModel: UserInformationMetadataModel(),
        Callback: (fieldGroup: core.JsonObject) => {
            if (FieldGroupProperties.GroupFields in fieldGroup) {
                const fieldGroupName = fieldGroup[FieldGroupProperties.Name] as string;
                if (fieldGroupName) {
                    fieldGroup[FieldGroupProperties.Name] = fieldGroupName + ' Found';
                }
            }
            return [fieldGroup, false];
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
                        },
                        Details: {
                            [FieldGroupProperties.JsonPathKey]: fieldGroupJSONPathPrefixDepth0 + 'Details',
                            [FieldGroupProperties.Name]: 'Address Details Found',
                            [FieldGroupProperties.GroupFields]: (() => {
                                const fieldGroupJSONPathPrefixDepth1 =
                                    fieldGroupJSONPathPrefixDepth0 + 'Details' + GroupJsonPathPrefix;
                                return [
                                    {
                                        City: {
                                            [FieldGroupProperties.JsonPathKey]: fieldGroupJSONPathPrefixDepth1 + 'City',
                                            [FieldGroupProperties.Name]: 'City Name',
                                            [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                                            [FieldGroupProperties.FieldUI]: FieldUIs.Text,
                                            [FieldGroupProperties.DatabaseJoinDepth]: 1
                                        },
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
                            [FieldGroupProperties.GroupReadOrderOfFields]: ['City', 'ZipCode']
                        }
                    }
                ],
                [FieldGroupProperties.GroupReadOrderOfFields]: ['ID', 'Name', 'Details']
            };
        })()
    })
];

describe('Iter Map', () => {
    it.each(testData)('$TestTitle', (data) => {
        const res = Map(data.MetadataModel, data.Callback);
        expect(res).toEqual(data.Expected);
    });
});
