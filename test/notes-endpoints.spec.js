const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray } = require('./folders.fixtures.js');
const { makeNotesArray, makeNote } = require('./notes.fixtures.js');

describe('Notes Endpoint', function() {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
        app.set('db', db);
    })

    after('disconnect from db', () => db.destroy())

    before('clean table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

    afterEach('clean table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

    describe('GET /api/notes', () => {
        context('Given no notes', () => {
            it ('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, []);
            })
        })

        context('Given folders and notes', () => {
            const testFolders = makeFoldersArray();
            const testNotes = makeNotesArray();

            beforeEach('insert folders and notes', () => {
                return db('folders')
                    .insert(testFolders)
                    .then(() => {
                        return db('notes')
                            .insert(testNotes)
                    });
            })

            it('responds with 200 and all notes', () => {
                return supertest(app)
                    .get('/api/notes/1')
                    .expect(200);
            })
        })
    })

    describe('GET /api/notes/:id', () => {
        const testFolders = makeFoldersArray();
        const testNotes = makeNotesArray();

        context('Given folders and notes', () => {
            beforeEach('insert folders and notes', () => {
                return db('folders')
                    .insert(testFolders)
                    .then(() => {
                        return db('notes')
                            .insert(testNotes)
                    });
            })

            it('responds with 200 and the note', () => {
                const noteId = 1;
                const expectedNote = testNotes[noteId - 1];
                
                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.id).to.eql(expectedNote.id);
                        expect(res.body.name).to.eql(expectedNote.name);
                        expect(Number(res.body.folderid)).to.eql(expectedNote.folderid);
                        expect(res.body.content).to.eql(expectedNote.content);
                        const expected = new Intl.DateTimeFormat('en-US').format(new Date());
                        const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.modified));
                        expect(actual).to.eql(expected);
                    });
            })
        })
    })

    describe('POST /api/notes', () => {
        const testFolders = makeFoldersArray();
        const testNote = makeNote();

        context('Given folders', () => {
            beforeEach('insert folders', () => db('folders').insert(testFolders))

            it('inserts note, responds with 201 and id', () => {
                return supertest(app)
                    .post('/api/notes')
                    .send(testNote)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.have.property('id');
                        expect(res.body.name).to.eql(testNote.name);
                        expect(Number(res.body.folderid)).to.eql(testNote.folderid);
                        expect(res.body.content).to.eql(testNote.content);
                        const expected = new Intl.DateTimeFormat('en-US').format(new Date());
                        const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.modified));
                        expect(actual).to.eql(expected);
                        expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)
                    })
                    .then(res => {
                        return supertest(app)
                            .get(`/api/notes/${res.body.id}`)
                            .expect(res.body);
                    })
            })

            const requiredFields = ['name', 'folderid', 'content'];

            requiredFields.forEach(field => {
                const newNote = {
                    "name": "Test Note",
                    "folderid": 1,
                    "content": "Test Content"
                };

                it('responds with 400 when required fields are missing', () => {
                    delete newNote[field];

                    return supertest(app)
                        .post('/api/notes')
                        .send(newNote)
                        .expect(400, {
                            error: { message: `Missing ${field} in request body` }
                        })
                })
            })
        })
    })

    describe('DELETE /api/notes/:id', () => {
        const testFolders = makeFoldersArray();
        const testNotes = makeNotesArray();

        beforeEach('insert folders and notes', () => {
            return db('folders')
                .insert(testFolders)
                .then(() => {
                    return db('notes')
                        .insert(testNotes);
                });
        })

        it('deletes note, returns 204', () => {
            const idToRemove = 2;
            const expectedNotes = testNotes.filter(note => note.id !== idToRemove);

            return supertest(app)
                .delete(`/api/notes/${idToRemove}`)
                .expect(204)
                .then(() => {
                    return supertest(app)
                        .get(`/api/notes`)
                        .expect(res => {
                            expectedNotes.forEach((note, i) => {
                                expect(res.body[i].id).to.eql(note.id);
                                expect(res.body[i].name).to.eql(note.name);
                                expect(Number(res.body[i].folderid)).to.eql(note.folderid);
                                expect(res.body[i].content).to.eql(note.content);
                                const expected = new Intl.DateTimeFormat('en-US').format(new Date(note.modified));
                                const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body[i].modified));
                                expect(expected).to.eql(actual);
                            })
                        });
                })
        })
    })
})