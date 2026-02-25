// controllers/supabaseAuth.js
const supabase = require("../utils/supabaseClient");

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    req.flash("error", error.message);
    return res.redirect("/login");
  }

  const user = data.user;

  // ✅ CHECK ADMIN TABLE
  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("id", user.id)
    .single();

  req.session.supabaseUser = {
    id: user.id,
    email: user.email,
  };

  if (admin) {
    req.session.role = "admin";
    return res.redirect("/admin/dashboard");
  }

  // ✅ ELSE NORMAL USER
  req.session.role = "user";
  return res.redirect("/");
};

module.exports.logout = async (req, res) => {
  req.session.destroy();
  res.redirect("/login");
};
