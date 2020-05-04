function makeNotesArray() {
    return [
        {
            id: 1,
            name: "Dogs",
            modified: new Date(),
            folderid: 1,
            content: "Mackey Moo"
        },
        {
            id: 2,
            name: "Birds",
            modified: new Date(),
            folderid: 1,
            content: "Oak Titmouse was caught with the Golden Finch"
        },
        {
            id: 3,
            name: "Bears",
            modified: new Date(),
            folderid: 2,
            content: "Eating some honey"
        },
        {
            id: 4,
            name: "Cats",
            modified: new Date(),
            folderid: 2,
            content: "Po was eating Poppy Parsnips"
        },
        {
            id: 5,
            name: "Lion",
            modified: new Date(),
            folderid: 3,
            content: "Leo knows how to get down"
        }
    ];
}

function makeNote() {
    return {
        id: 6,
        name: "Lamination Station",
        modified: new Date(),
        folderid: "1",
        content: "Welcome to the Station of Devastation"
    }
}

module.exports = { 
    makeNotesArray,
    makeNote
};