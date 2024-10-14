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
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser); // User found, return that user
        }

        // Create a new user if none exists
        const newUser = new User({
          googleId: profile.id,
          displayName: profile.displayName,
        });
        const savedUser = await newUser.save();
        done(null, savedUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport;
