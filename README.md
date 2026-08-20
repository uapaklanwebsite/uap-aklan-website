Sure — here's a **compressed, single Markdown block** you can copy directly into `README.md`:

````md
# UAP Aklan Website

Official website and content management system for the **United Architects of the Philippines – Aklan Chapter**.

🌐 **Website:** https://uap-aklan-website.pages.dev/  
🔐 **Admin:** https://uap-aklan-website.pages.dev/uap-aklan-admin/

---

## 📌 Overview

The website provides public information about the chapter, including:

- Officers
- Members
- Gallery
- Activities & Calendar
- Awards
- Accreditations
- Certifications
- Membership
- Pay Your Dues
- Governance
- Resolutions
- Chapter information

The **Admin Dashboard** allows authorized administrators to update website content without directly editing the source code.

---

## ✨ Features

### Public Website
- Responsive desktop, tablet, and mobile design
- Dynamic content from Supabase
- Member directory with search
- Image galleries
- Activities calendar
- Awards, accreditations, and certifications
- Membership information
- Pay Your Dues
- Governance and resolutions
- Editable Home/About content

### Admin Dashboard
- Secure admin login
- CRUD for website content
- Dashboard statistics
- Image upload and deletion
- Content management for all major website sections
- Responsive admin interface

### Image Handling
Uploaded images are automatically:

1. Compressed in the browser
2. Converted to WebP
3. Given a unique filename
4. Uploaded to Supabase Storage
5. Saved using an image path in the database

This reduces storage usage and improves loading performance.

---

## 🛠️ Tech Stack

**Frontend**
- HTML5
- CSS3
- JavaScript
- Tailwind CSS

**Backend / Database**
- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Storage
- Row Level Security (RLS)

**Hosting**
- Cloudflare Pages
- GitHub

**Image Processing**
- Browser-side compression
- WebP conversion

---

## 🏗️ System Flow

```text
VISITOR
   ↓
CLOUDFLARE
   ↓
FRONTEND
   ↓
SUPABASE
 ┌───────────────┐
 │ PostgreSQL    │
 │ Storage       │
 │ Authentication│
 │ RLS           │
 └───────────────┘


ADMIN
   ↓
Admin Login
   ↓
Admin Dashboard
   ↓
CRUD / Image Upload
   ↓
Supabase
   ↓
Public Website Updated
````

---

## 🔄 CRUD

The Admin Dashboard uses standard CRUD operations:

* **Create** – Add content
* **Read** – Display content
* **Update** – Edit content
* **Delete** – Remove content

Example image workflow:

```text
Select Image
    ↓
Compress Image
    ↓
Convert to WebP
    ↓
Upload to Storage
    ↓
Get Storage Path
    ↓
Save Path in Database
    ↓
Display on Website
```

---

## 🗄️ Supabase

Supabase is responsible for:

### Database

Stores structured website information such as:

* Officers
* Members
* Activities
* Gallery records
* Awards
* Accreditations
* Certifications
* Membership content
* Help links
* Payment information
* Governance content
* Resolutions

### Storage

Stores uploaded website images.

The database stores the **image path**, while the actual image is stored in a Supabase Storage bucket.

---

## 🔐 Security

The Admin Dashboard uses **Supabase Authentication**.

Database and Storage access are protected with **Row Level Security (RLS)**.

Public users can read publicly available content.

Authenticated administrators can perform authorized CRUD operations.

### Important

Do **NOT**:

* Disable RLS in production
* Commit passwords to GitHub
* Commit `.env` files
* Expose Supabase Service Role Keys
* Store private API keys in frontend code

The frontend should only use the public/anon/publishable Supabase key.

---

## 📱 Responsive Design

The website supports:

* 📱 Mobile
* 📱 Tablet
* 💻 Laptop
* 🖥️ Desktop

Responsive layouts are applied to both the public website and Admin Dashboard.

Gallery-style sections use a Pinterest/Masonry-inspired layout where appropriate.

---

## 📊 Dashboard

The Admin Dashboard provides dynamic statistics for managed content, including:

* Officers
* Members
* Gallery
* Activities
* Awards
* Accreditations

Statistics are retrieved from Supabase rather than being hard-coded.

---

## ⚙️ Environment Variables

Example:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_public_key
```

Depending on the current configuration:

```env
VITE_SUPABASE_PUBLISHABLE_KEY=your_public_key
```

Never commit actual credentials.

Recommended `.gitignore`:

```text
.env
.env.local
```


### Install dependencies

```bash
npm install
```

### Configure environment variables

Create the required `.env` file.

### Run locally

```bash
npm run dev
```

The exact commands may vary depending on the current project configuration.

---

## ☁️ Deployment

The website is hosted on **Cloudflare Pages** and connected to GitHub.

```text
Developer
   ↓
GitHub
   ↓
Cloudflare Pages
   ↓
Build & Deploy
   ↓
Live Website
```

Pushing changes to the configured GitHub branch can trigger a new deployment.

---

## 💾 Free Tier

The project currently uses free-tier services.

### Supabase Free

Important limits include approximately:

| Resource                  | Free Limit |
| ------------------------- | ---------: |
| Database                  |     500 MB |
| Storage                   |       1 GB |
| Uncached Egress           |       5 GB |
| Cached Egress             |       5 GB |
| Monthly Active Users      |     50,000 |
| Individual Storage Upload |      50 MB |

### Cloudflare Pages Free

| Resource                 | Free Limit |
| ------------------------ | ---------: |
| Builds                   |  500/month |
| Concurrent Builds        |          1 |
| Files per Site           |     20,000 |
| Maximum Individual Asset |     25 MiB |

For this project, the most important resources to monitor are **image Storage and image bandwidth**.

WebP compression helps reduce both.

Free-tier limits and pricing may change. Always check the provider's current documentation before upgrading.

---

## 🛠️ Troubleshooting

### Upload Failed

* Check internet connection
* Check selected image
* Check required fields
* Try again

### Save Failed

* Check required fields
* Try again
* Check Supabase if the problem continues

### Cannot Log In

* Check admin email/password
* Check Supabase Authentication
* Do not modify authentication settings unnecessarily

### Image Missing

Check:

1. Supabase Storage
2. Database image path
3. Correct Storage bucket
4. Storage RLS policies

### Website Not Updating

Check:

1. GitHub
2. Cloudflare deployment status
3. Browser cache
4. Supabase data

---

## 👥 Project Roles

### Website Administrator

Responsible for:

* Managing website content
* Managing members/officers
* Uploading images
* Updating chapter information

### Developer / Technical Support

Responsible for:

* Source code
* Database structure
* RLS policies
* Storage configuration
* Authentication
* Deployment
* Technical troubleshooting

---

## 🔑 Required Project Access

The following should be transferred securely to the organization:

```text
Website Admin Account
Supabase Account
Cloudflare Account
GitHub Repository Access
Domain / DNS Account (if applicable)
Supabase Project URL
Supabase Public/Anon/Publishable Key
Required Environment Variables
```

**Never put actual passwords or private keys in this README.**

---

## 📄 Documentation

A separate project turnover document should contain:

* Admin instructions
* Account information
* Environment variables
* Free-tier limits
* Troubleshooting
* Handover checklist
* Contact information

Keep completed documents containing passwords or private keys outside the public GitHub repository.


---

## 📜 License

Developed for the **United Architects of the Philippines – Aklan Chapter**.

The source code and website materials are intended for the organization and its authorized administrators.

---

## ❤️ UAP Aklan

**United Architects of the Philippines – Aklan Chapter**

🌐 [https://uap-aklan-website.pages.dev/](https://uap-aklan-website.pages.dev/)

```
```
