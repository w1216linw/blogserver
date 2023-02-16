import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email",
      },
    ];
  }
  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "username must be longer than 2 characters",
      },
    ];
  }
  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "invalid email contains @",
      },
    ];
  }
  if (options.password.length <= 2) {
    return [
      {
        field: "password",
        message: "password must be longer than 3 characters",
      },
    ];
  }

  return null;
};
