const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function (passport) {
  passport.use(
      new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
          // Match user by email
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: 'No user found with that email' });
          }

          // Match password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect password' });
          }

          // Successful login
          return done(null, user);
        } catch (err) {
          console.error('Error during authentication:', err);
          return done(err);
        }
      })
  );

  // Serialize user to store in session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        return done(new Error('User not found during deserialization'));
      }
      done(null, user);
    } catch (err) {
      console.error('Error during deserialization:', err);
      done(err);
    }
  });
};
