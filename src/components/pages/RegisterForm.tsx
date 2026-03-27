import { useState, useEffect, useRef } from "react";
import {
  nationalites,
  tests,
  quartiers,
  noms_feminins,
  noms_masculins,
} from "../../data/info";

// ================= COMPONENT: AUTOCOMPLETE =================
type AutoCompleteProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
};

function AutoComplete({
  value,
  onChange,
  options,
  placeholder,
  className,
}: AutoCompleteProps) {
  const [filtered, setFiltered] = useState<string[]>([]);
  const [show, setShow] = useState(false);
  const [cursor, setCursor] = useState(-1);

  useEffect(() => {
    if (!value.trim()) {
      setFiltered(options.slice(0, 8));
      return;
    }
    const words = value.toLowerCase().split(/\s+/);
    const lastWord = words[words.length - 1];
    if (!lastWord) {
      setFiltered([]);
      return;
    }
    const result = options.filter((item) =>
      item.toLowerCase().startsWith(lastWord),
    );
    setFiltered(result.slice(0, 8));
    setCursor(-1);
  }, [value, options]);

  const handleSelect = (suggestion: string) => {
    const words = value.split(/\s+/);
    words[words.length - 1] = suggestion;
    onChange(words.join(" "));
    setShow(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setCursor((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      setCursor((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && cursor >= 0) {
      e.preventDefault();
      e.stopPropagation();
      handleSelect(filtered[cursor]);
    } else if (e.key === "Escape") {
      setShow(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        value={value}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          onChange(e.target.value);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        className="w-full bg-white/40 border border-violet-100 rounded-xl px-3 py-2 text-[11px] font-medium text-violet-900 outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all shadow-sm"
      />
      {show && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 z-999 mt-1 bg-white border border-violet-200 rounded-xl shadow-xl max-h-48 overflow-y-auto py-1">
          {filtered.map((item, i) => (
            <li
              key={item}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              onMouseEnter={() => setCursor(i)}
              className={`px-3 py-2 cursor-pointer text-[10px] font-bold ${cursor === i ? "bg-violet-600 text-white" : "text-violet-700 hover:bg-violet-50"}`}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ================= MAIN COMPONENT =================
export default function RegisterForm() {
  const [mode, setMode] = useState<"LABO" | "MEDECIN">("MEDECIN");
  const [totalRows, setTotalRows] = useState(5);
  const [rows, setRows] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    docteur: "",
  });

  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Initial Load
  useEffect(() => {
    const savedH = localStorage.getItem("medidigt_history");
    const savedD = localStorage.getItem("medidigt_draft");

    if (savedH) setHistory(JSON.parse(savedH));

    if (savedD) {
      const draft = JSON.parse(savedD);
      setRows(draft);
      setTotalRows(draft.length);
    } else {
      generateRows(5);
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    if (rows.length > 0) {
      localStorage.setItem("medidigt_draft", JSON.stringify(rows));
    }
  }, [rows]);

  // Synchronize totalRows and rows array
  useEffect(() => {
    if (totalRows > rows.length) {
      const diff = totalRows - rows.length;
      const newEntries = Array.from({ length: diff }, (_, i) => ({
        id: rows.length + i + 1,
        name: "",
        sexe: "",
        age: "",
        adresse: "",
        nationalite: "",
        test: "",
        motif: "",
        diagnostic: "",
        examen: "",
        traitement: "",
      }));
      setRows([...rows, ...newEntries]);
    } else if (totalRows < rows.length && totalRows >= 0) {
      // Optionnel: réduit le tableau si l'utilisateur diminue le nombre
      setRows(rows.slice(0, totalRows));
    }
  }, [totalRows]);

  // Global Key Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showConfirm && e.key === "Enter") {
        const isAutoCompleteOpen = document.querySelector("ul.absolute");
        if (!isAutoCompleteOpen) {
          e.preventDefault();
          setShowConfirm(true);
        }
      } else if (showConfirm && e.key === "Enter") {
        e.preventDefault();
        handleConfirmSave();
      } else if (showConfirm && e.key === "Escape") {
        setShowConfirm(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showConfirm, rows]);

  const generateRows = (count: number) => {
    const newRows = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: "",
      sexe: "",
      age: "",
      adresse: "",
      nationalite: "",
      test: "",
      motif: "",
      diagnostic: "",
      examen: "",
      traitement: "",
    }));
    setRows(newRows);
  };

  const updateRow = (index: number, field: string, value: string) => {
    setRows((prev) => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], [field]: value };
      if (field === "name" && value.trim().length > 0) {
        const first = value.trim().split(/\s+/)[0].toLowerCase();
        if (noms_feminins.includes(first)) newRows[index].sexe = "f";
        else if (noms_masculins.includes(first)) newRows[index].sexe = "m";
      }
      return newRows;
    });
  };

  const handleConfirmSave = () => {
    const validRows = rows.filter((r) => r.name.trim() !== "");
    if (validRows.length === 0) {
      setShowConfirm(false);
      return;
    }

    const newEntry = {
      ...formData,
      mode,
      patients: validRows,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now(),
    };
    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("medidigt_history", JSON.stringify(updatedHistory));

    localStorage.removeItem("medidigt_draft");
    setTotalRows(5);
    generateRows(5);
    setShowConfirm(false);
  };

  const currentGrid =
    mode === "MEDECIN"
      ? "grid-cols-[50px_1.5fr_60px_60px_1fr_1fr_1fr_1.2fr_1fr_1.2fr]"
      : "grid-cols-[50px_1.5fr_70px_70px_1fr_1.2fr_2fr]";

  return (
    <div className="min-h-screen bg-[#F6F5FF] text-violet-950 p-4 font-sans select-none overflow-y-auto">
      <div className="max-w-462.5 mx-auto bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white shadow-2xl flex flex-col mb-10 overflow-hidden">
        {/* HEADER */}
        <header className="px-10 py-6 border-b border-violet-50 flex justify-between items-center bg-white/40 z-10">
          <div className="flex items-center gap-10">
            <h1 className="text-2xl font-black text-violet-900 tracking-tight">
              MediDigit{" "}
              <span className="font-thin text-violet-400">REGISTRE</span>
            </h1>

            <div className="flex items-center gap-6 bg-violet-100/30 px-6 py-2 rounded-2xl border border-violet-100">
              {/* Date Input */}
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-violet-300 uppercase">
                  Date
                </span>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="text-[11px] font-bold text-violet-600 bg-transparent outline-none"
                />
              </div>

              {/* Doctor Input */}
              {mode === "MEDECIN" && (
                <div className="flex flex-col border-l border-violet-200 pl-6">
                  <span className="text-[9px] font-black text-violet-300 uppercase">
                    Docteur
                  </span>
                  <input
                    placeholder="Dr. Hassan"
                    value={formData.docteur}
                    onChange={(e) =>
                      setFormData({ ...formData, docteur: e.target.value })
                    }
                    className="text-[11px] font-bold text-violet-600 bg-transparent outline-none w-32"
                  />
                </div>
              )}

              {/* Rows Counter (Infinite increase) */}
              <div className="flex flex-col border-l border-violet-200 pl-6">
                <span className="text-[9px] font-black text-violet-300 uppercase">
                  Lignes
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={totalRows}
                    onChange={(e) =>
                      setTotalRows(Math.max(1, Number(e.target.value)))
                    }
                    className="text-[11px] font-bold text-violet-600 bg-transparent outline-none w-12"
                  />
                  <button
                    onClick={() => setTotalRows((prev) => prev + 1)}
                    className="bg-violet-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-black hover:scale-110 transition-transform cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-violet-100/50 p-1 rounded-2xl border border-violet-100">
            <button
              onClick={() => setMode("MEDECIN")}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${mode === "MEDECIN" ? "bg-white text-violet-600 shadow-sm" : "text-violet-400"}`}
            >
              MÉDECIN
            </button>
            <button
              onClick={() => setMode("LABO")}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${mode === "LABO" ? "bg-white text-violet-600 shadow-sm" : "text-violet-400"}`}
            >
              LABO
            </button>
          </div>
        </header>

        {/* TABLE HEADERS */}
        <div className="px-11 bg-white/20">
          <div
            className={`grid ${currentGrid} gap-3 py-4 text-[9px] font-black text-violet-400 uppercase border-b border-violet-100`}
          >
            <span className="text-center">ID</span>
            <span>Patient</span>
            <span className="text-center">Sexe</span>
            <span className="text-center">Âge</span>
            <span>Quartier</span>
            <span>Nationalité</span>
            {mode === "MEDECIN" ? (
              <>
                <span className="text-violet-500">Motif</span>
                <span className="text-center text-violet-700">Diagnostic</span>
                <span>Examen</span>
                <span>Traitement</span>
              </>
            ) : (
              <span>Test Effectué</span>
            )}
          </div>
        </div>

        {/* TABLE BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-2 min-h-125">
          <div className="space-y-1">
            {rows.map((row, index) => (
              <div
                key={row.id}
                style={{ zIndex: rows.length - index }}
                className={`grid ${currentGrid} gap-3 p-1.5 rounded-xl items-center border border-transparent hover:border-violet-100 group relative`}
              >
                <div className="text-center text-[10px] font-black text-violet-200 group-hover:text-violet-500">
                  {row.id}
                </div>
                <AutoComplete
                  value={row.name}
                  onChange={(val) => updateRow(index, "name", val)}
                  options={[...noms_masculins, ...noms_feminins]}
                  placeholder="Nom..."
                />
                <select
                  value={row.sexe}
                  onChange={(e) => updateRow(index, "sexe", e.target.value)}
                  className="bg-white/40 border border-violet-50 rounded-xl py-2 text-[10px] font-bold text-violet-700 outline-none text-center appearance-none cursor-pointer"
                >
                  <option value="m">M</option>
                  <option value="f">F</option>
                </select>
                <input
                  value={row.age}
                  onChange={(e) => updateRow(index, "age", e.target.value)}
                  className="bg-white/40 border border-violet-50 rounded-xl py-2 text-[10px] font-bold text-violet-700 text-center outline-none"
                  placeholder="Age"
                />
                <AutoComplete
                  value={row.adresse}
                  onChange={(val) => updateRow(index, "adresse", val)}
                  options={quartiers}
                  placeholder="Quartier"
                />
                <AutoComplete
                  value={row.nationalite}
                  onChange={(val) => updateRow(index, "nationalite", val)}
                  options={nationalites}
                />
                {mode === "MEDECIN" ? (
                  <>
                    <input
                      value={row.motif}
                      onChange={(e) =>
                        updateRow(index, "motif", e.target.value)
                      }
                      className="bg-violet-50/30 border border-violet-50 rounded-xl px-2 py-2 text-[10px] outline-none focus:bg-white"
                    />
                    <input
                      value={row.diagnostic}
                      onChange={(e) =>
                        updateRow(index, "diagnostic", e.target.value)
                      }
                      className="bg-violet-100/30 border border-violet-100 rounded-xl px-2 py-2 text-[10px] font-black text-violet-900 outline-none text-center focus:bg-white"
                    />
                    <input
                      value={row.examen}
                      onChange={(e) =>
                        updateRow(index, "examen", e.target.value)
                      }
                      className="bg-violet-50/30 border border-violet-50 rounded-xl px-2 py-2 text-[10px] outline-none focus:bg-white"
                    />
                    <input
                      value={row.traitement}
                      onChange={(e) =>
                        updateRow(index, "traitement", e.target.value)
                      }
                      className="bg-violet-50/30 border border-violet-50 rounded-xl px-2 py-2 text-[10px] outline-none focus:bg-white"
                    />
                  </>
                ) : (
                  <AutoComplete
                    value={row.test}
                    onChange={(val) => updateRow(index, "test", val)}
                    options={tests}
                    placeholder="Test..."
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER ACTION */}
        <footer className="px-10 py-5 border-t border-violet-50 bg-white/20 flex justify-end items-center z-10">
          <button
            onClick={() => setShowConfirm(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white font-black text-[11px] px-14 py-4 rounded-2xl shadow-xl shadow-violet-200 uppercase tracking-widest transition-all cursor-pointer"
          >
            Enregistrer (Enter)
          </button>
        </footer>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-violet-950/60 backdrop-blur-md flex items-center justify-center z-1000 p-4">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-white w-full max-w-md text-center animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-violet-900 mb-2 uppercase">
              Confirmation
            </h2>
            <p className="text-xs text-violet-400 mb-8 px-6 font-medium italic">
              Voulez-vous enregistrer ces données ?<br />
              Appuyez à nouveau sur{" "}
              <span className="text-violet-600 font-bold uppercase">
                Enter
              </span>{" "}
              pour valider.
            </p>
            <div className="flex flex-col gap-3">
              <button
                ref={confirmBtnRef}
                onClick={handleConfirmSave}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-violet-200 cursor-pointer"
              >
                Oui, Confirmer
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full text-violet-300 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer"
              >
                Annuler (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
