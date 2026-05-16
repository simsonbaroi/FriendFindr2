import * as fs from 'fs';
import * as path from 'path';

function getFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

function processFiles() {
    const files = getFiles('src');
    for (const filePath of files) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let newContent = content.replace(/bg-\[#00A3B8\] dark:bg-\[#00C4D8\]\/10/g, "bg-[#00A3B8]/10 dark:bg-[#00C4D8]/10");

        if (newContent !== content) {
            fs.writeFileSync(filePath, newContent, 'utf-8');
            console.log(`Updated ${filePath}`);
        }
    }
}

processFiles();
