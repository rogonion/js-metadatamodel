import { FieldGroupProperties, FieldTypes, FieldUIs, GroupJsonPathPrefix } from '@core';
import { core, path } from '@rogonion/js-json';

// UserInformationMetadataModel returns a sample metadata model for testing iteration functions.
export function UserInformationMetadataModel(): core.JsonObject {
    const fieldGroupJSONPathPrefixDepth0 = path.JsonpathKeyRoot + GroupJsonPathPrefix;

    return structuredClone({
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
                    [FieldGroupProperties.Name]: 'Address Details',
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
                                    [FieldGroupProperties.JsonPathKey]: fieldGroupJSONPathPrefixDepth1 + 'ZipCode',
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
    });
}
