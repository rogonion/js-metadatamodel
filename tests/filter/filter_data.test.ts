import { TestData } from '@internal';
import { core, path } from '@rogonion/js-json';
import { describe, expect, it } from 'vitest';
import {
    DataFilter,
    FilterConditionProps,
    FilterConditions,
    LogicalOperatorValues,
    QueryConditionProps,
    QuerySectionTypes
} from '@filter';
import { FieldTypes } from '@core';
import { ProductMetadataModel, UserProfileMetadataModel } from '../metadata_models';

class FilterData extends TestData {
    public Object: any;
    public MetadataModel: core.JsonObject = {};
    public QueryCondition: core.JsonObject = {};
    public RootJsonPathKey: path.JSONPath = '';
    public RootJsonPathToValue: path.JSONPath = '';
    public FilterExcludeIndexes: number[] = [];
}

const products = [
    { ID: [0], Name: ['Product 0'], Price: [11.0] },
    { ID: [1], Name: ['Product 1'] },
    { ID: [2], Name: ['Product 2'] },
    { ID: [3], Name: ['Product 3'] }
];

const userProfiles = [
    {
        Name: ['User 0'],
        Age: [10],
        Address: [{ Street: ['Street 1'], City: ['City 1'] }]
    },
    {
        Name: ['User 2'],
        Age: [20],
        Address: [{ Street: ['Street 2'], City: ['City 2'] }]
    },
    {
        Name: ['User 3'],
        Age: [30],
        Address: [
            { Street: ['Street 3'], City: ['City 3'] },
            { Street: ['Street 4'], City: ['City 4'] }
        ]
    }
];

const testData: FilterData[] = [
    Object.assign(new FilterData(), {
        TestTitle: 'Product Metadata Model - Filter by ID and Name',
        Object: products,
        MetadataModel: ProductMetadataModel(),
        QueryCondition: {
            [QueryConditionProps.Type]: QuerySectionTypes.LogicalOperator,
            ['LogicalOperator']: LogicalOperatorValues.And,
            [QueryConditionProps.Value]: [
                {
                    [QueryConditionProps.Type]: QuerySectionTypes.FieldGroup,
                    [QueryConditionProps.Value]: {
                        ['$.GroupFields[*].ID']: {
                            [FilterConditions.GreaterThan]: {
                                [FilterConditionProps.AssumedFieldType]: FieldTypes.Number,
                                [FilterConditionProps.Value]: 0
                            },
                            [FilterConditions.LessThan]: {
                                [FilterConditionProps.AssumedFieldType]: FieldTypes.Number,
                                [FilterConditionProps.Value]: 3
                            }
                        }
                    }
                },
                {
                    [QueryConditionProps.Type]: QuerySectionTypes.FieldGroup,
                    [QueryConditionProps.Value]: {
                        ['$.GroupFields[*].Name']: {
                            [FilterConditions.EndsWith]: {
                                [FilterConditionProps.AssumedFieldType]: FieldTypes.Text,
                                [FilterConditionProps.Value]: '2'
                            }
                        }
                    }
                }
            ]
        },
        FilterExcludeIndexes: [0, 1, 3]
    }),
    Object.assign(new FilterData(), {
        TestTitle: 'User Profile Metadata Model - Filter by Address Count or City Prefix',
        Object: userProfiles,
        MetadataModel: UserProfileMetadataModel(),
        QueryCondition: {
            [QueryConditionProps.Type]: QuerySectionTypes.LogicalOperator,
            ['LogicalOperator']: LogicalOperatorValues.Or,
            [QueryConditionProps.Value]: [
                {
                    [QueryConditionProps.Type]: QuerySectionTypes.FieldGroup,
                    [QueryConditionProps.Value]: {
                        ['$.GroupFields[*].Address']: {
                            [FilterConditions.NoOfEntriesGreaterThan]: {
                                [FilterConditionProps.Value]: 1
                            }
                        }
                    }
                },
                {
                    [QueryConditionProps.Type]: QuerySectionTypes.FieldGroup,
                    [QueryConditionProps.Value]: {
                        ['$.GroupFields[*].Address.GroupFields[*].City']: {
                            [FilterConditions.BeginsWith]: {
                                [FilterConditionProps.AssumedFieldType]: FieldTypes.Text,
                                [FilterConditionProps.Value]: 'Streete'
                            }
                        }
                    }
                }
            ]
        },
        // User 3 (Index 2) has 2 addresses, so NoOfEntriesGreaterThan 1 should pass.
        // Excluded should be 0 and 1.
        FilterExcludeIndexes: [0, 1]
    }),
    Object.assign(new FilterData(), {
        TestTitle: 'User Profile Metadata Model - Focused Filter on Address at Index 2',
        Object: userProfiles,
        MetadataModel: UserProfileMetadataModel(),
        QueryCondition: {
            [QueryConditionProps.Type]: QuerySectionTypes.FieldGroup,
            [QueryConditionProps.Negate]: true,
            [QueryConditionProps.Value]: {
                ['$.GroupFields[*].Address.GroupFields[*].City']: {
                    [FilterConditions.BeginsWith]: {
                        [FilterConditionProps.AssumedFieldType]: FieldTypes.Text,
                        [FilterConditionProps.Value]: 'City 4'
                    }
                }
            }
        },
        RootJsonPathKey: '$.GroupFields[*].Address',
        RootJsonPathToValue: '$[2].Address',
        FilterExcludeIndexes: [1]
    })
];

describe('Filter DataFilter', () => {
    it.each(testData)('$TestTitle', (data) => {
        const fd = new DataFilter(data.Object, data.MetadataModel);
        const res = fd.filter(data.QueryCondition, data.RootJsonPathKey, data.RootJsonPathToValue);

        expect(res).toEqual(data.FilterExcludeIndexes);
    });
});
