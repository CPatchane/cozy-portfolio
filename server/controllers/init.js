//this controller is used only to start the cozycloud application and serve the public view of the portfolio

//first entry of the client application
module.exports.start = function(req, res, next){
  res.render('index.jade', {}, function(err, html) {
    res.send(html);
  });
}

//public entry to the portfolio public view
module.exports.public = function(req, res, next){
  var portfolioData = {
    user : {
      name: "Cédric Patchane",
      age :25,
      description: "Etudiant de TELECOM Bretagne, j'ai pour projet professionnel de faire de ma passion pour l'informatique mon métier.",
      status : "Etudiant",
      localisation : "Brest",
      hobbies : ["Jeux-vidéo", "Infograhie", "3D", "Musique", "Sport"],
      keywords: ["Motivé", "Passionné", "Dynamique"]
    },
    portfolios : {
      "Vidéos" : {
        title: "Vidéos",
        documents: [
          {
            title: "Video1",
            description: "Une vidéo de test ici",
            url: "http://cedricpatchane.fr",
            relatedWebsite: "http://cedricpatchane.fr",
            creationDate: "10/10/2010"
          }
        ]
      },
      "Audios" : {
        title: "Audios",
        documents: [
          {
            title: "Un audio pour le portfolio",
            description: "Voici un petit extrait audio juste pour le test ici du portfolio. Pour voir si le texte tient correctement sur la page j'écris beaucoup de mots sans trop de sens. En effet tout ceci ne sert à rien, c'est juste pour remplir la description d'un document et de voir si cela s'affiche correctement. M'enfin bref, voilà j'écris encore plein de mots, et encore d'autres, bla bla bla, et voyons voir. Peut être que cela posera des soucis d'affichage ou peut être pas. Voila !!",
            url: "http://cedricpatchane.fr",
            relatedWebsite: "",
            creationDate: "10/10/2011"
          }
        ]
      }
    },
    badges : [
      {
        name: "Level 5 on Shaping up with Angular.js",
        issuerName : "CodeSchool",
        hostedUrl : "https://www.codeschool.com/users/CPatchane/badges/397",
        description: "Awarded for the completion of Level 5 on Shaping up with Angular.js",
        imageUrl: "https://backpack.openbadges.org/images/badge/be3fe78cae265dd7d15335e63390ee9d4be5a3f1ea32ae36985415218cede9e7.png",
        isserUrl: "http://www.codeschool.com/",
        issuedOn: "2014-12-22"
      },
      {
        name: "Completed Try Git",
        issuerName : "CodeSchool",
        hostedUrl : "https://www.codeschool.com/users/CPatchane/badges/121",
        description: "Awarded for the completion of Try Git",
        imageUrl: "https://backpack.openbadges.org/images/badge/491301726193a2146e82aa968b76c053ea022a1c114589d85e847b729683bc4d.png",
        isserUrl: "http://www.codeschool.com/",
        issuedOn: "2014-08-23"
      }
    ]
  };
  res.render('public.jade', portfolioData, function(err, html) {
    res.send(html);
  });
}