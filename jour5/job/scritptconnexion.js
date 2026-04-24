/* ================================================
   CONNEXION.JS — Validation & sécurité front-end
   ================================================

   Sécurités implémentées :
    1. Validation asynchrone avec debounce
    2. Sanitisation XSS (échappement HTML)
    3. CSRF token simulé (en prod : injecté serveur)
    4. Honeypot anti-bot
    5. Rate-limiting client (5 tentatives → blocage 30s)
    6. maxlength sur tous les champs (HTML)
    7. novalidate + validation 100% JS
    8. Aria-invalid pour l'accessibilité
    9. CSP + X-Frame-Options via meta (HTML)
*/

/* ── 1. CSRF token simulé ───────────────────────────
   En production, ce token doit être généré côté
   serveur et injecté dans le formulaire.
---------------------------------------------------- */
document.getElementById('csrfToken').value =
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2);


/* ── 2. Sanitisation XSS ────────────────────────────
   Échappe les caractères HTML dangereux pour éviter
   toute injection de code dans le DOM.
---------------------------------------------------- */
function sanitize(str) {
  const map = {
    '<' : '&lt;',
    '>' : '&gt;',
    '"' : '&quot;',
    "'" : '&#x27;',
    '`' : '&#x60;',
    '&' : '&amp;'
  };
  return String(str).replace(/[<>"'`&]/g, c => map[c]);
}


/* ── 3. Helpers UI ──────────────────────────────────
   Fonctions pour afficher / masquer les états
   d'erreur ou de succès sur chaque champ.
---------------------------------------------------- */

/**
 * Affiche un message d'erreur sous le champ donné.
 * @param {string} fieldId - ID du champ input
 * @param {string} msg     - Message d'erreur à afficher
 */
function showError(fieldId, msg) {
  const input  = document.getElementById(fieldId);
  const error  = document.getElementById('error-' + fieldId);
  const status = document.getElementById('status-' + fieldId);

  input.classList.add('is-error');
  input.classList.remove('is-valid');
  input.setAttribute('aria-invalid', 'true');
  error.textContent = '⚠ ' + msg;
  error.classList.add('visible');

  if (status) {
    status.textContent = '✗';
    status.className   = 'status-icon visible error';
  }
}

/**
 * Marque un champ comme valide.
 * @param {string} fieldId - ID du champ input
 */
function showValid(fieldId) {
  const input  = document.getElementById(fieldId);
  const error  = document.getElementById('error-' + fieldId);
  const status = document.getElementById('status-' + fieldId);

  input.classList.remove('is-error');
  input.classList.add('is-valid');
  input.setAttribute('aria-invalid', 'false');
  error.classList.remove('visible');

  if (status) {
    status.textContent = '✓';
    status.className   = 'status-icon visible valid';
  }
}

/**
 * Remet un champ dans son état neutre.
 * @param {string} fieldId - ID du champ input
 */
function clearState(fieldId) {
  const input  = document.getElementById(fieldId);
  const error  = document.getElementById('error-' + fieldId);
  const status = document.getElementById('status-' + fieldId);

  input.classList.remove('is-error', 'is-valid');
  input.removeAttribute('aria-invalid');
  error.classList.remove('visible');

  if (status) status.className = 'status-icon';
}


/* ── 4. Debounce ────────────────────────────────────
   Évite de valider à chaque frappe : attend que
   l'utilisateur s'arrête de taper (ms millisecondes).
---------------------------------------------------- */
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}


/* ── 5. Validateurs asynchrones ─────────────────────
   Chaque validateur retourne une Promise résolue
   avec { ok: boolean, msg?: string }.
   Le délai simulate un appel serveur.
---------------------------------------------------- */

/**
 * Valide le format et la longueur de l'adresse e-mail.
 */
async function validateEmail(value) {
  return new Promise(resolve => {
    setTimeout(() => {
      const val = value.trim();

      if (!val)
        return resolve({ ok: false, msg: "L'adresse e-mail est requise." });

      if (val.length > 254)
        return resolve({ ok: false, msg: 'Adresse trop longue (max 254 caractères).' });

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(val))
        return resolve({ ok: false, msg: "Format invalide (ex : vous@exemple.fr)." });

      resolve({ ok: true });
    }, 200);
  });
}

/**
 * Valide la présence et la longueur du mot de passe.
 * (La page connexion ne vérifie pas la complexité —
 * c'est le rôle du serveur lors de la comparaison.)
 */
async function validatePassword(value) {
  return new Promise(resolve => {
    setTimeout(() => {
      if (!value)
        return resolve({ ok: false, msg: 'Le mot de passe est requis.' });

      if (value.length < 8)
        return resolve({ ok: false, msg: 'Minimum 8 caractères requis.' });

      if (value.length > 128)
        return resolve({ ok: false, msg: 'Mot de passe trop long (max 128 caractères).' });

      resolve({ ok: true });
    }, 150);
  });
}


/* ── 6. Listeners avec debounce ─────────────────────
   Validation en temps réel pendant la frappe,
   et validation immédiate à la perte de focus (blur).
---------------------------------------------------- */
const emailInput    = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Validation différée pendant la saisie
const debouncedEmail = debounce(async (val) => {
  if (!val) return clearState('email');
  const result = await validateEmail(val);
  result.ok ? showValid('email') : showError('email', result.msg);
}, 400);

const debouncedPassword = debounce(async (val) => {
  if (!val) return clearState('password');
  const result = await validatePassword(val);
  result.ok ? showValid('password') : showError('password', result.msg);
}, 350);

emailInput.addEventListener('input', e =>
  debouncedEmail(sanitize(e.target.value))
);

passwordInput.addEventListener('input', e =>
  debouncedPassword(e.target.value)
);

// Validation immédiate au blur
emailInput.addEventListener('blur', async e => {
  if (!e.target.value) return clearState('email');
  const result = await validateEmail(e.target.value.trim());
  result.ok ? showValid('email') : showError('email', result.msg);
});

passwordInput.addEventListener('blur', async e => {
  if (!e.target.value) return clearState('password');
  const result = await validatePassword(e.target.value);
  result.ok ? showValid('password') : showError('password', result.msg);
});


/* ── 7. Toggle affichage mot de passe ───────────────
   Bascule entre type="password" et type="text".
---------------------------------------------------- */
document.getElementById('togglePw').addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  document.getElementById('togglePw').textContent = isHidden ? '🙈' : '👁';
});


/* ── 8. Rate-limiting côté client ───────────────────
   Bloque les soumissions après 5 tentatives échouées
   pendant 30 secondes. Cela complète (sans remplacer)
   le rate-limiting côté serveur.
---------------------------------------------------- */
let attempts    = 0;
let blockedUntil = 0;


/* ── 9. Soumission du formulaire ────────────────────
   Enchaîne : honeypot → rate-limit → validation
   → appel simulé → gestion du résultat.
---------------------------------------------------- */
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  // Honeypot : si ce champ est rempli, c'est un bot
  if (this.elements['website'].value) return;

  const globalAlert = document.getElementById('globalAlert');
  globalAlert.style.display = 'none';

  // Vérification du blocage temporaire
  const now = Date.now();
  if (now < blockedUntil) {
    const seconds = Math.ceil((blockedUntil - now) / 1000);
    globalAlert.textContent = `⛔ Trop de tentatives. Réessayez dans ${seconds}s.`;
    globalAlert.style.display = 'flex';
    return;
  }

  // Affichage du spinner
  const btn = document.getElementById('submitBtn');
  btn.classList.add('loading');
  btn.disabled = true;

  const email    = emailInput.value.trim();
  const password = passwordInput.value;

  // Validation simultanée des deux champs
  const [resultEmail, resultPassword] = await Promise.all([
    validateEmail(email),
    validatePassword(password)
  ]);

  let isValid = true;

  if (!resultEmail.ok) {
    showError('email', resultEmail.msg);
    isValid = false;
  } else {
    showValid('email');
  }

  if (!resultPassword.ok) {
    showError('password', resultPassword.msg);
    isValid = false;
  } else {
    showValid('password');
  }

  if (!isValid) {
    btn.classList.remove('loading');
    btn.disabled = false;
    return;
  }

  // Simule un appel API (1,2s)
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Incrément des tentatives (simulation d'échec serveur)
  attempts++;
  if (attempts >= 5) {
    blockedUntil = Date.now() + 30_000; // 30 secondes
    attempts     = 0;
    globalAlert.textContent = ' Trop de tentatives échouées. Compte temporairement verrouillé (30s).';
    globalAlert.style.display = 'flex';
    btn.classList.remove('loading');
    btn.disabled = false;
    return;
  }

  // Simulation succès
  btn.classList.remove('loading');
  btn.querySelector('.btn-text').textContent = '✓ Connecté !';
  btn.style.background = 'var(--success)';
  btn.disabled = false;
});