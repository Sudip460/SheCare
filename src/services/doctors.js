import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";

export const fallbackDoctors = [
  {
    id: "dr-ananya-rao",
    name: "Dr. Ananya Rao",
    specialty: "Gynecologist and PCOS care",
    city: "Bengaluru",
    rating: 4.9,
    experience: "12 years",
    bio: "Cycle health, hormonal concerns, and preventive reproductive care.",
  },
  {
    id: "dr-meera-shah",
    name: "Dr. Meera Shah",
    specialty: "Endocrinology",
    city: "Mumbai",
    rating: 4.8,
    experience: "10 years",
    bio: "Metabolic health, insulin resistance, thyroid, and PCOS evaluation.",
  },
  {
    id: "dr-kavya-menon",
    name: "Dr. Kavya Menon",
    specialty: "Women&apos;s mental wellness",
    city: "Delhi",
    rating: 4.7,
    experience: "9 years",
    bio: "Stress, sleep, emotional wellbeing, and cycle-linked mood support.",
  },
];

export async function loadDoctors() {
  try {
    const snapshot = await getDocs(query(collection(db, "doctors"), orderBy("rating", "desc")));
    const doctors = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return doctors.length ? doctors : fallbackDoctors;
  } catch {
    return fallbackDoctors;
  }
}
