import { useState } from "react";
import ParallaxLayout from "../shared/ParallaxLayout";
import { loginUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { users } from "../../data/users";

export default function Sign_In() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    // BOTH EMPTY
    if (!email && !password) {
      newErrors.email = "Email is required";
      newErrors.password = "Password is required";
    }

    // EMAIL FILLED, PASSWORD EMPTY
    else if (email && !password) {
      newErrors.password = "Email or password is incorrect";
    }

    // EMAIL EMPTY
    else if (!email) {
      newErrors.email = "Email is required";
    }

    // EMAIL FORMAT
    else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    // NOT ALLOWED EMAIL
    else if (!users.some((u) => u.email === email)) {
      newErrors.email = "Access denied";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validate();
    if (!isValid) return;

    try {
      const user = await loginUser({ email, password });
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/", { replace: true });

      console.log("Login success:", user);
    } catch (err: any) {
      setErrors({ password: err.message });
    }
  };

  return (
    <ParallaxLayout>
      <form
        onSubmit={handleSubmit}
        className="bg-black/5 backdrop-blur-2xl border border-white/30 shadow-[0_0_50px_-12px_rgba(168,85,247,0.4)] rounded-3xl p-10 w-full max-w-md"
      >
        <h1 className="text-3xl font-extrabold text-white mb-8 text-center tracking-tight">
          Connexion
        </h1>

        {/* Email */}
        <div className="mb-5">
          <input
            type="email"
            placeholder="Email"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
            className={`w-full p-4 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all ${
              errors.email
                ? "border border-red-500 bg-red-500/10 focus:ring-red-500"
                : "border border-white/20 bg-white/5 focus:ring-purple-500 focus:bg-white/10"
            }`}
          />

          {errors.email && (
            <p className="text-red-400 px-1 py-1 text-xs mt-1 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-8">
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
            className={`w-full p-4 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all ${
              errors.password
                ? "border border-red-500 bg-red-500/10 focus:ring-red-500"
                : "border border-white/20 bg-white/5 focus:ring-purple-500 focus:bg-white/10"
            }`}
          />

          {errors.password && (
            <p className="text-red-400 px-1 py-1 text-xs mt-1 font-medium">
              {errors.password}
            </p>
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-violet-400 active:scale-[0.98] transition-all shadow-xl"
        >
          Se connecter
        </button>

        <p className="mt-8 text-center text-white/40 text-[12px] border-b border-violet/20 uppercase tracking-widest font-bold">
          Digitalisation Par LARIA
        </p>
      </form>
    </ParallaxLayout>
  );
}
