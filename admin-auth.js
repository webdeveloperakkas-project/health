/* Everyday Atlas — secure admin-only Supabase authentication gate. */
(() => {
  "use strict";
  const SUPABASE_URL = "https://oxxnjxrunvhrfwxdvbsr.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_UKOjnMUUrbVK3a0fruk55Q_Anjk04RA";
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  const $ = (id) => document.getElementById(id);
  const form = $("adminLoginForm"), screen = $("adminLoginScreen");
  const errorBox = $("adminLoginError"), loginButton = $("adminLoginButton");
  const mode = $("adminMode"), logout = $("adminLogout");
  let checking = false;

  function showLogin(message) {
    document.body.classList.remove("admin-authenticated");
    screen.hidden = false;
    mode.textContent = "ADMIN LOGIN REQUIRED";
    logout.hidden = true;
    if (message) { errorBox.textContent = message; errorBox.hidden = false; }
  }
  function showDashboard(email) {
    document.body.classList.add("admin-authenticated");
    screen.hidden = true;
    mode.textContent = email || "AUTHORISED ADMIN";
    logout.hidden = false;
    errorBox.hidden = true;
  }
  async function validateAdmin() {
    if (checking) return false;
    checking = true;
    try {
      const { data: { user }, error: userError } = await client.auth.getUser();
      if (userError || !user) { showLogin(); return false; }
      const { data, error } = await client.rpc("is_admin");
      if (error || data !== true) {
        await client.auth.signOut();
        showLogin("This account is not authorised for administrator access.");
        return false;
      }
      showDashboard(user.email);
      return true;
    } catch (_) {
      showLogin("Could not verify administrator access. Please try again.");
      return false;
    } finally { checking = false; }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBox.hidden = true;
    loginButton.disabled = true;
    loginButton.textContent = "Signing in…";
    try {
      const email = $("adminEmail").value.trim();
      const password = $("adminPassword").value;
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const valid = await validateAdmin();
      if (!valid) throw new Error("This account is not authorised as the Everyday Atlas administrator.");
      $("adminPassword").value = "";
    } catch (error) {
      showLogin(error.message || "Sign-in failed. Check your email and password.");
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Sign in securely";
    }
  });

  logout.addEventListener("click", async () => {
    await client.auth.signOut();
    showLogin();
    $("adminPassword").value = "";
  });

  client.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") showLogin();
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") setTimeout(validateAdmin, 0);
  });

  window.EA_SUPABASE = client;
  showLogin();
  validateAdmin();
})();
