import { users } from "../data/users";

export interface LoginPayload {
  email: string;
  password: string;
}

export const loginUser = async ({ email, password }: LoginPayload) => {
  // 👉 LOCAL LOGIC (temporary)
  const user = users.find((u) => u.email === email && u.password === password);
//   API CALL
// try {
//     const res = await fetch("https://your-api/login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ email, password }),
//     });

//     if (!res.ok) {
//       throw new Error("Email or password is incorrect");
//     }

//     const data = await res.json();
//     return data;

//   } catch (error: any) {
//     console.error("Login error:", error);

//     // Optional: normalize error message
//     throw new Error(error.message || "Something went wrong");
//   }
// };


  if (!user) {
    throw new Error("Email or password is incorrect");
  }

  // simulate API delay (optional)
  await new Promise((res) => setTimeout(res, 500));

  return user;
};
