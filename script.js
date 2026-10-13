let h3 = document.querySelector(".afficher");
let rejouer = document.getElementById("rejouer");
let commencer = document.getElementById("commencer");
let suivant = document.getElementById("suivant");

let indexQuestionActuelle = 0;
let score = 0;
let questionsAffichees = mesQuestions;
let niveauActuel = "Tous";
let minuteurInterval;
let delaiSuivantTimeout;
const tempsLimite = 10;

// Cacher le bouton rejouer au départ
rejouer.style.display = "none";

function lancerMinuteur() {
  let tempsRestant = tempsLimite;
  const timerDisplay = document.getElementById("timer");
  timerDisplay.textContent = `Temps restant : ${tempsRestant}s`;
  timerDisplay.style.color = "var(--text-light)"; // Réinitialise la couleur en blanc

  clearInterval(minuteurInterval); // Sécurité pour éviter les doublons

  minuteurInterval = setInterval(() => {
    tempsRestant--;
    timerDisplay.textContent = `Temps restant : ${tempsRestant}s`;

    // Change la couleur en rouge s'il reste 3 secondes ou moins
    if (tempsRestant <= 3) {
      timerDisplay.style.color = "var(--warning-red)";
    }

    if (tempsRestant <= 0) {
      clearInterval(minuteurInterval);
      verifierReponse(null, null); // Affiche la bonne réponse en vert
      // Attend 1 seconde avant de passer à la suite
      delaiSuivantTimeout = setTimeout(() => {
        allerAQuestionSuivante();
      }, 1000);
    }
  }, 1000);
}

function afficherQuestion() {
  // on recuper le conteneur des reponses
  const contener = document.querySelector(".options");
  if (!contener) return;

  //   vider les anciens reponses
  contener.innerHTML = "";

  // Masquer le bouton suivant au début de chaque question
  suivant.style.display = "none";

  // Mettre à jour la barre de progression
  const progression =
    ((indexQuestionActuelle + 1) / questionsAffichees.length) * 100;
  document.getElementById("progress-bar").style.width = progression + "%";

  // Mettre à jour le texte du compteur
  document.getElementById("progress-text").textContent =
    `Question ${indexQuestionActuelle + 1} sur ${questionsAffichees.length}`;

  // on recupere la question actuelle
  const questionActuelle = questionsAffichees[indexQuestionActuelle];

  //   mettre a jour le text de question
  h3.textContent = questionActuelle.question;

  // Ajouter l'animation UI
  const quizContainer = document.querySelector(".quiz");
  quizContainer.classList.remove("fade-in");
  void quizContainer.offsetWidth; // Trigger reflow
  quizContainer.classList.add("fade-in");

  // Lancer le chrono
  lancerMinuteur();

  questionActuelle.options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;

    // ajouter un evenement click
    button.addEventListener("click", () => {
      verifierReponse(option, button);
    });
    //   ajouter le bouton a l'ecran
    contener.appendChild(button);
  });
}

function verifierReponse(choix, boutonClique) {
  clearInterval(minuteurInterval); // On arrête le chrono dès qu'on répond
  const questionActuelle = questionsAffichees[indexQuestionActuelle];
  const boutons = document.querySelectorAll(".options button");

  // Désactiver tous les boutons pour éviter les clics multiples
  boutons.forEach((btn) => (btn.disabled = true));

  if (choix !== null && choix === questionActuelle.bonneReponse) {
    score++;
    boutonClique.classList.add("correct");
  } else {
    if (boutonClique) boutonClique.classList.add("incorrect");

    // Montrer la bonne réponse quand on se trompe ou que le temps est fini
    boutons.forEach((btn) => {
      if (btn.textContent === questionActuelle.bonneReponse) {
        btn.classList.add("correct");
      }
    });
  }

  // Afficher le bouton suivant
  suivant.style.display = "block";
}

function initialiserQuiz() {
  indexQuestionActuelle = 0;
  score = 0;
  h3.textContent = "";
  commencer.style.display = "none"; // Cache le bouton Commencer
  rejouer.style.display = "none";
  afficherQuestion();
}

function obtenirMessageFinal(score, total) {
  const ratio = score / total;
  if (ratio === 1) return "🏆 Parfait ! Vous êtes un expert !";
  if (ratio >= 0.7) return "🌟 Excellent travail !";
  if (ratio >= 0.5) return "👍 Pas mal, encore un petit effort !";
  return "😅 Oups... On réessaie ?";
}

function allerAQuestionSuivante() {
  clearTimeout(delaiSuivantTimeout); // Annule le délai automatique si on clique manuellement

  indexQuestionActuelle++;
  if (indexQuestionActuelle < questionsAffichees.length) {
    afficherQuestion();
  } else {
    // Fin du quiz : affiche le score final
    const contener = document.querySelector(".options");
    contener.innerHTML = ""; // Vide les options

    // Gestion du High Score (Record)
    const key = `quiz_high_score_${niveauActuel}`;
    let recordPrecedent = parseInt(localStorage.getItem(key)) || 0;
    let nouveauRecord = false;

    if (score > recordPrecedent) {
      localStorage.setItem(key, score);
      recordPrecedent = score;
      nouveauRecord = true;
    }

    const message = obtenirMessageFinal(score, questionsAffichees.length);
    const recordText = nouveauRecord
      ? "🔥 Nouveau Record !"
      : `Meilleur score (${niveauActuel}) : ${recordPrecedent}`;

    h3.innerHTML = `${message}<br>
                    <span style="font-size: 0.8em; font-weight: normal;">Votre score : ${score} / ${questionsAffichees.length}</span><br>
                    <span style="font-size: 0.7em; color: var(--primary-blue); font-weight: bold;">${recordText}</span>`;

    suivant.style.display = "none"; // Cache le bouton suivant
    rejouer.style.display = "block"; // Affiche le bouton rejouer
    document.getElementById("progress-text").textContent = ""; // Vide le compteur
    document.getElementById("progress-bar").style.width = "0%"; // Reset la barre
    document.getElementById("timer").textContent = ""; // Vide le timer
    clearInterval(minuteurInterval);
  }
}

commencer.addEventListener("click", initialiserQuiz);

rejouer.addEventListener("click", () => {
  questionsAffichees = mesQuestions; // Reset vers toutes les questions
  niveauActuel = "Tous";
  // Remettre le style actif sur le bouton "Tous"
  liensNiveau.forEach((l) => l.classList.remove("active"));
  document.querySelector(".liste ul li a").classList.add("active");

  initialiserQuiz();
});

suivant.addEventListener("click", allerAQuestionSuivante);

// Gestion des niveaux (Bonus)
const liensNiveau = document.querySelectorAll(".liste ul li a");
liensNiveau.forEach((lien) => {
  lien.addEventListener("click", (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    const niveauSelectionne = lien.textContent.trim();
    niveauActuel = niveauSelectionne;
    // Mise à jour visuelle de l'état actif
    liensNiveau.forEach((l) => l.classList.remove("active"));
    lien.classList.add("active");

    if (niveauSelectionne === "Tous") {
      questionsAffichees = mesQuestions;
    } else {
      questionsAffichees = mesQuestions.filter(
        (q) => q.niveau === niveauSelectionne,
      );
    }

    // Réinitialisation complète lors du changement de niveau
    indexQuestionActuelle = 0;
    score = 0;
    commencer.style.display = "none"; // On lance directement après le choix
    afficherQuestion();
  });
});
