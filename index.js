// @ts-check

class ConsoleTable {
    /**
     * 
     * @param {Object} params параметры
     * @param {number=} params.width ширина таблицы в символах
     * @param {number=} params.hrOnEvery вывод строки разделителя каждые **hrOnEvery** строк данных, при 0 не выводится
     * @param {number=} params.titleOnEvery вывод строк заголовков каждые **titleOnEvery** строк данных, при 0 не выводится,
     *      если в строке должен вывестись заголовок и разделитель, то приоритет отдается разделителю
     * @param {string[]=} params.onlyKeys массив ключей, которые только будут выводиться в указаном, при пустом выводятся все
     * @param {Object.<string, string>=} params.headers объект с отображением ключей на заголовки в таблице
     * @param {string[]=} params.excludedKeys массив ключей, которые будут игнорироваться при выводе
     * @param {function (string, string, boolean, {}): string=} params.mapValue функция для отображения данных,
     *      которая должна возвращать новое отображение для ячейки таблицы, принимает параметры в порядке следования:
     *      ключ объекта, его строковое, сформированное значение уже с пробелами, true если это строка заголовков и объект
     *      для отображения в этой строке
     * @param {function (string): string=} params.mapBorder функция для отображения границ,
     *      которая должна возвращать новое отображение границы, принимает параметр в строковом значении границы
     */
    constructor(params = {}) {
        this.params = Object.assign({
            width: 120,
            hrOnEvery: 0,
            titleOnEvery: 0,
            onlyKeys: [],
            headers: {},
            excludedKeys: [],
            mapValue: (key, value, isHeader, obj) => value,
            mapBorder: (value) => value,
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
        } = this.params;

        return this.params.mapBorder('│')
            + columnWidths.map((width, i) => {
                return mapValue(keys[i], this._frm(values[i].substr(0, width - 2) + ' ', width), isHeader, obj);
            }).join(this.params.mapBorder('│'))
            + this.params.mapBorder('│');
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
        output.push(this._makeTopRow(columnWidths),
            this._makeKeysRow(columnWidths, headerKeys, headerKeys, true, {}),
            this._makeCenterRow(columnWidths));
        arr.forEach((obj, i, arr) => {
            output.push(this._makeKeysRow(columnWidths, keys, this._extractValuesByKeys(keys, obj), false, obj));
            if (titleOnEvery && i && arr.length !== i + 1 && (i + 1) % titleOnEvery === 0) {
                output.push(this._makeCenterRow(columnWidths),
                    this._makeKeysRow(columnWidths, headerKeys, headerKeys, true, {}),
                    this._makeCenterRow(columnWidths));
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
        output.push(this._makeTopRow(columnWidths),
            this._makeKeysRow(columnWidths, headerKeys, headerKeys, true, {}),
            this._makeCenterRow(columnWidths));
        
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
        output.push(this._makeCenterRow(columnWidths),
            this._makeKeysRow(columnWidths, headerKeys, headerKeys, true, {}),
            this._makeCenterRow(columnWidths));
        
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

        return [this._makeKeysRow(columnWidths, onlyKeys, this._extractValuesByKeys(onlyKeys, obj), false, obj)];
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