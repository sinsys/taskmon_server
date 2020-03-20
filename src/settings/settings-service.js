const xss = require('xss');

const SettingsService = {

  // Get user settings
  getSettings: (db, user_id) => {
    return (
      db
        .from('settings AS setting')
        .select(
          'setting.id',
          'setting.user_id',
          'setting.nickname',
          'setting.hydration'
        )
        .where('setting.id', user_id)
        .first()
    );
  },

  updateSettings: (db, user_id, updatedSettings) => {
    return (
      db('settings')
        .where('settings.user_id', user_id)
        .update(updatedSettings)
    );
  },
  

  serializeSettings: (settings) => {
    return {
      ...settings,
      nickname: xss(settings.nickname)
    };
  },

  addSettings: (db, newSettings) => {
    return (
      db
        .insert(newSettings)
        .into('settings')
        .returning('*')
        .then(([settings]) => settings)
    );
  }

};

module.exports = SettingsService;