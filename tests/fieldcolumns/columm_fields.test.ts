import { describe, it, expect } from 'vitest';
import { Extraction, ColumnFields, FieldToSkip, type FieldsToSkip } from '@fieldcolumns';
import {
    FieldGroupProperties,
    type FieldGroupPropertiesMatch,
    AsJSONPath,
    GetGroupFields,
    GetGroupReadOrderOfFields,
    AsJsonObject,
    IsFieldAGroup
} from '@core';
import { TestData } from '@internal';
import {
    UserMetadataModel,
    EmployeeMetadataModel,
    ProductMetadataModel,
    UserProfileMetadataModel
} from '../metadata_models';
import { core, path } from '@rogonion/js-json';
import { Map, ForEach, Filter } from '@iter';

class SkipData extends TestData {
    MetadataModel: core.JsonObject = {};
    ExpectedOk: boolean = true;
    Skip: FieldGroupPropertiesMatch | undefined;
    NestedSkip: FieldGroupPropertiesMatch | undefined;
    Add: FieldGroupPropertiesMatch | undefined;
    NestedAdd: FieldGroupPropertiesMatch | undefined;
    ExpectedFieldsToSkip: FieldsToSkip = {};
}

class RepositionData extends TestData {
    MetadataModel: core.JsonObject = {};
    ExpectedOk: boolean = true;
    ExpectedIndexOfReadOrderOfColumnFields: number[] = [];
}

describe('FieldColumns Skip', () => {
    const testDataList: SkipData[] = [];

    // Case 1: Skip 'Age' field in UserProfile
    {
        const expectedFieldsToSkip: FieldsToSkip = {};
        const metadataModel = Map(UserProfileMetadataModel(), (fieldGroup) => {
            const jsonPathKey = AsJSONPath(fieldGroup[FieldGroupProperties.JsonPathKey]);
            if (jsonPathKey) {
                const name = fieldGroup[FieldGroupProperties.Name];
                if (name === 'Age') {
                    fieldGroup[FieldGroupProperties.ViewDisable] = true;
                    expectedFieldsToSkip[jsonPathKey] = FieldToSkip();
                }
            }
            return [fieldGroup, true];
        }) as core.JsonObject;

        const data = new SkipData();
        data.TestTitle = "Skip 'Age' field in UserProfile";
        data.MetadataModel = metadataModel;
        data.ExpectedOk = true;
        data.Skip = {
            [FieldGroupProperties.ViewDisable]: true
        };
        data.ExpectedFieldsToSkip = expectedFieldsToSkip;
        testDataList.push(data);
    }

    // Case 2: Skip Pivoted Address Fields in UserProfile
    {
        const expectedFieldsToSkip: FieldsToSkip = {};
        const metadataModel = Map(UserProfileMetadataModel(), (fieldGroup) => {
            const fieldGroupJsonPathKey = AsJSONPath(fieldGroup[FieldGroupProperties.JsonPathKey]);
            if (fieldGroupJsonPathKey) {
                const name = fieldGroup[FieldGroupProperties.Name];
                if (name === 'Address') {
                    fieldGroup[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                    fieldGroup[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 3;
                    fieldGroup[FieldGroupProperties.ViewDisable] = true;

                    const fgReadOrder = GetGroupReadOrderOfFields(fieldGroup);
                    const fgFields = GetGroupFields(fieldGroup);

                    if (fgReadOrder && fgFields) {
                        for (let currentIndex = 0; currentIndex < 3; currentIndex++) {
                            for (const fgKeySuffix of fgReadOrder) {
                                const field = AsJsonObject(fgFields[fgKeySuffix]);
                                if (AsJSONPath(field[FieldGroupProperties.JsonPathKey])) {
                                    const key = `${fieldGroupJsonPathKey}${path.JsonpathDotNotation}${FieldGroupProperties.GroupFields}${path.JsonpathLeftBracket}${currentIndex}${path.JsonpathRightBracket}${path.JsonpathDotNotation}${fgKeySuffix}`;
                                    expectedFieldsToSkip[key] = FieldToSkip();
                                }
                            }
                        }
                    }
                }
            }
            return [fieldGroup, true];
        }) as core.JsonObject;

        const data = new SkipData();
        data.TestTitle = 'Skip Pivoted Address Fields in UserProfile';
        data.MetadataModel = metadataModel;
        data.ExpectedOk = true;
        data.Skip = {
            [FieldGroupProperties.ViewDisable]: true
        };
        data.NestedSkip = {
            [FieldGroupProperties.ViewDisable]: {
                MatchingProps: (val: any, fieldGroup: core.JsonObject) => {
                    if (fieldGroup[FieldGroupProperties.ViewDisable] === true) {
                        return { [FieldGroupProperties.ViewDisable]: true };
                    }
                    return {};
                }
            }
        };
        data.ExpectedFieldsToSkip = expectedFieldsToSkip;
        testDataList.push(data);
    }

    // Case 3: Skip Nested Profile Fields in Employee
    {
        let profileJsonPathKey: string = '';
        const expectedFieldsToSkip: FieldsToSkip = {};

        const metadataModel = Map(EmployeeMetadataModel(), (fieldGroup) => {
            const jsonPathKey = AsJSONPath(fieldGroup[FieldGroupProperties.JsonPathKey]);
            if (jsonPathKey) {
                const name = fieldGroup[FieldGroupProperties.Name];
                if (name === 'UserProfile') {
                    profileJsonPathKey = jsonPathKey;
                    fieldGroup[FieldGroupProperties.ViewDisable] = true;
                    return [fieldGroup, false];
                }

                if (
                    profileJsonPathKey !== '' &&
                    !IsFieldAGroup(fieldGroup) &&
                    jsonPathKey.startsWith(profileJsonPathKey)
                ) {
                    expectedFieldsToSkip[jsonPathKey] = FieldToSkip();
                }
            }
            return [fieldGroup, false];
        }) as core.JsonObject;

        // Manually populate expectedFieldsToSkip because Map might not visit children if we return false,
        // or if the logic above relies on a specific traversal order/behavior.
        // In the Go test, it seems to rely on `iter.Map` visiting nodes.
        // Let's manually traverse to ensure we have the expected keys for the test.
        const populateExpected = (model: core.JsonObject) => {
            const _ = Map(model, (group) => {
                const jsonPathKey = AsJSONPath(group[FieldGroupProperties.JsonPathKey]);
                if (
                    jsonPathKey &&
                    profileJsonPathKey &&
                    jsonPathKey.startsWith(profileJsonPathKey) &&
                    jsonPathKey !== profileJsonPathKey
                ) {
                    if (!IsFieldAGroup(group)) {
                        expectedFieldsToSkip[jsonPathKey] = FieldToSkip();
                    }
                }
                return [group, true];
            });
        };
        // We need to re-traverse because the first Map might have stopped recursion or modified in place.
        // But we need to find the profileJsonPathKey first.
        // Let's just use a fresh model to find the keys to skip.
        const tempModel = EmployeeMetadataModel();
        let tempProfileKey = '';
        const _ = Map(tempModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'UserProfile') {
                tempProfileKey = AsJSONPath(group[FieldGroupProperties.JsonPathKey]) || '';
            }
            return [group, true];
        });
        if (tempProfileKey) {
            profileJsonPathKey = tempProfileKey;
            populateExpected(tempModel);
        }

        const data = new SkipData();
        data.TestTitle = 'Skip Nested Profile Fields in Employee';
        data.MetadataModel = metadataModel;
        data.ExpectedOk = true;
        data.Skip = {
            [FieldGroupProperties.ViewDisable]: true
        };
        data.NestedSkip = {
            [FieldGroupProperties.ViewDisable]: {
                MatchingProps: (val: any, fieldGroup: core.JsonObject) => {
                    if (fieldGroup[FieldGroupProperties.ViewDisable] === true) {
                        return { [FieldGroupProperties.ViewDisable]: true };
                    }
                    return {};
                }
            }
        };
        data.ExpectedFieldsToSkip = expectedFieldsToSkip;
        testDataList.push(data);
    }

    it.each(testDataList)('', (data) => {
        const extractor = new Extraction(data.MetadataModel);
        if (data.NestedSkip) extractor.Skip = data.NestedSkip;
        if (data.NestedAdd) extractor.Add = data.NestedAdd;

        const columnFields = extractor.Extract();
        if (data.ExpectedOk) {
            expect(columnFields).toBeDefined();
        }
        if (!columnFields) return;

        columnFields.Skip(data.Skip, data.Add);

        expect(Object.keys(columnFields.FieldsToSkip).sort()).toEqual(Object.keys(data.ExpectedFieldsToSkip).sort());
    });
});

describe('FieldColumns Reposition', () => {
    const testDataList: RepositionData[] = [];

    // Case 1: User Metadata Model - Default Order
    {
        const data = new RepositionData();
        data.TestTitle = 'User Metadata Model - Default Order';
        data.MetadataModel = UserMetadataModel();
        data.ExpectedOk = true;
        data.ExpectedIndexOfReadOrderOfColumnFields = [0, 1, 2];
        testDataList.push(data);
    }

    // Case 2: Employee Metadata Model - Default Order
    {
        const data = new RepositionData();
        data.TestTitle = 'Employee Metadata Model - Default Order';
        data.MetadataModel = EmployeeMetadataModel();
        data.ExpectedOk = true;
        data.ExpectedIndexOfReadOrderOfColumnFields = [0, 1, 2, 3, 4, 5, 6];
        testDataList.push(data);
    }

    // Case 3: UserProfile - Pivoted Address
    {
        const metadataModel = Map(UserProfileMetadataModel(), (fieldGroup) => {
            const jsonPathKey = AsJSONPath(fieldGroup[FieldGroupProperties.JsonPathKey]);
            if (jsonPathKey) {
                const name = fieldGroup[FieldGroupProperties.Name];
                if (name === 'Address') {
                    fieldGroup[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                    fieldGroup[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 3;
                    fieldGroup[FieldGroupProperties.ViewDisable] = true;
                }
            }
            return [fieldGroup, true];
        }) as core.JsonObject;

        const data = new RepositionData();
        data.TestTitle = `UserProfile - Pivoted Address ('${FieldGroupProperties.ViewValuesInSeparateColumns}')`;
        data.MetadataModel = metadataModel;
        data.ExpectedOk = true;
        data.ExpectedIndexOfReadOrderOfColumnFields = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        testDataList.push(data);
    }

    // Case 4: Product - Pivoted Name
    {
        const metadataModel = Map(ProductMetadataModel(), (fieldGroup) => {
            const name = fieldGroup[FieldGroupProperties.Name];
            if (name === 'Name') {
                fieldGroup[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                fieldGroup[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 3;
            }
            return [fieldGroup, true];
        }) as core.JsonObject;

        const data = new RepositionData();
        data.TestTitle = `Product - Pivoted Name ('${FieldGroupProperties.ViewValuesInSeparateColumns}')`;
        data.MetadataModel = metadataModel;
        data.ExpectedOk = true;
        data.ExpectedIndexOfReadOrderOfColumnFields = [0, 1, 2, 3, 4];
        testDataList.push(data);
    }

    // Case 5: Product - Reposition 'Price' after 'ID'
    {
        let metadataModel = ProductMetadataModel();
        let idJsonPathKey = '';
        const _ = Map(metadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'ID') {
                idJsonPathKey = AsJSONPath(group[FieldGroupProperties.JsonPathKey]) || '';
            }
            return [group, true];
        });

        metadataModel = Map(metadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'Name') {
                group[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                group[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 3;
            }
            return [group, true];
        }) as core.JsonObject;

        metadataModel = Map(metadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'Price' && idJsonPathKey) {
                group[FieldGroupProperties.FieldColumnPosition] = {
                    [FieldGroupProperties.JsonPathKey]: idJsonPathKey
                };
            }
            return [group, true];
        }) as core.JsonObject;

        const data = new RepositionData();
        data.TestTitle = "Product - Reposition 'Price' after 'ID'";
        data.MetadataModel = metadataModel;
        data.ExpectedOk = true;
        data.ExpectedIndexOfReadOrderOfColumnFields = [0, 4, 1, 2, 3];
        testDataList.push(data);
    }

    // Case 6: Product - Reposition 'Name' before 'ID'
    {
        let metadataModel = ProductMetadataModel();
        let idJsonPathKey = '';
        const _ = Map(metadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'ID') {
                idJsonPathKey = AsJSONPath(group[FieldGroupProperties.JsonPathKey]) || '';
            }
            return [group, true];
        });

        metadataModel = Map(metadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'Name') {
                group[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                group[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 3;
            }
            return [group, true];
        }) as core.JsonObject;

        metadataModel = Map(metadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'Name' && idJsonPathKey) {
                group[FieldGroupProperties.FieldColumnPosition] = {
                    [FieldGroupProperties.JsonPathKey]: idJsonPathKey,
                    [FieldGroupProperties.PositionBefore]: true
                };
            }
            return [group, true];
        }) as core.JsonObject;

        const data = new RepositionData();
        data.TestTitle = "Product - Reposition 'Name' before 'ID'";
        data.MetadataModel = metadataModel;
        data.ExpectedOk = true;
        data.ExpectedIndexOfReadOrderOfColumnFields = [1, 2, 3, 0, 4];
        testDataList.push(data);
    }

    // Case 7: UserProfile - Reposition 'Address' before 'Age'
    {
        let metadataModel = UserProfileMetadataModel();
        let ageJsonPathKey = '';
        const _ = Map(metadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'Age') {
                ageJsonPathKey = AsJSONPath(group[FieldGroupProperties.JsonPathKey]) || '';
            }
            return [group, true];
        });

        metadataModel = Map(metadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'Address') {
                group[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                group[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 3;
                group[FieldGroupProperties.ViewDisable] = true;
                if (ageJsonPathKey) {
                    group[FieldGroupProperties.FieldColumnPosition] = {
                        [FieldGroupProperties.JsonPathKey]: ageJsonPathKey,
                        [FieldGroupProperties.PositionBefore]: true
                    };
                }
            }
            return [group, true];
        }) as core.JsonObject;

        const data = new RepositionData();
        data.TestTitle = "UserProfile - Reposition 'Address' before 'Age'";
        data.MetadataModel = metadataModel;
        data.ExpectedOk = true;
        data.ExpectedIndexOfReadOrderOfColumnFields = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1];
        testDataList.push(data);
    }

    // Case 8: Employee - Reposition Nested 'Profile' after 'Skills'
    {
        let metadataModel = EmployeeMetadataModel();
        let skillsJsonPathKey = '';
        ForEach(metadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'Skills') {
                skillsJsonPathKey = AsJSONPath(group[FieldGroupProperties.JsonPathKey]) || '';
                return [true, true];
            }
            return [false, false];
        });

        metadataModel = Map(metadataModel, (group) => {
            if (group[FieldGroupProperties.Name] === 'UserProfile' && skillsJsonPathKey) {
                group[FieldGroupProperties.FieldColumnPosition] = {
                    [FieldGroupProperties.JsonPathKey]: skillsJsonPathKey
                };
            }
            return [group, true];
        }) as core.JsonObject;

        const data = new RepositionData();
        data.TestTitle = "Employee - Reposition Nested 'Profile' after 'Skills'";
        data.MetadataModel = metadataModel;
        data.ExpectedOk = true;
        data.ExpectedIndexOfReadOrderOfColumnFields = [0, 6, 1, 2, 3, 4, 5];
        testDataList.push(data);
    }

    it.each(testDataList)('', (data) => {
        const extractor = new Extraction(data.MetadataModel);
        const columnFields = extractor.Extract();
        if (data.ExpectedOk) {
            expect(columnFields).toBeDefined();
        }
        if (!columnFields) return;

        columnFields.Reposition();
        expect(columnFields.RepositionedReadOrderOfColumnFields).toEqual(data.ExpectedIndexOfReadOrderOfColumnFields);
    });
});
