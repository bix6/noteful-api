const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray } = require('./folders.fixtures.js');
const { makeNotesArray } = require('./notes.fixtures.js');

describe('Folders Endpoint', function() {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    })

    after('disconnect from db', () => db.destroy())

    before('clean table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

    afterEach('clean table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

    describe('GET /api/folders', () => {
        context('Given no folders', () => {
            it ('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/folders')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, []);
            })
        })

        context('Given folders', () => {
            const testFolders = makeFoldersArray();

            beforeEach('insert folders', () => {
                return db('folders').insert(testFolders);
            })

            it('responds with 200 and all folders', () => {
                return supertest(app)
                    .get('/api/folders')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200);
            })
        })
    })

    describe('GET /api/folders/:folderId', () => {
        context('Given no folders', () => {
            it('responds with 404', () => {
                const folderId = 1111;
                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: { message: `Folder does not exist` } })
            })
        })

        context('Given folders', () => {
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

            it('responds with 200 and notes with matching folderId', () => {
                this.retries(3);
                const folderId = 1;
                const expectedNotes = testNotes.filter(note => note.folderid === folderId);

                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200)
                    .expect(res => {
                        for (let i = 0; i < res.body.length; i++) {
                            expect(res.body[i].id).to.eql(expectedNotes[i].id);
                            expect(res.body[i].name).to.eql(expectedNotes[i].name);
                            expect(res.body[i].folderid).to.eql(folderId);
                            expect(res.body[i].content).to.eql(expectedNotes[i].content);
                            const expected = new Intl.DateTimeFormat('en-US').format(new Date());
                            const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body[i].modified));
                            expect(actual).to.eql(expected);
                        }
                    })
            })
        })
    })

    describe('POST /api/folders', () => {
        const newFolder = { "name": "test folder" };

        it('insert folder, responds with 201 and id', () => {
            return supertest(app)
                .post('/api/folders')
                .send(newFolder)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.name).to.eql(newFolder.name);
                })
        })

        it('responds with 400 when required fields are missing', () => {
            return supertest(app)
                .post('/api/folders')
                .send()
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, { error: { message: 'Missing name in request body' } })
        })
    })

    describe('DELETE /api/folders/:id', () => {
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

        it('deletes folder, returns 204', () => {
            const idToRemove = 1;
            const expectedFolders = testFolders.filter(folder => folder.id != idToRemove)

            return supertest(app)
                .delete(`/api/folders/${idToRemove}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(204)
                .then(() => {
                    return supertest(app)
                        .get(`/api/folders`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(expectedFolders)
                })
        })
    })
})