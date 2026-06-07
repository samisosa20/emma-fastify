import {
  UserCreateInput,
  UserLoginInput,
  UserConfirmEmailInput,
  UserResendEmailInput,
  UserRecoveryPasswordInput,
} from "../packages/shared/validations/user";

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
  console.log(
    "Invalid email login test (should fail):",
    !resultEmail.success ? "PASSED" : "FAILED"
  );
};

const testConfirmEmail = () => {
  console.log("\n--- Testing Confirm Email Validation ---");

  const valid = {
    email: "john@example.com",
    token: "550e8400-e29b-41d4-a716-446655440000",
  };

  const invalidToken = {
    email: "john@example.com",
    token: "invalid-token",
  };

  const resultValid = UserConfirmEmailInput.safeParse(valid);
  console.log(
    "Valid confirm email test:",
    resultValid.success ? "PASSED" : "FAILED"
  );

  const resultInvalidToken = UserConfirmEmailInput.safeParse(invalidToken);
  console.log(
    "Invalid token confirm email test (should fail):",
    !resultInvalidToken.success ? "PASSED" : "FAILED"
  );
};

const testResendEmail = () => {
  console.log("\n--- Testing Resend Email Validation ---");

  const valid = { email: "john@example.com" };
  const invalid = { email: "invalid-email" };

  const resultValid = UserResendEmailInput.safeParse(valid);
  console.log(
    "Valid resend email test:",
    resultValid.success ? "PASSED" : "FAILED"
  );

  const resultInvalid = UserResendEmailInput.safeParse(invalid);
  console.log(
    "Invalid email resend email test (should fail):",
    !resultInvalid.success ? "PASSED" : "FAILED"
  );
};

const testRecoveryPassword = () => {
  console.log("\n--- Testing Recovery Password Validation ---");

  const valid = { email: "john@example.com" };
  const invalid = { email: "invalid-email" };

  const resultValid = UserRecoveryPasswordInput.safeParse(valid);
  console.log(
    "Valid recovery password test:",
    resultValid.success ? "PASSED" : "FAILED"
  );

  const resultInvalid = UserRecoveryPasswordInput.safeParse(invalid);
  console.log(
    "Invalid email recovery password test (should fail):",
    !resultInvalid.success ? "PASSED" : "FAILED"
  );
};

try {
  testRegistration();
  testLogin();
  testConfirmEmail();
  testResendEmail();
  testRecoveryPassword();
} catch (error) {
  console.error("Test execution failed:", error);
}
