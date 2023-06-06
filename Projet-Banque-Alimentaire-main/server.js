const express = require('express');
const app = express();
const port = 3000;
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const sendEmail = require("./sendEmail");
const nodemon = require('nodemon');
const browserSync = require('browser-sync').create();
const base_de_donnees = require("./middlewares/db")
const bodyparser = require("body-parser");
const db_utilities = require("./middlewares/db_utilities.js")
const token_utilities = require("./middlewares/token_utilities.js");
const pdf = require("./middlewares/pdf-function.js");

const maxAge = token_utilities.token_minutes * 60 * 1000;

const { checkNotAuthenticated, decodeToken, checkAccountAdmin, checkAccountComptable, checkAccountSecretaire, checkAuthenticated } = require('./middlewares/auth.js');
const auth = require('./middlewares/auth.js');

// Set the view engine to ejsj
app.set('view engine', 'ejs');

// Serve static files from the 'public' folder
app.use(express.static('public'));

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
// Configure Nodemon and Browser-sync
const startNodemonAndBrowserSync = () => {
  // Start Nodemon
  nodemon({
    script: 'server.js',
    ext: 'js ejs',
    ignore: ['public/*'],
  });

  // Configure Browser-sync to proxy the Express server
  browserSync.init({
    proxy: `http://localhost:${port}`,
    files: ['public/**/*', 'views/**/*'],
    port: port + 1000,
    open: false,
    notify: false,
  });

  // Restart Browser-sync when Nodemon restarts the server
  nodemon
    .on('start', () => {
      browserSync.reload();
    })
    .on('quit', () => {
      console.log('Server stopped, exiting...');
      process.exit();
    });
};


app.get('/', async (req, res) => {
  try {
    SERVICES = await db_utilities.getDataFrom("services");
    res.render('welcome_page', { services: SERVICES });
  } catch (error) {

    console.error('Error fetching data:', error);
    res.redirect("/e_404");
  }
});

app.get('/service', async (req, res) => {
  try {
    SERVICES = await db_utilities.getDataFrom("services");
    res.render('service', { services: SERVICES });
  } catch (error) {

    console.error('Error fetching data:', error);
    res.redirect("/e_404");
  }
});

app.get("/info_liste_famille", async (req, res) => {
  try {
    const particularitiesR = await db_utilities.getDataFrom("particularity", "Name");
    const particularities = particularitiesR.map(result => result.Name);
    res.render("search", { particularities });
  } catch (error) {
    console.error('Error fetching particularities:', error);
    res.redirect("/e_404");
  }
});

app.get("/api/locations", async (req, res) => {
  try {

    offices = await db_utilities.getDataFrom("officeInfo");
    res.json(offices);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.redirect("/e_404");
  }
});
app.get("/api/subscriptions/:locid", async (req, res) => {
  try {

    locationId = req.params.locid;
    const conditionsLoc = {
      Id: parseInt(locationId)
    };
    LOCATION = await db_utilities.getDataFrom("officeInfo", conditionsLoc);
    if (LOCATION) {

      const conditions = {
        Location: LOCATION[0].Name,
      };
      subscriptions = await db_utilities.getDataFrom("abonnement", conditions);
      res.json(subscriptions);
    }
  } catch (error) {
    console.error('Error fetching subs:', error);
    res.redirect("/e_404");
  }
});
app.get("/api/clients/:subId", async (req, res) => {
  console.log("API REQUEST with " + req.params.subId);
  try {
    Id = req.params.subId;

    const conditions = {
      Id: Id,
    };
    SUBSCRIPTION = await db_utilities.getDataFrom("abonnement", conditions);
    console.log(SUBSCRIPTION);
    familyIdList = SUBSCRIPTION[0].FamilyMembers.split(',');
    Members = [];
    console.log(familyIdList);
    for (let i = 0; i < familyIdList.length; i++) {
      const CONDITION = {
        Id: parseInt(familyIdList[i])
      }
      person = await db_utilities.getDataFrom("personnes", CONDITION);

      Members.push(person[0]);
    }
    res.json(Members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.redirect("/e_404");
  }
});

app.get("/api/getUserType", async (req, res) => {
  try {
    CURRENTUSER = await decodeToken(req);
    if (CURRENTUSER) {
      res.json({ Type: CURRENTUSER.AccountType });

    } else {
      res.json({ Type: null });
    }
  } catch (error) {
    console.error('Error fetching members:', error);
    res.redirect("/e_404");
  }
});
app.get("/api/services", async (req, res) => {
  try {

    service = await db_utilities.getDataFrom("services");
    res.json(service);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.redirect("/e_404");
  }
});

app.get("/api/employees", async (req, res) => {
  try {

    users = await db_utilities.getDataFrom("users");
    res.json(users);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.redirect("/e_404");
  }
});




app.post('/api/filter-members', async function (req, res) {
  const selectedParticularities = req.body.particularities;
  console.log(selectedParticularities);
});

app.get('/api/data', async function (req, res) {
  const data = await getDataFrom("Membres");
  res.json(data);
});

// pour charger la page d'inscription
app.get("/inscription_famille", async (req, res) => {
  try {
    const [particularities] = await Promise.all([
      db_utilities.getDataFrom("particularity"),
    ]);
    res.render("family_subscription", {
      titrePage: "Inscription_Famille",
      list_particularity: particularities,
    });
  } catch (error) {
    console.error('Error fetching data for inscription_famille:', error);
    res.redirect("/e_404");
  }
});
// pour charger la page d'inscription
app.get("/oldTheme", async (req, res) => {

  res.render("welcome", {
  });

});

app.get("/e_404", async (req, res) => {

  res.render("404", {
  });

});

app.post("/inscription_famille", async (req, res) => {
  console.log("Info");
  try {
    const inputData = req.body;
    LastName = inputData.nom;
    FirstName = inputData.prenom;
    Birthday = inputData.date_naissance;
    Particularities = inputData.selectedParticularities;
    Sexe = inputData.sexe;

    if (Particularities.includes("Autre")) {
      OtherParticularities = inputData.otherOption;
      console.log(OtherParticularities);
      OtherParticularities = OtherParticularities.split(',');
      particularities_list = Particularities.split(',');
      var index = particularities_list.indexOf("Autre");
      particularities_list.splice(index, 1);
      OtherParticularities.forEach(part => {
        particularities_list.push(part.trim());
      });
      Particularities = particularities_list.join(',');
    }

    const MainMember = {
      FirstName: FirstName,
      LastName: LastName,
      Birthday: Birthday,
      Particularities: Particularities,
      Sexe: Sexe
    }
    console.log(MainMember);
    const [locations] = await Promise.all([
      db_utilities.getDataFrom("officeInfo"),
    ]);
    res.render("family_subscription_info", {
      titrePage: "Inscription_Famille",
      MainMember: MainMember,
      list_location: locations,
    });
  } catch (error) {
    console.error("Error processing registration:", error);
    res.redirect("/e_404");

  }
});

app.post("/ajout_membres", async (req, res) => {
  console.log("Membres");
  try {
    const inputData = req.body;
    const lastName = inputData.FirstName;
    const firstName = inputData.LastName;
    const birthday = inputData.Birthday;
    const sexe = inputData.Sexe;
    const mainMemberParticularities = inputData.selectedParticularities;
    const [particularities] = await Promise.all([
      db_utilities.getDataFrom("particularity"),
    ]);
    const officeLocation = inputData.officeLocation;
    const address = inputData.adresse;
    const telephone = inputData.telephone;
    const email = inputData.email;
    const MainMember = {
      FirstName: firstName,
      LastName: lastName,
      Birthday: birthday,
      Sexe: sexe,
      Particularities: mainMemberParticularities,
    }
    res.render("family_subscription_member", {
      titrePage: "Inscription_Famille",
      MainMember: MainMember,
      particularities: particularities,
      officeLocation: officeLocation,
      address: address,
      telephone: telephone,
      email: email
    });
  } catch (error) {
    console.error("Error processing registration:", error);
    res.redirect("/e_404");
  }
});


app.post("/abonnement_termine", async (req, res) => {
  try {
    const inputData = req.body;
    const officeLocation = inputData.officeLocation;
    const address = inputData.address;
    const telephone = inputData.telephone;
    const email = inputData.email;

    memberList = JSON.parse(inputData.memberList);
    familyMemberIds = [];
    MainMember = memberList[0];
    const subscription_data = { Adresse: address, Telephone: telephone, Email: email, Location: officeLocation, FamilyMembers: null };
    try {
      const subscriptionInserted = await db_utilities.insertInto('abonnement', subscription_data);
      memberList.splice(0, 1);
      if (subscriptionInserted) {
        const queryCondition = { Email: subscription_data.Email };
        SubscriptionData = await db_utilities.getDataFrom("abonnement", queryCondition);
        console.log("ID Sub = " + SubscriptionData[0].Id);
        parti = MainMember.particularities;
        //Create User using the informations we have here. (No sex cuz i forgot);
        if (typeof MainMember.particularities === "string") {
          parti = MainMember.particularities;
        } else {
          parti = MainMember.particularities.join(", ")
        }
        if (parti.trim() == "") {
          parti = null;
        }
        const maindata = { FirstName: MainMember.firstName, LastName: MainMember.lastName, Sexe: MainMember.sexe, Particularities: parti, DateNaissance: MainMember.birthday.split('T')[0] };
        try {
          const inserted = await db_utilities.insertInto('personnes', maindata);
          if (inserted) {
            const MainMemberData = await db_utilities.getDataFrom("personnes", maindata);
            familyMemberIds.push(MainMemberData[0].Id);

            for (member of memberList) {
              console.log(member);
              parti = member.Particularities;
              //Create User using the informations we have here. (No sex cuz i forgot);
              if (typeof member.Particularities === "string") {
                parti = member.Particularities;
              } else {
                parti = member.Particularities.join(",")
              }
              if (parti.includes("Other")) {


                /*
                OtherParticularities = OtherParticularities.split(',')
                OtherParticularities.forEach(part => {
                  particularities_list = parti.split(',');
                  particularities_list.splice("Other", 1);
                  particularities_list.push(part.trim());
                  parti = particularities_list.join(',');
                });
                */
              }
              if (parti.trim() == "") {
                parti = null;
              }
              console.log(member.Particularities);
              const data = { FirstName: member.FirstName, LastName: member.LastName, Sexe: member.Sexe, Particularities: parti, DateNaissance: member.Birthday.split('T')[0] };

              try {
                const inserted = await db_utilities.insertInto('personnes', data);

                if (inserted) {


                  const memberData = await db_utilities.getDataFrom("personnes", data);
                  familyMemberIds.push(memberData[0].Id);
                  console.log(familyMemberIds);

                }
              } catch (error) {
                console.error('Error inserting data:', error);
                res.status(500).json({ message: 'Internal server error' });
              }
              // use case for insertInto function

              //Add the ids in the familyMemberIds list if they are not the main member
            }
            // use case for updateFrom function
            var myIds = familyMemberIds.join(", ");
            const updateValues = { FamilyMembers: myIds };
            const queryCondition = { Id: SubscriptionData[0].Id };
            try {
              const updated = await db_utilities.updateFrom("abonnement", updateValues, queryCondition);
              if (updated) {
                familyMemberNames = [];
                memberList.forEach(element => {
                  familyMemberNames.push({ firstname: memberList.FirstName, lastname: memberList.lastName });
                });
                const code = codeConfirmLink(familyMemberIds, SubscriptionData[0].Id);
                const link = `localhost:4000/confirmer_abonnement/`;

                sendEmail(
                  email,
                  "CONFIRMATION D'ABONNEMENT À (NONAMEYET)",
                  {
                    Location: officeLocation,
                    firstname: MainMemberData.FirstName,
                    lastname: MainMemberData.LastName,
                    family: familyMemberNames,
                    code: code,
                    link: link,
                  },
                  "./bienvenue.handlebars"
                );
                res.redirect('/');
              } else {
                res.json({ message: "abonnement not found" });
              }
            } catch (error) {
              console.error("Error updating Abonnement:", error);

              const queryCondition = { Id: SubscriptionData[0].Id };
              await db_utilities.deleteFrom("abonnement", queryCondition);
              for (memberX in familyMemberIds) {

                const queryConditionP = { Id: memberX };
                await db_utilities.deleteFrom("personnes", queryConditionP);
              }

              res.status(500).json({ message: "Internal server error" });
            }


          } else {
            const queryCondition = { Id: SubscriptionData[0].Id };
            res.json({ message: 'Data not inserted' });
            await db_utilities.deleteFrom("abonnement", queryCondition);
          }

        } catch (error) {
          const queryCondition = { Id: SubscriptionData[0].Id };
          console.error('Error inserting data:', error);
          res.status(500).json({ message: 'Internal server error' });
          await db_utilities.deleteFrom("abonnement", queryCondition);
        }

      }
    } catch (error) {
      console.error("Error Creating subscription data in DB:", error);
      res.redirect("/e_404");
    }
  } catch (error) {
    console.error("Error processing registration:", error);
    res.redirect("/e_404");
  }
});

function codeConfirmLink(familyMemberIds, subId) {
  const code = familyMemberIds.join("KIL89KI") + "HJT27HJ" + (parseInt(subId) + 87);
  return code;
}
function decodeConfirmLink(str) {
  const infoSplit = String(str).split("HJT27HJ");
  familyIds = infoSplit[0].split("KIL89KI");
  subId = parseInt(infoSplit[1]) - 87;

  return {
    FamilyIds: familyIds,
    SubId: subId,
  }
}
app.get("/testingmail", async (req, res) => {
  sendEmail(
    "adamrhazy@gmail.com",
    "CONFIRMATION D'ABONNEMENT À (NONAMEYET)",
    {
    },
    "./Test.handlebars"
  );


});


app.post("/confirmer_abonnement", async (req, res) => {
  const code = req.body.code;
  const accept = req.body.acceptance;
  REALCODE = decodeConfirmLink(code);
  CONFIRMED = accept;
  console.log(code);
  console.log(REALCODE);
  console.log(CONFIRMED);
  success = false;
  try {
    const queryCondition = { Id: REALCODE.SubId };
    SubscriptionData = await db_utilities.getDataFrom("abonnement", queryCondition);
    if (SubscriptionData) {
      if (SubscriptionData[0].Etat == "CompteVierge") {
        if (CONFIRMED == "confirm") {
          const queryCondition = { Id: REALCODE.SubId };
          const updateValues = { Etat: "ConfirmeParEmail" };
          await db_utilities.updateFrom("abonnement", updateValues, queryCondition);
        } else if (CONFIRMED == "cancel") {
          FAMILYLIST = SubscriptionData[0].FamilyMembers.split(',')

          const queryCondition = { Id: SubscriptionData[0].Id };
          await db_utilities.deleteFrom("abonnement", queryCondition);
          for (const memberX of FAMILYLIST) {

            const queryConditionP = { Id: parseInt(memberX.trim()) };
            await db_utilities.deleteFrom("personnes", queryConditionP);
          }
        }
        success = CONFIRMED == "confirm";
        const message = success ? "Confirmation de l'abonnement effectué!" : "L'abonnement a été annulé.";
        const redirectUrl = `/confirmation?message=${message}&success=${success}`;
        res.redirect(redirectUrl);
      } else {
        const message = "Le lien de confirmation a expiré.";
        const redirectUrl = `/confirmation?message=${message}&success=${success}`;
        res.redirect(redirectUrl);
      }
    } else {
      const message = "Une erreur s'est produite lors de la confirmation de l'abonnement";
      const redirectUrl = `/confirmation?message=${message}&success=${success}`;
      res.redirect(redirectUrl);
    }
  } catch (error) {
    console.log(error);
    res.redirect("/404");
  }


});

/*
app.post("/inscription_famille", async (req, res) => {
  try {
    const inputData = req.body;
    const results = await db_utilities.getDataFrom("Particularity", "Name");
    const particularity_list = results
      .filter(result => inputData[result.Name])
      .map(result => result.Name);
    console.log(inputData.familyMembers);
    const data = {
      LastName: inputData.lastName,
      FirstName: inputData.firstName,
      Email: inputData.email,
      Telephone: inputData.phone,
      FamilyMembers : inputData.familyMembers,
      Location: inputData.officeLocation,
      Particularities: particularity_list.join(','),
    };

    const inserted = await db_utilities.insertInto("Members", data);
    if (inserted) {
      console.log("Data inserted successfully");
      res.redirect("/inscription_famille");
    } else {
      console.log("Data not inserted");
      res.status(400).send("Unable to insert data");
    }
  } catch (error) {
    console.error("Error processing registration:", error);
    res.redirect("/e_404");
  }
});
*/
app.get('/favicon.ico', (req, res) => {
  // Serve your favicon here, e.g.:
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});
app.get('/dynamicform/table/:datatable', checkAccountAdmin, async (req, res) => {
  try {
    let tablename  = req.params.datatable;
    let tables = await db_utilities.getTables(); // you need to await this function
    let found = tables.some(tuple => tuple.table_name == tablename);
    if(found){ // check if the array contains the table name
      let columns = await db_utilities.getColumns(tablename);
      if (columns) {
        res.render('form_adapter', {
          table: tablename,
          columns
        });
        return;
      }
    } else {
      res.send('/404')
      return;
    }
  } catch (err) {
    console.log(err);
  }
});


app.post('/submit_dynamic_form', async (req, res) => {
  // Get form data from request body
  const formData = req.body;

  // Get the table name
  const tableName = formData.table;

  // Remove the table entry from formData as it's not a column in the table
  delete formData.table;

  try {
    // Use your database utility function to insert the data
    const result = await db_utilities.insertInto(tableName, formData);

    // Send success response


    if (result) {
      success = true;
      const message = "Les informations ont été créés avec succès!";
      const redirectUrl = `/confirmation?message=${message}&success=${success}`;
      res.redirect(redirectUrl);
    } else {
      success = false;
      const message = "Une erreur est survenue!"
      const redirectUrl = `/confirmation?message=${message}&success=${false}`;
      res.redirect(redirectUrl);
    }
  } catch (error) {
    // If there's an error, send an error response
      success = false;
      const message = "Une erreur est survenue!"
      const redirectUrl = `/confirmation?message=${message}&success=${false}`;
      res.redirect(redirectUrl);
  }
});
// Route pour afficher la page d'inscription
app.post('/test', checkAccountAdmin, async (req, res) => {
  res.redirect('/')


});

app.get('/api/datatable', async (req, res) => {
  try {


    tables = await db_utilities.getTables()
    res.send(tables);

  } catch (err) {
    console.log(err);
  }

});


app.get('/testingngchangesform', (req, res) => {
  res.render("formtest");
});
// Route pour afficher la page d'inscription
app.get('/register', checkAccountAdmin, (req, res) => {
  res.render('register.ejs');
});

app.get('/profil', checkAuthenticated, async (req, res) => {
  const user = await decodeToken(req);
  const userID = user.Id;

  const showInfoSql = 'SELECT * FROM users WHERE id = ?';

  base_de_donnees.query(showInfoSql, [userID], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erreur lors de la récupération des informations de l'utilisateur");
    } else {
      const userInfos = result[0];
      res.render('profil', { userInfos });
    }
  });
});
app.get('/profil/:userId', checkAccountAdmin, async (req, res) => {
  const userID = req.params.userId;

  const showInfoSql = 'SELECT * FROM users WHERE id = ?';

  base_de_donnees.query(showInfoSql, [userID], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erreur lors de la récupération des informations de l'utilisateur");
    } else {
      const userInfos = result[0];
      res.render('profil', { userInfos });
    }
  });
});

app.post('/profil/update', checkAccountAdmin, async (req, res) => {
  const { name, lastname, email, phone, password, newPassword, confirmPassword } = req.body;

  const user = await decodeToken(req);
  const userID = user.Id;
  USEREXISTS = await db_utilities.checkExistFrom("users", { Id: userID });
  if (!USEREXISTS) {
    res.redirect("/404");
  }
  try {

    USER = await db_utilities.getDataFrom("users", { Id: userID });

    if (newPassword !== confirmPassword) {
      res.status(400).send("Les nouveaux mots de passe ne correspondent pas");
      res.redirect("/404");
      return;
    }
    newPass = newPassword == '' ? USER.password : newPassword;
    const newInfos = {
      FirstName: name,
      LastName: lastname,
      Email: email,
      Telephone: phone,
      Password: newPass
    };

    try {
      UPDATE = await db_utilities.updateFrom("users", newInfos, { Id: USER.Id });
      if (UPDATE) {
        res.redirect("/profil");
      } else {
        res.redirect("/404");

      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur lors de la vérification du mot de passe");
      res.redirect("/404");
      return;

    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la vérification du mot de passe");
    res.redirect("/404");
    return;

  }


});


// Route pour gérer la soumission du formulaire d'inscription
app.post('/submit', checkAccountAdmin, async (req, res) => {
  const { firstname, lastname, email, phone, password, passwordValidation, accounttype } = req.body;

  const reg_email = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/;
  const reg_tel = /^([0-9]{3})[-]([0-9]{3})[-]([0-9]{4})$/;

  const isEmailValid = reg_email.test(email);
  const isPhoneValid = reg_tel.test(phone);
  const isLastNameValid = !!lastname;
  const isFirstNameValid = !!firstname;
  const isPasswordValid = password === passwordValidation;
  const isAccountTypeValid = accounttype != "";

  if (isEmailValid && isPhoneValid && isLastNameValid && isFirstNameValid && isPasswordValid && isAccountTypeValid) {
    HASHEDPASSWORD = await bcrypt.hash(password, saltRounds);
    console.log(HASHEDPASSWORD);
    const data = {
      FirstName: firstname,
      LastName: lastname,
      Telephone: phone,
      Email: email,
      AccountType: accounttype,
      Password: HASHEDPASSWORD,
    };

    try {
      console.log(data);
      const inserted = await db_utilities.insertInto("users", data);


      if (inserted) {
        success = true;
        const message = "Le compte a été créé avec succès!";
        const redirectUrl = `/confirmation?message=${message}&success=${success}`;
        res.redirect(redirectUrl);
      } else {
        success = false;
        const message = "Une erreur est survenue!"
        const redirectUrl = `/confirmation?message=${message}&success=${success}`;
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error("Error processing registration:", error);
      res.redirect("/e_404"); // Code de statut HTTP 500 pour indiquer une erreur interne du serveur
    }
  } else {
    const errors = [];
    if (!isFirstNameValid) errors.push("Invalid first name.");
    if (!isLastNameValid) errors.push("Invalid last name.");
    if (!isEmailValid) errors.push("Invalid email.");
    if (!isPhoneValid) errors.push("Invalid phone number.");
    if (!isPasswordValid) errors.push("Passwords do not match.");

    console.log("Invalid fields received:", errors.join(" "));
    res.status(400).send(errors.join(" "));
  }
});


app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/confirmation', (req, res) => {
  const { message = "Une erreur est survenue", success = false } = req.query;
  res.render('error_or_success_message', { message, success });
});


app.post('/login', async (req, res) => {
  const dataReceived = req.body;
  //let accountType;
  const PASS = dataReceived.password
  try {
    const conditions = {
      Email: dataReceived.email
    };
    const userExists = await db_utilities.checkExistFrom("users", conditions);
    if (userExists) {
      const result = await db_utilities.getDataFrom("users", conditions);
      const passwordMatches = await bcrypt.compare(PASS, result[0].Password);

      if (passwordMatches) {
        console.log(result[0].Password);
        console.log(PASS);
        if (result && result.length > 0) {
          const token = await token_utilities.asignTokenToUser(result[0].Id);
          //app.locals.accountType = result[0].AccountType;
          // Ajouter le token dans le header de la réponse
          res.cookie('token', token, {
            httpOnly: false,
            secure: true,
            sameSite: 'strict',
            maxAge: maxAge
          });

          res.redirect('/');
        } else {
          console.log("Aucun utilisateur trouvé pour l'email et le mot de passe fournis");
          res.redirect("/login");
        }
      } else {
        console.log("Aucun utilisateur trouvé pour l'email et le mot de passe fournis");
        res.redirect("/login");
      }

    } else {
      console.log("Aucun utilisateur trouvé pour l'email et le mot de passe fournis");
      res.status(401).end('Email ou mot de passe incorrect');
    }
  } catch (error) {
    console.error('Erreur lors de la requête :', error);
    res.status(500).end('Erreur interne du serveur');
  }
});


app.get('/logout', checkAuthenticated, function (req, res) {
  res.clearCookie('token'); // Clear the token cookie
  res.redirect('/'); // Redirect the user to the login page
});

app.get('/search_payer', async (req, res) => {
  try {
    const payerName = req.query.name;
    //const user = await auth.decodeToken(req);
    //if (!user) {
    //  res.status(401).send('Unauthorized');
    //  return; AbonnementId	PayerId	CurrentOffice	ServiceId	EmployeeId	Date	Time	Notes
    //}

    //const userId = user.Id;
    const results = await db_utilities.searchPayer(payerName);
    res.json(results);
    console.log(results);
  } catch (err) {
    console.error('Error searching for payer:', err);
    res.status(500).send('Error searching for payer.');
  }
});

app.post('/command', checkAuthenticated, async (req, res) => {
  try {
    const {
      currentOffice,
      service,
      email,
      personne,
      dateInput,
      timeInput,
      notesInput
    } = req.body;


    const user = await auth.decodeToken(req);
    console.log(user); // Appeler la méthode pour obtenir l'utilisateur connecté
    const Abonnement = await db_utilities.getDataFrom("Abonnement", { Id: email });
    console.log(Abonnement);
    if (Abonnement && user) {
      console.log(user.Id);
      const abonnementId = Abonnement[0].Id;
      const pastCommand = await db_utilities.checkExistFrom("Command", { AbonnementId: abonnementId, Etat: "Commande" });
      const pastPrepare = await db_utilities.checkExistFrom("Command", { AbonnementId: abonnementId, Etat: "Prepare" });
      if (pastCommand == false || pastPrepare == false) {
        newCommand = {
          AbonnementId: abonnementId,
          PayerId: personne,
          CurrentOffice: currentOffice,
          EmployeeId: `${user.Id}`,
          ServiceId: service,
          Etat: "Commande",
          Date: dateInput,
          Time: timeInput,
          Note: notesInput
        }

        console.log(newCommand);
        INSERTED = await db_utilities.insertInto("Command", newCommand);
        if (INSERTED) {
          res.redirect("/commande_input");
          return;
        }
      } else {
        console.log("More than one command");
      }

    }

    res.redirect("404");
  } catch (error) {
    console.log(error);
    res.redirect("404");
  }
});


app.get('/commande_input', checkAuthenticated, async (req, res) => {
  try {
    const offices = await db_utilities.getOffices();
    const services = await db_utilities.getServices();
    const abonnements = await db_utilities.getDataFrom("Abonnement", {Etat:"ValideParSecretaire"});
    const personnes = await db_utilities.getDataFrom("Personnes");


    const user = await auth.decodeToken(req); // Appeler la méthode pour obtenir l'utilisateur connecté

    if (user) {
      const { FirstName, LastName } = user;
      const employeeName = `${LastName}, ${FirstName}`;

      res.render('command_page', { offices, services, abonnements, personnes, employeeName });
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Erreur lors de la récupération des données");
  }
});
app.get('/lol', async (req, res) => {
  res.render("selectbox2test");
});

app.post('/api/command', (req, res) => {
  const { officeId, subscriptionEmail, payerId, serviceId, employeeId, date, time, note } = req.body;

  const sql = `
    INSERT INTO Command (AbonnementId, PayerId, CurrentOffice, ServiceId, EmployeeId, Date, Time, Notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [subscriptionEmail, payerId, officeId, serviceId, employeeId, date, time, note];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error inserting data into the database' });
    } else {
      res.status(200).json({ message: 'Data successfully inserted into the database' });
    }
  });
});

app.get('/about', async (req, res) => {
  res.render("about");
});


app.get('/contact', async (req, res) => {

  try {
    LOCATIONS = await db_utilities.getDataFrom("officeInfo");
    res.render('contact', { locations: LOCATIONS });
  } catch (error) {

    console.error('Error fetching data:', error);
    res.redirect("/e_404");
  }
});
app.post('/revenu_annuel', (req, res) => {
  const year = req.body.year;
  const month = req.body.month;

  let sql;
  let queryParams;
  let isMonthlyReport;

  if (month) {
    sql = `
      SELECT DAY(Date) as Jour, SUM(s.Price) as Revenu
      FROM command c
      JOIN services s ON c.ServiceId = s.Id
      WHERE YEAR(Date) = ? AND MONTH(Date) = ?
      GROUP BY DAY(Date)
      ORDER BY DAY(Date)
    `;
    queryParams = [parseInt(year), parseInt(month)];
    isMonthlyReport = true;
  } else {
    sql = `
      SELECT MONTH(Date) as Mois, SUM(s.Price) as Revenu
      FROM command c
      JOIN services s ON c.ServiceId = s.Id
      WHERE YEAR(Date) = ?
      GROUP BY MONTH(Date)
      ORDER BY MONTH(Date)
    `;
    queryParams = year;
    isMonthlyReport = false;
  }

  base_de_donnees.query(sql, queryParams, (err, result) => {
    if (err) throw err;
    console.log('isMonthlyReport:', isMonthlyReport);
    console.log('data:', result);
    res.render('revenu_annuel', { data: result, isMonthlyReport: isMonthlyReport });
  });

});



app.get('/revenu_annuel', async (req, res) => {
  res.render('revenu_annuel', { data: null, isMonthlyReport: false });
});
app.get('/generate_fake_command', async (req, res) => {



  const notesOptions = ['récupération de panier', 'changement de service'];

  function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
  const AboIds = await db_utilities.getDataFrom("Abonnement");
  const SerIds = await db_utilities.getDataFrom("Services");
  const EmpIds = await db_utilities.getDataFrom("users");
  const OffIds = await db_utilities.getDataFrom("officeInfo");

  for (let i = 1; i <= 50; i++) {
    const abonnement = AboIds[Math.floor(Math.random() * AboIds.length)];
    payersTemp = abonnement.FamilyMembers.split(",");
    const payerId = payersTemp[Math.floor(Math.random() * payersTemp.length)].trim();
    const currentOffice = OffIds[Math.floor(Math.random() * OffIds.length)].Id;
    const serviceId = SerIds[Math.floor(Math.random() * SerIds.length)].Id;
    const employeeId = EmpIds[Math.floor(Math.random() * EmpIds.length)].Id;
    const date = randomDate(new Date('2020-01-01'), new Date('2023-12-31')).toISOString().slice(0, 10);
    const time = Math.floor(Math.random() * 24) + ':' + Math.floor(Math.random() * 60);
    const notes = notesOptions[Math.floor(Math.random() * notesOptions.length)];
    const etats = ["Commande", "Prepare", "Recupere"];
    const randomEtat = etats[Math.floor(Math.random() * etats.length)].trim();
    await db_utilities.insertInto("Command", {
      AbonnementId: abonnement.Id,
      PayerId: payerId,
      CurrentOffice: currentOffice,
      ServiceId: serviceId,
      EmployeeId: employeeId,
      Etat: randomEtat,
      Date: date,
      Time: time,
      Notes: notes,
    })


  }
  res.redirect("/revenu_annuel");
});
app.get('/tableau/:table', checkAccountAdmin, async (req, res) => {
  TABLE = req.params.table;
  tableau = await db_utilities.getDataFrom(TABLE);
  columns = await db_utilities.getColumns(TABLE);

  console.log(TABLE);
  res.render("details_table_object_id", { table: TABLE, data: tableau, columns });
});

app.get('/rapport', checkAuthenticated, async (req, res) => {
  let Names = [
    "Afficher la liste des familles qui ont récupéré un panier entre deux périodes",
    "Afficher les revenus sommaires et détaillés par succursale selon plusieurs durées",
    "Afficher la liste des familles d'où un membre de la famille a une particularité spécifique"
  ];

  let Descriptions = [
    "La page propose des options pour sélectionner la date et l'heure de début et de fin d'une commande. Elle affiche également plusieurs informations sur le service, y compris le nom de l'employé qui a confirmé le service.",
    "La page affiche les revenus sommaires et détaillés par succursale pour différentes durées. Les options incluent une sélection de l'année et l'exportation des données en Excel ou PDF. Les revenus par mois sont affichés avec le montant correspondant pour chaque mois et le total annuel.",
    "La page affiche les familles ayant un membre avec une particularité spécifique. Les utilisateurs peuvent rechercher une ou plusieurs particularités pour afficher la liste de familles correspondante."
  ];

  let Links = [
    "/rapport/commande_history",
    "/revenu_annuel",
    "/rapport/details_particularites"
  ]

  res.render("rapport", { Names, Descriptions, Links });
});

app.get('/rapport/details_familles', checkAuthenticated, async (req, res) => {
  try {
    const personnes = await db_utilities.getDataFrom('personnes');
    console.log(personnes);

    const abonnements = await db_utilities.getDataFrom('abonnement');
    console.log(abonnements);
    res.render("details_familles", { personnes: personnes, abonnements: abonnements });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/generate-pdf', async (req, res) => {
  try {
    const { tableHTML, cssStyles } = req.body;
    const pdfBuffer = await pdf.pdfBuild(tableHTML, cssStyles);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rapport-famille.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});





app.post('/rapport/modifie_abonnement', async (req, res) => {
  const { updateValues, queryCondition } = req.body;
  try {
    const updated = await db_utilities.updateFrom("abonnement", updateValues, queryCondition);
    if (updated) {
      res.json({ message: "Abonnement updated successfully" });
    } else {
      res.json({ message: "Abonnement not found" });
    }
  } catch (error) {
    console.error("Error updating Abonnement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post('/rapport/delete_abonnement', async (req, res) => {
  const { abonnementId } = req.body;
  try {
    const deleted = await db_utilities.deleteFrom("abonnement", { Id: abonnementId });
    if (deleted) {
      res.json({ message: "Abonnement deleted successfully" });
    } else {
      res.json({ message: "Abonnement not found" });
    }
  } catch (error) {
    console.error("Error deleting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get('/rapport/details_familles/:id', checkAuthenticated, async (req, res) => {
  try {
    const memberId = req.params.id;
    const customWhereClause = 'FIND_IN_SET(?, FamilyMembers) > 0';
    const abonnements = await db_utilities.getDataFrom('abonnement', '*', customWhereClause, [memberId]);

    if (abonnements.length == 1) {
      const familyMembers = abonnements[0].FamilyMembers.split(',').map(memberId => parseInt(memberId.trim()));
      const customWhereClauseForPersonnes = `Id IN (${familyMembers.join(',')})`;

      const personnes = await db_utilities.getDataFrom('personnes', '*', customWhereClauseForPersonnes);
      res.render('details_familles_id', { abonnements: abonnements, personnes: personnes });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/rapport/modifie_abonnement_personne', async (req, res) => {
  const { updateValues, queryCondition } = req.body;
  try {
    const updated = await db_utilities.updateFrom("personnes", updateValues, queryCondition);
    if (updated) {
      res.json({ message: "Personne updated successfully" });
    } else {
      res.json({ message: "Personne not found" });
    }
  } catch (error) {
    console.error("Error updating:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post('/rapport/ajout_abonnement', async (req, res) => {
  try {
    const { Adresse, Telephone, Email, Location, Etat } = req.body;
    const data = { Adresse, Telephone, Email, Location, Etat, FamilyMembers: '0, 0' };
    const inserted = await db_utilities.insertInto('abonnement', data);
    if (inserted) {
      res.status(200).json({ message: 'Abonnement added successfully' });
    } else {
      res.status(500).json({ message: 'Error adding abonnement' });
    }
  } catch (error) {
    console.error('Error adding abonnement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/rapport/commande_history', checkAccountSecretaire, async (req, res) => {
  try {
    const commandes = await db_utilities.getDataFrom('command');
    const abonnements = await db_utilities.getDataFrom('abonnement');
    const personnes = await db_utilities.getDataFrom('personnes');
    const offices = await db_utilities.getDataFrom('officeinfo');
    const services = await db_utilities.getDataFrom('services');
    const users = await db_utilities.getDataFrom('users');
    console.log(commandes[0]);

    res.render("details_commandes_history", {
      commandes, abonnements, personnes, offices, services, users
    });
  } catch (error) {
    console.error('Error:', error);
    res.redirect('/404');
  }
});

app.get('/rapport/details_abonnements_inactif', checkAccountSecretaire, async (req, res) => {
  try {
    const commandes = await db_utilities.getDataFrom('command');
    const abonnements = await db_utilities.getDataFrom('abonnement');
    const personnes = await db_utilities.getDataFrom('personnes');
    const offices = await db_utilities.getDataFrom('officeinfo');
    const services = await db_utilities.getDataFrom('services');
    const users = await db_utilities.getDataFrom('users');

    res.render("details_abonnements_inactif", {
      commandes, abonnements, personnes, offices, services, users
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/rapport/details_particularites', checkAccountSecretaire, async (req, res) => {
  try {
    const abonnements = await db_utilities.getDataFrom('abonnement');
    const personnes = await db_utilities.getDataFrom('personnes');
    const commandes = await db_utilities.getDataFrom('command');

    res.render("details_particularites", {
      abonnements, personnes, commandes
    });
  } catch (error) {
    console.error('Error:', error);
    res.redirect("404");
  }
});


app.get('/test2', async (req, res) => {
  res.render("test2");
});



// Since this is the last non-error-handling
// middleware use()d, we assume 404, as nothing else
// responded.

// $ curl http://localhost:3000/notfound
// $ curl http://localhost:3000/notfound -H "Accept: application/json"
// $ curl http://localhost:3000/notfound -H "Accept: text/plain"

app.use(function (req, res, next) {
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startNodemonAndBrowserSync();
});
