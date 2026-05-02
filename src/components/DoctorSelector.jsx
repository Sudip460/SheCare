import { useEffect, useMemo, useState } from "react";
import { Search, Star, Stethoscope } from "lucide-react";
import { loadDoctors } from "../services/doctors";

export default function DoctorSelector({ selectedDoctor, onSelect }) {
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const rows = await loadDoctors();
      setDoctors(rows);
      setLoading(false);
    }
    load();
  }, []);

  const filteredDoctors = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return doctors;
    return doctors.filter((doctor) =>
      [doctor.name, doctor.specialty, doctor.city].some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [doctors, query]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Choose your doctor</p>
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 dark:border-white/10 dark:bg-white/10">
          <Search size={18} className="text-muted dark:text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, specialty, or city"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="grid max-h-72 gap-3 overflow-y-auto pr-1">
        {loading && <div className="loader" />}
        {!loading &&
          filteredDoctors.map((doctor) => {
            const active = selectedDoctor?.id === doctor.id;
            return (
              <button
                key={doctor.id}
                type="button"
                onClick={() => onSelect(doctor)}
                className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${
                  active
                    ? "border-health-sky bg-health-blue dark:border-health-sky dark:bg-blue-500/15"
                    : "border-slate-200 bg-white/75 dark:border-white/10 dark:bg-white/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-health-green">
                    <Stethoscope size={21} className="text-emerald-700" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold text-ink dark:text-slate-100">{doctor.name}</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-white/10 dark:text-amber-300">
                        <Star size={13} fill="currentColor" />
                        {doctor.rating || "4.8"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted dark:text-slate-400">{doctor.specialty}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {doctor.city} • {doctor.experience}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        {!loading && filteredDoctors.length === 0 && (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-muted dark:bg-white/10 dark:text-slate-400">
            No doctors matched your search.
          </p>
        )}
      </div>
    </div>
  );
}
