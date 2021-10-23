import ConsoleTable from '../src/index';
import ANSIEscapeCodes from '../src/ANSIEscapeCodes';

const data = [
    {
        "function": "concat",
        "test": "100",
        "count": 100,
        "time": "9.4137",
        "avg": "0.0941",
        "min": "0.0508",
        "q5": "0.0516",
        "med": "0.0583",
        "q95": "0.1248",
        "max": "1.5068",
        "result": "last"
    },
    {
        "function": "spread",
        "test": "100",
        "count": 100,
        "time": "8.8147",
        "avg": "0.0881",
        "min": "0.0413",
        "q5": "0.0415",
        "med": "0.0434",
        "q95": "0.4697",
        "max": "0.9192",
        "result": "medium"
    },
    {
        "function": "push",
        "test": "100",
        "count": 100,
        "time": "1.1013",
        "avg": "0.0110",
        "min": "0.0094",
        "q5": "0.0094",
        "med": "0.0096",
        "q95": "0.0100",
        "max": "0.1393",
        "result": "first"
    },
    {
        "function": "concat",
        "test": "1000",
        "count": 100,
        "time": "411.8303",
        "avg": "4.1183",
        "min": "3.5575",
        "q5": "3.6566",
        "med": "3.9141",
        "q95": "5.1912",
        "max": "6.3358",
        "result": "medium"
    },
    {
        "function": "spread",
        "test": "1000",
        "count": 100,
        "time": "585.6137",
        "avg": "5.8561",
        "min": "4.8650",
        "q5": "4.9966",
        "med": "5.6645",
        "q95": "7.4246",
        "max": "10.5829",
        "result": "last"
    },
    {
        "function": "push",
        "test": "1000",
        "count": 100,
        "time": "4.2966",
        "avg": "0.0430",
        "min": "0.0173",
        "q5": "0.0175",
        "med": "0.0204",
        "q95": "0.0926",
        "max": "0.2400",
        "result": "first"
    },
    {
        "function": "concat",
        "test": "10000",
        "count": 100,
        "time": "37645.1738",
        "avg": "376.4517",
        "min": "347.9864",
        "q5": "350.9889",
        "med": "374.3031",
        "q95": "405.9324",
        "max": "584.2256",
        "result": "medium"
    },
    {
        "function": "spread",
        "test": "10000",
        "count": 100,
        "time": "59029.0983",
        "avg": "590.2910",
        "min": "557.4600",
        "q5": "559.1160",
        "med": "577.5479",
        "q95": "656.5528",
        "max": "711.2944",
        "result": "last"
    },
    {
        "function": "push",
        "test": "10000",
        "count": 100,
        "time": "28.7749",
        "avg": "0.2877",
        "min": "0.1740",
        "q5": "0.1785",
        "med": "0.2297",
        "q95": "0.5734",
        "max": "1.5632",
        "result": "first"
    }
];

new ConsoleTable({
    width: 160,
    titleOnEvery: 3,
    mapValue: (key, value, isHeader, obj) => {
        if (isHeader) {
            return `${ANSIEscapeCodes.DECORATORS.REVERSED}${value}${ANSIEscapeCodes.RESET}`;
        }
        if (key === 'function') {
            return `${ANSIEscapeCodes.DECORATORS.BOLD}${value}${ANSIEscapeCodes.RESET}`;
        }
        switch (obj['result']) {
            case 'first': return `${ANSIEscapeCodes.COLORS.GREEN}${value}${ANSIEscapeCodes.RESET}`;
            case 'last': return `${ANSIEscapeCodes.COLORS.RED}${value}${ANSIEscapeCodes.RESET}`;
        }
        return value;
    },
    excludedKeys: ['result', 'count'],
    headers: {
        avg: 'avg (ms)',
        min: 'min (ms)',
        q5: 'q5 (ms)',
        med: 'med (ms)',
        q95: 'q95 (ms)',
        max: 'max (ms)',
    }
})
    .make(data)
    .forEach((row) => console.log(row));