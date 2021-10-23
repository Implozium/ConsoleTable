import ConsoleTable from '../src/index';

const data = [
    {
        name: 'First Max',
        id: 1,
        followers: 32,
        subscribers: 4,
        dexcription: 'This is a big boy who doesn\'t like small boys',
    },
    {
        name: 'Second Jim',
        id: 2,
        followers: 123,
        subscribers: 41,
        dexcription: 'This is a second big boy who very likes small boys',
    },
    {
        name: 'John',
        id: 3,
        followers: 320,
        subscribers: 0,
        dexcription: 'This is a tall boy who doesn\'t like short boys but likes short girls',
    },
    {
        name: 'Mary',
        id: 4,
        followers: 3200,
        subscribers: 485,
        dexcription: 'This is a short girl who doesn\'t like small boys',
    },
    {
        name: 'Jack',
        id: 5,
        followers: 12,
        subscribers: 0,
        dexcription: 'This is a Jack who is named as Jack',
    }
];

new ConsoleTable({
    width: 40,
    hrOnEvery: 2,
    titleOnEvery: 4,
    onlyKeys: ['id', 'name', 'followers', 'dexcription'],
    headers: {
        id: '#',
        name: 'User name',
        dexcription: 'Description',
        followers: "Followers"
    }
})
    .make(data)
    .forEach((row) => console.log(row));