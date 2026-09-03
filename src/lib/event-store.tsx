import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Priority = "low" | "medium" | "high";
export type RsvpStatus = "Invited" | "Confirmed" | "Declined" | "Pending";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  due: string;
};

export type Guest = {
  id: string;
  name: string;
  email: string;
  rsvp: RsvpStatus;
  category: string;
  dietary: string;
  plusOne: boolean;
};

export type BudgetItem = {
  id: string;
  category: string;
  estimated: number;
  actual: number;
  vendor: string;
  status: "Unpaid" | "Deposit paid" | "Paid";
  notes: string;
};

export type Vendor = {
  id: string;
  name: string;
  category: string;
  contact: string;
  quote: number;
  status: "Researching" | "Contacted" | "Quoted" | "Booked" | "Declined";
  contract: "None" | "Sent" | "Signed";
  rating: number;
  notes: string;
};

export type TimelineItem = {
  id: string;
  time: string;
  activity: string;
  location: string;
  person: string;
  notes: string;
};

export type EventDetails = {
  name: string;
  type: string;
  date: string;
  location: string;
  guestTarget: number;
  budget: number;
  currency: string;
  theme: string;
  preferences: string;
  requirements: string;
};

export type AiActivity = { id: string; label: string; at: string };

export type EventState = {
  event: EventDetails;
  tasks: Task[];
  guests: Guest[];
  budgetItems: BudgetItem[];
  vendors: Vendor[];
  timeline: TimelineItem[];
  aiActivity: AiActivity[];
};

export const uid = () => Math.random().toString(36).slice(2, 10);

function futureDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function makeInitialState(): EventState {
  return {
    event: {
      name: "Aurora Corporate Networking Evening",
      type: "Corporate networking",
      date: futureDate(42),
      location: "Cape Town, South Africa",
      guestTarget: 120,
      budget: 10000,
      currency: "$",
      theme: "Modern and professional",
      preferences: "Standing dinner, live acoustic set, strong branding moments",
      requirements: "Wheelchair accessible venue, halal and vegan menu options",
    },
    tasks: [
      { id: uid(), title: "Confirm venue", done: true, priority: "high", due: futureDate(-3) },
      { id: uid(), title: "Send invitations", done: true, priority: "high", due: futureDate(2) },
      { id: uid(), title: "Finalize catering", done: false, priority: "high", due: futureDate(9) },
      { id: uid(), title: "Contact photographer", done: false, priority: "medium", due: futureDate(14) },
      { id: uid(), title: "Review event schedule", done: false, priority: "low", due: futureDate(30) },
    ],
    guests: [
      { id: uid(), name: "Naledi Mokoena", email: "naledi@example.com", rsvp: "Confirmed", category: "Partner", dietary: "Vegan", plusOne: true },
      { id: uid(), name: "Daniel Ferreira", email: "daniel@example.com", rsvp: "Confirmed", category: "Client", dietary: "None", plusOne: false },
      { id: uid(), name: "Sarah Whitfield", email: "sarah@example.com", rsvp: "Pending", category: "Speaker", dietary: "Gluten free", plusOne: false },
      { id: uid(), name: "Thabo Dlamini", email: "thabo@example.com", rsvp: "Invited", category: "Team", dietary: "Halal", plusOne: true },
      { id: uid(), name: "Erin Vaughn", email: "erin@example.com", rsvp: "Declined", category: "Press", dietary: "None", plusOne: false },
    ],
    budgetItems: [
      { id: uid(), category: "Venue", estimated: 3200, actual: 3200, vendor: "Harbour Loft", status: "Paid", notes: "Includes furniture" },
      { id: uid(), category: "Catering", estimated: 3000, actual: 2450, vendor: "Table Nine", status: "Deposit paid", notes: "Canapé menu" },
      { id: uid(), category: "Entertainment", estimated: 1200, actual: 900, vendor: "Duo Ashwood", status: "Deposit paid", notes: "2 x 45 min sets" },
      { id: uid(), category: "Decor", estimated: 800, actual: 400, vendor: "", status: "Unpaid", notes: "" },
      { id: uid(), category: "Photography", estimated: 1000, actual: 300, vendor: "", status: "Unpaid", notes: "Quotes pending" },
      { id: uid(), category: "Contingency", estimated: 800, actual: 0, vendor: "", status: "Unpaid", notes: "8% buffer" },
    ],
    vendors: [
      { id: uid(), name: "Harbour Loft", category: "Venue", contact: "hello@harbourloft.example", quote: 3200, status: "Booked", contract: "Signed", rating: 5, notes: "Capacity 150 standing" },
      { id: uid(), name: "Table Nine", category: "Catering", contact: "events@tablenine.example", quote: 3000, status: "Booked", contract: "Sent", rating: 4, notes: "Vegan + halal options confirmed" },
      { id: uid(), name: "Duo Ashwood", category: "Entertainment", contact: "book@duoashwood.example", quote: 1200, status: "Quoted", contract: "None", rating: 4, notes: "Acoustic duo" },
      { id: uid(), name: "Lumen Studio", category: "Photography", contact: "studio@lumen.example", quote: 950, status: "Contacted", contract: "None", rating: 0, notes: "Awaiting availability" },
    ],
    timeline: [
      { id: uid(), time: "18:00", activity: "Guest arrival & welcome drinks", location: "Foyer", person: "Front of house", notes: "Check-in desk, name badges" },
      { id: uid(), time: "18:30", activity: "Welcome speech", location: "Main hall", person: "MD", notes: "5 minutes" },
      { id: uid(), time: "19:00", activity: "Dinner service", location: "Main hall", person: "Table Nine", notes: "Roaming canapés" },
      { id: uid(), time: "20:00", activity: "Entertainment", location: "Stage", person: "Duo Ashwood", notes: "Two sets" },
      { id: uid(), time: "21:30", activity: "Closing remarks", location: "Main hall", person: "MD", notes: "Thank sponsors" },
    ],
    aiActivity: [],
  };
}

type Ctx = {
  state: EventState;
  ready: boolean;
  update: (patch: Partial<EventState>) => void;
  setEvent: (patch: Partial<EventDetails>) => void;
  logAi: (label: string) => void;
  reset: () => void;
};

const EventContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "eventflow-ai-state-v1";

export function EventProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EventState>(() => makeInitialState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState((prev) => ({ ...prev, ...(JSON.parse(raw) as EventState) }));
    } catch {
      /* ignore corrupted storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, ready]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      ready,
      update: (patch) => setState((prev) => ({ ...prev, ...patch })),
      setEvent: (patch) => setState((prev) => ({ ...prev, event: { ...prev.event, ...patch } })),
      logAi: (label) =>
        setState((prev) => ({
          ...prev,
          aiActivity: [{ id: uid(), label, at: new Date().toISOString() }, ...prev.aiActivity].slice(0, 8),
        })),
      reset: () => setState(makeInitialState()),
    }),
    [state, ready],
  );

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEventStore() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEventStore must be used inside EventProvider");
  return ctx;
}

export function eventContextString(state: EventState) {
  const e = state.event;
  const spent = state.budgetItems.reduce((s, i) => s + i.actual, 0);
  const confirmed = state.guests.filter((g) => g.rsvp === "Confirmed").length;
  const open = state.tasks.filter((t) => !t.done).map((t) => t.title);
  return [
    `Event name: ${e.name}`,
    `Type: ${e.type}`,
    `Date: ${e.date}`,
    `Location: ${e.location}`,
    `Expected guests: ${e.guestTarget} (${confirmed} confirmed so far)`,
    `Total budget: ${e.currency}${e.budget} (${e.currency}${spent} recorded as spent)`,
    `Theme: ${e.theme}`,
    `Preferences: ${e.preferences}`,
    `Special requirements: ${e.requirements}`,
    `Open tasks: ${open.length ? open.join(", ") : "none recorded"}`,
    `Vendors on file: ${state.vendors.map((v) => `${v.name} (${v.category}, ${v.status})`).join("; ") || "none"}`,
  ].join("\n");
}

export function daysUntil(dateStr: string) {
  const target = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function formatCurrency(amount: number, currency = "$") {
  return `${currency}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
