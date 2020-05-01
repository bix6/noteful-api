const express = require('express');
const xss = require('xss');
const path = require('path');
const NotesService = require('./notes-service.js');

const notesRouter = express.Router();
const jsonParser = express.json();

const sanitizeNote = note => ({
    id: note.id,
    name: xss(note.name)
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

module.exports = notesRouter;