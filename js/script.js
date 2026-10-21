"use strict";

document.documentElement.classList.add("js");

/* =====================================================
   KONFIGURASI: GANTI DI SINI
   Semua tautan dan nomor di halaman diatur dari objek ini.
   ===================================================== */
const CONFIG = {
  // Nomor WhatsApp internasional tanpa tanda +, spasi, atau tanda baca.
  whatsappNumber: "6285217707749",
  whatsappMessage: "Halo Admin HEARTCALM, saya ingin berkonsultasi tentang Acne Water Gel.",
  instagramUsername: "HeartCalm",
  tiktokUsername: "HeartCalm",
  shopeeStore: "HeartCalm_Store"
};

/* Pola email: teks@domain.tld (tld minimal 2 huruf).
   "nama@email" ditolak, "nama@email.com" diterima. */
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Mengisi atribut href semua tautan ber-atribut data-link dari CONFIG */
function applyConfigLinks() {
  const urls = {
    whatsapp: `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`,
    shopee: `https://shopee.co.id/${encodeURIComponent(CONFIG.shopeeStore)}`,
    instagram: `https://www.instagram.com/${encodeURIComponent(CONFIG.instagramUsername)}/`,
    tiktok: `https://www.tiktok.com/@${encodeURIComponent(CONFIG.tiktokUsername)}`
  };
  document.querySelectorAll("[data-link]").forEach((el) => {
    const url = urls[el.dataset.link];
    if (url) el.href = url;
  });
}

/* Tinggi navbar dihitung lewat JavaScript, bukan angka tetap */
function getNavbarOffset() {
  return document.getElementById("siteHeader").offsetHeight;
}

/* Scrollspy Bootstrap: menandai menu aktif saat halaman digulir */
function initScrollSpy(offset) {
  const existing = bootstrap.ScrollSpy.getInstance(document.body);
  if (existing) existing.dispose();
  new bootstrap.ScrollSpy(document.body, {
    target: "#mainNav",
    rootMargin: `-${offset}px 0px -60% 0px`
  });
}

/* Simpan tinggi navbar ke CSS variable dan segarkan scrollspy */
function updateNavbarOffset() {
  const offset = getNavbarOffset();
  document.documentElement.style.setProperty("--navbar-offset", `${offset}px`);
  initScrollSpy(offset);
}

/* Gulir halus ke bagian tujuan, dikurangi tinggi navbar */
function scrollToTarget(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - getNavbarOffset();
  window.scrollTo({ top: Math.max(top, 0), behavior: prefersReducedMotion ? "auto" : "smooth" });
}

/* Semua tautan #id memakai gulir halus; menu hamburger menutup otomatis */
function setupSmoothScroll() {
  const navMenu = document.getElementById("navMenu");
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!document.querySelector(hash)) return;
      event.preventDefault();
      if (navMenu.classList.contains("show")) {
        // Tunggu menu tertutup agar tinggi navbar sudah final
        navMenu.addEventListener("hidden.bs.collapse", () => scrollToTarget(hash), { once: true });
        bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
      } else {
        scrollToTarget(hash);
      }
    });
  });
}

/* Tombol kembali ke atas: muncul setelah menggulir 400px */
function setupBackToTop() {
  const button = document.getElementById("backToTop");
  const toggleButton = () => button.classList.toggle("is-visible", window.scrollY > 400);
  window.addEventListener("scroll", toggleButton, { passive: true });
  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
  toggleButton();
}

/* Validasi format email */
function validateEmail(value) {
  return EMAIL_PATTERN.test(value.trim());
}

/* Tampilkan modal Bootstrap saat email valid */
function showSuccessModal() {
  bootstrap.Modal.getOrCreateInstance(document.getElementById("successModal")).show();
}

/* Formulir newsletter: validasi, pesan kesalahan, modal, lalu kosongkan formulir */
function setupNewsletter() {
  const form = document.getElementById("newsletterForm");
  const input = document.getElementById("newsletterEmail");
  const feedback = document.getElementById("newsletterFeedback");

  const showError = (message) => {
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    feedback.textContent = message;
  };
  const clearError = () => {
    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
    feedback.textContent = "";
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return showError("Email wajib diisi.");
    if (!validateEmail(value)) return showError("Format email belum valid. Contoh: nama@email.com");
    clearError();
    showSuccessModal();
    form.reset();
  });

  // Hapus pesan kesalahan begitu pengguna memperbaiki email
  input.addEventListener("input", () => {
    if (input.classList.contains("is-invalid") && validateEmail(input.value)) clearError();
  });
}

/* Reveal konten saat masuk viewport; nonaktif untuk mode reduced motion. */
function setupReveal() {
  const elements = document.querySelectorAll(
    ".section-head, .card-soft, .benefit-item, .stat-item, .newsletter-box"
  );

  if (!elements.length) return;

  elements.forEach((element, index) => {
    element.dataset.reveal = "";
    element.style.setProperty("--reveal-delay", `${(index % 4) * 80}ms`);
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  elements.forEach((element) => observer.observe(element));
}

/* Inisialisasi setelah halaman siap */
document.addEventListener("DOMContentLoaded", () => {
  applyConfigLinks();
  updateNavbarOffset();
  setupSmoothScroll();
  setupBackToTop();
  setupNewsletter();
  setupReveal();
  document.getElementById("currentYear").textContent = new Date().getFullYear();
  window.addEventListener("resize", updateNavbarOffset);
});