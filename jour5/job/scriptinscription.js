/* ================================================
   INSCRIPTION.JS — Validation & sécurité front-end
   ================================================

   Sécurités implémentées :
   ✅ 1.  Validation asynchrone avec debounce (350–450ms)
   ✅ 2.  Sanitisation XSS (échappement HTML)
   ✅ 3.  CSRF token simulé (en prod : injecté côté serveur)
   ✅ 4.  Honeypot anti-bot
   ✅ 5.  maxlength sur tous les champs (HTML)
   ✅ 6.  novalidate + validation 100% JS
   ✅ 7.  Indicateur de force du mot de passe (score /4)
   ✅ 8.  Vérification de correspondance des mots de passe
   ✅ 9.  Regex robuste : email, noms, code postal
   ✅ 10. autocomplete="new-password" (HTML)
   ✅ 11. inputmode="numeric" sur le code postal (HTML)
   ✅ 12. Consentement RGPD obligatoire
   ✅ 13. CSP + X-Frame-Options via meta (HTML)
   ✅ 14. aria-invalid pour l'accessibilité
   ✅ 15. Scroll automatique vers le premier champ en erreur
*/

/* ── 1. CSRF token simulé ──────────────────────────────
   En production, générez ce token côté serveur (session)
   et injectez-le dans le champ hidden du formulaire.
----------------------------------------------------- */
document.getElementById('csrfToken').value =
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2);


/* ── 2. Sanitisation XSS ───────────────────────────────
   Neutralise les caractères HTML avant traitement.
----------------------------------------------------- */
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


/* ── 3. Helpers UI ─────────────────────────────────────
   Affiche / masque les états d'erreur et de succès.
----------------------------------------------------- */

/**
 * Affiche un message d'erreur sous le champ.
 * @param {string} id  - ID du champ input
 * @param {string} msg - Texte du message d'erreur
 */
function showError(id, msg) {
  const input  = document.getElementById(id);
  const error  = document.getElementById('error-' + id);
  const status = document.getElementById('status-' + id);

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
 * @param {string} id - ID du champ input
 */
function showValid(id) {
  const input  = document.getElementById(id);
  const error  = document.getElementById('error-' + id);
  const status = document.getElementById('status-' + id);

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
 * @param {string} id - ID du champ input
 */
function clearField(id) {
  const input  = document.getElementById(id);
  const error  = document.getElementById('error-' + id);
  const status = document.getElementById('status-' + id);

  input.classList.remove('is-error', 'is-valid');
  input.removeAttribute('aria-invalid');
  error.classList.remove('visible');

  if (status) status.className = 'status-icon';
}


/* ── 4. Debounce ────────────────────────────────────────
   Attend ms millisecondes après la dernière frappe
   avant de lancer la validation.
----------------------------------------------------- */
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}


/* ── 5. Validateurs asynchrones ────────────────────────
   Chacun renvoie une Promise<{ ok: boolean, msg?: string }>.
----------------------------------------------------- */

/** Prénom : lettres (avec accents), tirets et espaces. */
async function validatePrenom(v) {
  return new Promise(resolve => setTimeout(() => {
    v = v.trim();
    if (!v)
      return resolve({ ok: false, msg: 'Le prénom est requis.' });
    if (v.length < 2)
      return resolve({ ok: false, msg: 'Minimum 2 caractères.' });
    if (v.length > 60)
      return resolve({ ok: false, msg: 'Maximum 60 caractères.' });
    if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ' -]+$/.test(v))
      return resolve({ ok: false, msg: 'Lettres uniquement (pas de chiffres ni symboles).' });
    resolve({ ok: true });
  }, 180));
}

/** Nom de famille : mêmes règles que le prénom. */
async function validateNom(v) {
  return new Promise(resolve => setTimeout(() => {
    v = v.trim();
    if (!v)
      return resolve({ ok: false, msg: 'Le nom est requis.' });
    if (v.length < 2)
      return resolve({ ok: false, msg: 'Minimum 2 caractères.' });
    if (v.length > 60)
      return resolve({ ok: false, msg: 'Maximum 60 caractères.' });
    if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ' -]+$/.test(v))
      return resolve({ ok: false, msg: 'Lettres uniquement (pas de chiffres ni symboles).' });
    resolve({ ok: true });
  }, 180));
}

/** E-mail : format RFC simplifié + longueur max 254. */
async function validateEmail(v) {
  return new Promise(resolve => setTimeout(() => {
    v = v.trim();
    if (!v)
      return resolve({ ok: false, msg: "L'adresse e-mail est requise." });
    if (v.length > 254)
      return resolve({ ok: false, msg: 'Adresse trop longue (max 254 car.).' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))
      return resolve({ ok: false, msg: 'Format invalide (ex : vous@exemple.fr).' });
    resolve({ ok: true });
  }, 280));
}

/**
 * Mot de passe : min 8 car., majuscule, chiffre, caractère spécial.
 * Ces règles doivent être identiques côté serveur.
 */
async function validatePassword(v) {
  return new Promise(resolve => setTimeout(() => {
    if (!v)
      return resolve({ ok: false, msg: 'Le mot de passe est requis.' });
    if (v.length < 8)
      return resolve({ ok: false, msg: 'Minimum 8 caractères requis.' });
    if (v.length > 128)
      return resolve({ ok: false, msg: 'Maximum 128 caractères.' });
    if (!/[A-Z]/.test(v))
      return resolve({ ok: false, msg: 'Au moins une lettre majuscule requise.' });
    if (!/[0-9]/.test(v))
      return resolve({ ok: false, msg: 'Au moins un chiffre requis.' });
    if (!/[^A-Za-z0-9]/.test(v))
      return resolve({ ok: false, msg: 'Au moins un caractère spécial requis (!@#$%…).' });
    resolve({ ok: true });
  }, 220));
}

/** Confirmation : doit être identique au mot de passe. */
async function validateConfirm(pw, conf) {
  return new Promise(resolve => setTimeout(() => {
    if (!conf)
      return resolve({ ok: false, msg: 'Veuillez confirmer votre mot de passe.' });
    if (pw !== conf)
      return resolve({ ok: false, msg: 'Les mots de passe ne correspondent pas.' });
    resolve({ ok: true });
  }, 180));
}

/** Adresse : présente, entre 5 et 150 caractères. */
async function validateAdresse(v) {
  return new Promise(resolve => setTimeout(() => {
    v = v.trim();
    if (!v)
      return resolve({ ok: false, msg: "L'adresse est requise." });
    if (v.length < 5)
      return resolve({ ok: false, msg: 'Adresse trop courte (min 5 car.).' });
    if (v.length > 150)
      return resolve({ ok: false, msg: 'Adresse trop longue (max 150 car.).' });
    resolve({ ok: true });
  }, 180));
}

/** Code postal français : exactement 5 chiffres. */
async function validateCP(v) {
  return new Promise(resolve => setTimeout(() => {
    v = v.trim();
    if (!v)
      return resolve({ ok: false, msg: 'Le code postal est requis.' });
    if (!/^\d{5}$/.test(v))
      return resolve({ ok: false, msg: 'Code postal invalide (5 chiffres).' });
    resolve({ ok: true });
  }, 180));
}

/** Ville : optionnelle, mais min 2 car. si renseignée. */
async function validateVille(v) {
  return new Promise(resolve => setTimeout(() => {
    v = v.trim();
    if (v && v.length < 2)
      return resolve({ ok: false, msg: 'Nom de ville trop court.' });
    resolve({ ok: true });
  }, 150));
}


/* ── 6. Indicateur de force du mot de passe ────────────
   Score de 0 à 4 basé sur la longueur et la diversité.
----------------------------------------------------- */
const STRENGTH_COLORS = ['', '#ff5e7a', '#ffb347', '#ffcc00', '#00e5a0'];
const STRENGTH_LABELS = ['', 'Très faible', 'Faible', 'Moyen', 'Fort 💪'];

/**
 * Calcule un score de force entre 0 et 4.
 * @param {string} pw
 * @returns {number}
 */
function passwordScore(pw) {
  let score = 0;
  if (pw.length >= 8)           score++;
  if (pw.length >= 12)          score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  return Math.min(score, 4);
}

/**
 * Met à jour visuellement la barre de force.
 * @param {string} pw
 */
function updateStrengthBar(pw) {
  const wrap  = document.getElementById('strengthWrap');
  const label = document.getElementById('strengthLabel');
  const segs  = ['seg1', 'seg2', 'seg3', 'seg4'].map(id => document.getElementById(id));

  if (!pw) {
    wrap.classList.remove('visible');
    return;
  }

  wrap.classList.add('visible');
  const score = passwordScore(pw);

  segs.forEach((seg, i) => {
    seg.style.background = i < score
      ? STRENGTH_COLORS[score]
      : 'var(--border)';
  });

  label.textContent  = STRENGTH_LABELS[score] || 'Trop court';
  label.style.color  = STRENGTH_COLORS[score] || 'var(--text-muted)';
}


/* ── 7. Indicateur de correspondance ───────────────────
   Affiche en temps réel si les deux mots de passe
   sont identiques.
----------------------------------------------------- */
function updateMatchIndicator() {
  const pw   = document.getElementById('password').value;
  const conf = document.getElementById('confirm').value;
  const ind  = document.getElementById('matchIndicator');

  if (!conf) {
    ind.className = 'match-indicator';
    return;
  }

  if (pw === conf) {
    ind.className   = 'match-indicator visible ok';
    ind.textContent = '✓ Les mots de passe correspondent.';
  } else {
    ind.className   = 'match-indicator visible fail';
    ind.textContent = '✗ Ne correspondent pas.';
  }
}


/* ── 8. Indicateur de progression (dots) ───────────────
   Met à jour les 3 points en haut du formulaire selon
   le nombre de champs valides.
----------------------------------------------------- */
const PROGRESS_FIELDS = ['prenom', 'nom', 'email', 'password', 'confirm', 'adresse', 'cp'];

function updateProgressDots() {
  const filled = PROGRESS_FIELDS.filter(id => {
    const el = document.getElementById(id);
    return el && el.classList.contains('is-valid');
  }).length;

  const pct = filled / PROGRESS_FIELDS.length;

  document.getElementById('dot1').className =
    'step-dot' + (pct > 0 ? ' active' : '');

  document.getElementById('dot2').className =
    'step-dot' + (pct >= 0.5 ? (pct < 1 ? ' active' : ' done') : '');

  document.getElementById('dot3').className =
    'step-dot' + (pct >= 1 ? ' done active' : '');
}


/* ── 9. Wiring des événements sur chaque champ ─────────
   Chaque champ reçoit :
   • un listener input → debounce → validateur async
   • un listener blur  → validateur async immédiat
----------------------------------------------------- */

/**
 * Attache les événements input + blur à un champ simple.
 * @param {string}   id        - ID du champ
 * @param {Function} validator - Fonction de validation async
 * @param {number}   delay     - Délai debounce (ms)
 * @param {boolean}  doSanitize - Sanitiser la valeur (false pour les mots de passe)
 */
function wire(id, validator, delay = 400, doSanitize = true) {
  const el = document.getElementById(id);
  if (!el) return;

  const process = v => (doSanitize ? sanitize(v) : v);

  const debouncedValidate = debounce(async (val) => {
    if (!val) return clearField(id);
    const result = await validator(val);
    result.ok ? showValid(id) : showError(id, result.msg);
  }, delay);

  el.addEventListener('input', e => {
    debouncedValidate(process(e.target.value));
    updateProgressDots();
  });

  el.addEventListener('blur', async e => {
    const val = process(e.target.value.trim());
    if (!val && id !== 'ville') return clearField(id);
    const result = await validator(val);
    result.ok ? showValid(id) : showError(id, result.msg);
    updateProgressDots();
  });
}

// Champs simples
wire('prenom',  validatePrenom,  400);
wire('nom',     validateNom,     400);
wire('email',   validateEmail,   450);
wire('adresse', validateAdresse, 400);
wire('cp',      validateCP,      350);
wire('ville',   validateVille,   350);

// Bloquer les caractères non numériques dans le CP
document.getElementById('cp').addEventListener('keypress', e => {
  if (!/[0-9]/.test(e.key) && e.key !== 'Backspace') e.preventDefault();
});

// Mot de passe (sans sanitize, avec barre de force)
const pwInput   = document.getElementById('password');
const confInput = document.getElementById('confirm');

const debouncePw = debounce(async (val) => {
  updateStrengthBar(val);
  if (!val) return clearField('password');
  const result = await validatePassword(val);
  result.ok ? showValid('password') : showError('password', result.msg);
  if (confInput.value) updateMatchIndicator();
  updateProgressDots();
}, 350);

const debounceConf = debounce(async (val) => {
  updateMatchIndicator();
  if (!val) return clearField('confirm');
  const result = await validateConfirm(pwInput.value, val);
  result.ok ? showValid('confirm') : showError('confirm', result.msg);
  updateProgressDots();
}, 350);

pwInput.addEventListener('input',  e => debouncePw(e.target.value));
confInput.addEventListener('input', e => debounceConf(e.target.value));

pwInput.addEventListener('blur', async e => {
  if (!e.target.value) return clearField('password');
  const result = await validatePassword(e.target.value);
  result.ok ? showValid('password') : showError('password', result.msg);
});

confInput.addEventListener('blur', async e => {
  if (!e.target.value) return clearField('confirm');
  const result = await validateConfirm(pwInput.value, e.target.value);
  result.ok ? showValid('confirm') : showError('confirm', result.msg);
});


/* ── 10. Toggle affichage des mots de passe ────────────
----------------------------------------------------- */
function makeToggle(btnId, inputId) {
  document.getElementById(btnId).addEventListener('click', () => {
    const el     = document.getElementById(inputId);
    const isHidden = el.type === 'password';
    el.type      = isHidden ? 'text' : 'password';
    document.getElementById(btnId).textContent = isHidden ? '🙈' : '👁';
  });
}

makeToggle('togglePw1', 'password');
makeToggle('togglePw2', 'confirm');


/* ── 11. Soumission du formulaire ──────────────────────
   Enchaîne : honeypot → RGPD → validation complète
   → appel simulé → overlay de succès.
----------------------------------------------------- */
document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  // Honeypot : bot détecté → blocage silencieux
  if (this.elements['website'].value) return;

  const btn      = document.getElementById('submitBtn');
  const rgpdCb   = document.getElementById('rgpd');
  const rgpdErr  = document.getElementById('error-rgpd');

  // Vérification du consentement RGPD
  if (!rgpdCb.checked) {
    rgpdErr.classList.add('visible');
    btn.classList.remove('loading');
    btn.disabled = false;
    return;
  }
  rgpdErr.classList.remove('visible');

  btn.classList.add('loading');
  btn.disabled = true;

  // Lecture et nettoyage des valeurs
  const vals = {
    prenom:   sanitize(document.getElementById('prenom').value.trim()),
    nom:      sanitize(document.getElementById('nom').value.trim()),
    email:    sanitize(document.getElementById('email').value.trim()),
    password: document.getElementById('password').value,        // pas de sanitize sur le mdp
    confirm:  document.getElementById('confirm').value,
    adresse:  sanitize(document.getElementById('adresse').value.trim()),
    cp:       sanitize(document.getElementById('cp').value.trim()),
    ville:    sanitize(document.getElementById('ville').value.trim()),
  };

  // Validation simultanée de tous les champs
  const [
    rPrenom, rNom, rEmail,
    rPassword, rConfirm,
    rAdresse, rCP, rVille
  ] = await Promise.all([
    validatePrenom(vals.prenom),
    validateNom(vals.nom),
    validateEmail(vals.email),
    validatePassword(vals.password),
    validateConfirm(vals.password, vals.confirm),
    validateAdresse(vals.adresse),
    validateCP(vals.cp),
    validateVille(vals.ville),
  ]);

  const fieldResults = [
    ['prenom', rPrenom], ['nom', rNom], ['email', rEmail],
    ['password', rPassword], ['confirm', rConfirm],
    ['adresse', rAdresse], ['cp', rCP], ['ville', rVille],
  ];

  let allValid = true;
  fieldResults.forEach(([id, result]) => {
    if (!result.ok) { showError(id, result.msg); allValid = false; }
    else showValid(id);
  });

  if (!allValid) {
    btn.classList.remove('loading');
    btn.disabled = false;
    // Scroll automatique vers le premier champ en erreur
    const firstError = document.querySelector('.is-error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Simule un appel API (1,4s)
  await new Promise(resolve => setTimeout(resolve, 1400));

  // Affichage de l'overlay de succès
  btn.classList.remove('loading');
  document.getElementById('successOverlay').classList.add('visible');
});