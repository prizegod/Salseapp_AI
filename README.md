# ShopSale POS: Smart Retail Management & Billing System

**GitHub Repository:** https://github.com/prizegod/Salseapp_AI

---

## Project Demonstration / Video Walkthrough
Watch the complete walkthrough and feature demonstration of ShopSale POS in action:
👉 [Click Here to Watch the Video Walkthrough](https://drive.google.com/file/d/1zNWIwnGR-OzwWEa2QEp40znwA0_sGwp5/view?usp=drivesdk)

---

## What is ShopSale POS & Purpose
In many local retail shops, daily sales, stock movements, and expenses are still manually tracked in physical notebooks. Managing inventory, figuring out what's out of stock, or calculating daily spending can be tedious. 

ShopSale POS bridges this exact gap by converting traditional notebook records and local language notes into structured, digital software analytics. Shop owners can record their day's end sales, track stock levels, monitor sold-out items, and analyze total expenditures digitally.

---

## Security Architecture (Mid-to-High Level)
Security was designed and structured meticulously:
- **JWT Authentication:** Secure user sessions and role-based access control.
- **Query-Level Data Isolation:** Implemented strict backend scoping (StoreID and UserId filters) across controllers to completely prevent cross-tenant data leaks between different stores.

---

## Backend-Driven AI Document Scanner
The application features an integrated AI Bill Scanner for multi-item receipts:
- **Server-Side Processing:** The heavy processing and AI parsing logic run entirely on the Backend (C# ASP.NET Core Web API). 
- Keeping API keys and model logic off the client-side ensures complete data security. The frontend simply sends the receipt image and receives structured product data instantly.

---

## My Student Journey: AI & Vibe Coding
As a student developer, building ShopSale POS was an incredible milestone achieved by embracing "Vibe Coding" and working alongside AI as my mentor:
- Instead of letting AI blindly generate code, I maintained full control over the creative vision, architectural decisions, and security logic.
- AI served as my pair programmer to help structure secure APIs, debug complex asynchronous LINQ queries, and navigate cloud deployment challenges.

---

## Tech Stack
- **Backend:** C# ASP.NET Core Web API, Entity Framework Core, LINQ
- **Frontend:** React.js (Vite), Tailwind CSS, Framer Motion, Lucide Icons
