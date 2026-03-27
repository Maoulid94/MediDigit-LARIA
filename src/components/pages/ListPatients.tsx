import * as XLSX from "xlsx";

type ListPatientsProps = {
  history: any[];
  onClear?: () => void;
};

export default function ListPatients({ history, onClear }: ListPatientsProps) {
  const exportGroupToExcel = (session: any) => {
    const dataToExport = session.patients.map((p: any) => ({
      Date: session.date,
      Heure: session.timestamp,
      Docteur: session.docteur || "N/A",
      Patient: p.name,
      Sexe: p.sexe,
      Age: p.age,
      Adresse: p.adresse,
      Motif: p.motif || "-",
      "Diagnostic/Test": p.diagnostic || p.test || "Consultation",
      Examen: p.examan || p.examen || "-",
      Traitement: p.traitement || "-",
      Mode: session.mode,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");
    const fileName = `Registre_${session.date.replace(/\//g, "-")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (!history || history.length === 0) {
    return (
      <div className="max-w-462.5 mx-auto mt-10 px-10">
        <div className="bg-white/40 p-20 rounded-[3rem] border border-dashed border-violet-200 text-center">
          <span className="text-[10px] font-black text-violet-300 uppercase tracking-[0.5em]">
            Aucun historique disponible
          </span>
        </div>
      </div>
    );
  }

  // Ordre des colonnes mis à jour dans le grid
  const gridLayout =
    "grid-cols-[100px_1fr_60px_60px_1fr_1.2fr_1.2fr_1.5fr_1.5fr_1fr]";

  return (
    <div className="max-w-462.5 mx-auto mt-10 space-y-6 pb-20 px-4">
      <div className="flex justify-between items-center px-6">
        <h2 className="text-sm font-black text-violet-300 uppercase tracking-[0.4em]">
          Registre Médical Complet
        </h2>
        {onClear && (
          <button
            onClick={onClear}
            className="text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors cursor-pointer"
          >
            Effacer Tout
          </button>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 bg-violet-50/50 border-b border-violet-100">
          <div
            className={`grid ${gridLayout} gap-4 py-5 text-[9px] font-black text-violet-400 uppercase`}
          >
            <span>Heure / Dr</span>
            <span>Nom du Patient</span>
            <span className="text-center">Sexe</span>
            <span className="text-center">Âge</span>
            <span>Quartier</span>
            <span className="text-violet-600">Motif</span>
            <span className="text-indigo-600">Diagnostic / Test</span>{" "}
            {/* Déplacé ici */}
            <span className="text-violet-600">Examen</span>
            <span className="text-violet-600">Traitement</span>
            <span className="text-right">Mode</span>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[75vh]">
          {history.map((session, sIdx) => (
            <div key={session.id || sIdx} className="contents">
              <div className="bg-violet-100/30 px-8 py-2 border-b border-violet-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-violet-900">
                    {session.date}
                  </span>
                  <span className="text-[9px] font-bold text-violet-400 italic">
                    REF: {session.id ? String(session.id).slice(0, 8) : sIdx}
                  </span>
                </div>
                <button
                  onClick={() => exportGroupToExcel(session)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-full transition-all active:scale-95 shadow-sm"
                >
                  <span className="text-[9px] font-black uppercase tracking-tighter">
                    Excel
                  </span>
                </button>
              </div>

              {session.patients &&
                session.patients.map((p: any, pIdx: number) => (
                  <div
                    key={`${session.id}-${pIdx}`}
                    className={`grid ${gridLayout} gap-4 px-8 py-4 items-center border-b border-violet-50 hover:bg-white transition-colors group`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-violet-900">
                        {session.timestamp}
                      </span>
                      <span className="text-[8px] font-black text-violet-400 truncate uppercase">
                        {session.docteur ? `Dr. ${session.docteur}` : "N/A"}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-violet-800">
                      {p.name}
                    </div>
                    <div className="text-center text-[10px] font-bold text-violet-500 uppercase">
                      {p.sexe}
                    </div>
                    <div className="text-center text-[10px] font-bold text-violet-500">
                      {p.age}
                    </div>
                    <div className="text-[10px] text-violet-600 truncate">
                      {p.adresse}
                    </div>

                    {/* Motif */}
                    <div className="text-[10px] text-violet-700 font-medium italic">
                      {p.motif || "-"}
                    </div>

                    {/* Diagnostic / Test (Déplacé après Motif) */}
                    <div>
                      <span className="text-[9px] font-black text-indigo-900 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                        {p.diagnostic || p.test || "CONSULTATION"}
                      </span>
                    </div>

                    {/* Examen et Traitement */}
                    <div className="text-[10px] text-violet-700 font-medium">
                      {p.examan || p.examen || "-"}
                    </div>
                    <div className="text-[10px] text-violet-700 font-medium">
                      {p.traitement || "-"}
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[8px] font-black px-2 py-1 rounded-md ${
                          session.mode === "MEDECIN"
                            ? "bg-blue-50 text-blue-500"
                            : "bg-emerald-50 text-emerald-500"
                        }`}
                      >
                        {session.mode}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
