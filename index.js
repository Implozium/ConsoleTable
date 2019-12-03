// @ts-check

class ConsoleTable {
    /**
     * 
     * @param {Object} params параметры
     * @param {number=} params.width ширина таблицы в символах, по умолчанию 120
     * @param {number=} params.hrOnEvery вывод строки разделителя каждые **hrOnEvery** строк данных, при 0 не выводится, по умолчанию 0
     * @param {number=} params.titleOnEvery вывод строк заголовков каждые **titleOnEvery** строк данных, при 0 не выводится,
     *      если в строке должен вывестись заголовок и разделитель, то приоритет отдается разделителю, по умолчанию 0
     * @param {string[]=} params.onlyKeys массив ключей, которые только будут выводиться в указаном, при пустом выводятся все, по умолчанию пустой массив
     * @param {Object.<string, string>=} params.headers объект с отображением ключей на заголовки в таблице, по умолчанию пустой объект
     * @param {string[]=} params.excludedKeys массив ключей, которые будут игнорироваться при выводе, по умолчанию пустой массив
     * @param {function (string, string, boolean, {}, number): string=} params.mapValue функция для отображения данных,
     *      которая должна возвращать новое отображение для ячейки таблицы, принимает параметры в порядке следования:
     *      ключ объекта,
     *      его строковое, сформированное значение уже с пробелами,
     *      true если это строка заголовков, иначе false
     *      объект для отображения в этой строке,
     *      номер строки для вывода
     * @param {function (string): string=} params.mapBorder функция для отображения границ,
     *      которая должна возвращать новое отображение границы, принимает параметр в строковом значении границы
     * @param {boolean=} params.wrap при значении true включает перенос строк, по умолчанию true
     * @param {string=} params.wordBreak при значении "all" перенос строк идет по символьно,
     *      при значении "word" перенос строк идет по словам, при невозможности переносить по словам, идет перенос по символам,
     *      по умолчанию "word"
     */
    constructor(params = {}) {
        this.params = Object.assign({
            width: 120,
            hrOnEvery: 0,
            titleOnEvery: 0,
            onlyKeys: [],
            headers: {},
            excludedKeys: [],
            mapValue: (key, value, isHeader, obj, number) => value,
            mapBorder: (value) => value,
            wrap: true,
        }, params);
    }

    /**
     * Дополняет строку символами слева до определенной длины
     * 
     * @param {string} str 
     * @param {number} length 
     * @param {string} symbol 
     */
    _frm(str, length, symbol = ' ') {
        return (symbol.repeat(length) + str).slice(-length);
    }

    _extractHeaders(arr) {
        const setOfHeaders = new Set();
        arr.forEach(obj => Object.keys(obj).forEach(key => setOfHeaders.add(key)));
        return Array.from(setOfHeaders.keys());
    }

    _makeColumnWidths(size) {
        const {
            width,
        } = this.params;

        const columnWidth = Math.floor((width - 2 - size + 1) / size);
        const columnWidths = Array.from({length: size}, () => columnWidth);
        columnWidths[columnWidths.length - 1] = (width - 2 - size + 1) - columnWidth * (columnWidths.length - 1);
        return columnWidths;
    }

    _makeTopRow(columnWidths) {
        return this.params.mapBorder('┌' + columnWidths.map((width) => '─'.repeat(width)).join('┬') + '┐');
    }

    _makeCenterRow(columnWidths) {
        return this.params.mapBorder('├' + columnWidths.map((width) => '─'.repeat(width)).join('┼') + '┤');
    }

    _makeBottomRow(columnWidths) {
        return this.params.mapBorder('└' + columnWidths.map((width) => '─'.repeat(width)).join('┴') + '┘');
    }

    _makeKeysRow(columnWidths, keys, values, isHeader, obj) {
        const {
            mapValue,
            wrap,
            wordBreak,
        } = this.params;

        const output = [];
        let wrappedValues = [];
        if (!wrap || wordBreak === 'all') {
            wrappedValues = columnWidths.map((width, i) => values[i].match(new RegExp(`.{1,${width - 2}}|^$`, 'g')));
        } else {
            wrappedValues = columnWidths.map((width, i) => {
                const output = [];
                values[i].split(' ').forEach((word) => {
                    if (output.length && output[output.length - 1].length !== 0 && width - output[output.length - 1].length - 2 >= word.length + 1) {
                        output[output.length - 1] += ' ' + word;
                    } else {
                        output.push(...word.match(new RegExp(`.{1,${width - 2}}|^$`, 'g')));
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
                    return mapValue(keys[i], this._frm(wrappedValues[i][j] === undefined ? '' : wrappedValues[i][j] + ' ', width), isHeader, obj, j);
                }).join(this.params.mapBorder('│'))
                + this.params.mapBorder('│')
            );
        }

        return output.slice(0, wrap ? output.length : 1);
    }

    _extractValuesByKeys(keys, obj) {
        return keys.map((key) => obj[key] === undefined ? '' : obj[key] === null ? '' : obj[key].toString());
    }

    /**
     * Преобразует массив объектов в таблицу и возвращает массив для отображения таблицы
     * 
     * @param {{}[]} arr массив объектов
     * @return {string[]} массив строк таблицы
     */
    make(arr) {
        const {
            hrOnEvery,
            titleOnEvery,
            onlyKeys,
            excludedKeys,
            headers,
        } = this.params;

        const keys = (onlyKeys.length ? onlyKeys : this._extractHeaders(arr)).filter(key => !excludedKeys.includes(key));
        const headerKeys = keys.map(key => headers[key] || key);
        const columnWidths = this._makeColumnWidths(keys.length);
        const output = [];
        output.push(
            this._makeTopRow(columnWidths),
            ...this._makeKeysRow(columnWidths, headerKeys, headerKeys, true, {}),
            this._makeCenterRow(columnWidths)
        );
        arr.forEach((obj, i, arr) => {
            output.push(...this._makeKeysRow(columnWidths, keys, this._extractValuesByKeys(keys, obj), false, obj));
            if (titleOnEvery && i && arr.length !== i + 1 && (i + 1) % titleOnEvery === 0) {
                output.push(
                    this._makeCenterRow(columnWidths),
                    ...this._makeKeysRow(columnWidths, headerKeys, headerKeys, true, {}),
                    this._makeCenterRow(columnWidths)
                );
            } else if (hrOnEvery && i && arr.length !== i + 1 && (i + 1) % hrOnEvery === 0) {
                output.push(this._makeCenterRow(columnWidths));
            }
        });
        output.push(this._makeBottomRow(columnWidths));
        return output;
    }

    _checkParams() {
        if (this.params.onlyKeys.length === 0) {
            throw new Error('Need param onlyKeys');
        }
    }


    /**
     * Возвращает массив из строк для заголовка
     * 
     * @return {string[]}
     */
    getHeader() {
        const {
            onlyKeys,
            headers,
        } = this.params;

        this._checkParams();
        const headerKeys = onlyKeys.map(key => headers[key] || key);
        const columnWidths = this._makeColumnWidths(onlyKeys.length);
        const output = [];
        output.push(
            this._makeTopRow(columnWidths),
            ...this._makeKeysRow(columnWidths, headerKeys, headerKeys, true, {}),
            this._makeCenterRow(columnWidths)
        );
        
        return output;
    }

    /**
     * Возвращает массив из строк для внутреннего заголовка
     * 
     * @return {string[]}
     */
    getInnerHeader() {
        const {
            onlyKeys,
            headers,
        } = this.params;

        this._checkParams();
        const headerKeys = onlyKeys.map(key => headers[key] || key);
        const columnWidths = this._makeColumnWidths(onlyKeys.length);
        const output = [];
        output.push(
            this._makeCenterRow(columnWidths),
            ...this._makeKeysRow(columnWidths, headerKeys, headerKeys, true, {}),
            this._makeCenterRow(columnWidths)
        );
        
        return output;
    }

    /**
     * Возвращает массив из строк для горизонтальной строки разделителя
     * 
     * @return {string[]}
     */
    getHR() {
        const {
            onlyKeys,
        } = this.params;

        this._checkParams();
        const columnWidths = this._makeColumnWidths(onlyKeys.length);

        return [this._makeCenterRow(columnWidths)];
    }

    /**
     * Возвращает массив из строк для объекта
     * 
     * @param {{}} obj 
     * @return {string[]}
     */
    getRow(obj) {
        const {
            onlyKeys,
        } = this.params;

        this._checkParams();
        const columnWidths = this._makeColumnWidths(onlyKeys.length);

        return this._makeKeysRow(columnWidths, onlyKeys, this._extractValuesByKeys(onlyKeys, obj), false, obj);
    }

    /**
     * Возвращает массив из строк для последней строки таблицы
     * 
     * @return {string[]}
     */
    getEndLine() {
        const {
            onlyKeys,
        } = this.params;

        this._checkParams();
        const columnWidths = this._makeColumnWidths(onlyKeys.length);

        return [this._makeBottomRow(columnWidths)];
    }
}

module.exports = ConsoleTable;