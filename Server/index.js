//Libraries
const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const monster = require('./Model/monster');
const { check, validationResult } = require('express-validator');


//Setup defaults for script
const app = express();
app.use(express.static('public'))
app.use(express.json()); //not sure about this one


const upload = multer()
const port = 3000 //Default port to http server

//The * in app.* needs to match the method type of the request
app.get(
    '/monster/', 
    upload.none(), 
    async (request, response) => {
        let result = {};
        try {
            result = await monster.getAllMonsters(request.query);
        } catch (error) {
            console.log(error);
            return response.status(500) //Error code 
                .json({message: 'Something went wrong with the server.'});
        }
        //Default response object
        response.json({'data': result});
});

app.get('/monster/details', async (request, response) => {
    const { monster_id } = request.query; // Get monster_id from query parameters
    if (!monster_id) {
        return response.status(400).json({ message: 'Monster ID is required.' });
    }

    try {
        const monsterDetails = await monster.getMonsterDetails(monster_id);
        if (monsterDetails.length === 0) {
            return response.status(404).json({ message: 'Monster not found.' });
        }
        response.json({ data: monsterDetails });
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Something went wrong with the server.' });
    }
});

app.post(
    '/monster/runs',
    [
        // Validation rules
        check('game').notEmpty().withMessage('Game is required.'),
        check('monster_id').notEmpty().withMessage('Monster ID is required.'),
        check('username').notEmpty().withMessage('Username is required.'),
        check('weapon').notEmpty().withMessage('Weapon is required.'),
        check('time')
            .notEmpty().withMessage('Time is required.')
            .matches(/^\d{2}:\d{2}:\d{2}$/).withMessage('Time must be in HH:MM:SS format.'),
        check('rules').notEmpty().withMessage('Rules are required.'),
        check('device').notEmpty().withMessage('Device is required.')
    ],
    async (request, response) => {
        console.log('Request Body:', request.body); // Log the request body

        // Check for validation errors
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            console.log('Validation Errors:', errors.array()); // Log validation errors
            return response.status(400).json({ errors: errors.array() });
        }

        const runData = request.body;

        try {
            await monster.insertRun(runData);
            response.status(201).json({ message: 'Run successfully added.' });
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: 'Something went wrong with the server.' });
        }
    }
);

app.put(
    '/monster/runs/:id',
    [
        // Validation rules
        check('game').notEmpty().withMessage('Game is required.'),
        check('monster_id').notEmpty().withMessage('Monster ID is required.'),
        check('username').notEmpty().withMessage('Username is required.'),
        check('weapon').notEmpty().withMessage('Weapon is required.'),
        check('time')
            .notEmpty().withMessage('Time is required.')
            .matches(/^\d{2}:\d{2}:\d{2}$/).withMessage('Time must be in HH:MM:SS format.'),
        check('rules').notEmpty().withMessage('Rules are required.'),
        check('device').notEmpty().withMessage('Device is required.')
    ],
    async (request, response) => {
        // Check for validation errors
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const { id } = request.params; // Get the ID from the URL
        const runData = request.body; // Get the updated data from the request body

        try {
            await monster.updateRun(id, runData); // Call the update function in your model
            response.status(200).json({ message: 'Run successfully updated.' });
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: 'Something went wrong with the server.' });
        }
    }
);


app.get('/monster/runs/:id', async (request, response) => {
    const { id } = request.params; // Get the ID from the URL
    try {
        const [run] = await monster.getRunById(id); // Fetch the run by ID
        if (!run) {
            return response.status(404).json({ message: 'Run not found.' });
        }
        response.json(run);
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Something went wrong with the server.' });
    }
});

app.delete('/monster/runs/:id', async (request, response) => {
    const { id } = request.params;

    try {
        await monster.deleteRun(id); // Add a deleteRun function in your model
        response.status(200).json({ message: 'Run successfully deleted.' });
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Something went wrong with the server.' });
    }
});




app.listen(port, () => {
    console.log(`Application listening at http://localhost:${port}`);

})


