<div align="center">

<br/>

<h1>
  <picture>
    <img alt="Complete Retro on Ubuntu" src="https://readme-typing-svg.demolab.com?font=Press+Start+2P&size=16&duration=3000&pause=800&color=F58220&center=true&vCenter=true&width=600&lines=Complete+Retro+on+Ubuntu;Self-hosted+Hotel+Stack;Powered+by+Nitro+V3+%2B+Arcturus" />
  </picture>
</h1>

<p>
  <strong>A full self-hosted retro hotel — Ubuntu 26.04 LTS · NGINX · AtomCMS · Arcturus Extended · Nitro V3.</strong>
</p>

<p>
  <a href="https://ubuntu.com/download/server"><img src="https://img.shields.io/badge/Ubuntu-26.04_LTS-E95420?style=for-the-badge&logo=ubuntu&logoColor=white" alt="Ubuntu"/></a>
  <a href="https://nginx.org/"><img src="https://img.shields.io/badge/NGINX-mainline-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="NGINX"/></a>
  <a href="https://mariadb.org/"><img src="https://img.shields.io/badge/MariaDB-12.x-003545?style=for-the-badge&logo=mariadb&logoColor=white" alt="MariaDB"/></a>
  <a href="https://www.php.net/"><img src="https://img.shields.io/badge/PHP-8.4-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP"/></a>
  <a href="https://discord.gg/HEqEwK2B"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"/></a>
</p>

<p>
  <a href="#setup-path">🚀 Setup Path</a> ·
  <a href="#status">📊 Status</a> ·
  <a href="#credits">💛 Credits</a> ·
  <a href="#community--support">💬 Community</a>
</p>

</div>

---

## About this guide

A step-by-step walkthrough for setting up a complete retro hotel on **Ubuntu 26.04 LTS Server** (codename *Resolute Raccoon*). The emulator runs as a `systemd` service, so no manual intervention is required after a reboot — the hotel comes back online automatically.

> Download Ubuntu Server here: <https://ubuntu.com/download/server>

## Why Ubuntu + NGINX?

|  | Benefit |
|---|---|
| 💸 | **Lower hosting costs** — no Windows license required |
| ⚡ | **Better web performance** than IIS, Apache, and other traditional stacks |
| 🪶 | **Lighter hardware footprint** — runs comfortably on small VPS plans |
| 🔁 | **Auto-recovers on reboot** — emulator is managed as a `systemd` service |
| 🔒 | **5 years of security support** with Ubuntu LTS |

## Setup path

Follow the steps in order. Each one links to its own detailed guide.

1. **[VPS Setup](#)** — base OS, users, firewall, MariaDB, PHP-FPM
2. **[NitroV3 & Emulator Setup](NitroV3_And_Emulator.md)** — Arcturus Morningstar Extended, Nitro V3, Nitro Renderer
3. **CMS Front-end** — choose one:
   - **[Atom CMS Setup](NGINX_Atom_setup.md)** — full-featured CMS front-end *(recommended)*
   - **[UI Login Setup](NGINX_UI-Setup.md)** — minimal, no CMS required
4. **[Imager & Gamedata Setup](#)** — avatar imager, badge imager, c_images
5. **[Cloudflare & SSL Setup](#)** — Origin certificates, real-IP, WSS proxying

> **Note:** you'll need to provide your own copy of the `c_images` pack — it isn't bundled with this repo.

## Status

| Component | Status |
|---|:---:|
| VPS / Atom or OrionCMS / Arcturus database | ✅ |
| Imager | ✅ |
| Cloudflare & SSL | ✅ |
| Emulator | ✅ |
| Nitro setup | ✅ |

## Credits

A big thanks to everyone who made this possible:

| Contributor | Contribution |
|---|---|
| **Dennis ⚡ (Object)** | Atom CMS |
| **iNicollas** | OrionCMS |
| **TheGeneral** | Initial base database |
| **TenShie** | Crackables, soundtracks, crafting, target offers, room bundles, calendar |
| **Skeletor** | Group badge imager |

## Community & support

<div align="center">

Two active Discord communities support this stack — pick the one that matches your question.

<table>
<tr>
<td align="center" width="50%">

<img src="https://img.shields.io/badge/CMS-AtomCMS-F58220?style=for-the-badge&logo=laravel&logoColor=white" alt="AtomCMS Community"/>

<br/><br/>

**Atom Community**

CMS questions, theme development,<br/>
front-end issues, and Atom updates.

<br/>

<a href="https://discord.gg/HEqEwK2B">
  <img src="https://img.shields.io/badge/Join%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Join Atom Discord"/>
</a>

</td>
<td align="center" width="50%">

<img src="https://img.shields.io/badge/Emulator-Nitro%20V3%20%2B%20Arcturus%20Extended-E95420?style=for-the-badge&logo=java&logoColor=white" alt="NitroV3 Community"/>

<br/><br/>

**NitroV3 Community**

Emulator help, Nitro V3 + renderer,<br/>
Arcturus Extended, and gamedata.

<br/>

<a href="https://discord.gg/vhsk4wQfH">
  <img src="https://img.shields.io/badge/Join%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Join NitroV3 Discord"/>
</a>

</td>
</tr>
</table>

</div>

---

<div align="center">

*Made with ❤️ for the retro community.*

</div>
