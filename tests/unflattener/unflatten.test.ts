import { describe, it, expect } from 'vitest';
import { Unflattener, Signature } from '@unflattener';
import { jsobject, core, schema } from '@rogonion/js-json';
import { EmployeeMetadataModel, ProductMetadataModel, UserMetadataModel } from '../metadata_models';
import { ColumnFields } from '@fieldcolumns';
import { Map } from '@iter';
import { FieldGroupProperties } from '@core';
import { EmployeeSchema, ProductSchema, UserSchema } from '../schemas';
import { Address, Employee, Product, User, UserProfile } from '../types';
import { type FlattenedRow, type FlattenedTable } from '@flattener';

class UnflattenTestData {
    TestTitle: string = '';
    SourceTable: any[][] = [];
    MetadataModel: core.JsonObject = {};
    Schema?: schema.Schema;
    ColumnFields?: ColumnFields;
    ExpectedResult: any = null;
}

function toFlattenedTable(data: any[][]): FlattenedTable {
    const flattenedTable: FlattenedTable = new Array(data.length).fill(undefined);
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        let fRow: FlattenedRow = new Array(row.length).fill(undefined);
        for (let j = 0; j < row.length; j++) {
            const val = row[j];
            if (!core.IsDefined(val)) {
                fRow[j] = undefined;
            } else {
                fRow[j] = val;
            }
        }
        flattenedTable[i] = fRow;
    }
    return flattenedTable;
}

describe('Unflattener Unflatten', () => {
    const testDataList: UnflattenTestData[] = [];

    // Case 1: Simple User Unflattening
    {
        const userTable = [[[101], ['Alice'], ['alice@example.com']]];
        const data = new UnflattenTestData();
        data.TestTitle = 'Simple User Unflattening';
        data.SourceTable = userTable;
        data.MetadataModel = UserMetadataModel();
        data.Schema = Object.assign(new schema.DynamicSchemaNode(), {
            Kind: schema.DataKind.Array,
            ChildNodesLinearCollectionElementsSchema: UserSchema()
        });
        data.ExpectedResult = [
            (function (): User {
                const u = new User();
                u.ID = [101];
                u.Name = ['Alice'];
                u.Email = ['alice@example.com'];
                return u;
            })()
        ];
        testDataList.push(data);
    }

    // Case 2: Deep Nested Employee Unflattening
    {
        const empTable = [
            [[500], ['Bob'], [30], ['123 Tech Ln'], ['Silicon Valley'], ['94000'], ['Go', 'Rust']],
            [[500], ['Bob'], [30], ['456 Tech Ln'], ['Silicon Valley'], ['94000'], ['Go', 'Rust']],
            [[500], ['Alice'], [100], null, null, null, null],
            [600, 'Doe', '35', '123 Tech Ln', 'Silicon Valley', '94000', ['HTML', 'CSS']],
            [null, null, null, null, null, null, null]
        ];

        const expectedEmp = [
            (function (): Employee {
                const e = new Employee();
                e.ID = [500];
                e.Skills = ['Go', 'Rust'];
                e.Profile = [
                    (function (): UserProfile {
                        const p = new UserProfile();
                        p.Name = ['Bob'];
                        p.Age = [30];
                        p.Address = [
                            (function (): Address {
                                const a = new Address();
                                a.Street = ['123 Tech Ln'];
                                a.City = ['Silicon Valley'];
                                a.ZipCode = ['94000'];
                                return a;
                            })(),
                            (function (): Address {
                                const a = new Address();
                                a.Street = ['456 Tech Ln'];
                                a.City = ['Silicon Valley'];
                                a.ZipCode = ['94000'];
                                return a;
                            })()
                        ];
                        return p;
                    })(),
                    (function (): UserProfile {
                        const p = new UserProfile();
                        p.Name = ['Alice'];
                        p.Age = [100];
                        return p;
                    })()
                ];
                return e;
            })(),
            (function (): Employee {
                const e = new Employee();
                e.ID = [600];
                e.Skills = ['HTML', 'CSS'];
                e.Profile = [
                    (function (): UserProfile {
                        const p = new UserProfile();
                        p.Name = ['Doe'];
                        p.Age = [35];
                        p.Address = [
                            (function (): Address {
                                const a = new Address();
                                a.Street = ['123 Tech Ln'];
                                a.City = ['Silicon Valley'];
                                a.ZipCode = ['94000'];
                                return a;
                            })()
                        ];
                        return p;
                    })()
                ];
                return e;
            })()
        ];

        const data = new UnflattenTestData();
        data.TestTitle = 'Deep Nested Employee Unflattening';
        data.SourceTable = empTable;
        data.MetadataModel = EmployeeMetadataModel();
        data.Schema = Object.assign(new schema.DynamicSchemaNode(), {
            Kind: schema.DataKind.Array,
            ChildNodesLinearCollectionElementsSchema: EmployeeSchema()
        });
        data.ExpectedResult = expectedEmp;
        testDataList.push(data);
    }

    // Case 3: Array of Products Unflattening
    {
        const prodTable = [
            [[1], ['Laptop'], [999.99]],
            [[2], ['Mouse'], [25.5]]
        ];

        const data = new UnflattenTestData();
        data.TestTitle = 'Array of Products Unflattening';
        data.SourceTable = prodTable;
        data.MetadataModel = ProductMetadataModel();
        data.Schema = Object.assign(new schema.DynamicSchemaNode(), {
            Kind: schema.DataKind.Array,
            ChildNodesLinearCollectionElementsSchema: ProductSchema()
        });
        data.ExpectedResult = [
            (function (): Product {
                const p = new Product();
                p.ID = [1];
                p.Name = ['Laptop'];
                p.Price = [999.99];
                return p;
            })(),
            (function (): Product {
                const p = new Product();
                p.ID = [2];
                p.Name = ['Mouse'];
                p.Price = [25.5];
                return p;
            })()
        ];
        testDataList.push(data);
    }

    // Case 4: Partial Data (Nil Values)
    {
        const partialProdTable = [
            [[1], ['Laptop'], [999.99]],
            [[2], ['Freebie'], undefined]
        ];
        const data = new UnflattenTestData();
        data.TestTitle = 'Partial Data (Nil Values)';
        data.SourceTable = partialProdTable;
        data.MetadataModel = ProductMetadataModel();
        data.Schema = Object.assign(new schema.DynamicSchemaNode(), {
            Kind: schema.DataKind.Array,
            ChildNodesLinearCollectionElementsSchema: ProductSchema()
        });
        data.ExpectedResult = [
            (function (): Product {
                const p = new Product();
                p.ID = [1];
                p.Name = ['Laptop'];
                p.Price = [999.99];
                return p;
            })(),
            (function (): Product {
                const p = new Product();
                p.ID = [2];
                p.Name = ['Freebie'];
                return p;
            })()
        ];
        testDataList.push(data);
    }

    // Case 5: Horizontal Expansion (Pivoting)
    {
        const pivotedRows = [
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
                // Skills (Max 3)
                ['Go'],
                ['Python'],
                null // Padding
            ]
        ];

        let pivotedMeta = EmployeeMetadataModel();
        pivotedMeta = Map(pivotedMeta, (node: core.JsonObject) => {
            if (core.IsString(node[FieldGroupProperties.Name])) {
                switch (node[FieldGroupProperties.Name]) {
                    case 'Skills':
                        node[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                        node[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 3;
                        break;
                    case 'Address':
                        node[FieldGroupProperties.ViewValuesInSeparateColumns] = true;
                        node[FieldGroupProperties.ViewMaxNoOfValuesInSeparateColumns] = 2;
                        break;
                }
            }
            return [node, false];
        });

        const data = new UnflattenTestData();
        data.TestTitle = 'Horizontal Expansion (Pivoting)';
        data.SourceTable = pivotedRows;
        data.MetadataModel = pivotedMeta;
        data.Schema = Object.assign(new schema.DynamicSchemaNode(), {
            Kind: schema.DataKind.Array,
            ChildNodesLinearCollectionElementsSchema: EmployeeSchema()
        });
        data.ExpectedResult = [
            (function (): Employee {
                const e = new Employee();
                e.ID = [999];
                e.Skills = ['Go', 'Python'];
                e.Profile = [
                    (function (): UserProfile {
                        const p = new UserProfile();
                        p.Name = ['Pivot Master'];
                        p.Age = [40];
                        p.Address = [
                            (function (): Address {
                                const a = new Address();
                                a.Street = ['Office 1'];
                                a.City = ['Nairobi'];
                                a.ZipCode = ['001'];
                                return a;
                            })(),
                            (function (): Address {
                                const a = new Address();
                                a.Street = ['Home 2'];
                                a.City = ['Mombasa'];
                                a.ZipCode = ['002'];
                                return a;
                            })()
                        ];
                        return p;
                    })()
                ];
                return e;
            })()
        ];
        testDataList.push(data);
    }

    it.each(testDataList)('$TestTitle', (data) => {
        const sourceTable = toFlattenedTable(data.SourceTable);

        const destination = new jsobject.JSObject();
        if (data.Schema) {
            destination.Schema = data.Schema;
        } else {
            destination.Source = [];
        }

        const u = new Unflattener(data.MetadataModel, new Signature());
        if (data.ColumnFields) {
            u.ColumnFields = data.ColumnFields;
        }
        u.Destination = destination;

        u.Unflatten(sourceTable);

        const actualResult = destination.Source;
        expect(actualResult).toEqual(data.ExpectedResult);
    });
});
