import { describe, it, expect } from 'vitest';
import { FLattener } from '@flattener';
import { jsobject, core } from '@rogonion/js-json';
import { FieldGroupProperties } from '@core';
import { Extraction, ColumnFields } from '@fieldcolumns';
import { EmployeeMetadataModel, ProductMetadataModel, UserMetadataModel } from '../metadata_models';
import { Map } from '@iter';

// --- Test Data Helpers ---

function NewJSObject(source: any): jsobject.JSObject {
    const obj = new jsobject.JSObject();
    obj.Source = source;
    return obj;
}

class FlattenTestData {
    TestTitle: string = '';
    SourceObject: jsobject.JSObject = new jsobject.JSObject();
    MetadataModel: core.JsonObject = {};
    ColumnFields?: ColumnFields;
    ExpectedResult: any[][] = [];
}

describe('Flattener Flatten and WriteTo', () => {
    const testDataList: FlattenTestData[] = [];

    // Case 1: Simple User Flattening
    {
        const userData = {
            ID: [101],
            Name: ['Alice'],
            Email: ['alice@example.com']
        };
        const expectedUser = [[[101], ['Alice'], ['alice@example.com']]];

        const data = new FlattenTestData();
        data.TestTitle = 'Simple User Flattening';
        data.SourceObject = NewJSObject(userData);
        data.MetadataModel = UserMetadataModel();
        data.ExpectedResult = expectedUser;
        testDataList.push(data);
    }

    // Case 2: Deep Nested Employee Flattening
    {
        const empData = {
            ID: [500],
            Skills: ['Go', 'Rust'],
            Profile: [
                {
                    Name: ['Bob'],
                    Age: [30],
                    Address: [
                        {
                            Street: ['123 Tech Ln'],
                            City: ['Silicon Valley'],
                            ZipCode: ['94000']
                        }
                    ]
                }
            ]
        };
        const expectedEmp = [[[500], ['Bob'], [30], ['123 Tech Ln'], ['Silicon Valley'], ['94000'], ['Go', 'Rust']]];

        const data = new FlattenTestData();
        data.TestTitle = 'Deep Nested Employee Flattening';
        data.SourceObject = NewJSObject(empData);
        data.MetadataModel = EmployeeMetadataModel();
        data.ExpectedResult = expectedEmp;
        testDataList.push(data);
    }

    // Case 3: Array of Products Flattening
    {
        const prodData = [
            { ID: [1], Name: ['Laptop'], Price: [999.99] },
            { ID: [2], Name: ['Mouse'], Price: [25.5] }
        ];
        const expectedProd = [
            [[1], ['Laptop'], [999.99]],
            [[2], ['Mouse'], [25.5]]
        ];

        const data = new FlattenTestData();
        data.TestTitle = 'Array of Products Flattening';
        data.SourceObject = NewJSObject(prodData);
        data.MetadataModel = ProductMetadataModel();
        data.ExpectedResult = expectedProd;
        testDataList.push(data);
    }

    // Case 4: WriteTo with Reordering and Skipping
    {
        const prodData = [
            { ID: [1], Name: ['Laptop'], Price: [999.99] },
            { ID: [2], Name: ['Mouse'], Price: [25.5] }
        ];

        const prodMeta = ProductMetadataModel();
        const extraction = new Extraction(prodMeta);
        const extractedCols = extraction.Extract();

        // Original Order: ID (0), Name (1), Price (2)
        // Desired: Price (2), Name (1). ID (0) skipped.
        extractedCols.RepositionedReadOrderOfColumnFields = [2, 1];
        extractedCols.Skip(undefined, undefined);

        const expectedReordered = [
            [[999.99], ['Laptop']],
            [[25.5], ['Mouse']]
        ];

        const data = new FlattenTestData();
        data.TestTitle = 'WriteTo with Reordering and Skipping';
        data.SourceObject = NewJSObject(prodData);
        data.MetadataModel = prodMeta;
        data.ColumnFields = extractedCols;
        data.ExpectedResult = expectedReordered;
        testDataList.push(data);
    }

    // Case 5: Matrix Multiplication
    {
        const complexEmpData = [
            {
                ID: [100],
                Skills: ['Go'],
                Profile: [
                    {
                        Name: ['Dev'],
                        Age: [30],
                        Address: [
                            {
                                Street: ['Home St'],
                                City: ['Nairobi'],
                                ZipCode: ['00100']
                            },
                            {
                                Street: ['Work Ave'],
                                City: ['Westlands'],
                                ZipCode: ['00200']
                            }
                        ]
                    }
                ]
            },
            {
                ID: [200],
                Skills: ['Management'],
                Profile: [
                    {
                        Name: ['Admin'],
                        Age: [45],
                        Address: [
                            {
                                Street: ['HQ Blvd'],
                                City: ['Mombasa'],
                                ZipCode: ['80100']
                            }
                        ]
                    },
                    {
                        Name: ['Consultant'],
                        Age: [50],
                        Address: [
                            {
                                Street: ['Remote Ln'],
                                City: ['Kisumu'],
                                ZipCode: ['40100']
                            }
                        ]
                    }
                ]
            }
        ];

        const expectedComplexRows = [
            [[100], ['Dev'], [30], ['Home St'], ['Nairobi'], ['00100'], ['Go']],
            [[100], ['Dev'], [30], ['Work Ave'], ['Westlands'], ['00200'], ['Go']],
            [[200], ['Admin'], [45], ['HQ Blvd'], ['Mombasa'], ['80100'], ['Management']],
            [[200], ['Consultant'], [50], ['Remote Ln'], ['Kisumu'], ['40100'], ['Management']]
        ];

        const data = new FlattenTestData();
        data.TestTitle = 'Matrix Multiplication: Multi-Employee/Profile/Address';
        data.SourceObject = NewJSObject(complexEmpData);
        data.MetadataModel = EmployeeMetadataModel();
        data.ExpectedResult = expectedComplexRows;
        testDataList.push(data);
    }

    // Case 6: Horizontal Expansion (Pivoting)
    {
        const pivotedEmpData = {
            ID: [999],
            Skills: ['Go', 'Python'],
            Profile: [
                {
                    Name: ['Pivot Master'],
                    Age: [40],
                    Address: [
                        {
                            Street: ['Office 1'],
                            City: ['Nairobi'],
                            ZipCode: ['001']
                        },
                        {
                            Street: ['Home 2'],
                            City: ['Mombasa'],
                            ZipCode: ['002']
                        }
                    ]
                }
            ]
        };

        let pivotedMeta = EmployeeMetadataModel();
        pivotedMeta = Map(pivotedMeta, (fieldGroup: core.JsonObject) => {
            if (core.IsString(fieldGroup[FieldGroupProperties.Name])) {
                switch (fieldGroup[FieldGroupProperties.Name]) {
                    case 'Skills':
                        fieldGroup[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                        fieldGroup[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 3;
                        break;
                    case 'Address':
                        fieldGroup[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                        fieldGroup[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 2;
                        break;
                }
            }
            return [fieldGroup, false];
        });

        const expectedPivotedRow = [
            [
                [999],
                ['Pivot Master'],
                [40],
                // Address 1
                ['Office 1'],
                ['Nairobi'],
                ['001'],
                // Address 2
                ['Home 2'],
                ['Mombasa'],
                ['002'],
                // Skills
                ['Go'],
                ['Python'],
                [] // Padding
            ]
        ];

        const data = new FlattenTestData();
        data.TestTitle = 'Horizontal Expansion (Pivoting)';
        data.SourceObject = NewJSObject(pivotedEmpData);
        data.MetadataModel = pivotedMeta;
        data.ExpectedResult = expectedPivotedRow;
        testDataList.push(data);
    }

    it.each(testDataList)('', (data) => {
        const destinationSource: any[] = [];
        const destination = NewJSObject(destinationSource);

        const f = new FLattener(data.MetadataModel);
        if (data.ColumnFields) {
            f.ColumnFields = data.ColumnFields;
        }

        f.Flatten(data.SourceObject);
        f.WriteToDestination(destination);

        const actualResult = destination.Source;
        expect(actualResult).toEqual(data.ExpectedResult);
    });
});

describe('Flattener Reset', () => {
    it('should reset state correctly', () => {
        const userMeta = UserMetadataModel();
        const f = new FLattener(userMeta);

        // Batch 1
        const user1 = { ID: [1], Name: ['Alice'] };
        f.Flatten(NewJSObject(user1));
        expect(f.CurrentSourceObjectResult.length).toBe(1);

        // Reset
        f.Reset();
        expect(f.CurrentSourceObjectResult.length).toBe(0);

        // Batch 2
        const user2 = { ID: [2], Name: ['Bob'] };
        f.Flatten(NewJSObject(user2));
        expect(f.CurrentSourceObjectResult.length).toBe(1);

        // Verify content of Batch 2 (Name is index 1)
        // Row 0, Col 1 -> ["Bob"]
        expect(f.CurrentSourceObjectResult[0][1]).toEqual(['Bob']);
    });
});
