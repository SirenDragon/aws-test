const connection = require('./connection');

// Define getMonsterDetails at the top level
async function getMonsterDetails(monsterName) {
    const selectSql = `SELECT * FROM monster WHERE name = ?`;
    return await connection.query(selectSql, [monsterName]);
}

async function insertRun(runData) {
    const insertSql = `
        INSERT INTO runs (game, monster_id, username, weapon, time, rules, device)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const queryParameters = [
        runData.game,
        runData.monster_id,
        runData.username,
        runData.weapon,
        runData.time,
        runData.rules,
        runData.device
    ];
    return await connection.query(insertSql, queryParameters);
}

async function updateRun(id, runData) {
    const updateSql = `
        UPDATE runs
        SET game = ?, monster_id = ?, username = ?, weapon = ?, time = ?, rules = ?, device = ?
        WHERE id = ?
    `;
    const queryParameters = [
        runData.game,
        runData.monster_id,
        runData.username,
        runData.weapon,
        runData.time,
        runData.rules,
        runData.device,
        id
    ];
    return await connection.query(updateSql, queryParameters);
}

async function getRunById(id) {
    const selectSql = `
        SELECT
            r.id,
            r.game,
            r.monster_id,
            r.username,
            r.weapon,
            TIME_FORMAT(STR_TO_DATE(r.time, '%H:%i:%s'), '%H:%i:%s') AS time, -- Updated to include seconds
            r.rules,
            r.device
        FROM runs r
        WHERE r.id = ?
    `;
    return await connection.query(selectSql, [id]);
}


async function deleteRun(id) {
    const deleteSql = `DELETE FROM runs WHERE id = ?`;
    return await connection.query(deleteSql, [id]);
}

async function getAllMonsters(parameters = {}) {
    let selectSql = `SELECT
            r.id,
            r.game,
            m.name AS monster,
            r.username,
            r.weapon,
            TIME_FORMAT(STR_TO_DATE(r.time, '%H:%i:%s'), '%H:%i:%s') AS time,
            r.rules,
            r.device
        FROM runs r
        LEFT JOIN monster m ON r.monster_id = m.name`;

    const whereStatements = [];
    const queryParameters = [];
    const orderByStatements = [];

    // Add filters based on parameters
    if (parameters.game && parameters.game.length > 0) {
        whereStatements.push('r.game = ?');
        queryParameters.push(parameters.game);
    }

    if (parameters.monster && parameters.monster.length > 0) {
        whereStatements.push('r.monster_id LIKE ?');
        queryParameters.push('%' + parameters.monster + '%');
    }

    if (parameters.username && parameters.username.length > 0) {
        whereStatements.push('r.username LIKE ?');
        queryParameters.push('%' + parameters.username + '%');
    }

    if (parameters.weapon && parameters.weapon.length > 0) {
        whereStatements.push('r.weapon = ?');
        queryParameters.push(parameters.weapon);
    }

    if (parameters.rules && parameters.rules === 'TA') {
        whereStatements.push('r.rules = "TA"');
    }

    if (parameters.device && parameters.device.length > 0) {
        whereStatements.push('r.device = ?');
        queryParameters.push(parameters.device);
    }

    // Add WHERE clause if there are conditions
    if (whereStatements.length > 0) {
        selectSql += ' WHERE ' + whereStatements.join(' AND ');
    }

    // Add ORDER BY clause if sorting is specified
    if (parameters.sort) {
        orderByStatements.push('r.time ' + (parameters.sort === 'ASC' ? 'ASC' : 'DESC'));
    }

    if (orderByStatements.length > 0) {
        selectSql += ' ORDER BY ' + orderByStatements.join(', ');
    }

    // Add LIMIT clause if specified
    if (parameters.limit && parameters.limit > 0 && parameters.limit < 6) {
        selectSql += ' LIMIT ' + parameters.limit;
    }

    console.log(selectSql); // Debugging: Log the final SQL query
    return await connection.query(selectSql, queryParameters);
}


module.exports = {
    getAllMonsters,
    getMonsterDetails,
    insertRun,
    updateRun,
    getRunById,
    deleteRun
}