import { UserCreateInput, UserLoginInput } from "../packages/shared/validations/user";

const testRegistration = () => {
  console.log("--- Testing Registration Validation ---");

  const validRegistration = {
    name: "John Doe",
    email: "john@example.com",
    password: "Password123!",
    badgeId: "550e8400-e29b-41d4-a716-446655440000",
  };

  const invalidRegistrationWeakPassword = {
    ...validRegistration,
    password: "password",
  };

  const invalidRegistrationEmail = {
    ...validRegistration,
    email: "invalid-email",
  };

  const resultValid = UserCreateInput.safeParse(validRegistration);
  console.log("Valid registration test:", resultValid.success ? "PASSED" : "FAILED");
  if (!resultValid.success) console.log(resultValid.error.issues);

  const resultWeakPassword = UserCreateInput.safeParse(invalidRegistrationWeakPassword);
  console.log("Weak password registration test (should fail):", !resultWeakPassword.success ? "PASSED" : "FAILED");
  if (resultWeakPassword.success) console.log("Error: Weak password was accepted");

  const resultEmail = UserCreateInput.safeParse(invalidRegistrationEmail);
  console.log("Invalid email registration test (should fail):", !resultEmail.success ? "PASSED" : "FAILED");
};

const testLogin = () => {
  console.log("\n--- Testing Login Validation ---");

  const validLogin = {
    email: "john@example.com",
    password: "Password123!",
  };

  const invalidLoginEmail = {
    email: "invalid-email",
    password: "Password123!",
  };

  const resultValid = UserLoginInput.safeParse(validLogin);
  console.log("Valid login test:", resultValid.success ? "PASSED" : "FAILED");

  const resultEmail = UserLoginInput.safeParse(invalidLoginEmail);
  console.log("Invalid email login test (should fail):", !resultEmail.success ? "PASSED" : "FAILED");
};

try {
  testRegistration();
  testLogin();
} catch (error) {
  console.error("Test execution failed:", error);
}
