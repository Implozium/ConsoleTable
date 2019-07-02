const ConsoleTable = require('../index');

const data = [
    {
        name: 'First User',
        id: 1,
        followers: 32,
        subscribers: 4,
    },
    {
        name: 'Second',
        id: 2,
        followers: 123,
        subscribers: 41,
    },
    {
        name: 'John',
        id: 3,
        followers: 320,
        subscribers: 0,
    },
    {
        name: 'Mary',
        id: 4,
        followers: 3200,
        subscribers: 485,
    },
    {
        name: 'Jack',
        id: 5,
        followers: 12,
        subscribers: 0,
    }
];

new ConsoleTable({
    width: 40,
    hrOnEvery: 2,
    titleOnEvery: 4,
    onlyKeys: ['id', 'name', 'followers'],
    headers: {
        id: '#',
        name: 'User name',
        followers: "Followers"
    }
})
    .make(data)
    .forEach(row => console.log(row));