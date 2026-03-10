import { TestData } from '@internal';
import { type path } from '@rogonion/js-json';
import { describe, expect, it } from 'vitest';
import { JsonPathToValue } from '@core';

describe('Core JsonPathToValue', () => {
    it.each(testData)('$TestTitle', (data) => {
        const jptv = new JsonPathToValue();
        jptv.RemoveGroupFields = data.RemoveGroupFields;
        jptv.SourceOfValueIsAnArray = data.SourceOfValueIsAnArray;
        jptv.ReplaceArrayPathPlaceholderWithActualIndexes = data.ReplaceArrayPathPlaceholderWithActualIndexes;
        try {
            const res = jptv.Get(data.Path, data.ArrayIndexes);
            expect(res).toBe(data.Expected);
        } catch (e) {
            if (data.ExpectedOk) {
                throw e;
            }
            // If we expected an error (ExpectedOk = false), we catch it here.
            // Since all current test cases expect success, this block is just for completeness.
        }
    });
});

class JsonPathToValueData extends TestData {
    public Path: path.JSONPath = '';
    public RemoveGroupFields: boolean = false;
    public SourceOfValueIsAnArray: boolean = false;
    public ReplaceArrayPathPlaceholderWithActualIndexes: boolean = false;
    public ArrayIndexes: number[] = [];
    public ExpectedOk: boolean = false;
    public Expected: path.JSONPath = '';
}

const testData: JsonPathToValueData[] = [
    // Case 1: Remove GroupFields, Source is Array
    Object.assign(new JsonPathToValueData(), {
        TestTitle: 'Remove GroupFields, Source is Array, Default Index (0)',
        Path: '$.GroupFields[*].Group1.GroupFields[*].Group1Field',
        RemoveGroupFields: true,
        SourceOfValueIsAnArray: true,
        ReplaceArrayPathPlaceholderWithActualIndexes: true,
        ExpectedOk: true,
        Expected: '$[0].Group1[0].Group1Field'
    }),
    // Case 2: Remove GroupFields, Source is Object
    Object.assign(new JsonPathToValueData(), {
        TestTitle: 'Remove GroupFields, Source is Object, Default Index (0)',
        Path: '$.GroupFields[*].Group1.GroupFields[*].Group1Field',
        RemoveGroupFields: true,
        ExpectedOk: true,
        ReplaceArrayPathPlaceholderWithActualIndexes: true,
        Expected: '$.Group1[0].Group1Field'
    }),
    // Case 3: Keep GroupFields, Specific Indexes
    Object.assign(new JsonPathToValueData(), {
        TestTitle: 'Keep GroupFields, Specific Indexes [1, 2]',
        Path: '$.GroupFields[*].Group1.GroupFields[*].Group1Field',
        ExpectedOk: true,
        ArrayIndexes: [1, 2],
        Expected: '$.GroupFields[1].Group1.GroupFields[2].Group1Field'
    }),
    // Case 4: Remove GroupFields, Source is Array, Specific Indexes
    Object.assign(new JsonPathToValueData(), {
        TestTitle: 'Remove GroupFields, Source is Array, Specific Indexes [1, 2]',
        Path: '$.GroupFields[*].Group1.GroupFields[*].Group1Field',
        RemoveGroupFields: true,
        SourceOfValueIsAnArray: true,
        ExpectedOk: true,
        ArrayIndexes: [1, 2],
        Expected: '$[1].Group1[2].Group1Field'
    }),
    // Case 5: Remove GroupFields, Source is Object, Single Index
    Object.assign(new JsonPathToValueData(), {
        TestTitle: 'Remove GroupFields, Source is Object, Single Index [2]',
        Path: '$.GroupFields[*].Group1.GroupFields[*].Group1Field',
        RemoveGroupFields: true,
        ExpectedOk: true,
        ArrayIndexes: [2],
        Expected: '$.Group1[2].Group1Field'
    })
];
