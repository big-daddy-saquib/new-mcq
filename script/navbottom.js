
    const currentPage = window.location.pathname.split("/").pop().replace(".html", "") || "index";

document.querySelectorAll(".nav-item").forEach(item => {
  const img = item.querySelector("img");

  if (item.dataset.page === currentPage) {
    item.classList.add("active");
    img.src = img.dataset.active;
  } else {
    item.classList.remove("active");
    img.src = img.dataset.inactive;
  }
});

