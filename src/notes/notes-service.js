const NotesService = {
    getAllNotes(knex) {
        return knex('notes')
            .select('*');
    },

    getById(knex, id) {
        return knex('notes')
            .select('*')
            .where({ id })
            .first();
    }
}

module.exports = NotesService;