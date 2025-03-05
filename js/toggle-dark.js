const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
      body.classList.add('dark-mode');
      darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener('change', () => {
      if (darkModeToggle.checked) {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
      } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', null);
        document.querySelector('.form-check-label').style.color = 'white';
      }
    });