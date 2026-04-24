export interface GuestRecord {
  id: string;
  name: string;
  email: string;
  code: string;
  city: string;
  lastParticipation: string;
  marketingActive: boolean;
  initials: string;
  avatarTone: "rose" | "amber" | "blue" | "peach";
}

export const GUESTS: GuestRecord[] = [
  {
    id: "claudio-huebscher",
    name: "Claudio Hübscher",
    email: "c.hübscher@stv-consult.de",
    code: "SL-1023",
    city: "Zug",
    lastParticipation: "12. Okt 2023",
    marketingActive: true,
    initials: "CH",
    avatarTone: "rose",
  },
  {
    id: "benjamin-forster",
    name: "Benjamin Forster",
    email: "b.forster@tie-international.ch",
    code: "SL-4492",
    city: "Luzern",
    lastParticipation: "05. Sep 2023",
    marketingActive: false,
    initials: "BF",
    avatarTone: "amber",
  },
  {
    id: "samuel-glauser",
    name: "Samuel Glauser",
    email: "s.glauser@bitcoin.suisse.ch",
    code: "SL-8821",
    city: "Zug",
    lastParticipation: "21. Aug 2023",
    marketingActive: true,
    initials: "SG",
    avatarTone: "blue",
  },
  {
    id: "amarah-warren",
    name: "Amarah Warren",
    email: "a.warren@idk.ch",
    code: "SL-3301",
    city: "Zug",
    lastParticipation: "01. Nov 2023",
    marketingActive: true,
    initials: "AW",
    avatarTone: "peach",
  },
];
