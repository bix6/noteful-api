const express = require('express');
const xss = require('xss');
const path = require('path');
const FoldersService = require('./folders-service.js');

const foldersRouter = express.Router();
const jsonParser = express.json();

const sanitizeFolder = folder => ({
    id: folder.id,
    name: xss(folder.name)
});

const sanitizeNotes = note => ({
    id: note.id,
    name: xss(note.name),
    modified: xss(note.modified),
    folderid: note.folderid,
    content: xss(note.content)
});

foldersRouter
    .route('/')
    .get((req, res, next) => {
        FoldersService.getAllFolders(req.app.get('db'))
            .then(folders => { 
                res.json(folders.map(sanitizeFolder))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name } = req.body;
        const newFolder = { name };

        if (newFolder.name == null) {
            return res.status(400).json({
                error: { message: `Missing name in request body` }
            })
        }

        FoldersService.insertFolder(req.app.get('db'), sanitizeFolder(newFolder))
            .then(folder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(sanitizeFolder(folder))
            })
            .catch(next);
    })

foldersRouter
    .route('/:folderId')
    .all((req, res, next) => {
        FoldersService.getById(
            req.app.get('db'),
            req.params.folderId
        )
            .then(folder => {
                if (!folder) {
                    return res.status(404).json({
                        error: { message: 'Folder does not exist' }
                    });
                }
                res.folder = folder;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        FoldersService.getNotesByFolderId(
            req.app.get('db'),
            res.folder.id
        )
            .then(notes => {
                res.json(notes.map(sanitizeNotes))
            })
            .catch(next);
    }) 
    .delete((req, res, next) => {
        FoldersService.deleteFolder(
            req.app.get('db'),
            res.folder.id    
        )
            .then(() => { res.status(204).end() })
            .catch(next);
    })

module.exports = foldersRouter;