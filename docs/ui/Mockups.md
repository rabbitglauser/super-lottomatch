# Mockups Documentation

## Purpose

This document describes the UI mockups for **SuperLottomatch** and links to the design files used for review and frontend planning.

The mockups were created to validate:

- the overall user interface
- the main user flows
- usability before implementation
- mobile and desktop usage contexts

They are especially focused on **clarity**, **speed of use**, and **simple interaction flows** for non-technical users.

---

## Design Links

### Figma Design File
[Open the Figma design file](https://www.figma.com/design/HTw1EeP0NtAig6EPZTlszr/Lottomatch?node-id=0-1&t=Sn74xPKErbcUuN11-1)

### Figma Prototype
[Open the interactive Figma prototype](https://www.figma.com/proto/HTw1EeP0NtAig6EPZTlszr/Lottomatch?node-id=0-1&t=Sn74xPKErbcUuN11-1)

---

## Project Context

**SuperLottomatch** is a browser-based system for the STV Ennetbürgen Lottomatch event. It digitalizes the current manual process for:

- guest registration
- guest lookup
- mobile QR check-in
- event management
- guest administration
- raffle-related event operations

The mockups support the implementation of both the **desktop web application** and the **mobile check-in flow**.

---

## Target Users

The mockups were designed for the following user groups:

- **Admin** – manages events, users, and overall administration
- **Event Manager** – manages guests, imports data, and oversees the event workflow
- **Door Staff** – uses the mobile check-in screens during the event

### UX Priorities

The design focuses on:

- simple and fast interaction flows
- high readability for older users
- minimal input effort
- large buttons and clear primary actions
- mobile-friendly check-in screens
- low cognitive load for non-technical users

---

## Covered Mockups

### Mobile Mockups

The following mobile screens are included:

- **Check-in Homepage**
- **QR Scanner**
- **Check-in Successful**
- **Guest Registration**
- **Check-in Warning**
- **Guest Not Found**
- **Confirmation & QR Code**

These screens primarily support the **door staff** workflow and the fast on-site check-in process.

### Desktop Mockups

The following desktop screens are included:

- **Login**
- **Dashboard / Homepage**
- **Create Event**
- **Event List**
- **Guest Management**
- **Import Guests**
- **Add Guest**

These screens mainly support the **admin** and **event manager** workflows.

---

## Core Flows Covered

### 1. Registration & Login
Covered by:

- Desktop **Login**
- Mobile/Desktop **Guest Registration**
- **Confirmation & QR Code** screen

### 2. Event Creation & Dashboard
Covered by:

- **Dashboard**
- **Create Event**
- **Event List**

### 3. Guest Management
Covered by:

- **Guest Management**
- **Add Guest**
- **Import Guests**
- visible **search field** and guest overview actions

### 4. QR Check-in (Mobile View)
Covered by:

- **Check-in Homepage**
- **QR Scanner**
- **Check-in Successful**
- **Check-in Warning**
- **Guest Not Found**
- fallback into **Guest Registration**

---

## Navigation and Contexts

The mockups consider two main application contexts:

### Desktop Context
Used for:

- administration
- event creation
- guest management
- imports and overview pages

### Mobile Context
Used for:

- QR scanning
- quick guest lookup
- fast check-in actions
- fallback flows during check-in

Navigation is represented through:

- **desktop sidebar / menu structure**
- **mobile bottom navigation**
- separate screens for the main user transitions

---

## Important Design Decisions

The mockups intentionally simplify the interface.

### 1. Fast Check-in
The mobile check-in flow was designed to be as fast as possible:

- large scan area
- clear status feedback
- direct primary actions
- simple fallback when the guest cannot be found

### 2. Accessibility for Older or Non-Technical Users
The UI uses:

- large cards and buttons
- readable typography
- minimal field groups
- clear labels and spacing
- low visual complexity

### 3. Minimal Input Fields
Only the most relevant fields are shown in the forms to reduce friction and speed up usage.

### 4. Clear Separation Between Desktop and Mobile Roles
The desktop screens focus on planning and management, while the mobile screens focus on quick operational actions during the event.

---

## Business Rule Reflected in the Mockups

The mockups align with the current business rule of the project:

- a guest who checks in on **one day** has **1 raffle chance**
- a guest who checks in on **both days** has **2 raffle chances**

This rule is based on the database design where each **check-in** represents one raffle entry.

