export type PasswordCheck = { label: string; passed: boolean };

export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "An uppercase letter (A-Z)", passed: /[A-Z]/.test(password) },
    { label: "A lowercase letter (a-z)", passed: /[a-z]/.test(password) },
    { label: "A number (0-9)", passed: /\d/.test(password) },
    { label: "A symbol (like ! @ # $)", passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function isStrongPassword(password: string): boolean {
  return getPasswordChecks(password).every((check) => check.passed);
}

// level 0 = nothing typed, 1 = Weak, 2 = Fair, 3 = Good, 4 = Strong
export function getStrength(password: string): { level: number; label: string } {
  if (!password) return { level: 0, label: "" };
  const passed = getPasswordChecks(password).filter((c) => c.passed).length;
  if (passed <= 2) return { level: 1, label: "Weak" };
  if (passed === 3) return { level: 2, label: "Fair" };
  if (passed === 4) return { level: 3, label: "Good" };
  return { level: 4, label: "Strong" };
}