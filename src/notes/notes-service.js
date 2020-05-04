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
    },

    insertNote(knex, newNote) {
        return knex('notes')
            .insert(newNote)
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },

    deleteNote(knex, id) {
        return knex('notes')
            .delete()
            .where({ id });
    }
}

module.exports = NotesService;