const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray } = require('./folders.fixtures.js');
const { makeNotesArray } = require('./notes.fixtures.js');

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
                    .get('/api/notes')
                    .expect(200);
            })
        })
    })
})