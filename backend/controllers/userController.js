const supabase = require('../config/supabase');

exports.getProfile = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.userId)
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Profile updated', user: data });
  } catch (error) {
    next(error);
  }
};
