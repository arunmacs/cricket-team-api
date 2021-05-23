const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
let db = null;

const initDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
  app.listen(3000, () => {
    console.log("Server Running at http://localhost:3000/");
  });
};

initDBAndServer();

//API -1: GET list of all players in the team;

app.get("/players/", async (Request, Response) => {
  const getAllPlayersQuery = `
    SELECT * 
    FROM cricket_team;`;
  const playersList = await db.all(getAllPlayersQuery);
  Response.send(playersList);
});

//API -2: POST Creates a new player in the team(database),player_id is auto-incremented

app.post("/players/", async (Request, Response) => {
  const { playerName, jerseyNumber, role } = Request.body;
  const addPlayerQuery = `INSERT INTO 
        cricket_team(player_name,jersey_number,role) 
        VALUES('${playerName}',
                ${jerseyNumber},
                '${role}');`;
  await db.run(addPlayerQuery);
  Response.send("Player Added to Team");
});

//API -3: GET specific(using player_id) player in the team;

app.get("/players/:playerId/", async (Request, Response) => {
  const { playerId } = Request.params;
  const getPlayerQuery = `
    SELECT * 
    FROM cricket_team
    WHERE player_id = ${playerId}
    ORDER BY player_id ASC;`;
  const player = await db.get(getPlayerQuery);
  Response.send(player);
});

//API -4: PUT Updates player details in the team(database)

app.put("/players/:playerId/", async (Request, Response) => {
  const { playerId } = Request.params;
  const { playerName, jerseyNumber, role } = Request.body;
  const updatePlayerQuery = `
    UPDATE 
        cricket_team
    SET 
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  Response.send("Player Details Updated");
});

//API -5: DELETE player details from team(database)

app.delete("/players/:playerId/", async (Request, Response) => {
  const { playerId } = Request.params;
  const deletePlayerQuery = `
    DELETE FROM 
        cricket_team
    WHERE player_id = ${playerId};`;

  await db.run(deletePlayerQuery);
  Response.send("Player Removed");
});

module.exports = app;
