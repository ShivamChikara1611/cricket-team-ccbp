const express = require('express')
const path = require('path')

const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const intilizeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log(`Server Running at http://localhost:3000`)
    })
  } catch (e) {
    console.log(`Db Error ${e.message}`)
    process.exit(1)
  }
}

intilizeDatabaseAndServer()

//Get Players API
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    select
        player_id as playerId, player_name as playerName, jersey_number as jerseyNumber, role
    From
        cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(playersArray)
})

//Add Player API
app.post('/players/', async (request, response) => {
  const getDetails = request.body
  const {playerName, jerseyNumber, role} = getDetails
  const addPlayerQuery = `
  INSERT INTO 
      cricket_team(player_name, jersey_number, role)
  values(
    '${playerName}',
    ${jerseyNumber},
    '${role}'
  );`
  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//Get player API
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  select 
    player_id as playerId, player_name as playerName, jersey_number as jerseyNumber, role
  from
      cricket_team
  where
    player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  response.send(player)
})

//update Book API
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getBody = request.body
  const {playerName, jerseyNumber, role} = getBody
  const updatePlayerQuery = `update
    cricket_team
  set 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}' 
  where
    player_id = ${playerId} ;`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//Delete Player API
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
    delete
      from cricket_team
    where
      player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
