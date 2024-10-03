const fs = require('fs').promises;
const path = require('path');
const Fontmin = require('fontmin');  // Для преобразования TTF в WOFF
const ttf2woff2 = require('ttf2woff2');

// Папки для входных и выходных файлов
const inputDir = './fonts/ttf';
const outputWoffDir = './fonts/woff';
const outputWoff2Dir = './fonts/woff2';

// Функция для преобразования TTF в WOFF и WOFF2
async function convertFonts() {
    // Создание выходных директорий, если их нет
    await fs.mkdir(outputWoffDir, { recursive: true });
    await fs.mkdir(outputWoff2Dir, { recursive: true });

    try {
        // Чтение всех файлов в папке с TTF-шрифтами
        const files = await fs.readdir(inputDir);
        
        // Фильтрация файлов, чтобы оставить только TTF
        const ttfFiles = files.filter(file => path.extname(file) === '.ttf');

        // Обработка каждого файла TTF
        for (const file of ttfFiles) {
            const inputPath = path.join(inputDir, file);

            // Преобразование в WOFF с использованием Fontmin
            await new Promise((resolve, reject) => {
                const fontmin = new Fontmin()
                    .src(inputPath)
                    .use(Fontmin.ttf2woff())
                    .run(async (err, files) => {
                        if (err) {
                            console.error(`Ошибка при преобразовании в WOFF для ${file}:`, err);
                            reject(err);
                        } else {
                            try {
                                // Перемещаем сгенерированный WOFF файл в нужную папку
                                const woffFile = files[0]; // WOFF файл будет первым в массиве
                                const woffOutputPath = path.join(outputWoffDir, file.replace('.ttf', '.woff'));
                                await fs.writeFile(woffOutputPath, woffFile.contents);
                                console.log(`Преобразование в WOFF завершено для ${file}`);
                                resolve();
                            } catch (writeErr) {
                                reject(writeErr);
                            }
                        }
                    });
            });

            // Преобразование в WOFF2 с использованием ttf2woff2
            try {
                const ttfBuffer = await fs.readFile(inputPath);
                const woff2Buffer = ttf2woff2(ttfBuffer);
                const woff2OutputPath = path.join(outputWoff2Dir, file.replace('.ttf', '.woff2'));

                await fs.writeFile(woff2OutputPath, woff2Buffer);
                console.log(`Преобразование в WOFF2 завершено для ${file}`);
            } catch (err) {
                console.error(`Ошибка при преобразовании в WOFF2 для ${file}:`, err);
            }
        }
    } catch (err) {
        console.error('Ошибка при обработке файлов:', err);
    }
}

// Вызов функции для преобразования всех шрифтов
convertFonts();
