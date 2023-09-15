import { fetchCorrectnessData } from '../src/correctness'; 
import dotenv from 'dotenv';

dotenv.config({ path: 'C:\\Users\\osceo\\Desktop\\Stuff\\ECE461\\ECE-461-Group-12-FA2023-project-part1\\src\\.env' }); //change this to your direct path, idk why the relative path refuses to work

test('calculates the correctness score correctly', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const repoUrl = 'https://github.com/wolever/parameterized'; 
    const result = await fetchCorrectnessData(repoUrl);
    
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
});