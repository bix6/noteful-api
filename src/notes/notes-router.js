const express = require('express');
const xss = require('xss');
const path = require('path');
const NotesService = require('./notes-service.js');

const notesRouter = express.Router();
const jsonParser = express.json();

const sanitizeNote = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folderid: xss(note.folderid),
    content: xss(note.content)
});

notesRouter
    .route('/')
    .get((req, res, next) => {
        NotesService.getAllNotes(req.app.get('db'))
            .then(notes => { 
                res.json(notes.map(sanitizeNote))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, folderid, content } = req.body;
        const newNote = { name, folderid, content };

        for(const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body`}
                });
            }
        }

        NotesService.insertNote(req.app.get('db'), sanitizeNote(newNote))
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(sanitizeNote(note))
            })
            .catch(next);
    })

notesRouter
    .route('/:noteId')
    .all((req, res, next) => {
        NotesService.getById(
            req.app.get('db'),
            req.params.noteId
        )
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: 'Note does not exist' }
                    });
                }
                res.note = note;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        res.json(sanitizeNote(res.note));
    }) 
    .delete((req, res, next) => {
        NotesService.deleteNote(
            req.app.get('db'),
            res.note.id
        )
            .then(() => { res.status(204).end() })
            .catch(next);
    })

module.exports = notesRouter;