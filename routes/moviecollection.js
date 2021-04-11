const express = require("express");
const router = express.Router();
const xml2js = require("xml2js");
const fs = require("fs");
var validator = require("xsd-schema-validator");

const parser = new xml2js.Parser({ explicitArray: false });
const builder = new xml2js.Builder();

/* GET users listing. */
router.post("/", function (req, res, next) {
  console.log(req.body);
  req.session.xmlFileName = `${__dirname}/../public/xml/${req.body.fname}`;
  parser
    .parseStringPromise(fs.readFileSync(req.session.xmlFileName, "utf-8"))
    .then((result) => {
      req.session.xmlObject = result;
      res.redirect("/moviecollection");
    });
});

router.get("/", function (req, res, next) {
  res.render("movieTemplate", {
    movies: req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film,
    genres: req.session.xmlObject.baza_filmow.gatunki.gatunek,
  });
});

router.get("/addMovie", (req, res, next) => {
  res.render("addMovie", {
    genres: req.session.xmlObject.baza_filmow.gatunki.gatunek,
  });
});

router.get("/deleteGenre/:id", (req, res, next) => {
  console.log(req.params.id);
  let movieBackup =
    req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film;
  let genreBackup = req.session.xmlObject.baza_filmow.gatunki.gatunek;
  req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film = req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film.filter(
    (movie) => {
      return movie.$.idRef != req.params.id;
    }
  );
  req.session.xmlObject.baza_filmow.gatunki.gatunek = req.session.xmlObject.baza_filmow.gatunki.gatunek.filter(
    (genre) => {
      return genre.$.id != req.params.id;
    }
  );
  var xml = builder.buildObject(req.session.xmlObject);
  validator.validateXML(
    xml,
    `${__dirname}/../public/xml/MovieSchema.xsd`,
    (err, result) => {
      if (err) {
        console.log(err);
        req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film = movieBackup;
        req.session.xmlObject.baza_filmow.gatunki.gatunek = genreBackup;
        res.redirect("/moviecollection/invalidSchema");
      } else {
        fs.writeFileSync(req.session.xmlFileName, xml);
        res.redirect("/moviecollection");
      }
    }
  );
});

router.get("/invalidSchema", (req, res, next) => {
  res.render("invalidSchema");
});

router.post("/addMovie", (req, res, next) => {
  let newObj = createNewObject(req.body);
  newObj.$.numer_filmu =
    parseInt(
      req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film[
        req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film
          .length - 1
      ].$.numer_filmu
    ) + 1;
  req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film.push(
    newObj
  );
  var xml = builder.buildObject(req.session.xmlObject);
  console.log(xml);
  validator.validateXML(
    xml,
    `${__dirname}/../public/xml/MovieSchema.xsd`,
    (err, result) => {
      if (err) {
        console.log(err);
        req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film.pop();
        res.redirect("/moviecollection/invalidSchema");
      } else {
        fs.writeFileSync(req.session.xmlFileName, xml);
        res.redirect("/moviecollection");
      }
    }
  );
});

router.get("/editGenres", (req, res, next) => {
  res.render("editGenres", {
    genres: req.session.xmlObject.baza_filmow.gatunki.gatunek,
  });
});

router.post("/editGenres", (req, res, next) => {
  let genreBackup = req.session.xmlObject.baza_filmow.gatunki.gatunek;
  let newGenreArray = [];
  for (const [key, value] of Object.entries(req.body)) {
    newGenreArray = [...newGenreArray, { _: value, $: { id: key } }];
  }
  req.session.xmlObject.baza_filmow.gatunki.gatunek = newGenreArray;
  var xml = builder.buildObject(req.session.xmlObject);
  validator.validateXML(
    xml,
    `${__dirname}/../public/xml/MovieSchema.xsd`,
    (err, result) => {
      if (err) {
        console.log(err);
        req.session.xmlObject.baza_filmow.gatunki.gatunek = genreBackup;
        res.redirect("/moviecollection/invalidSchema");
      } else {
        fs.writeFileSync(req.session.xmlFileName, xml);
        res.redirect("/moviecollection");
      }
    }
  );
});

router.get("/editMovie/:id", (req, res, next) => {
  const movie = req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film.find(
    (movie) => {
      return movie.$.numer_filmu == req.params.id;
    }
  );
  res.render("editMovie", {
    genres: req.session.xmlObject.baza_filmow.gatunki.gatunek,
    movie: movie,
  });
});

router.post("/editMovie/:id", (req, res, next) => {
  const movie = req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film.find(
    (movie) => {
      return movie.$.numer_filmu == req.params.id;
    }
  );
  const movieIndex = req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film.findIndex(
    (movie) => {
      return movie.$.numer_filmu == req.params.id;
    }
  );
  let newObj = createNewObject(req.body);
  newObj.$.numer_filmu = movie.$.numer_filmu;
  req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film[
    movieIndex
  ] = newObj;
  xml = builder.buildObject(req.session.xmlObject);
  validator.validateXML(
    xml,
    `${__dirname}/../public/xml/MovieSchema.xsd`,
    (err, result) => {
      if (err) {
        console.log(err);
        req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film[
          movieIndex
        ] = movie;
        res.redirect("/moviecollection/invalidSchema");
      } else {
        fs.writeFileSync(req.session.xmlFileName, xml);
        res.redirect("/moviecollection");
      }
    }
  );
});

router.get("/deleteMovie/:id", (req, res, next) => {
  const movieBackup = req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film.find(
    (movie) => {
      return movie.$.numer_filmu == req.params.id;
    }
  );
  const movieIndex = req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film.findIndex(
    (movie) => {
      return movie.$.numer_filmu == req.params.id;
    }
  );
  req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film.splice(
    movieIndex,
    1
  );
  xml = builder.buildObject(req.session.xmlObject);
  validator.validateXML(
    xml,
    `${__dirname}/../public/xml/MovieSchema.xsd`,
    (err, result) => {
      if (err) {
        console.log(err);
        req.session.xmlObject.baza_filmow.kolekcja_filmow_oscarowych.film.splice(
          movieIndex - 1,
          0,
          movieBackup
        );
        res.redirect("/moviecollection/invalidSchema");
      } else {
        fs.writeFileSync(req.session.xmlFileName, xml);
        res.redirect("/moviecollection");
      }
    }
  );
});

function createNewObject(data) {
  let newObj = {
    $: { numer_filmu: "", idRef: "" },
    plakat: "",
    informacje_o_filmie: {
      tytul: "",
      org_tytul: "",
      rezyser: "",
      kraj_produkcji: "",
      ocena_na_filmwebie: "",
      ocena_rotten_tomatoes: { _: "", $: { jednostka: "%" } },
      ocena_osobista: "",
      box_office: { _: "", $: { waluta: "$" } },
      liczba_oscarow: "",
      lista_oscarow: { oscar: [] },
      format_obrazu: "",
      daty_premiery: {
        data_premiery: [
          { _: "", $: { region: "global" } },
          { _: "", $: { region: "pl" } },
        ],
      },
    },
  };
  for (const [key, value] of Object.entries(data)) {
    switch (key) {
      case "idRef":
        newObj.$.idRef = value;
      case "plakat":
        newObj.plakat = value;
        break;
      case "ocena_rotten_tomatoes":
        newObj.informacje_o_filmie.ocena_rotten_tomatoes._ = value;
        break;
      case "box_office":
        newObj.informacje_o_filmie.box_office._ = value;
        break;
      case "data_global_filmu":
        newObj.informacje_o_filmie.daty_premiery.data_premiery[0]._ = value;
        break;
      case "data_pl_filmu":
        newObj.informacje_o_filmie.daty_premiery.data_premiery[1]._ = value;
        break;
      case "oscar":
        if (typeof value === "string") {
          console.log("Jeden ");
          newObj.informacje_o_filmie.lista_oscarow.oscar.push(value);
        } else {
          console.log("Wiele");
          newObj.informacje_o_filmie.lista_oscarow.oscar = value;
          console.log(newObj.informacje_o_filmie.lista_oscarow.oscar);
        }
        break;
      default:
        newObj.informacje_o_filmie[key] = value;
    }
  }
  console.log(newObj);
  return newObj;
}

module.exports = router;
