const FoldersService = {
    getAllFolders(knex) {
        return knex('folders')
            .select('*');
    },

    getById(knex, id) {
        return knex('folders')
            .select('*')
            .where({ id })
            .first();
    },

    getNotesByFolderId(knex, folderId) {
        return knex('notes')
            .select('*')
            .where('folderid', folderId);
    },

    insertFolder(knex, folder) {
        return knex('folders')
            .insert(folder)
            .returning('*')
            .then(rows => rows[0]);
    }
}

module.exports = FoldersService;