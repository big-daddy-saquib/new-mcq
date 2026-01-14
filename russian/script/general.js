  
// Hamburger toggle overlay menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('show');
  hamburger.classList.toggle('active');
});

// Mobile dropdown toggle
document.querySelectorAll('.dropdown-parent').forEach(parent => {
  parent.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      parent.classList.toggle('active');
    }
  });
});