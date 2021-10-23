/**
 * Параметры
 */
interface Params<T extends Record<string, any>> {
    /**
     * ширина таблицы в символах, по умолчанию 120
     */
    width: number;
    /**
     * вывод строки разделителя каждые **hrOnEvery** строк данных, при 0 не выводится, по умолчанию 0
     */
    hrOnEvery: number;
    /**
     * вывод строк заголовков каждые **titleOnEvery** строк данных, при 0 не выводится,
     * если в строке должен вывестись заголовок и разделитель, то приоритет отдается разделителю, по умолчанию 0
     */
    titleOnEvery: number;
    /**
     * массив ключей, которые только будут выводиться в указаном, при пустом выводятся все, по умолчанию пустой массив
     */
    onlyKeys: string[];
    /**
     * объект с отображением ключей на заголовки в таблице, по умолчанию пустой объект
     */
    headers: Record<string, string>;
    /**
     * массив ключей, которые будут игнорироваться при выводе, по умолчанию пустой массив
     */
    excludedKeys: string[];
    /**
     * функция для отображения данных,
     * которая должна возвращать новое отображение для ячейки таблицы, принимает параметры в порядке следования:
     * - ключ объекта,
     * - его строковое, сформированное значение уже с пробелами,
     * - true если это строка заголовков, иначе false
     * - объект для отображения в этой строке,
     * - номер строки для вывода
     */
    mapValue: (key: string, value: string, isHeader: boolean, item: T, number: number) => string;
    /**
     * функция для отображения границ,
     * которая должна возвращать новое отображение границы, принимает параметр в строковом значении границы
     */
    mapBorder: (border: string) => string;
    /**
     * при значении true включает перенос строк, по умолчанию true
     */
    wrap: boolean;
    /**
     * при значении "all" перенос строк идет по символьно,
     * при значении "word" перенос строк идет по словам, при невозможности переносить по словам, идет перенос по символам,
     * по умолчанию "word"
     */
    wordBreak: 'all' | 'word';
}

class ConsoleTable<T extends Record<string, any>> {
    private params: Params<T>;

    constructor(params?: Partial<Params<T>>) {
        const defaultParams: Params<T> = {
            width: 120,
            hrOnEvery: 0,
            titleOnEvery: 0,
            onlyKeys: [],
            headers: {},
            excludedKeys: [],
            mapValue: (key: string, value: string, isHeader: boolean, item: T, number: number) => value,
            mapBorder: (border: string) => border,
            wrap: true,
            wordBreak: 'word',
        };
        this.params = Object.assign(defaultParams, params);
    }

    /**
     * Дополняет строку символами слева до определенной длины
     */
    private frm(str: string, length: number, symbol = ' '): string {
        return (symbol.repeat(length) + str).slice(-length);
    }

    private extractHeaders(arr: T[]): string[] {
        const setOfHeaders = new Set<string>();
        arr.forEach((obj) => Object.keys(obj).forEach((key) => setOfHeaders.add(key)));
        return Array.from(setOfHeaders.keys());
    }

    private makeColumnWidths(size: number): number[] {
        const {
            width,
        } = this.params;

        const columnWidth = Math.floor((width - 2 - size + 1) / size);
        const columnWidths = Array.from({length: size}, () => columnWidth);
        columnWidths[columnWidths.length - 1] = (width - 2 - size + 1) - columnWidth * (columnWidths.length - 1);
        return columnWidths;
    }

    private makeTopRow(columnWidths: number[]): string {
        return this.params.mapBorder('┌' + columnWidths.map((width) => '─'.repeat(width)).join('┬') + '┐');
    }

    private makeCenterRow(columnWidths: number[]): string {
        return this.params.mapBorder('├' + columnWidths.map((width) => '─'.repeat(width)).join('┼') + '┤');
    }

    private makeBottomRow(columnWidths: number[]): string {
        return this.params.mapBorder('└' + columnWidths.map((width) => '─'.repeat(width)).join('┴') + '┘');
    }

    private makeKeysRow(columnWidths: number[], keys: string[], values: string[], isHeader: boolean, item: T) {
        const {
            mapValue,
            wrap,
            wordBreak,
        } = this.params;

        const output: string[] = [];
        let wrappedValues: string[][] = [];
        if (!wrap || wordBreak === 'all') {
            wrappedValues = columnWidths.map((width, i) => {
                const result = values[i].match(new RegExp(`.{1,${width - 2}}|^$`, 'g'));
                if (result) {
                    return result;
                }
                return [];
            });
        } else {
            wrappedValues = columnWidths.map((width, i) => {
                const output: string[] = [];
                values[i].split(' ').forEach((word) => {
                    if (output.length && output[output.length - 1].length !== 0 && width - output[output.length - 1].length - 2 >= word.length + 1) {
                        output[output.length - 1] += ' ' + word;
                    } else {
                        const result = word.match(new RegExp(`.{1,${width - 2}}|^$`, 'g'));
                        if (result) {
                            output.push(...result);
                        }
                    }
                });
                return output;
            });
        }
        const max = wrappedValues.reduce((max, column) => max > column.length ? max : column.length, 0);
        for (let j = 0; j < max; j++) {
            output.push(
                this.params.mapBorder('│')
                + columnWidths.map((width, i) => {
                    return mapValue(keys[i], this.frm(wrappedValues[i][j] === undefined ? '' : wrappedValues[i][j] + ' ', width), isHeader, item, j);
                }).join(this.params.mapBorder('│'))
                + this.params.mapBorder('│')
            );
        }

        return output.slice(0, wrap ? output.length : 1);
    }

    private extractValuesByKeys(keys: string[], item: T): string[] {
        return keys.map((key) => item[key] === undefined ? '' : item[key] === null ? '' : item[key].toString());
    }

    /**
     * Преобразует массив объектов в таблицу и возвращает массив для отображения таблицы
     */
    make(arr: T[]): string[] {
        const {
            hrOnEvery,
            titleOnEvery,
            onlyKeys,
            excludedKeys,
            headers,
        } = this.params;

        const keys = (onlyKeys.length ? onlyKeys : this.extractHeaders(arr)).filter(key => !excludedKeys.includes(key));
        const headerKeys = keys.map(key => headers[key] || key);
        const columnWidths = this.makeColumnWidths(keys.length);
        const output = [];
        output.push(
            this.makeTopRow(columnWidths),
            ...this.makeKeysRow(columnWidths, headerKeys, headerKeys, true, {} as T),
            this.makeCenterRow(columnWidths)
        );
        arr.forEach((obj, i, arr) => {
            output.push(...this.makeKeysRow(columnWidths, keys, this.extractValuesByKeys(keys, obj), false, obj));
            if (titleOnEvery && i && arr.length !== i + 1 && (i + 1) % titleOnEvery === 0) {
                output.push(
                    this.makeCenterRow(columnWidths),
                    ...this.makeKeysRow(columnWidths, headerKeys, headerKeys, true, {} as T),
                    this.makeCenterRow(columnWidths)
                );
            } else if (hrOnEvery && i && arr.length !== i + 1 && (i + 1) % hrOnEvery === 0) {
                output.push(this.makeCenterRow(columnWidths));
            }
        });
        output.push(this.makeBottomRow(columnWidths));
        return output;
    }

    private checkParams(): void {
        if (this.params.onlyKeys.length === 0) {
            throw new Error('Need param onlyKeys');
        }
    }


    /**
     * Возвращает массив из строк для заголовка
     */
    getHeader(): string[] {
        const {
            onlyKeys,
            headers,
        } = this.params;

        this.checkParams();
        const headerKeys = onlyKeys.map(key => headers[key] || key);
        const columnWidths = this.makeColumnWidths(onlyKeys.length);
        const output = [];
        output.push(
            this.makeTopRow(columnWidths),
            ...this.makeKeysRow(columnWidths, headerKeys, headerKeys, true, {} as T),
            this.makeCenterRow(columnWidths)
        );
        
        return output;
    }

    /**
     * Возвращает массив из строк для внутреннего заголовка
     * 
     * @return {string[]}
     */
    getInnerHeader(): string[] {
        const {
            onlyKeys,
            headers,
        } = this.params;

        this.checkParams();
        const headerKeys = onlyKeys.map(key => headers[key] || key);
        const columnWidths = this.makeColumnWidths(onlyKeys.length);
        const output = [];
        output.push(
            this.makeCenterRow(columnWidths),
            ...this.makeKeysRow(columnWidths, headerKeys, headerKeys, true, {} as T),
            this.makeCenterRow(columnWidths)
        );
        
        return output;
    }

    /**
     * Возвращает массив из строк для горизонтальной строки разделителя
     * 
     * @return {string[]}
     */
    getHR(): string[] {
        const {
            onlyKeys,
        } = this.params;

        this.checkParams();
        const columnWidths = this.makeColumnWidths(onlyKeys.length);

        return [this.makeCenterRow(columnWidths)];
    }

    /**
     * Возвращает массив из строк для объекта
     */
    getRow(item: T): string[] {
        const {
            onlyKeys,
        } = this.params;

        this.checkParams();
        const columnWidths = this.makeColumnWidths(onlyKeys.length);

        return this.makeKeysRow(columnWidths, onlyKeys, this.extractValuesByKeys(onlyKeys, item), false, item);
    }

    /**
     * Возвращает массив из строк для последней строки таблицы
     */
    getEndLine() {
        const {
            onlyKeys,
        } = this.params;

        this.checkParams();
        const columnWidths = this.makeColumnWidths(onlyKeys.length);

        return [this.makeBottomRow(columnWidths)];
    }
}

export default ConsoleTable;
