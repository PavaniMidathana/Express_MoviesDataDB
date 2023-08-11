const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

let db = null;
const dbPath = path.join(__dirname, "moviesData.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbObjectToResponseObject3 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//Get Movies API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT movie_name
    FROM movie
    ORDER BY movie_id;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((each) => convertDbObjectToResponseObject(each))
  );
});

//Add Movies API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO 
        movie (director_id,movie_name,lead_actor)
    VALUES 
        (
            ${directorId},
             '${movieName}',
            '${leadActor}'
        );`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//Get movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * 
     FROM movie
     WHERE movie_id=${movieId};`;
  let movie = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject2(movie));
});

//Update movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieUpdateQuery = `UPDATE movie
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId};`;
  await db.run(movieUpdateQuery);
  response.send("Movie Details Updated");
});

//Delete movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDeleteQuery = `DELETE FROM 
            movie 
    WHERE 
            movie_id = ${movieId};`;
  await db.run(movieDeleteQuery);
  response.send("Movie Removed");
});

//Get Directors list API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT *
    FROM director
    ORDER BY director_id;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((each) => convertDbObjectToResponseObject3(each))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `SELECT movie_name
    FROM movie
    WHERE director_id = ${directorId};`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((each) => convertDbObjectToResponseObject(each))
  );
});

module.exports = app;
