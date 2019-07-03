const ConsoleTable = require('../index');

const aConsoleTable = new ConsoleTable({
    width: 60,
    onlyKeys: ['id', 'name', 'followers'],
    headers: {
        id: '#',
        name: 'User name',
        followers: "Followers"
    }
});

aConsoleTable.getHeader()
    .forEach(row => console.log(row));
aConsoleTable.getRow({
    name: 'First User',
    id: 1,
    followers: 32,
    subscribers: 4,
})
    .forEach(row => console.log(row));
aConsoleTable.getRow({
    name: 'Second',
    id: 2,
    followers: 123,
    subscribers: 41,
})
    .forEach(row => console.log(row));
aConsoleTable.getHR()
    .forEach(row => console.log(row));
aConsoleTable.getHR()
    .forEach(row => console.log(row));
aConsoleTable.getRow({
    name: 'Total',
    id: '',
    followers: 155,
    subscribers: 45,
})
    .forEach(row => console.log(row));
aConsoleTable.getEndLine()
    .forEach(row => console.log(row));