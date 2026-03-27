// import { em } from "framer-motion/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  // Récupération de l'utilisateur connecté
  const storedUser = localStorage.getItem("user");
  let userEmail = "Utilisateur";
  let displayName = "Utilisateur";
  try {
    if (storedUser) {
      userEmail = JSON.parse(storedUser).email;
      displayName = userEmail.split("@")[0]; // Optionnel : afficher seulement la partie avant le @
    }
  } catch {
    userEmail = "Utilisateur";
    displayName = "Utilisateur";
  }

  useEffect(() => {
    // Utilisation de la clé 'medidigt_history' pour correspondre au RegisterForm
    const saved = localStorage.getItem("medidigt_history");
    if (saved) {
      try {
        const history = JSON.parse(saved);

        // Calcul du nombre total de patients à travers toutes les sessions
        const patientsCount = history.reduce(
          (acc: number, curr: any) =>
            acc + (curr.patients ? curr.patients.length : 0),
          0,
        );
        setTotalPatients(patientsCount);

        // Calcul des sessions uniques par date
        const uniqueDates = new Set(history.map((entry: any) => entry.date));
        setTotalSessions(uniqueDates.size);
      } catch (error) {
        console.error("Erreur lors de la lecture de l'historique:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-[#f5f3ff] via-[#ede9fe] to-[#ddd6fe] flex flex-col items-center overflow-hidden font-sans">
      {/* Header avec Logout intégré */}
      <header className="w-full max-w-7xl flex justify-between items-center px-12 py-10">
        <div className="flex flex-col">
          <h1 className="text-5xl font-black text-violet-950 tracking-tighter italic">
            MediDigit <span className="text-violet-500">LARIA</span>
          </h1>
          <p className="text-violet-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
            Système de Gestion Médicale
          </p>
        </div>

        <div className="flex items-center gap-6">
          <span className=" capitalize text-violet-900 font-bold text-sm bg-white/50 px-4 py-2 rounded-full border border-white/20">
            {displayName}
          </span>
          <button
            onClick={handleLogout}
            className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors cursor-pointer"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full mb-16">
          {/* Carte Patients */}
          <div className="bg-white/60 backdrop-blur-2xl p-12 rounded-[3.5rem] border border-white/40 shadow-[0_30px_60px_rgba(139,92,246,0.1)] hover:scale-[1.02] transition-transform flex flex-col items-center">
            <p className="text-violet-400 font-bold uppercase text-[13px] tracking-[0.4em] mb-6">
              Patients Enregistrés
            </p>
            <h3 className="text-9xl font-black text-violet-950">
              {totalPatients}
            </h3>
          </div>

          {/* Carte Sessions */}
          <div className="bg-white/60 backdrop-blur-2xl p-12 rounded-[3.5rem] border border-white/40 shadow-[0_30px_60px_rgba(139,92,246,0.1)] hover:scale-[1.02] transition-transform flex flex-col items-center">
            <p className="text-violet-400 font-bold uppercase text-[13px] tracking-[0.4em] mb-6">
              Sessions Labo
            </p>
            <h3 className="text-9xl font-black text-violet-600">
              {totalSessions}
            </h3>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-wrap justify-center gap-6">
          <button
            onClick={() => navigate("/register")}
            className="px-16 py-6 bg-violet-600 text-white rounded-3xl font-black text-xl shadow-[0_20px_40px_rgba(139,92,246,0.3)] hover:bg-violet-700 hover:-translate-y-1 transition-all active:scale-[0.96] uppercase tracking-[0.2em]"
          >
            Nouvelle Session
          </button>
          <button
            onClick={() => navigate("/patients")}
            className="px-16 py-6 bg-white text-violet-600 border-2 border-violet-100 rounded-3xl font-black text-xl shadow-[0_20px_40px_rgba(139,92,246,0.05)] hover:bg-violet-50 hover:-translate-y-1 transition-all active:scale-[0.96] uppercase tracking-[0.2em]"
          >
            Archives
          </button>
        </div>
      </main>

      <footer className="pb-12 text-center">
        <p className="text-violet-300 font-bold text-[10px] uppercase tracking-[0.5em]">
          Développement Digital • Université de Djibouti
        </p>
      </footer>
    </div>
  );
}
