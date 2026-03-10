import { TestData } from '@internal';
import { core } from '@rogonion/js-json';
import { describe, expect, it } from 'vitest';
import { ForEach } from '@iter';
import { GetColumnFields, ColumnFields } from '../../src/database/get_column_fields';
import { FieldGroupProperties, type FieldGroupPropertiesMatch, IsFieldAGroup } from '@core';
import {
    ProductMetadataModel,
    CompanyMetadataModel,
    UserProfileMetadataModel,
    EmployeeMetadataModel
} from '../metadata_models';

class GetColumnFieldsData extends TestData {
    public MetadataModel: core.JsonObject = {};
    public JoinDepth?: number;
    public TableCollectionName?: string;
    public TableCollectionUid?: string;
    public Skip?: FieldGroupPropertiesMatch;
    public Add?: FieldGroupPropertiesMatch;
    public ExpectedOk: boolean = false;
    public Expected?: ColumnFields;
}

function getExpectedColumnFields(
    metadataModel: core.JsonObject,
    criteria: {
        uid?: string;
        name?: string;
        joinDepth?: number;
        add?: FieldGroupPropertiesMatch;
    }
): ColumnFields {
    const columnFields = new ColumnFields();
    const { uid, name, joinDepth, add } = criteria;

    ForEach(metadataModel, (fieldGroup: core.JsonObject) => {
        // Check Add filter
        if (add) {
            let match = false;
            for (const addKey in add) {
                if (Object.prototype.hasOwnProperty.call(add, addKey)) {
                    // Simple equality check as per FirstMatch logic for primitives
                    if (fieldGroup[addKey] === add[addKey]) {
                        match = true;
                        break;
                    }
                }
            }
            if (!match) return [false, false];
        }

        let match = false;
        if (uid !== undefined) {
            if (fieldGroup[FieldGroupProperties.DatabaseTableCollectionUid] === uid) {
                match = true;
            }
        } else if (name !== undefined && joinDepth !== undefined) {
            if (
                fieldGroup[FieldGroupProperties.DatabaseJoinDepth] === joinDepth &&
                fieldGroup[FieldGroupProperties.DatabaseTableCollectionName] === name
            ) {
                match = true;
            }
        }

        if (match) {
            if (!IsFieldAGroup(fieldGroup)) {
                const fieldColumnName = fieldGroup[FieldGroupProperties.DatabaseFieldColumnName];
                if (typeof fieldColumnName === 'string' && fieldColumnName.length > 0) {
                    columnFields.ColumnFieldsReadOrder.push(fieldColumnName);
                    columnFields.Fields[fieldColumnName] = fieldGroup;
                }
            }
            return [false, false];
        }
        return [false, true];
    });
    return columnFields;
}

const testData: GetColumnFieldsData[] = [];

// Case 1: Product Metadata Model
const productModel = ProductMetadataModel();
testData.push(
    Object.assign(new GetColumnFieldsData(), {
        TestTitle: 'Product MetadataModel (By UID)',
        MetadataModel: productModel,
        TableCollectionUid: productModel[FieldGroupProperties.Name],
        ExpectedOk: true,
        Expected: getExpectedColumnFields(productModel, {
            uid: productModel[FieldGroupProperties.Name] as string
        })
    })
);

// Case 2: Company Metadata Model
const companyModel = CompanyMetadataModel();
testData.push(
    Object.assign(new GetColumnFieldsData(), {
        TestTitle: 'Company MetadataModel (By Name & JoinDepth)',
        MetadataModel: companyModel,
        JoinDepth: 0,
        TableCollectionName: companyModel[FieldGroupProperties.Name],
        ExpectedOk: true,
        Expected: getExpectedColumnFields(companyModel, {
            name: companyModel[FieldGroupProperties.Name] as string,
            joinDepth: 0
        })
    })
);

// Case 3: UserProfile Metadata Model
const userProfileModel = UserProfileMetadataModel();
testData.push(
    Object.assign(new GetColumnFieldsData(), {
        TestTitle: 'UserProfile MetadataModel (By Name & JoinDepth)',
        MetadataModel: userProfileModel,
        JoinDepth: 0,
        TableCollectionName: userProfileModel[FieldGroupProperties.Name],
        ExpectedOk: true,
        Expected: getExpectedColumnFields(userProfileModel, {
            name: userProfileModel[FieldGroupProperties.Name] as string,
            joinDepth: 0
        })
    })
);

// Case 4: Employee Metadata Model (Profile)
const employeeModel = EmployeeMetadataModel();
testData.push(
    Object.assign(new GetColumnFieldsData(), {
        TestTitle: 'Employee MetadataModel - Profile Collection (By UID)',
        MetadataModel: employeeModel,
        TableCollectionUid: 'Profile',
        ExpectedOk: true,
        Expected: getExpectedColumnFields(employeeModel, {
            uid: 'Profile'
        })
    })
);

// Case 5: Employee Metadata Model (Profile) with Add Filter
testData.push(
    Object.assign(new GetColumnFieldsData(), {
        TestTitle: 'Employee MetadataModel - Profile Collection (By UID) with Add Filter (Age)',
        MetadataModel: employeeModel,
        TableCollectionUid: 'Profile',
        Add: {
            [FieldGroupProperties.DatabaseFieldColumnName]: 'Age'
        },
        ExpectedOk: true,
        Expected: getExpectedColumnFields(employeeModel, {
            uid: 'Profile',
            add: {
                [FieldGroupProperties.DatabaseFieldColumnName]: 'Age'
            }
        })
    })
);

describe('Database GetColumnFields', () => {
    it.each(testData)('$TestTitle', (data) => {
        const gcf = new GetColumnFields();
        if (data.Skip) gcf.Skip = data.Skip;
        if (data.Add) gcf.Add = data.Add;
        if (data.TableCollectionUid !== undefined) gcf.TableCollectionUID = data.TableCollectionUid;
        if (data.JoinDepth !== undefined) gcf.JoinDepth = data.JoinDepth;
        if (data.TableCollectionName !== undefined) gcf.TableCollectionName = data.TableCollectionName;

        if (data.ExpectedOk) {
            const res = gcf.Get(data.MetadataModel);
            expect(JSON.parse(JSON.stringify(res))).toEqual(JSON.parse(JSON.stringify(data.Expected)));
        } else {
            expect(() => gcf.Get(data.MetadataModel)).toThrow();
        }
    });
});
