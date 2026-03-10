import { TestData } from '@internal';
import { core } from '@rogonion/js-json';
import { describe, expect, it } from 'vitest';
import { ForEach } from '@iter';
import { UserInformationMetadataModel } from './misc';

class ForEachData extends TestData {
    public MetadataModel: core.JsonObject = {};
    public Expected: number = 0;
}

const testData: ForEachData[] = [
    Object.assign(new ForEachData(), {
        TestTitle: 'Test Number of iterations from UserInformationMetadataModel',
        MetadataModel: UserInformationMetadataModel(),
        Expected: 5
    })
];

describe('Iter ForEach', () => {
    it.each(testData)('$TestTitle', (data) => {
        let noOfIterations = 0;
        ForEach(data.MetadataModel, () => {
            noOfIterations++;
            return [false, false];
        });

        expect(noOfIterations).toBe(data.Expected);
    });
});
