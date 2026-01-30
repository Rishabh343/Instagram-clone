import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.model.js";

dotenv.config({});

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");

    // Clear existing users (optional)
    // await User.deleteMany({});

    // Create test user
    const hashedPassword = await bcrypt.hash("password123", 10);
    const testUser = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
      bio: "This is a test user",
      profilePicture: "",
    });

    console.log("Test user created:", testUser);
    console.log("Email: test@example.com");
    console.log("Password: password123");

    await mongoose.connection.close();
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
