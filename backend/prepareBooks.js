import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import md5 from 'md5';
import aesjs from 'aes-js';
import msgpack from 'msgpack-lite';
import { randomBytes } from 'crypto';

const password = "qkkAg8va";
const key = aesjs.utils.hex.toBytes("77afca0860c48cd56f4a4bbec17e7864");

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function bytePad(original, width, fill) {
    fill = fill || 0;
    let output = Buffer.alloc(width, fill);
    original.copy(output);
    return output;
}

function passwordProtect(inputPath, outputPath) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(path.dirname(outputPath))) {
            await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
        }

        let pdftk = spawn('pdftk', [inputPath, 'output', outputPath, 'user_pw', password]);
        pdftk.on('close', resolve);
    });
}

async function splitPDF(inputPath, outputFolder) {
    if (!fs.existsSync(outputFolder)) {
        await fs.promises.mkdir(outputFolder, { recursive: true });
    }

    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();

    let bookData = {title: "", isbn: "", pages:[]}

    for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);

        const newPdfBytes = await newPdf.save();
        bookData.pages.push(`page_${pad(i + 1, 4)}.pdf`);
        const outputFilePath = path.join(outputFolder, `page_${pad(i + 1, 4)}.pdf`);
        fs.promises.writeFile(outputFilePath, newPdfBytes);

        console.log(`Saved: ${outputFilePath}`);
    }

    await fs.promises.writeFile(path.join(outputFolder, 'bookData.json'), JSON.stringify(bookData, null, 2));


    console.log('PDF split complete!');
}

async function generateThumbnail(pdfPath, outputPath) {
    return new Promise((resolve, reject) => {
        let converter = spawn('convert', [`${pdfPath}[0]`, outputPath]);
        converter.on('close', resolve);
    });
}

async function encryptPages(originalPath, encryptedPath) {

    if (!fs.existsSync(encryptedPath)) {
        await fs.promises.mkdir(encryptedPath, { recursive: true });
    }

    let files = await fs.promises.readdir(originalPath);
    files = files.filter(f => f != 'bookData.json');

    let bookData = {title: "", isbn: "", pages:[]};
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Encrypting ${file}`);
        const original = await fs.promises.readFile(path.join(originalPath, file));
        const originalMd5 = md5(original);
        const iv = randomBytes(16);
        const encryptedLength = Math.floor(original.length * 0.5);
        const firstPart = original.slice(0, encryptedLength);
        const secondPart = original.slice(encryptedLength);
        const aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
        const paddedFirstPart = aesjs.padding.pkcs7.pad(firstPart);
        const encrypted = aesCbc.encrypt(paddedFirstPart);
        bookData.pages.push(originalMd5);
        const outputStream = fs.createWriteStream(path.join(encryptedPath, originalMd5));
        const fileData = {
            md5: originalMd5,
            start: paddedFirstPart.length,
            length: original.length,
            filename: file,
        }
        outputStream.write(bytePad(msgpack.encode(fileData), 256));
        outputStream.write(iv);
        outputStream.write(encrypted);
        outputStream.write(secondPart);
        outputStream.end();
    }

    await fs.promises.writeFile(path.join(encryptedPath, 'bookData.json'), JSON.stringify(bookData, null, 2));
}

(async () => {
    let books = await fs.promises.readdir("./books");
    let splitted = await fs.promises.readdir("./books/split");
    books = books.filter(b => !(['split', 'thumbnails', 'encrypted', 'password'].includes(b)));
    books = books.map(b => b.split('.')[0]);
    books = books.filter(b => !(splitted.includes(b))); // avoid reprocessing already processed books
    console.log(books);
    console.log(splitted);
    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        await passwordProtect(`./books/${book}.pdf`, `./books/password/${book}.pdf`);
        await splitPDF(`./books/${book}.pdf`, `./books/split/${book}`);
        await generateThumbnail(`./books/split/${book}/page_0001.pdf`, `./books/thumbnails/${book}.png`);
        await encryptPages(`./books/split/${book}`, `./books/encrypted/${book}`);
    }
})();