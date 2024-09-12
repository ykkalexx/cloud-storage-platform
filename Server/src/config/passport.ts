import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User";

// Serialize the user to store the user ID in the session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize the user from the session using the user ID
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if a user with this Google ID already exists
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser); // User found, return that user
        }

        // Extract useful information from the Google profile
        const newUser = new User({
          googleId: profile.id,
          username: profile.displayName, // Using displayName as the username
          email: profile.emails && profile.emails[0].value, // Using the first email
        });

        // Save the new user to the database
        const savedUser = await newUser.save();
        done(null, savedUser); // Return the new user
      } catch (err) {
        done(err, null); // Handle errors properly
      }
    }
  )
);

export default passport;
