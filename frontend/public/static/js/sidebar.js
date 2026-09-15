const openNav = document.getElementById('openNav');
const closeNav = document.getElementById('closeNav');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

const isMobile = () => window.matchMedia('(max-width: 991px)').matches;

const openSidebar = () => {
    sidebar.classList.add('active');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
    document.body.classList.add('sidebar-open');
};

const closeSidebar = () => {
    sidebar.classList.remove('active');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    document.body.classList.remove('sidebar-open');
};

openNav.addEventListener('click', () => {
    if (isMobile()) {
        sidebar.classList.contains('active') ? closeSidebar() : openSidebar();
        return;
    }
    sidebar.classList.toggle('active');
});

closeNav.addEventListener('click', closeSidebar);

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
}

document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (isMobile()) closeSidebar();
    });
});
