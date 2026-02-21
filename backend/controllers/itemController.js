const supabase = require('../config/supabase');

exports.getItems = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ items: data });
  } catch (error) {
    next(error);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const { data, error } = await supabase
      .from('items')
      .insert([{ title, description, status, user_id: req.user.userId }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Item created', item: data });
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const { data, error } = await supabase
      .from('items')
      .update({ title, description, status })
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Item updated', item: data });
  } catch (error) {
    next(error);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.userId);

    if (error) throw error;

    res.json({ message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
};
