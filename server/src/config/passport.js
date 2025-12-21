import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';

// Sử dụng chiến lược Google OAuth2.0 cho Passport
passport.use(
  new GoogleStrategy(
    {
      // clientID và clientSecret được lấy từ Google Cloud Console, lưu trong biến môi trường
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // URL callback sau khi người dùng xác thực với Google
      callbackURL: '/api/auth/google/callback',
    },
    // Hàm callback sẽ được gọi sau khi Google xác thực thành công
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Tìm kiếm người dùng bằng googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Nếu tìm thấy người dùng, trả về người dùng đó
          return done(null, user);
        }

        // Nếu không tìm thấy bằng googleId, thử tìm bằng email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Nếu người dùng tồn tại với email (đăng ký bằng email/password trước đó),
          // thì liên kết tài khoản Google này với tài khoản hiện có.
          user.googleId = profile.id;
          user.avatar = profile.photos[0].value; // Cập nhật avatar từ Google
          await user.save();
          return done(null, user);
        }

        // Nếu người dùng chưa tồn tại, tạo một tài khoản mới
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          // Người dùng đăng ký qua OAuth không có mật khẩuHash
        });

        await newUser.save();
        // Trả về người dùng mới tạo
        done(null, newUser);
      } catch (err) {
        // Xử lý lỗi nếu có
        done(err, false);
      }
    }
  )
);

// SerializeUser: Lưu user ID vào session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// DeserializeUser: Lấy người dùng từ user ID lưu trong session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
});

export default passport;
