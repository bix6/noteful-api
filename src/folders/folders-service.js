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
    }
}

module.exports = FoldersService;