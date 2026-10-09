// Attente du chargement complet du DOM
document.addEventListener('DOMContentLoaded', () => {
  // Vérifie si un utilisateur est déjà connecté
  checkAuthStatus();

  // Block 1 = Gere la connexion
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // evite le rechargement de la page 

      //extraire les valeurs de l'user
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const messageEl = document.getElementById('loginMessage');

      try {
        // envoie d'une req HTTP vers l'API d'authentification
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json(); // => conversion de la reponse

        if (res.ok) {
          // connexion réussie : stockage du jeton JWT et des infos utilisateur dans le localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        
          messageEl.style.color = '#2e7d32';
          messageEl.textContent = 'Connexion réussie !';
          loginForm.reset(); // vide les champs du form
          checkAuthStatus();
        } else {
          // la cest identifiants incorrects 
          messageEl.style.color = '#c45b6a';
          messageEl.textContent = data.error || 'Oupsi ! erreur de connexion.';
        }
      } catch (err) {
        // pb de reseau ou serveur pas dispo
        messageEl.style.color = '#c45b6a';
        messageEl.textContent = 'Erreur serveur.';
      }
    });
  }

  //Block 2 : Inscription
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      // pareil on recupere les données du formulaire
      const pseudo = document.getElementById('regPseudo').value;
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;
      const messageEl = document.getElementById('regMessage');

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pseudo, email, password })
        });

        const data = await res.json();

        if (res.ok) {
          // succes creation de compte
          messageEl.style.color = '#2e7d32';
          messageEl.textContent = 'Inscription réussie ! Vous pouvez vous connecter.';
          registerForm.reset();
        } else {
          messageEl.style.color = '#c45b6a';
          messageEl.textContent = data.error || 'Erreur d’inscription.';
        }
      } catch (err) {
        messageEl.style.color = '#c45b6a';
        messageEl.textContent = 'Erreur serveur.';
      }
    });
  }

  //Block 3 deconnexion
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // suppresion de la session + du jeton jwt dans le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      checkAuthStatus();
    });
  }

  // Block 4 - Frigo Recherche
  const fridgeForm = document.getElementById('fridgeForm');
  if (fridgeForm) {
    fridgeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // on recupere de la liste des ingrédients saisis
      const search = document.getElementById('fridgeIngredients').value;
      // demarrage de la recherche filtrée
      fetchRecipes(search);
    });
  }
});

// gerer l'état connecté/déconnecté
function checkAuthStatus() {
  // on recupe la session stocké
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const authSection = document.getElementById('authSection');
  const appSection = document.getElementById('appSection');

  if (user) {
    // mode connecté, masque les formulaires et affiche le tableau de bord
    authSection.style.display = 'none';
    appSection.style.display = 'block';
    // injection du pseudo de l'user dans l'en tete d'acceuil
    document.getElementById('userPseudoDisplay').textContent = user.pseudo;
    fetchRecipes(); // charge toutes les recettes à l'arrivée
  } else {
    // deconnecte on affiche que la session pour se connecter 
    authSection.style.display = 'block';
    appSection.style.display = 'none';
  }
}

// Fonction fetchRecipes pour un rendu dynamique des recettes 
async function fetchRecipes(searchQuery = '') {
  const container = document.getElementById('recipesList');

  try {
    // vonstruction de l'URL avec les paramètres d'ingrédients si renseignés
    const url = searchQuery 
      ? `/api/recipes?ingredients=${encodeURIComponent(searchQuery)}` 
      : '/api/recipes';

      // récuperation du jeton jwt pour authentifier la requête HTTP
    const token = localStorage.getItem('token');

      //appel de l'api de nos recettes 
   const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    const recipes = await res.json();

// au cas ou si aucun resultat n'apparait
    if (recipes.length === 0) {
      container.innerHTML = '<p>Ton frigo est aussi vide que nos idées de recettes lol</p>';
      return;
    }

    // Génération du HTML pour chaque recette en lisant la relation RecipeIngredient -> Ingredient
    container.innerHTML = recipes.map(recipe => {
      const ingredientNames = recipe.ingredients && recipe.ingredients.length > 0
        ? recipe.ingredients.map(ri => ri.ingredient.name).join(', ')
        : 'Non renseignés';

      return `
        <div class="recipe-card">
          <h3>${recipe.title}</h3>
          <p><strong>Ingrédients :</strong> ${ingredientNames}</p>
          <p><strong>Temps :</strong> ${recipe.prepTime} min</p>
          <p>${recipe.steps}</p>
        </div>
      `;
    }).join('');

  } catch (err) {
    container.innerHTML = '<p>Erreur de chargement des recettes.</p>';
  }
}

