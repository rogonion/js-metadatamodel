import { describe, expect, it } from 'vitest';
import { FieldValue, GetColumnFields } from '@database';
import { EmployeeMetadataModel, ProductMetadataModel } from '../metadata_models';

describe('Database FieldValue', () => {
    it('FieldValue on Employee (Set Nested)', () => {
        const employee: any = {
            ID: [1],
            Profile: [{}]
        };

        const metadataModel = EmployeeMetadataModel();
        const gcf = new GetColumnFields();
        gcf.JoinDepth = 1;
        gcf.TableCollectionName = 'Profile';
        const userProfileColumnFields = gcf.Get(metadataModel);

        const fieldValue = new FieldValue(employee, userProfileColumnFields);
        const noOfModifications = fieldValue.Set('Age', 16);

        expect(noOfModifications).toBe(1);
        expect(employee.Profile[0].Age).toEqual([16]);
    });

    it('FieldValue on Product (Get, Set, Delete)', () => {
        const product: any = {
            ID: [1],
            Name: [],
            Price: [0.0]
        };

        const metadataModel = ProductMetadataModel();
        const gcf = new GetColumnFields();
        gcf.JoinDepth = 0;
        gcf.TableCollectionName = 'Product';
        const columnFields = gcf.Get(metadataModel);

        const fieldValue = new FieldValue(product, columnFields);

        // Get ID
        const noOfResults = fieldValue.Get('ID');
        expect(noOfResults).toBe(1);

        const valueFound = fieldValue.GetValueFound();
        expect(valueFound).toEqual([1]);

        // Set Name
        const noOfModifications = fieldValue.Set('Name', 'Twinkies');
        expect(noOfModifications).toBe(1);
        expect(product.Name).toEqual(['Twinkies']);

        // Delete Price
        const deleteModifications = fieldValue.Delete('Price');
        expect(deleteModifications).toBe(1);

        // Check if Price is deleted or empty
        if (product.Price) {
            expect(product.Price).toEqual([]);
        } else {
            expect(product.Price).toBeUndefined();
        }
    });
});
